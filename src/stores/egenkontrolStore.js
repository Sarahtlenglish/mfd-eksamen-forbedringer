import { ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/configs/firebase'
import { collection, addDoc, deleteDoc, doc, getDocs, onSnapshot, getDoc, updateDoc } from 'firebase/firestore'
import { formatDateToISO, generateDateArray, getNextDateByFrequency } from '@/utils/dateHelpers'
import { useTjeklisteStore } from '@/stores/tjeklisteStore'
import { useOfflineStore } from './offlineStore'

export const useEgenkontrolStore = defineStore('egenkontrol', () => {
  const egenkontrollerData = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetches control tasks from Firebase or offline cache
  const fetchEgenkontroller = async () => {
    loading.value = true
    const offlineStore = useOfflineStore()

    try {
      // Offline: Load from cache
      if (!offlineStore.isOnline) {
        egenkontrollerData.value = await offlineStore.getCachedData('egenkontrol')
        return
      }

      // Online: Original logic
      const querySnapshot = await getDocs(collection(db, 'Egenkontrol'))
      const egenkontroller = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      egenkontrollerData.value = egenkontroller
      await ensureFutureTasks()
      await updateStatusesBasedOnDate()

      // Cache for offline use
      await offlineStore.cacheResponseData('egenkontrol', egenkontrollerData.value)
    } catch (err) {
      error.value = err
      // Fallback to cache
      egenkontrollerData.value = await offlineStore.getCachedData('egenkontrol')
      // Update statuses based on date even when offline
      if (egenkontrollerData.value && egenkontrollerData.value.length > 0) {
        await updateStatusesBasedOnDate()
      }
    } finally {
      loading.value = false
    }
  }

  // Updates a control task (offline: queue for sync)
  const updateStatusInFirebase = async (taskId, newStatus, targetDate) => {
    const offlineStore = useOfflineStore()

    // Offline: Update locally
    if (!offlineStore.isOnline) {
      const index = egenkontrollerData.value.findIndex(task => task.id === taskId)
      if (index !== -1) {
        const task = egenkontrollerData.value[index]
        const historyIndex = task.historik.findIndex(entry => entry.dato === targetDate)
        if (historyIndex !== -1) {
          const updatedHistorik = [...task.historik]
          updatedHistorik[historyIndex] = {
            ...updatedHistorik[historyIndex],
            status: newStatus
          }
          egenkontrollerData.value[index] = {
            ...egenkontrollerData.value[index],
            historik: updatedHistorik
          }
          await offlineStore.storeLocalData('egenkontrol', egenkontrollerData.value[index])
        }
      }
      await offlineStore.addPendingAction({
        type: 'UPDATE_EGENKONTROL_STATUS',
        data: { taskId, newStatus, targetDate }
      })
      return
    }

    // Online: Original logic
    try {
      const taskRef = doc(db, 'Egenkontrol', taskId)
      const taskDoc = await getDoc(taskRef)
      const taskData = taskDoc.data()

      const historyIndex = taskData.historik.findIndex(entry => entry.dato === targetDate)
      if (historyIndex === -1) {
        throw new Error('No history entry found for the target date')
      }

      const updatedHistorik = [...taskData.historik]
      updatedHistorik[historyIndex] = {
        ...updatedHistorik[historyIndex],
        status: newStatus
      }

      await updateDoc(taskRef, { historik: updatedHistorik })

      const index = egenkontrollerData.value.findIndex(task => task.id === taskId)
      if (index !== -1) {
        egenkontrollerData.value[index] = {
          ...egenkontrollerData.value[index],
          historik: updatedHistorik
        }
      }
    } catch (err) {
      console.error('Error updating status in Firestore:', err)
      throw err
    }
  }

  const updateStatusesBasedOnDate = async () => {
    const offlineStore = useOfflineStore()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const task of egenkontrollerData.value) {
      if (!Array.isArray(task.historik)) continue
      let taskUpdated = false
      const updatedHistorik = [...task.historik]

      for (let i = 0; i < updatedHistorik.length; i++) {
        const entry = updatedHistorik[i]
        const entryDate = new Date(entry.dato)
        entryDate.setHours(0, 0, 0, 0)
        let newStatus = entry.status

        if (entry.status === 'udført') {
          newStatus = 'udført'
        } else if (entry.status === 'afvigelse' && entryDate < today) {
          newStatus = 'afvigelse'
        } else if (entryDate < today && entry.status !== 'udført' && entry.status !== 'afvigelse') {
          newStatus = 'overskredet'
        } else if (entryDate.getTime() === today.getTime() && entry.status !== 'udført' && entry.status !== 'afvigelse') {
          newStatus = 'aktiv'
        } else if (entryDate > today && entry.status !== 'udført' && entry.status !== 'afvigelse') {
          newStatus = 'inaktiv'
        }

        if (entry.status !== newStatus) {
          updatedHistorik[i] = { ...entry, status: newStatus }
          taskUpdated = true
        }
      }

      // If task was updated, update it in the store
      if (taskUpdated) {
        const taskIndex = egenkontrollerData.value.findIndex(t => t.id === task.id)
        if (taskIndex !== -1) {
          egenkontrollerData.value[taskIndex] = {
            ...task,
            historik: updatedHistorik,
            updatedAt: new Date().toISOString()
          }

          // If offline, store locally. If online, sync will happen via updateStatusInFirebase calls
          if (!offlineStore.isOnline) {
            await offlineStore.storeLocalData('egenkontrol', egenkontrollerData.value[taskIndex])
            // Queue individual status updates for sync when back online
            for (let i = 0; i < updatedHistorik.length; i++) {
              if (task.historik[i] && task.historik[i].status !== updatedHistorik[i].status) {
                await offlineStore.addPendingAction({
                  type: 'UPDATE_EGENKONTROL_STATUS',
                  data: {
                    taskId: task.id,
                    newStatus: updatedHistorik[i].status,
                    targetDate: updatedHistorik[i].dato
                  }
                })
              }
            }
          } else {
            // Online: Use Firebase updates
            for (let i = 0; i < updatedHistorik.length; i++) {
              if (task.historik[i] && task.historik[i].status !== updatedHistorik[i].status) {
                await updateStatusInFirebase(task.id, updatedHistorik[i].status, updatedHistorik[i].dato)
              }
            }
          }
        }
      }
    }
  }

  async function ensureFutureTasks() {
    const tjeklisteStore = useTjeklisteStore()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const endDate = new Date()
    endDate.setMonth(today.getMonth() + 2)
    endDate.setHours(23, 59, 59, 999)

    for (const tjekliste of tjeklisteStore.tjeklister) {
      const egenkontrol = egenkontrollerData.value.find(t => t.checkliste === tjekliste.id)
      if (!egenkontrol) continue

      const historik = egenkontrol.historik || []
      let lastDate = historik.length > 0 ? new Date(historik[historik.length - 1].dato) : new Date()
      lastDate.setHours(0, 0, 0, 0)

      const freq = tjekliste.frekvens
      let nextDate = new Date(lastDate)
      while (nextDate < endDate) {
        nextDate = getNextDateByFrequency(nextDate, freq)
        if (nextDate > endDate) break
        if (!historik.some(h => h.dato === formatDateToISO(nextDate))) {
          historik.push({
            dato: formatDateToISO(nextDate),
            status: 'inaktiv',
            afsluttetAf: '',
            noter: ''
          })
        }
      }
      await updateDoc(doc(db, 'Egenkontrol', egenkontrol.id), { historik })
    }
  }

  // Sets up real-time updates from Firebase (only online)
  const setupEgenkontrollerListener = () => {
    const offlineStore = useOfflineStore()
    if (!offlineStore.isOnline) return null

    return onSnapshot(collection(db, 'Egenkontrol'),
      (snapshot) => {
        const egenkontroller = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        egenkontrollerData.value = egenkontroller

        // Cache for offline use
        offlineStore.cacheResponseData('egenkontrol', egenkontrollerData.value)
      },
      (err) => {
        console.error('Error in egenkontroller listener:', err)
        error.value = err
      }
    )
  }

  // Adds a control task (offline: queue for sync)
  const addEgenkontrol = async (egenkontrol) => {
    const offlineStore = useOfflineStore()

    // Offline: Store temporarily
    if (!offlineStore.isOnline) {
      const tjeklisteStore = useTjeklisteStore()
      const tjeklisteId = egenkontrol.tjekliste || egenkontrol.checkliste
      const tjekliste = tjeklisteStore.getTjeklisteById(tjeklisteId)
      if (!tjekliste) {
        throw new Error('Tjekliste ikke fundet')
      }

      const startDato = egenkontrol.startDato || new Date().toISOString().split('T')[0]
      const frekvens = tjekliste.frekvens
      const datoer = generateDateArray(startDato, frekvens, 10)
      const historik = datoer.map(dato => ({
        dato,
        status: 'inaktiv',
        afsluttetAf: '',
        noter: ''
      }))

      const tempId = `temp_egenkontrol_${Date.now()}`
      const tempEgenkontrol = {
        id: tempId,
        navn: egenkontrol.navn || tjekliste.tjeklisteNavn,
        beskrivelse: egenkontrol.beskrivelse || tjekliste.beskrivelse || '',
        checkliste: tjeklisteId,
        tjeklisterRef: `/Tjeklister/${tjeklisteId}`,
        lokation: egenkontrol.lokation || '',
        ansvarligeBrugere: egenkontrol.ansvarligeBrugere || [],
        modtagere: egenkontrol.modtagere || [],
        påmindelser: egenkontrol.påmindelser || [],
        frekvens,
        startDato,
        historik,
        type: 'Egenkontrol',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      egenkontrollerData.value = [...egenkontrollerData.value, tempEgenkontrol]
      await offlineStore.storeLocalData('egenkontrol', tempEgenkontrol)
      await offlineStore.addPendingAction({
        type: 'ADD_EGENKONTROL',
        data: tempEgenkontrol,
        tempId
      })

      // Update statuses immediately after adding the new egenkontrol
      await updateStatusesBasedOnDate()

      return tempId
    }

    // Online: Original logic
    const tjeklisteStore = useTjeklisteStore()
    const tjeklisteId = egenkontrol.tjekliste || egenkontrol.checkliste
    const tjekliste = tjeklisteStore.getTjeklisteById(tjeklisteId)
    if (!tjekliste) {
      throw new Error('Tjekliste ikke fundet')
    }
    const startDato = egenkontrol.startDato || new Date().toISOString().split('T')[0]
    const frekvens = tjekliste.frekvens
    const datoer = generateDateArray(startDato, frekvens, 10)
    const historik = datoer.map(dato => ({
      dato,
      status: 'inaktiv',
      afsluttetAf: '',
      noter: ''
    }))
    const egenkontrolDoc = {
      navn: egenkontrol.navn || tjekliste.tjeklisteNavn,
      beskrivelse: egenkontrol.beskrivelse || tjekliste.beskrivelse || '',
      checkliste: tjeklisteId,
      tjeklisterRef: `/Tjeklister/${tjeklisteId}`,
      lokation: egenkontrol.lokation || '',
      ansvarligeBrugere: egenkontrol.ansvarligeBrugere || [],
      modtagere: egenkontrol.modtagere || [],
      påmindelser: egenkontrol.påmindelser || [],
      frekvens,
      startDato,
      historik,
      type: 'Egenkontrol',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const docRef = await addDoc(collection(db, 'Egenkontrol'), egenkontrolDoc)
    return docRef.id
  }

  // Deletes a control task (offline: queue for sync)
  const deleteEgenkontrol = async (id) => {
    const offlineStore = useOfflineStore()

    // Remove from local state immediately
    egenkontrollerData.value = egenkontrollerData.value.filter(egenkontrol => egenkontrol.id !== id)

    // Offline: Queue for sync
    if (!offlineStore.isOnline) {
      await offlineStore.deleteLocalData('egenkontrol', id)
      await offlineStore.addPendingAction({ type: 'DELETE_EGENKONTROL', data: { id } })
      return
    }

    // Online: Original logic
    try {
      await deleteDoc(doc(db, 'Egenkontrol', id))
    } catch (err) {
      console.error('Error deleting egenkontrol:', err)
      throw err
    }
  }

  const resolveReferences = async (egenkontrol) => {
    try {
      const [bruger, enhed, tjekliste] = await Promise.all([
        egenkontrol.brugereRef ? getDoc(doc(db, 'Brugere', egenkontrol.brugereRef)) : null,
        egenkontrol.enhederRef ? getDoc(doc(db, 'Enheder', egenkontrol.enhederRef)) : null,
        egenkontrol.tjeklisterRef ? getDoc(doc(db, 'Tjeklister', egenkontrol.checkliste)) : null
      ])

      return {
        ...egenkontrol,
        brugerNavn: bruger?.exists() ? bruger.data().fuldeNavn : '',
        enhedNavn: enhed?.exists() ? enhed.data().enhedsNavn : '',
        tjeklisteNavn: tjekliste?.exists() ? tjekliste.data().tjeklisteNavn : ''
      }
    } catch (err) {
      console.error('Error resolving references:', err)
      return egenkontrol
    }
  }

  const formatTasksForCalendar = (tasks) => {
    const calendarTasks = {}
    const tjeklisteStore = useTjeklisteStore()

    tasks.forEach((task) => {
      // Find tjekliste fields for this task
      const tjekliste = tjeklisteStore.getTjeklisteById(task.checkliste)
      const tjeklisteFields = tjekliste?.tjeklisteFields || []

      if (Array.isArray(task.historik)) {
        task.historik.forEach((entry) => {
          const dateKey = entry.dato
          if (!calendarTasks[dateKey]) {
            calendarTasks[dateKey] = []
          }

          // Find korrektion og oprindelig afvigelse
          const korrektion = entry.korrektion || null
          // Find første afvigelse i historik før eller på denne dato
          let oprindeligAfvigelse = null
          if (entry.status === 'udført' && korrektion && korrektion.korrigeret) {
            // Find den historik-entry med status 'afvigelse' tættest på denne dato (samme dato eller før)
            const afvigelser = task.historik.filter(h => h.status === 'afvigelse' && new Date(h.dato) <= new Date(entry.dato))
            if (afvigelser.length > 0) {
              // Tag den seneste
              const orig = afvigelser.reduce((a, b) => new Date(a.dato) > new Date(b.dato) ? a : b)
              oprindeligAfvigelse = {
                afsluttetDato: orig.afsluttetDato,
                afsluttetAf: orig.afsluttetAf
              }
            }
          }

          calendarTasks[dateKey].push({
            ...task,
            status: entry.status,
            noter: entry.noter,
            afsluttetAf: entry.afsluttetAf,
            afsluttetDato: entry.afsluttetDato,
            dato: entry.dato,
            id: task.id,
            title: task.navn || task.name || 'Egenkontrol',
            details: task.lokation || task.location || '',
            historik: task.historik,
            modtagere: task.modtagere,
            påmindelser: task.påmindelser,
            tjeklisteFields: tjeklisteFields,
            korrektion: korrektion,
            oprindeligAfvigelse: oprindeligAfvigelse
          })
        })
      } else {
        const date = task.startDato || task.startDate
        if (!date) return
        const dateKey = typeof date === 'string' ? date : formatDateToISO(date)
        if (!calendarTasks[dateKey]) {
          calendarTasks[dateKey] = []
        }
        calendarTasks[dateKey].push({
          ...task,
          id: task.id,
          title: task.navn || task.name || 'Egenkontrol',
          details: task.lokation || task.location || '',
          status: 'inaktiv',
          påmindelser: task.påmindelser,
          tjeklisteFields: tjeklisteFields
        })
      }
    })

    return calendarTasks
  }

  const getCalendarTasks = async () => {
    try {
      if (egenkontrollerData.value.length === 0) {
        await fetchEgenkontroller()
      }

      const formattedTasks = formatTasksForCalendar(egenkontrollerData.value)
      return formattedTasks
    } catch (err) {
      console.error('Error getting calendar tasks:', err)
      return {}
    }
  }

  const getCalendarTasksSync = () => {
    return formatTasksForCalendar(egenkontrollerData.value)
  }

  // Updates egenkontrol with completed tjekliste field results
  const updateFieldResults = async (egenkontrolId, targetDate, fieldResults, completedBy) => {
    const offlineStore = useOfflineStore()

    try {
      // Find the egenkontrol
      const egenkontrol = egenkontrollerData.value.find(e => e.id === egenkontrolId)
      if (!egenkontrol) {
        throw new Error('Egenkontrol ikke fundet')
      }

      // Check if there are any deviations in the field results
      const hasDeviations = fieldResults.some((field) => {
        if (field.type === 'yes_no_comment') {
          return field.answer === 'nej'
        }
        return false
      })

      // Determine the final status based on whether there are deviations
      const finalStatus = hasDeviations ? 'afvigelse' : 'udført'

      // Update the specific history entry with field results
      const updatedHistorik = egenkontrol.historik.map((entry) => {
        if (entry.dato === targetDate) {
          return {
            ...entry,
            status: finalStatus,
            afsluttetAf: completedBy,
            afsluttetDato: new Date().toISOString(),
            tjeklisteFieldResults: fieldResults,
            noter: entry.noter || ''
          }
        }
        return entry
      })

      // Update locally first
      const updatedEgenkontrol = {
        ...egenkontrol,
        historik: updatedHistorik,
        updatedAt: new Date().toISOString()
      }

      // Update local state
      const index = egenkontrollerData.value.findIndex(e => e.id === egenkontrolId)
      if (index !== -1) {
        egenkontrollerData.value[index] = updatedEgenkontrol
      }

      // If offline, queue for later sync
      if (!offlineStore.isOnline) {
        await offlineStore.storeLocalData('egenkontrol', updatedEgenkontrol)
        await offlineStore.addPendingAction({
          type: 'UPDATE_EGENKONTROL_FIELD_RESULTS',
          data: {
            egenkontrolId,
            targetDate,
            fieldResults,
            completedBy
          }
        })
        return
      }

      // If online, update Firebase immediately
      await updateDoc(doc(db, 'Egenkontrol', egenkontrolId), {
        historik: updatedHistorik,
        updatedAt: new Date().toISOString()
      })
    } catch (err) {
      console.error('Error updating field results:', err)
      throw err
    }
  }

  // Updates egenkontrol status with correction information for deviations
  const updateEgenkontrolStatusWithCorrection = async (egenkontrolId, targetDate, correctionData) => {
    const offlineStore = useOfflineStore()

    try {
      // Find the egenkontrol
      const egenkontrol = egenkontrollerData.value.find(e => e.id === egenkontrolId)
      if (!egenkontrol) {
        throw new Error('Egenkontrol ikke fundet')
      }

      // Update the specific history entry with correction information
      const updatedHistorik = egenkontrol.historik.map((entry) => {
        if (entry.dato === targetDate) {
          return {
            ...entry,
            status: correctionData.afvigelseUdbedret ? 'udført' : 'afvigelse',
            korrektion: {
              korrigeret: correctionData.afvigelseUdbedret,
              korrektionsDato: correctionData.udbedringsDato,
              korrigeretAf: correctionData.udbedretAf,
              korrektionsBeskrivelse: correctionData.udbedringsBeskrivelse
            },
            updatedAt: new Date().toISOString()
          }
        }
        return entry
      })

      // Update locally first
      const updatedEgenkontrol = {
        ...egenkontrol,
        historik: updatedHistorik,
        updatedAt: new Date().toISOString()
      }

      // Update local state
      const index = egenkontrollerData.value.findIndex(e => e.id === egenkontrolId)
      if (index !== -1) {
        egenkontrollerData.value[index] = updatedEgenkontrol
      }

      // If offline, queue for later sync
      if (!offlineStore.isOnline) {
        await offlineStore.storeLocalData('egenkontrol', updatedEgenkontrol)
        await offlineStore.addPendingAction({
          type: 'UPDATE_EGENKONTROL_STATUS_WITH_CORRECTION',
          data: {
            egenkontrolId,
            targetDate,
            correctionData
          }
        })
        return
      }

      // If online, update Firebase immediately
      await updateDoc(doc(db, 'Egenkontrol', egenkontrolId), {
        historik: updatedHistorik,
        updatedAt: new Date().toISOString()
      })
    } catch (err) {
      console.error('Error updating egenkontrol status with correction:', err)
      throw err
    }
  }

  // Set up periodic status updates (every 5 minutes)
  let statusUpdateInterval = null

  const startStatusUpdates = () => {
    if (statusUpdateInterval) return

    statusUpdateInterval = setInterval(async () => {
      if (egenkontrollerData.value && egenkontrollerData.value.length > 0) {
        await updateStatusesBasedOnDate()
      }
    }, 5 * 60 * 1000) // 5 minutes
  }

  const stopStatusUpdates = () => {
    if (statusUpdateInterval) {
      clearInterval(statusUpdateInterval)
      statusUpdateInterval = null
    }
  }

  // Start status updates when store is created
  startStatusUpdates()

  return {
    egenkontrollerData,
    loading,
    error,
    fetchEgenkontroller,
    setupEgenkontrollerListener,
    addEgenkontrol,
    deleteEgenkontrol,
    resolveReferences,
    getCalendarTasks,
    getCalendarTasksSync,
    updateStatusesBasedOnDate,
    updateEgenkontrolStatus: updateStatusInFirebase,
    updateFieldResults,
    updateEgenkontrolStatusWithCorrection,
    startStatusUpdates,
    stopStatusUpdates
  }
})
