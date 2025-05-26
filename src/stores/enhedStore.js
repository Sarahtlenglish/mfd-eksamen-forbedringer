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
  const enheder = ref([])
  const loading = ref(false)
  const error = ref(null)

  const getEnhedById = (id) => {
    return enheder.value.find(enhed => enhed.id === id)
  }

  const getHistoryForEnhed = () => {
    return mockHistoryItems
  }

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
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const addEnhed = async (enhed) => {
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

  /* For when enheder update is implemented */
  const updateEnhed = async (id, updatedData) => {
    try {
      await updateDoc(doc(db, 'enheder', id), updatedData)
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
      enheder.value = enheder.value.filter(enhed => enhed.id !== id)
    } catch (err) {
      console.error('Error deleting enhed:', err)
      throw err
    }
  }

  const addGruppe = async (gruppe) => {
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

  const setupEnhederListener = () => {
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
