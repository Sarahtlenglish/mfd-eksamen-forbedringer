import { ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/configs/firebase'
import { collection, addDoc, deleteDoc, doc, getDocs, onSnapshot, getDoc, updateDoc } from 'firebase/firestore'

export const useEgenkontrolStore = defineStore('egenkontrol', () => {
  // State
  const egenkontrollerData = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Helper to update status in Firestore
  const updateStatusInFirebase = async (taskId, newStatus) => {
    try {
      await updateDoc(doc(db, 'Egenkontrol', taskId), { status: newStatus })
    } catch (err) {
      console.error('Error updating status in Firestore:', err)
    }
  }

  // Update statuses based on date and rules, and sync to Firestore
  const updateStatusesBasedOnDate = async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (const task of egenkontrollerData.value) {
      const taskDate = new Date(task.startDato || task.startDate)
      taskDate.setHours(0, 0, 0, 0)
      let newStatus = task.status
      if (task.status === 'udført') {
        newStatus = 'udført'
      } else if (task.status === 'afvigelse' && taskDate < today) {
        newStatus = 'afvigelse'
      } else if (taskDate < today && task.status !== 'udført') {
        newStatus = 'overskredet'
      } else if (taskDate.getTime() === today.getTime()) {
        newStatus = 'aktiv'
      } else {
        newStatus = 'inaktiv'
      }
      if (task.status !== newStatus) {
        task.status = newStatus
        await updateStatusInFirebase(task.id, newStatus)
      }
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
      await updateStatusesBasedOnDate()
    } catch (err) {
      console.error('Error fetching egenkontroller:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // Set up real-time listener
  const setupEgenkontrollerListener = () => {
    return onSnapshot(collection(db, 'Egenkontrol'),
      (snapshot) => {
        const egenkontroller = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        egenkontrollerData.value = egenkontroller
      },
      (err) => {
        console.error('Error in egenkontroller listener:', err)
        error.value = err
      }
    )
  }

  // Add new egenkontrol
  const addEgenkontrol = async (egenkontrol) => {
    console.log('Submitting egenkontrol:', egenkontrol)
    // Prepare Firestore references (support both single and array)
    const getRef = (collectionName, value) => {
      if (!value) return ''
      if (Array.isArray(value)) {
        return value.map(v => doc(db, collectionName, v))
      }
      return doc(db, collectionName, value)
    }

    // Gem ALT data fra egenkontrol (detailItem/formData) i Firestore
    const egenkontrolDoc = {
      ...egenkontrol,
      brugereRef: getRef('Brugere', Array.isArray(egenkontrol.ansvarlige) ? egenkontrol.ansvarlige[0] : (egenkontrol.ansvarlige || egenkontrol.responsibleUsers)),
      enhederRef: getRef('Enheder', egenkontrol.enhed || egenkontrol.location),
      tjeklisterRef: getRef('Tjeklister', egenkontrol.tjekliste || egenkontrol.checkliste)
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
        egenkontrol.brugereRef ? getDoc(egenkontrol.brugereRef) : null,
        egenkontrol.enhederRef ? getDoc(egenkontrol.enhederRef) : null,
        egenkontrol.tjeklisterRef ? getDoc(egenkontrol.tjeklisterRef) : null
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

  // Format tasks for calendar display
  const formatTasksForCalendar = (tasks) => {
    const calendarTasks = {}

    tasks.forEach((task) => {
      // Brug startDato eller startDate som dato
      const date = task.startDato || task.startDate
      if (!date) {
        console.log('No date found for task:', task)
        return
      }

      // Formatér dato til ISO string (YYYY-MM-DD)
      const dateKey = date.split('T')[0]

      // Opret array for denne dato hvis den ikke findes
      if (!calendarTasks[dateKey]) {
        calendarTasks[dateKey] = []
      }

      // Tilføj task til kalenderen
      calendarTasks[dateKey].push({
        id: task.id,
        title: task.navn || task.name || 'Egenkontrol',
        details: task.lokation || task.location || '',
        status: task.status || 'normal',
        originalTask: task // Gem hele task objektet for detaljeret visning
      })
    })

    console.log('Formatted calendar tasks:', calendarTasks)
    return calendarTasks
  }

  // Get calendar tasks with resolved references
  const getCalendarTasks = async () => {
    try {
      // Ensure we have the latest data
      if (egenkontrollerData.value.length === 0) {
        await fetchEgenkontroller()
      }

      // Resolve references for all egenkontroller
      const resolvedEgenkontroller = await Promise.all(
        egenkontrollerData.value.map(resolveReferences)
      )

      // Update statuses after resolving references
      await updateStatusesBasedOnDate()

      // Format tasks for calendar
      const formattedTasks = formatTasksForCalendar(resolvedEgenkontroller)

      return formattedTasks
    } catch (err) {
      console.error('Error getting calendar tasks:', err)
      return {}
    }
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
    updateStatusesBasedOnDate
  }
})
