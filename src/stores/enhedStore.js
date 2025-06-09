import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/configs/firebase'
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { useOfflineStore } from './offlineStore'

// Hardcoded history data for prototype
const mockHistoryItems = [
  {
    id: 1,
    type: 'NextInspection',
    title: 'Næste egenkontrol om 336 dage',
    date: 'Egenkontrol title',
    user: 'Christian Hansen'
  },
  {
    id: 2,
    type: 'dokumenter',
    title: 'Faktura fra Kasper Bohr',
    date: '1/3/2025',
    user: 'Christian Hansen'
  },
  {
    id: 3,
    type: 'opgave',
    title: 'Udført brændørs lukkemekaniske - Bygning A',
    date: '24/2/2025',
    user: 'Kasper Bohr'
  },
  {
    id: 4,
    type: 'kommentar',
    title: 'Mekaniker er tilkaldt til at fikse døren',
    date: '22/2/2025',
    user: 'Christian Hansen'
  },
  {
    id: 5,
    type: 'udført',
    title: 'Egenkontrol udført',
    date: '18/2/2025',
    user: 'Christian Hansen'
  }
]

export const useEnhedStore = defineStore('enhedStore', () => {
  const enheder = ref([])
  const loading = ref(false)
  const error = ref(null)

  const getEnhedById = (id) => {
    return enheder.value.find(enhed => enhed.id === id)
  }

  const getHistoryForEnhed = () => {
    return mockHistoryItems
  }

  // Fetches units from Firebase or offline cache
  const fetchEnheder = async () => {
    loading.value = true
    const offlineStore = useOfflineStore()

    try {
      // Offline: Load from cache
      if (!offlineStore.isOnline) {
        enheder.value = await offlineStore.getCachedData('enheder')
        return
      }

      // Online: Original logic
      const querySnapshot = await getDocs(collection(db, 'Enheder'))
      enheder.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().enhedsNavn,
        description: doc.data().beskrivelse,
        location: doc.data().lokation,
        type: doc.data().type,
        underenheder: doc.data().underenheder
      }))

      // Cache for offline use
      await offlineStore.cacheResponseData('enheder', enheder.value)
    } catch (err) {
      error.value = err
      // Fallback to cache
      enheder.value = await offlineStore.getCachedData('enheder')
    } finally {
      loading.value = false
    }
  }

  // Adds a unit (offline: queue for sync)
  const addEnhed = async (enhed) => {
    const offlineStore = useOfflineStore()

    // Offline: Store temporarily
    if (!offlineStore.isOnline) {
      const tempEnhed = {
        id: `temp_enhed_${Date.now()}`,
        name: enhed.name,
        description: enhed.description,
        location: enhed.location,
        type: enhed.type,
        underenheder: enhed.underenheder
      }
      enheder.value = [...enheder.value, tempEnhed]
      await offlineStore.storeLocalData('enheder', tempEnhed)
      await offlineStore.addPendingAction({ type: 'ADD_ENHED', data: enhed })
      return tempEnhed.id
    }

    // Online: Original logic
    try {
      const docRef = await addDoc(collection(db, 'Enheder'), {
        enhedsNavn: enhed.name,
        beskrivelse: enhed.description,
        lokation: enhed.location,
        type: enhed.type,
        createdAt: new Date()
      })

      const newEnhed = {
        id: docRef.id,
        name: enhed.name,
        description: enhed.description,
        location: enhed.location,
        type: enhed.type
      }
      enheder.value = [...enheder.value, newEnhed]
      return docRef.id
    } catch (err) {
      console.error('Error adding enhed:', err)
      throw err
    }
  }

  // Updates a unit (offline: queue for sync)
  const updateEnhed = async (id, updatedData) => {
    const offlineStore = useOfflineStore()

    // Offline: Update locally
    if (!offlineStore.isOnline) {
      const index = enheder.value.findIndex(enhed => enhed.id === id)
      if (index !== -1) {
        enheder.value[index] = { ...enheder.value[index], ...updatedData }
        await offlineStore.storeLocalData('enheder', enheder.value[index])
      }
      await offlineStore.addPendingAction({ type: 'UPDATE_ENHED', data: { id, updatedData } })
      return
    }

    // Online: Original logic
    try {
      await updateDoc(doc(db, 'Enheder', id), {
        enhedsNavn: updatedData.name,
        beskrivelse: updatedData.description,
        lokation: updatedData.location,
        type: updatedData.type,
        underenheder: updatedData.underenheder
      })
      const index = enheder.value.findIndex(enhed => enhed.id === id)
      if (index !== -1) {
        enheder.value[index] = { ...enheder.value[index], ...updatedData }
      }
    } catch (err) {
      console.error('Error updating enhed:', err)
      throw err
    }
  }

  // Deletes a unit (offline: queue for sync)
  const deleteEnhed = async (id) => {
    const offlineStore = useOfflineStore()

    // Remove from local state immediately
    enheder.value = enheder.value.filter(enhed => enhed.id !== id)

    // Offline: Queue for sync
    if (!offlineStore.isOnline) {
      await offlineStore.deleteLocalData('enheder', id)
      await offlineStore.addPendingAction({ type: 'DELETE_ENHED', data: { id } })
      return
    }

    // Online: Original logic
    try {
      await deleteDoc(doc(db, 'Enheder', id))
    } catch (err) {
      console.error('Error deleting enhed:', err)
      throw err
    }
  }

  const addGruppe = async (gruppe) => {
    const offlineStore = useOfflineStore()

    // Offline: Store temporarily
    if (!offlineStore.isOnline) {
      const tempGruppe = {
        id: `temp_gruppe_${Date.now()}`,
        name: gruppe.name,
        description: gruppe.description,
        location: gruppe.location,
        type: 'Gruppe',
        underenheder: gruppe.underenheder
      }
      enheder.value = [...enheder.value, tempGruppe]
      await offlineStore.storeLocalData('enheder', tempGruppe)
      await offlineStore.addPendingAction({
        type: 'ADD_ENHED',
        data: { ...gruppe, type: 'Gruppe' }
      })
      return tempGruppe.id
    }

    // Online: Original logic
    try {
      const docRef = await addDoc(collection(db, 'Enheder'), {
        enhedsNavn: gruppe.name,
        beskrivelse: gruppe.description,
        lokation: gruppe.location,
        type: 'Gruppe',
        underenheder: gruppe.underenheder,
        createdAt: new Date()
      })

      const newGruppe = {
        id: docRef.id,
        name: gruppe.name,
        description: gruppe.description,
        location: gruppe.location,
        type: 'Gruppe',
        underenheder: gruppe.underenheder
      }
      enheder.value = [...enheder.value, newGruppe]
      return docRef.id
    } catch (err) {
      console.error('Error adding gruppe:', err)
      throw err
    }
  }

  // Sets up real-time updates from Firebase (only online)
  const setupEnhederListener = () => {
    const offlineStore = useOfflineStore()
    if (!offlineStore.isOnline) return null

    return onSnapshot(collection(db, 'Enheder'),
      (snapshot) => {
        const newEnheder = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().enhedsNavn,
          description: doc.data().beskrivelse,
          location: doc.data().lokation,
          type: doc.data().type,
          underenheder: doc.data().underenheder
        }))
        enheder.value = newEnheder

        // Cache for offline use
        offlineStore.cacheResponseData('enheder', enheder.value)
      },
      (err) => {
        error.value = err
      }
    )
  }

  return {
    enheder,
    loading,
    error,
    getEnhedById,
    getHistoryForEnhed,
    fetchEnheder,
    addEnhed,
    addGruppe,
    updateEnhed,
    deleteEnhed,
    setupEnhederListener
  }
})
