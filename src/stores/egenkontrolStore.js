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
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (const task of egenkontrollerData.value) {
      if (!Array.isArray(task.historik)) continue
      for (const entry of task.historik) {
        const entryDate = new Date(entry.dato)
        entryDate.setHours(0, 0, 0, 0)
        let newStatus = entry.status
        if (entry.status === 'udført') {
          newStatus = 'udført'
        } else if (entry.status === 'afvigelse' && entryDate < today) {
          newStatus = 'afvigelse'
        } else if (entryDate < today && entry.status !== 'udført') {
          newStatus = 'overskredet'
        } else if (entryDate.getTime() === today.getTime()) {
          newStatus = 'aktiv'
        } else {
          newStatus = 'inaktiv'
        }
        if (entry.status !== newStatus) {
          await updateStatusInFirebase(task.id, newStatus, entry.dato)
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

      const tempEgenkontrol = {
        id: `temp_egenkontrol_${Date.now()}`,
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
      await offlineStore.addPendingAction({ type: 'ADD_EGENKONTROL', data: egenkontrol })
      return tempEgenkontrol.id
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

    tasks.forEach((task) => {
      if (Array.isArray(task.historik)) {
        task.historik.forEach((entry) => {
          const dateKey = entry.dato
          if (!calendarTasks[dateKey]) {
            calendarTasks[dateKey] = []
          }
          calendarTasks[dateKey].push({
            ...task,
            status: entry.status,
            noter: entry.noter,
            afsluttetAf: entry.afsluttetAf,
            dato: entry.dato,
            id: task.id,
            title: task.navn || task.name || 'Egenkontrol',
            details: task.lokation || task.location || '',
            historik: task.historik,
            modtagere: task.modtagere,
            påmindelser: task.påmindelser
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
          påmindelser: task.påmindelser
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
    updateEgenkontrolStatus: updateStatusInFirebase
  }
})
