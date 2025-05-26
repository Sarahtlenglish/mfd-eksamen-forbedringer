import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/configs/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore'

export const useTjeklisteStore = defineStore('tjekliste', () => {
  const tjeklister = ref([])
  const loading = ref(false)
  const error = ref(null)

  const tjeklisterData = computed(() => tjeklister.value)

  const getTjeklisteById = (id) => {
    return tjeklister.value.find(tjekliste => tjekliste.id === id)
  }

  const fetchTjeklister = async () => {
    loading.value = true
    try {
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
      tjeklister.value = fetchedTjeklister
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const addTjekliste = async (tjekliste) => {
    try {
      const docRef = await addDoc(collection(db, 'Tjeklister'), {
        tjeklisteNavn: tjekliste.tjeklisteNavn,
        beskrivelse: tjekliste.beskrivelse,
        type: tjekliste.type,
        frekvens: tjekliste.frekvens,
        tidspunkt: tjekliste.tidspunkt,
        opgaver: tjekliste.opgaver || [],
        createdAt: new Date()
      })

      const newTjekliste = {
        id: docRef.id,
        tjeklisteNavn: tjekliste.tjeklisteNavn,
        beskrivelse: tjekliste.beskrivelse,
        type: tjekliste.type,
        frekvens: tjekliste.frekvens,
        tidspunkt: tjekliste.tidspunkt,
        opgaver: tjekliste.opgaver || []
      }
      tjeklister.value = [...tjeklister.value, newTjekliste]
      return docRef.id
    } catch (err) {
      console.error('Error adding tjekliste:', err)
      throw err
    }
  }

  /* For when tjekliste update is implemented */
  const updateTjekliste = async (id, updatedData) => {
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

  const deleteTjekliste = async (id) => {
    try {
      await deleteDoc(doc(db, 'Tjeklister', id))
      tjeklister.value = tjeklister.value.filter(tjekliste => tjekliste.id !== id)
    } catch (err) {
      console.error('Error deleting tjekliste:', err)
      throw err
    }
  }

  const setupTjeklisterListener = () => {
    return onSnapshot(collection(db, 'Tjeklister'),
      (snapshot) => {
        const newTjeklister = snapshot.docs.map(doc => ({
          id: doc.id,
          tjeklisteNavn: doc.data().tjeklisteNavn,
          beskrivelse: doc.data().beskrivelse,
          type: doc.data().type,
          frekvens: doc.data().frekvens,
          tidspunkt: doc.data().tidspunkt,
          opgaver: doc.data().opgaver || []
        }))
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
    fetchTjeklister,
    addTjekliste,
    updateTjekliste,
    deleteTjekliste,
    setupTjeklisterListener
  }
})
