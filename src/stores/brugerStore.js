import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/configs/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore'

export const useBrugerStore = defineStore('bruger', () => {
  // State
  const brugere = ref([])
  const brugerNavne = ref({})
  const historyItems = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const getBrugereByRole = (rolle) => {
    return brugere.value.filter(bruger => bruger.rolle === rolle)
  }

  const getBrugereByGruppe = (gruppe) => {
    return brugere.value.filter(bruger => bruger.gruppe === gruppe)
  }

  const getBrugerById = (id) => {
    return brugere.value.find(bruger => bruger.id === id)
  }

  const getHistoryForBruger = (brugerId) => {
    return historyItems.value.filter(item => item.brugerId === brugerId)
  }

  // Actions
  const fetchBrugere = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'Brugere'))
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Create name lookup map
      brugerNavne.value = Object.fromEntries(
        users.map(user => [user.id, user.fuldeNavn])
      )

      // Add leader names to users using the lookup
      brugere.value = users.map(user => ({
        ...user,
        lederNavn: user.brugereRef ? brugerNavne.value[user.brugereRef] : null
      }))
    } catch (err) {
      console.error('Error fetching brugere:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const addBruger = async (bruger) => {
    try {
      console.log('Adding bruger to Firestore:', bruger)
      const docRef = await addDoc(collection(db, 'Brugere'), {
        adresse: bruger.adresse || '',
        brugereRef: bruger.brugereRef || '', // Reference to another user (leader)
        by: bruger.by || '',
        egenkontrolRef: bruger.egenkontrolRef || '', // Reference to egenkontrol
        email: bruger.email || '',
        fuldeNavn: bruger.fuldeNavn || '',
        postnummer: bruger.postnummer || '',
        rolle: bruger.rolle || '',
        telefon: bruger.telefon || '',
        createdAt: new Date()
      })
      console.log('Successfully added bruger with ID:', docRef.id)
      return docRef.id
    } catch (err) {
      console.error('Error adding bruger:', err)
      throw err
    }
  }

  const updateBruger = async (id, updatedData) => {
    try {
      const updateFields = {}
      // Only update fields that exist in our schema
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
      // Update local state
      const index = brugere.value.findIndex(bruger => bruger.id === id)
      if (index !== -1) {
        brugere.value[index] = { ...brugere.value[index], ...updateFields }
      }
    } catch (err) {
      console.error('Error updating bruger:', err)
      throw err
    }
  }

  const deleteBruger = async (id) => {
    try {
      await deleteDoc(doc(db, 'Brugere', id))
      // Update local state
      brugere.value = brugere.value.filter(bruger => bruger.id !== id)
    } catch (err) {
      console.error('Error deleting bruger:', err)
      throw err
    }
  }

  // Set up real-time listener
  const setupBrugereListener = () => {
    console.log('Setting up brugere listener...')
    return onSnapshot(collection(db, 'Brugere'),
      (snapshot) => {
        console.log('Received Firestore update, docs:', snapshot.docs.length)
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Update name lookup map
        brugerNavne.value = Object.fromEntries(
          users.map(user => [user.id, user.fuldeNavn])
        )

        // Add leader names using the lookup
        brugere.value = users.map(user => ({
          ...user,
          lederNavn: user.brugereRef ? brugerNavne.value[user.brugereRef] : null
        }))
      },
      (err) => {
        console.error('Error in brugere listener:', err)
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
    getBrugereByRole,
    getBrugereByGruppe,
    getBrugerById,
    getHistoryForBruger,
    fetchBrugere,
    addBruger,
    updateBruger,
    deleteBruger,
    setupBrugereListener
  }
})
