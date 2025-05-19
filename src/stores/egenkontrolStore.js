import { ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/configs/firebase'
import { collection, addDoc, deleteDoc, doc, getDocs, onSnapshot, getDoc, updateDoc } from 'firebase/firestore'
import { formatDateToISO, generateDateArray, getNextDateByFrequency } from '@/utils/dateHelpers'
import { useTjeklisteStore } from '@/stores/tjeklisteStore'

export const useEgenkontrolStore = defineStore('egenkontrol', () => {
  // State
  const egenkontrollerData = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Helper to update status in Firestore
  const updateStatusInFirebase = async (taskId, newStatus, targetDate) => {
    try {
      const taskRef = doc(db, 'Egenkontrol', taskId)
      const taskDoc = await getDoc(taskRef)
      const taskData = taskDoc.data()

      // Find the history entry for the target date
      const historyIndex = taskData.historik.findIndex(entry => entry.dato === targetDate)
      if (historyIndex === -1) {
        throw new Error('No history entry found for the target date')
      }

      // Update the status in the history array
      const updatedHistorik = [...taskData.historik]
      updatedHistorik[historyIndex] = {
        ...updatedHistorik[historyIndex],
        status: newStatus
      }

      // Update the document with the new history array
      await updateDoc(taskRef, { historik: updatedHistorik })

      // Update the local state
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

  // Update statuses based on date and rules, and sync to Firestore
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

  // Helper: Opret fremtidige tasks for næste 2 måneder
  async function ensureFutureTasks() {
    const tjeklisteStore = useTjeklisteStore()
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normaliser til midnat

    const endDate = new Date()
    endDate.setMonth(today.getMonth() + 2)
    endDate.setHours(23, 59, 59, 999) // Sæt til slutningen af dagen

    for (const tjekliste of tjeklisteStore.tjeklister) {
      // Find eksisterende egenkontrol for denne tjekliste
      const egenkontrol = egenkontrollerData.value.find(t => t.checkliste === tjekliste.id)
      if (!egenkontrol) continue

      // Find sidste dato i historik
      const historik = egenkontrol.historik || []
      let lastDate = historik.length > 0 ? new Date(historik[historik.length - 1].dato) : new Date()
      lastDate.setHours(0, 0, 0, 0)

      // Tilføj fremtidige datoer til historik-arrayet
      const freq = tjekliste.frekvens
      let nextDate = new Date(lastDate)
      while (nextDate < endDate) {
        nextDate = getNextDateByFrequency(nextDate, freq)
        if (nextDate > endDate) break
        // Hvis datoen ikke allerede findes i historik
        if (!historik.some(h => h.dato === formatDateToISO(nextDate))) {
          historik.push({
            dato: formatDateToISO(nextDate),
            status: 'inaktiv',
            afsluttetAf: '',
            noter: ''
          })
        }
      }
      // Opdater egenkontrol i Firestore med nyt historik-array
      await updateDoc(doc(db, 'Egenkontrol', egenkontrol.id), { historik })
    }
  }

  // Fetch all egenkontroller
  const fetchEgenkontroller = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'Egenkontrol'))
      const egenkontroller = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      egenkontrollerData.value = egenkontroller
      // Opret fremtidige tasks for næste 2 måneder
      await ensureFutureTasks()
      await updateStatusesBasedOnDate()
    } catch (err) {
      console.error('Error fetching egenkontroller:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const setupEgenkontrollerListener = () => {
    return onSnapshot(collection(db, 'Egenkontrol'),
      (snapshot) => {
        const egenkontroller = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log('Firestore listener fired!', egenkontroller)
        egenkontrollerData.value = egenkontroller
      },
      (err) => {
        console.error('Error in egenkontroller listener:', err)
        error.value = err
      }
    )
  }

  // Add new egenkontrol (NY LOGIK)
  const addEgenkontrol = async (egenkontrol) => {
    console.log('Submitting egenkontrol:', egenkontrol)
    const tjeklisteStore = useTjeklisteStore()
    // Find tjekliste-data
    const tjeklisteId = egenkontrol.tjekliste || egenkontrol.checkliste
    const tjekliste = tjeklisteStore.getTjeklisteById(tjeklisteId)
    if (!tjekliste) {
      throw new Error('Tjekliste ikke fundet')
    }
    // Brug startDato fra egenkontrol eller fallback til i dag
    const startDato = egenkontrol.startDato || new Date().toISOString().split('T')[0]
    const frekvens = tjekliste.frekvens
    console.log('Frekvens brugt til generateDateArray:', frekvens)
    // Generér historik for de næste 10 perioder
    const datoer = generateDateArray(startDato, frekvens, 10)
    console.log('Datoer genereret til historik:', datoer)
    const historik = datoer.map(dato => ({
      dato,
      status: 'inaktiv',
      afsluttetAf: '',
      noter: ''
    }))
    // Opret dokumentet
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
    // Add main document
    const docRef = await addDoc(collection(db, 'Egenkontrol'), egenkontrolDoc)
    return docRef.id
  }

  const deleteEgenkontrol = async (id) => {
    try {
      console.log('Deleting egenkontrol:', id)
      await deleteDoc(doc(db, 'Egenkontrol', id))
      // Update local state
      egenkontrollerData.value = egenkontrollerData.value.filter(egenkontrol => egenkontrol.id !== id)
      console.log('Successfully deleted egenkontrol:', id)
    } catch (err) {
      console.error('Error deleting tjekliste:', err)
      throw err
    }
  }

  // Helper to resolve references for display
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

  // Hybrid formatTasksForCalendar
  const formatTasksForCalendar = (tasks) => {
    const calendarTasks = {}

    tasks.forEach((task) => {
      // Hvis task har historik-array (ny struktur)
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
        // Fald tilbage til gammel struktur - denne del kan fjernes når alle tasks er migreret
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
          status: 'inaktiv', // Default status for gamle tasks
          påmindelser: task.påmindelser
        })
      }
    })

    return calendarTasks
  }

  // Get calendar tasks with resolved references
  const getCalendarTasks = async () => {
    try {
      // Ensure we have the latest data
      if (egenkontrollerData.value.length === 0) {
        await fetchEgenkontroller()
      }

      // Format tasks for calendar without resolving references
      const formattedTasks = formatTasksForCalendar(egenkontrollerData.value)
      return formattedTasks
    } catch (err) {
      console.error('Error getting calendar tasks:', err)
      return {}
    }
  }

  // Synchronous version for computed property
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
