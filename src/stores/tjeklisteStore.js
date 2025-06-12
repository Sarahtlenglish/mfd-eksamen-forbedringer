import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/configs/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { useOfflineStore } from './offlineStore'

export const useTjeklisteStore = defineStore('tjekliste', () => {
  const tjeklister = ref([])
  const tjeklisteResultater = ref([])
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
        tidspunkt: doc.data().tidspunkt,
        tjeklisteFields: doc.data().tjeklisteFields || [], // Dynamiske felter
        opgaver: doc.data().opgaver || [],
        createdAt: doc.data().createdAt,
        updatedAt: doc.data().updatedAt
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
      const tempTjekliste = {
        id: `temp_tjekliste_${Date.now()}`,
        tjeklisteNavn: tjekliste.tjeklisteNavn,
        beskrivelse: tjekliste.beskrivelse,
        type: tjekliste.type,
        frekvens: tjekliste.frekvens,
        tidspunkt: tjekliste.tidspunkt,
        opgaver: tjekliste.opgaver || []
      }
      tjeklister.value = [...tjeklister.value, tempTjekliste]
      await offlineStore.storeLocalData('tjeklister', tempTjekliste)
      await offlineStore.addPendingAction({ type: 'ADD_TJEKLISTE', data: tjekliste })
      return tempTjekliste.id
    }

    // Online: Original logic
    try {
      // Sikr at tjeklisteFields altid er et array
      const tjeklisteFields = tjekliste.tjeklisteFields || []

      // Tilføj unique IDs til hver felt (kun hvis der er felter)
      const tjeklisteFieldsWithIds = tjeklisteFields.map((field, index) => ({
        ...field,
        id: `field_${Date.now()}_${index}`,
        order: index + 1
      }))

      const docRef = await addDoc(collection(db, 'Tjeklister'), {
        tjeklisteNavn: tjekliste.tjeklisteNavn,
        beskrivelse: tjekliste.beskrivelse,
        type: tjekliste.type,
        frekvens: tjekliste.frekvens,
        tjeklisteFields: tjeklisteFieldsWithIds,
        opgaver: tjekliste.opgaver || [],
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const newTjekliste = {
        id: docRef.id,
        tjeklisteNavn: tjekliste.tjeklisteNavn,
        beskrivelse: tjekliste.beskrivelse,
        type: tjekliste.type,
        frekvens: tjekliste.frekvens,
        tjeklisteFields: tjeklisteFieldsWithIds,
        opgaver: tjekliste.opgaver || []
      }
      tjeklister.value = [...tjeklister.value, newTjekliste]
      return docRef.id
    } catch (err) {
      console.error('Error adding tjekliste:', err)
      throw err
    }
  }

  // Ny funktion: Opret tjekliste resultat når egenkontrol udføres
  const createTjeklisteResultat = async (tjeklisteId, egenkontrolId, userId) => {
    try {
      const tjekliste = getTjeklisteById(tjeklisteId)
      if (!tjekliste) throw new Error('Tjekliste not found')

      // Sikr at tjeklisteFields eksisterer
      const tjeklisteFields = tjekliste.tjeklisteFields || []

      // Initialiser tomme resultater baseret på tjekliste felter
      const fieldResults = tjeklisteFields.map(field => ({
        fieldId: field.id,
        type: field.type,
        title: field.title,
        answer: null, // Til yes/no felter
        comment: '', // Til alle comment felter
        imageUrl: null, // Til upload felter
        completed: false,
        required: field.required || false
      }))

      const resultatData = {
        tjeklisteId,
        egenkontrolId,
        fieldResults,
        status: tjeklisteFields.length === 0 ? 'completed' : 'pending', // Automatisk completed hvis ingen felter
        createdAt: new Date(),
        createdBy: userId
      }

      const docRef = await addDoc(collection(db, 'TjeklisteResultater'), resultatData)

      const newResultat = {
        id: docRef.id,
        ...resultatData
      }

      tjeklisteResultater.value = [...tjeklisteResultater.value, newResultat]
      return docRef.id
    } catch (err) {
      console.error('Error creating tjekliste resultat:', err)
      throw err
    }
  }

  // Opdater et specifikt felt resultat
  const updateFieldResultat = async (resultatId, fieldId, fieldData) => {
    try {
      const resultat = tjeklisteResultater.value.find(r => r.id === resultatId)
      if (!resultat) throw new Error('Resultat not found')

      // Find og opdater det specifikke felt
      const updatedFieldResults = resultat.fieldResults.map((field) => {
        if (field.fieldId === fieldId) {
          return { ...field, ...fieldData, completed: true }
        }
        return field
      })

      // Tjek om alle required felter er udfyldt
      const allRequiredCompleted = updatedFieldResults
        .filter(field => field.required)
        .every(field => field.completed)

      const updatedData = {
        fieldResults: updatedFieldResults,
        status: allRequiredCompleted ? 'completed' : 'partial',
        updatedAt: new Date()
      }

      if (allRequiredCompleted) {
        updatedData.completedAt = new Date()
      }

      await updateDoc(doc(db, 'TjeklisteResultater', resultatId), updatedData)

      // Opdater lokal state
      const index = tjeklisteResultater.value.findIndex(r => r.id === resultatId)
      if (index !== -1) {
        tjeklisteResultater.value[index] = { ...resultat, ...updatedData }
      }
    } catch (err) {
      console.error('Error updating field resultat:', err)
      throw err
    }
  }

  // Hent resultater for en specifik egenkontrol
  const getTjeklisteResultaterForEgenkontrol = async (egenkontrolId) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'TjeklisteResultater'))
      const resultater = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(resultat => resultat.egenkontrolId === egenkontrolId)

      return resultater
    } catch (err) {
      console.error('Error fetching tjekliste resultater:', err)
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
      const updatePayload = {
        ...updatedData,
        updatedAt: new Date()
      }

      // Hvis tjeklisteFields bliver opdateret, sørg for at de har IDs
      if (updatedData.tjeklisteFields) {
        updatePayload.tjeklisteFields = updatedData.tjeklisteFields.map((field, index) => ({
          ...field,
          id: field.id || `field_${Date.now()}_${index}`,
          order: index + 1
        }))
      }

      await updateDoc(doc(db, 'Tjeklister', id), updatePayload)

      const index = tjeklister.value.findIndex(tjekliste => tjekliste.id === id)
      if (index !== -1) {
        tjeklister.value[index] = { ...tjeklister.value[index], ...updatePayload }
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
          tidspunkt: doc.data().tidspunkt,
          tjeklisteFields: doc.data().tjeklisteFields || [],
          opgaver: doc.data().opgaver || [],
          createdAt: doc.data().createdAt,
          updatedAt: doc.data().updatedAt
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
    tjeklisteResultater,
    loading,
    error,
    tjeklisterData,
    getTjeklisteById,
    fetchTjeklister,
    addTjekliste,
    updateTjekliste,
    deleteTjekliste,
    setupTjeklisterListener,
    // Nye funktioner til resultater
    createTjeklisteResultat,
    updateFieldResultat,
    getTjeklisteResultaterForEgenkontrol
  }
})
