import { ref } from 'vue'
import { defineStore } from 'pinia'
import { formatTasksForCalendar } from '@/mock/index'
import { db } from '@/configs/firebase'
import { collection, addDoc, deleteDoc, doc, getDocs, onSnapshot, getDoc } from 'firebase/firestore'

export const useEgenkontrolStore = defineStore('egenkontrol', () => {
  // State
  const egenkontrollerData = ref([])
  const loading = ref(false)
  const error = ref(null)

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

  // Get calendar tasks with resolved references
  const getCalendarTasks = async () => {
    const resolvedEgenkontroller = await Promise.all(
      egenkontrollerData.value.map(resolveReferences)
    )
    return formatTasksForCalendar(resolvedEgenkontroller)
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
    getCalendarTasks
  }
})
