import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/configs/firebase'
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore'

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
  // State
  const enheder = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const getEnhederByLocation = (location) => {
    return enheder.value.filter(enhed => enhed.location === location)
  }

  const getEnhedById = (id) => {
    return enheder.value.find(enhed => enhed.id === id)
  }

  const getHistoryForEnhed = () => {
    // Return mock data for prototype
    return mockHistoryItems
  }

  const getGroupedEnheder = () => {
    const grouped = {}
    enheder.value.forEach((enhed) => {
      if (!grouped[enhed.location]) {
        grouped[enhed.location] = []
      }
      grouped[enhed.location].push(enhed)
    })
    return grouped
  }

  // Actions
  const fetchEnheder = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'Enheder'))
      enheder.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().enhedsNavn,
        description: doc.data().beskrivelse,
        location: doc.data().lokation,
        type: doc.data().type,
        underenheder: doc.data().underenheder
      }))
    } catch (err) {
      console.error('Error fetching enheder:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const addEnhed = async (enhed) => {
    try {
      console.log('Adding enhed to Firestore:', enhed)
      const docRef = await addDoc(collection(db, 'Enheder'), {
        enhedsNavn: enhed.name,
        beskrivelse: enhed.description,
        lokation: enhed.location,
        type: enhed.type,
        createdAt: new Date()
      })
      console.log('Successfully added enhed with ID:', docRef.id)

      const newEnhed = {
        id: docRef.id,
        name: enhed.name,
        description: enhed.description,
        location: enhed.location,
        type: enhed.type
      }
      // Add to local state
      enheder.value = [...enheder.value, newEnhed]
      return docRef.id
    } catch (err) {
      console.error('Error adding enhed:', err)
      throw err
    }
  }

  const updateEnhed = async (id, updatedData) => {
    try {
      await updateDoc(doc(db, 'enheder', id), updatedData)
      // Update local state
      const index = enheder.value.findIndex(enhed => enhed.id === id)
      if (index !== -1) {
        enheder.value[index] = { ...enheder.value[index], ...updatedData }
      }
    } catch (err) {
      console.error('Error updating enhed:', err)
      throw err
    }
  }

  const deleteEnhed = async (id) => {
    try {
      await deleteDoc(doc(db, 'Enheder', id))
      // Update local state
      enheder.value = enheder.value.filter(enhed => enhed.id !== id)
    } catch (err) {
      console.error('Error deleting enhed:', err)
      throw err
    }
  }

  // For gruppe enheder
  const addGruppe = async (gruppe) => {
    try {
      console.log('Adding gruppe to Firestore:', gruppe)
      const docRef = await addDoc(collection(db, 'Enheder'), {
        enhedsNavn: gruppe.name,
        beskrivelse: gruppe.description,
        lokation: gruppe.location,
        type: 'Gruppe',
        underenheder: gruppe.underenheder,
        createdAt: new Date()
      })
      console.log('Successfully added gruppe with ID:', docRef.id)

      const newGruppe = {
        id: docRef.id,
        name: gruppe.name,
        description: gruppe.description,
        location: gruppe.location,
        type: 'Gruppe',
        underenheder: gruppe.underenheder
      }
      // Add to local state
      enheder.value = [...enheder.value, newGruppe]
      return docRef.id
    } catch (err) {
      console.error('Error adding gruppe:', err)
      throw err
    }
  }

  // Set up real-time listener
  const setupEnhederListener = () => {
    console.log('Setting up enheder listener...')
    return onSnapshot(collection(db, 'Enheder'),
      (snapshot) => {
        console.log('Received Firestore update, docs:', snapshot.docs.length)
        const newEnheder = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().enhedsNavn,
          description: doc.data().beskrivelse,
          location: doc.data().lokation,
          type: doc.data().type,
          underenheder: doc.data().underenheder
        }))
        console.log('Updated local state with enheder:', newEnheder)
        enheder.value = newEnheder
      },
      (err) => {
        console.error('Error in enheder listener:', err)
        error.value = err
      }
    )
  }

  return {
    enheder,
    loading,
    error,
    getEnhederByLocation,
    getEnhedById,
    getHistoryForEnhed,
    getGroupedEnheder,
    fetchEnheder,
    addEnhed,
    addGruppe,
    updateEnhed,
    deleteEnhed,
    setupEnhederListener
  }
})
