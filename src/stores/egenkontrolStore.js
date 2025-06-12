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

      const currentEntry = taskData.historik[historyIndex]

      // VIGTIG: Respekter manuelt fuldførte opgaver
      if (currentEntry.manueltFuldført && (currentEntry.status === 'udført' || currentEntry.status === 'afvigelse')) {
        return // Undgå at overskrive manuelt fuldførte opgaver
      }

      const updatedHistorik = [...taskData.historik]
      updatedHistorik[historyIndex] = {
        ...updatedHistorik[historyIndex],
        status: newStatus,
        ...(completedData && {
          afsluttetAf: completedData.afsluttetAf,
          afsluttetDato: completedData.afsluttetDato,
          tjeklisteResultat: completedData.tjeklisteResultat
        })
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

        // VIGTIG: Bevar udført og afvigelse status - overskrid dem ALDRIG
        if (entry.status === 'udført' || entry.status === 'afvigelse') {
          continue // Skip denne entry - den er allerede fuldført
        }

        // Kun opdater status for ikke-fuldførte opgaver
        if (entryDate < today && entry.status !== 'udført' && entry.status !== 'afvigelse') {
          newStatus = 'overskredet'
        } else if (entryDate.getTime() === today.getTime()) {
          newStatus = 'aktiv'
        } else if (entryDate > today) {
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
      let needsUpdate = false

      // Opdater eksisterende historik entries der mangler tjeklisteFields
      for (let i = 0; i < historik.length; i++) {
        if (!historik[i].tjeklisteFields || historik[i].tjeklisteFields.length === 0) {
          const baseTjeklisteFields = tjekliste.tjeklisteFields || []
          const tjeklisteFields = baseTjeklisteFields.map(field => ({
            id: field.id,
            title: field.title,
            description: field.description || '',
            type: field.type,
            required: field.required || false,
            order: field.order || 1,
            // Svar felter
            answer: null,
            comment: '',
            imageUrl: null,
            completed: false
          }))

          historik[i] = {
            ...historik[i],
            tjeklisteFields: tjeklisteFields
          }
          needsUpdate = true
        }
      }

      // Tilføj nye fremtidige opgaver
      let lastDate = historik.length > 0 ? new Date(historik[historik.length - 1].dato) : new Date()
      lastDate.setHours(0, 0, 0, 0)

      const freq = tjekliste.frekvens
      let nextDate = new Date(lastDate)
      while (nextDate < endDate) {
        nextDate = getNextDateByFrequency(nextDate, freq)
        if (nextDate > endDate) break
        if (!historik.some(h => h.dato === formatDateToISO(nextDate))) {
          const baseTjeklisteFields = tjekliste.tjeklisteFields || []
          const tjeklisteFields = baseTjeklisteFields.map(field => ({
            id: field.id,
            title: field.title,
            description: field.description || '',
            type: field.type,
            required: field.required || false,
            order: field.order || 1,
            // Svar felter
            answer: null,
            comment: '',
            imageUrl: null,
            completed: false
          }))

          historik.push({
            dato: formatDateToISO(nextDate),
            status: 'inaktiv',
            afsluttetAf: '',
            noter: '',
            tjeklisteFields: tjeklisteFields
          })
          needsUpdate = true
        }
      }

      // Opdater kun hvis der faktisk er ændringer
      if (needsUpdate) {
        await updateDoc(doc(db, 'Egenkontrol', egenkontrol.id), { historik })
        // Opdater lokal data
        const index = egenkontrollerData.value.findIndex(e => e.id === egenkontrol.id)
        if (index !== -1) {
          egenkontrollerData.value[index].historik = historik
        }
      }
    }
  }

  const fetchEgenkontroller = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'Egenkontrol'))
      const egenkontroller = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      egenkontrollerData.value = egenkontroller

      await ensureFutureTasks()
      await updateStatusesBasedOnDate()
    } catch (err) {
      error.value = err
      console.error('Error in fetchEgenkontroller:', err)
    } finally {
      loading.value = false
    }
  }

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

    const historik = datoer.map((dato) => {
      // Initialiser tjeklisteFields baseret på tjekliste template
      const baseTjeklisteFields = tjekliste.tjeklisteFields || []
      const tjeklisteFields = baseTjeklisteFields.map(field => ({
        id: field.id,
        title: field.title,
        description: field.description || '',
        type: field.type,
        required: field.required || false,
        order: field.order || 1,
        // Svar felter
        answer: null,
        comment: '',
        imageUrl: null,
        completed: false
      }))

      return {
        dato,
        status: 'inaktiv',
        afsluttetAf: '',
        noter: '',
        tjeklisteFields: tjeklisteFields // Hovedstrukturen med svar-data inkluderet
      }
    })

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

  // Ny funktion til at opdatere tjeklisteFields for en specifik historik entry
  const updateFieldResults = async (taskId, targetDate, tjeklisteFields, completedBy) => {
    try {
      const taskRef = doc(db, 'Egenkontrol', taskId)
      const taskDoc = await getDoc(taskRef)
      const taskData = taskDoc.data()

      const historyIndex = taskData.historik.findIndex(entry => entry.dato === targetDate)
      if (historyIndex === -1) {
        throw new Error('No history entry found for the target date')
      }

      // VIGTIG: Tjek om der er nogen "nej" svar i yes_no_comment felter
      const hasAnyDeviations = tjeklisteFields
        .filter(field => field.type === 'yes_no_comment')
        .some(field => field.answer === 'nej')

      // Bestem status baseret på svarene
      const newStatus = hasAnyDeviations ? 'afvigelse' : 'udført'

      const updatedHistorik = [...taskData.historik]
      updatedHistorik[historyIndex] = {
        ...updatedHistorik[historyIndex],
        status: newStatus,
        tjeklisteFields: tjeklisteFields, // Gem alle svar i tjeklisteFields
        afsluttetAf: completedBy,
        afsluttetDato: new Date().toISOString(),
        // Tilføj flag så vi ved at denne er manuelt fuldført
        manueltFuldført: true
      }

      // Opdater hele historik arrayet i Firebase
      await updateDoc(taskRef, {
        historik: updatedHistorik,
        updatedAt: new Date().toISOString()
      })

      // Opdater lokal state
      const index = egenkontrollerData.value.findIndex(task => task.id === taskId)
      if (index !== -1) {
        egenkontrollerData.value[index] = {
          ...egenkontrollerData.value[index],
          historik: updatedHistorik
        }
      }

      return newStatus
    } catch (err) {
      console.error('Error updating tjeklisteFields:', err)
      throw err
    }
  }

  // NY FUNKTION: Opdater status fra afvigelse til udført med korrektion
  const updateEgenkontrolStatusWithCorrection = async (taskId, originalDate, correctionData) => {
    try {
      const taskRef = doc(db, 'Egenkontrol', taskId)
      const taskDoc = await getDoc(taskRef)
      const taskData = taskDoc.data()

      const historyIndex = taskData.historik.findIndex(entry => entry.dato === originalDate)
      if (historyIndex === -1) {
        throw new Error('No history entry found for the original date')
      }

      const originalEntry = taskData.historik[historyIndex]

      // Sikr at der faktisk var en afvigelse på denne dato
      if (originalEntry.status !== 'afvigelse') {
        throw new Error('Can only correct entries with deviation status')
      }

      const updatedHistorik = [...taskData.historik]

      if (correctionData.afvigelseUdbedret === 'ja') {
        // Marker som udført med korrektion
        updatedHistorik[historyIndex] = {
          ...originalEntry,
          status: 'udført', // Ændrer status til udført
          // Bevar den oprindelige afvigelse information
          oprindeligAfvigelse: {
            status: 'afvigelse',
            afsluttetDato: originalEntry.afsluttetDato,
            afsluttetAf: originalEntry.afsluttetAf,
            tjeklisteFields: originalEntry.tjeklisteFields
          },
          // Tilføj korrektion information
          korrektion: {
            korrigeret: true,
            korrektionsDato: correctionData.udbedringsDato,
            korrigeretAf: correctionData.udbedretAf,
            korrektionsBeskrivelse: correctionData.udbedringsBeskrivelse,
            korrektionsTidspunkt: new Date().toISOString()
          },
          // Opdater hovedfelter
          afsluttetDato: correctionData.udbedringsDato,
          afsluttetAf: correctionData.udbedretAf,
          manueltFuldført: true
        }
      } else {
        // Opdater bare beskrivelsen hvis ikke udbedret endnu
        updatedHistorik[historyIndex] = {
          ...originalEntry,
          statusOpdatering: {
            dato: correctionData.udbedringsDato,
            opdateretAf: correctionData.udbedretAf,
            beskrivelse: correctionData.udbedringsBeskrivelse,
            opdateringsTidspunkt: new Date().toISOString()
          }
        }
      }

      // Opdater hele historik arrayet i Firebase
      await updateDoc(taskRef, {
        historik: updatedHistorik,
        updatedAt: new Date().toISOString()
      })

      // Opdater lokal state
      const index = egenkontrollerData.value.findIndex(task => task.id === taskId)
      if (index !== -1) {
        egenkontrollerData.value[index] = {
          ...egenkontrollerData.value[index],
          historik: updatedHistorik
        }
      }

      return correctionData.afvigelseUdbedret === 'ja' ? 'udført' : 'afvigelse'
    } catch (err) {
      console.error('Error updating egenkontrol status with correction:', err)
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
            afsluttetDato: entry.afsluttetDato,
            dato: entry.dato,
            id: task.id,
            title: task.navn || task.name || 'Egenkontrol',
            details: task.lokation || task.location || '',
            historik: task.historik,
            modtagere: task.modtagere,
            påmindelser: task.påmindelser,
            // Tilføj adgang til tjeklisteFields for denne dato
            tjeklisteFields: entry.tjeklisteFields || [],
            // Tilføj korrektion og oprindelig afvigelse information
            korrektion: entry.korrektion || null,
            oprindeligAfvigelse: entry.oprindeligAfvigelse || null
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
          tjeklisteFields: [],
          fieldResults: []
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
    updateEgenkontrolStatus: updateStatusInFirebase,
    updateFieldResults,
    updateEgenkontrolStatusWithCorrection
  }
})
