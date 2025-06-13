import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/configs/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { useOfflineStore } from './offlineStore'

export const useTjeklisteStore = defineStore('tjekliste', () => {
  const tjeklister = ref([])
  const loading = ref(false)
  const error = ref(null)

  const tjeklisterData = computed(() => tjeklister.value)

  const getTjeklisteById = (id) => {
    return tjeklister.value.find(tjekliste => tjekliste.id === id)
  }

  // Fetches checklists from Firebase or offline cache
  const fetchTjeklister = async () => {
    loading.value = true
    const offlineStore = useOfflineStore()

    try {
      // Offline: Load from cache
      if (!offlineStore.isOnline) {
        const cachedTjeklister = await offlineStore.getCachedData('tjeklister')
        tjeklister.value = cachedTjeklister
        return
      }

      // Online: Original logic
      const querySnapshot = await getDocs(collection(db, 'Tjeklister'))
      const fetchedTjeklister = querySnapshot.docs.map(doc => ({
        id: doc.id,
        tjeklisteNavn: doc.data().tjeklisteNavn,
        beskrivelse: doc.data().beskrivelse,
        type: doc.data().type,
        frekvens: doc.data().frekvens,
        opgaver: doc.data().opgaver || [],
        tjeklisteFields: doc.data().tjeklisteFields || []
      }))
      tjeklister.value = fetchedTjeklister

      // Cache for offline use
      await offlineStore.cacheResponseData('tjeklister', tjeklister.value)
    } catch (err) {
      error.value = err
      // Fallback to cache
      tjeklister.value = await offlineStore.getCachedData('tjeklister')
    } finally {
      loading.value = false
    }
  }

  // Adds a checklist (offline: queue for sync)
  const addTjekliste = async (tjekliste) => {
    const offlineStore = useOfflineStore()

    // Offline: Store temporarily
    if (!offlineStore.isOnline) {
      const tempId = `temp_tjekliste_${Date.now()}`
      const tempTjekliste = {
        id: tempId,
        tjeklisteNavn: tjekliste.tjeklisteNavn,
        beskrivelse: tjekliste.beskrivelse,
        type: tjekliste.type,
        frekvens: tjekliste.frekvens,
        opgaver: tjekliste.opgaver || [],
        tjeklisteFields: tjekliste.tjeklisteFields || []
      }
      tjeklister.value = [...tjeklister.value, tempTjekliste]
      await offlineStore.storeLocalData('tjeklister', tempTjekliste)
      await offlineStore.addPendingAction({
        type: 'ADD_TJEKLISTE',
        data: tjekliste,
        tempId
      })
      return tempId
    }

    // Online: Original logic
    try {
      const docRef = await addDoc(collection(db, 'Tjeklister'), {
        tjeklisteNavn: tjekliste.tjeklisteNavn,
        beskrivelse: tjekliste.beskrivelse,
        type: tjekliste.type,
        frekvens: tjekliste.frekvens,
        opgaver: tjekliste.opgaver || [],
        tjeklisteFields: tjekliste.tjeklisteFields || [],
        createdAt: new Date()
      })

      const newTjekliste = {
        id: docRef.id,
        tjeklisteNavn: tjekliste.tjeklisteNavn,
        beskrivelse: tjekliste.beskrivelse,
        type: tjekliste.type,
        frekvens: tjekliste.frekvens,
        opgaver: tjekliste.opgaver || [],
        tjeklisteFields: tjekliste.tjeklisteFields || []
      }
      tjeklister.value = [...tjeklister.value, newTjekliste]
      return docRef.id
    } catch (err) {
      console.error('Error adding tjekliste:', err)
      throw err
    }
  }

  // Updates a checklist (offline: queue for sync)
  const updateTjekliste = async (id, updatedData) => {
    const offlineStore = useOfflineStore()

    // Offline: Update locally
    if (!offlineStore.isOnline) {
      const index = tjeklister.value.findIndex(tjekliste => tjekliste.id === id)
      if (index !== -1) {
        tjeklister.value[index] = { ...tjeklister.value[index], ...updatedData }
        await offlineStore.storeLocalData('tjeklister', tjeklister.value[index])
      }
      await offlineStore.addPendingAction({ type: 'UPDATE_TJEKLISTE', data: { id, updatedData } })
      return
    }

    // Online: Original logic
    try {
      await updateDoc(doc(db, 'Tjeklister', id), updatedData)
      const index = tjeklister.value.findIndex(tjekliste => tjekliste.id === id)
      if (index !== -1) {
        tjeklister.value[index] = { ...tjeklister.value[index], ...updatedData }
      }
    } catch (err) {
      console.error('Error updating tjekliste:', err)
      throw err
    }
  }

  // Deletes a checklist (offline: queue for sync)
  const deleteTjekliste = async (id) => {
    const offlineStore = useOfflineStore()

    // Remove from local state immediately
    tjeklister.value = tjeklister.value.filter(tjekliste => tjekliste.id !== id)

    // Offline: Queue for sync
    if (!offlineStore.isOnline) {
      await offlineStore.deleteLocalData('tjeklister', id)
      await offlineStore.addPendingAction({ type: 'DELETE_TJEKLISTE', data: { id } })
      return
    }

    // Online: Original logic
    try {
      await deleteDoc(doc(db, 'Tjeklister', id))
    } catch (err) {
      console.error('Error deleting tjekliste:', err)
      throw err
    }
  }

  // Sets up real-time updates from Firebase (only online)
  const setupTjeklisterListener = () => {
    const offlineStore = useOfflineStore()
    if (!offlineStore.isOnline) return null

    return onSnapshot(collection(db, 'Tjeklister'),
      (snapshot) => {
        const newTjeklister = snapshot.docs.map(doc => ({
          id: doc.id,
          tjeklisteNavn: doc.data().tjeklisteNavn,
          beskrivelse: doc.data().beskrivelse,
          type: doc.data().type,
          frekvens: doc.data().frekvens,
          opgaver: doc.data().opgaver || [],
          tjeklisteFields: doc.data().tjeklisteFields || []
        }))
        tjeklister.value = newTjeklister

        // Cache for offline use
        offlineStore.cacheResponseData('tjeklister', tjeklister.value)
      },
      (err) => {
        console.error('Error in tjeklister listener:', err)
        error.value = err
      }
    )
  }

  return {
    tjeklister,
    loading,
    error,
    tjeklisterData,
    getTjeklisteById,
    fetchTjeklister,
    addTjekliste,
    updateTjekliste,
    deleteTjekliste,
    setupTjeklisterListener
  }
})
