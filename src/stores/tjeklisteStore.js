import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/configs/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore'

export const useTjeklisteStore = defineStore('tjekliste', () => {
  // State
  const tjeklister = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const tjeklisterData = computed(() => tjeklister.value)

  const getTjeklisteById = (id) => {
    return tjeklister.value.find(tjekliste => tjekliste.id === id)
  }

  const getTjeklisterByType = (type) => {
    return tjeklister.value.filter(tjekliste => tjekliste.type === type)
  }

  // Actions
  const fetchTjeklister = async () => {
    loading.value = true
    try {
      console.log('Fetching tjeklister from Firestore...')
      const querySnapshot = await getDocs(collection(db, 'Tjeklister'))
      const fetchedTjeklister = querySnapshot.docs.map(doc => ({
        id: doc.id,
        tjeklisteNavn: doc.data().tjeklisteNavn,
        beskrivelse: doc.data().beskrivelse,
        type: doc.data().type,
        frekvens: doc.data().frekvens,
        tidspunkt: doc.data().tidspunkt,
        opgaver: doc.data().opgaver || []
      }))
      console.log('Successfully fetched tjeklister:', fetchedTjeklister)
      tjeklister.value = fetchedTjeklister
    } catch (err) {
      console.error('Error fetching tjeklister:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const addTjekliste = async (tjekliste) => {
    try {
      console.log('Adding tjekliste to Firestore:', tjekliste)
      const docRef = await addDoc(collection(db, 'Tjeklister'), {
        tjeklisteNavn: tjekliste.tjeklisteNavn,
        beskrivelse: tjekliste.beskrivelse,
        type: tjekliste.type,
        frekvens: tjekliste.frekvens,
        tidspunkt: tjekliste.tidspunkt,
        opgaver: tjekliste.opgaver || [],
        createdAt: new Date()
      })
      console.log('Successfully added tjekliste with ID:', docRef.id)

      const newTjekliste = {
        id: docRef.id,
        tjeklisteNavn: tjekliste.tjeklisteNavn,
        beskrivelse: tjekliste.beskrivelse,
        type: tjekliste.type,
        frekvens: tjekliste.frekvens,
        tidspunkt: tjekliste.tidspunkt,
        opgaver: tjekliste.opgaver || []
      }
      // Add to local state
      tjeklister.value = [...tjeklister.value, newTjekliste]
      return docRef.id
    } catch (err) {
      console.error('Error adding tjekliste:', err)
      throw err
    }
  }

  const updateTjekliste = async (id, updatedData) => {
    try {
      console.log('Updating tjekliste:', id, updatedData)
      await updateDoc(doc(db, 'Tjeklister', id), updatedData)
      // Update local state
      const index = tjeklister.value.findIndex(tjekliste => tjekliste.id === id)
      if (index !== -1) {
        tjeklister.value[index] = { ...tjeklister.value[index], ...updatedData }
      }
    } catch (err) {
      console.error('Error updating tjekliste:', err)
      throw err
    }
  }

  const deleteTjekliste = async (id) => {
    try {
      console.log('Deleting tjekliste:', id)
      await deleteDoc(doc(db, 'Tjeklister', id))
      // Update local state
      tjeklister.value = tjeklister.value.filter(tjekliste => tjekliste.id !== id)
      console.log('Successfully deleted tjekliste:', id)
    } catch (err) {
      console.error('Error deleting tjekliste:', err)
      throw err
    }
  }

  // Real-time listener
  const setupTjeklisterListener = () => {
    console.log('Setting up tjeklister listener...')
    return onSnapshot(collection(db, 'Tjeklister'),
      (snapshot) => {
        console.log('Received Firestore update, docs:', snapshot.docs.length)
        const newTjeklister = snapshot.docs.map(doc => ({
          id: doc.id,
          tjeklisteNavn: doc.data().tjeklisteNavn,
          beskrivelse: doc.data().beskrivelse,
          type: doc.data().type,
          frekvens: doc.data().frekvens,
          tidspunkt: doc.data().tidspunkt,
          opgaver: doc.data().opgaver || []
        }))
        console.log('Updated local state with tjeklister:', newTjeklister)
        tjeklister.value = newTjeklister
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
    getTjeklisterByType,
    fetchTjeklister,
    addTjekliste,
    updateTjekliste,
    deleteTjekliste,
    setupTjeklisterListener
  }
})
