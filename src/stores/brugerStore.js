import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/configs/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { useOfflineStore } from './offlineStore'

export const useBrugerStore = defineStore('bruger', () => {
  const brugere = ref([])
  const brugerNavne = ref({})
  const historyItems = ref([])
  const loading = ref(false)
  const error = ref(null)

  const getBrugerById = (id) => {
    return brugere.value.find(bruger => bruger.id === id)
  }

  // Fetches users from Firebase or offline cache
  const fetchBrugere = async () => {
    loading.value = true
    const offlineStore = useOfflineStore()

    try {
      // Offline: Load from cache
      if (!offlineStore.isOnline) {
        const cachedUsers = await offlineStore.getCachedData('brugere')
        // Build name mapping first
        brugerNavne.value = Object.fromEntries(
          cachedUsers.map(user => [user.id, user.fuldeNavn])
        )
        // Ensure all users have lederNavn calculated
        brugere.value = cachedUsers.map(user => ({
          ...user,
          lederNavn: user.brugereRef ? brugerNavne.value[user.brugereRef] : null
        }))
        return
      }

      // Online: Original logic
      const querySnapshot = await getDocs(collection(db, 'Brugere'))
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      brugerNavne.value = Object.fromEntries(
        users.map(user => [user.id, user.fuldeNavn])
      )

      brugere.value = users.map(user => ({
        ...user,
        lederNavn: user.brugereRef ? brugerNavne.value[user.brugereRef] : null
      }))

      // Cache for offline use
      await offlineStore.cacheResponseData('brugere', brugere.value)
    } catch (err) {
      error.value = err
      // Fallback to cache
      const cachedUsers = await offlineStore.getCachedData('brugere')
      brugerNavne.value = Object.fromEntries(
        cachedUsers.map(user => [user.id, user.fuldeNavn])
      )
      brugere.value = cachedUsers.map(user => ({
        ...user,
        lederNavn: user.brugereRef ? brugerNavne.value[user.brugereRef] : null
      }))
    } finally {
      loading.value = false
    }
  }

  // Adds a user (offline: queue for sync)
  const addBruger = async (bruger) => {
    const offlineStore = useOfflineStore()

    // Offline: Store temporarily
    if (!offlineStore.isOnline) {
      const tempBruger = {
        ...bruger,
        id: `temp_bruger_${Date.now()}`,
        createdAt: new Date(),
        lederNavn: bruger.brugereRef ? brugerNavne.value[bruger.brugereRef] : null
      }
      brugere.value.push(tempBruger)
      brugerNavne.value[tempBruger.id] = tempBruger.fuldeNavn
      await offlineStore.storeLocalData('brugere', tempBruger)
      await offlineStore.addPendingAction({ type: 'ADD_BRUGER', data: bruger })
      return tempBruger.id
    }

    // Online: Original logic
    try {
      const docRef = await addDoc(collection(db, 'Brugere'), {
        adresse: bruger.adresse || '',
        brugereRef: bruger.brugereRef || '',
        by: bruger.by || '',
        egenkontrolRef: bruger.egenkontrolRef || '',
        email: bruger.email || '',
        fuldeNavn: bruger.fuldeNavn || '',
        postnummer: bruger.postnummer || '',
        rolle: bruger.rolle || '',
        telefon: bruger.telefon || '',
        createdAt: new Date()
      })
      return docRef.id
    } catch (err) {
      console.error('Error adding bruger:', err)
      throw err
    }
  }

  // Updates a user (offline: queue for sync)
  const updateBruger = async (id, updatedData) => {
    const offlineStore = useOfflineStore()

    // Offline: Update locally
    if (!offlineStore.isOnline) {
      const index = brugere.value.findIndex(bruger => bruger.id === id)
      if (index !== -1) {
        brugere.value[index] = { ...brugere.value[index], ...updatedData }
        if (updatedData.fuldeNavn) {
          brugerNavne.value[id] = updatedData.fuldeNavn
        }
        await offlineStore.storeLocalData('brugere', brugere.value[index])
      }
      await offlineStore.addPendingAction({ type: 'UPDATE_BRUGER', data: { id, updatedData } })
      return
    }

    // Online: Original logic
    try {
      const updateFields = {}
      if (updatedData.adresse !== undefined) updateFields.adresse = updatedData.adresse
      if (updatedData.brugereRef !== undefined) updateFields.brugereRef = updatedData.brugereRef
      if (updatedData.by !== undefined) updateFields.by = updatedData.by
      if (updatedData.egenkontrolRef !== undefined) updateFields.egenkontrolRef = updatedData.egenkontrolRef
      if (updatedData.email !== undefined) updateFields.email = updatedData.email
      if (updatedData.fuldeNavn !== undefined) updateFields.fuldeNavn = updatedData.fuldeNavn
      if (updatedData.postnummer !== undefined) updateFields.postnummer = updatedData.postnummer
      if (updatedData.rolle !== undefined) updateFields.rolle = updatedData.rolle
      if (updatedData.telefon !== undefined) updateFields.telefon = updatedData.telefon

      await updateDoc(doc(db, 'Brugere', id), updateFields)
      const index = brugere.value.findIndex(bruger => bruger.id === id)
      if (index !== -1) {
        brugere.value[index] = { ...brugere.value[index], ...updateFields }
        if (updateFields.fuldeNavn) {
          brugerNavne.value[id] = updateFields.fuldeNavn
        }
      }
    } catch (err) {
      console.error('Error updating bruger:', err)
      throw err
    }
  }

  // Deletes a user (offline: queue for sync)
  const deleteBruger = async (id) => {
    const offlineStore = useOfflineStore()

    // Remove from local state immediately
    brugere.value = brugere.value.filter(bruger => bruger.id !== id)
    delete brugerNavne.value[id]

    // Offline: Queue for sync
    if (!offlineStore.isOnline) {
      await offlineStore.deleteLocalData('brugere', id)
      await offlineStore.addPendingAction({ type: 'DELETE_BRUGER', data: { id } })
      return
    }

    // Online: Original logic
    try {
      await deleteDoc(doc(db, 'Brugere', id))
    } catch (err) {
      console.error('Error deleting bruger:', err)
      throw err
    }
  }

  // Sets up real-time updates from Firebase (only online)
  const setupBrugereListener = () => {
    const offlineStore = useOfflineStore()
    if (!offlineStore.isOnline) return null

    return onSnapshot(collection(db, 'Brugere'),
      (snapshot) => {
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        brugerNavne.value = Object.fromEntries(
          users.map(user => [user.id, user.fuldeNavn])
        )

        brugere.value = users.map(user => ({
          ...user,
          lederNavn: user.brugereRef ? brugerNavne.value[user.brugereRef] : null
        }))

        // Cache for offline use
        offlineStore.cacheResponseData('brugere', brugere.value)
      },
      (err) => {
        error.value = err
      }
    )
  }

  return {
    brugere,
    brugerNavne,
    historyItems,
    loading,
    error,
    getBrugerById,
    fetchBrugere,
    addBruger,
    updateBruger,
    deleteBruger,
    setupBrugereListener
  }
})
