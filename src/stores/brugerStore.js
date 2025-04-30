import { defineStore } from 'pinia'
import { ref } from 'vue'

// Assuming these are imported from mock data files
// If not available, we'll use inline mock data
// import { brugereData, brugerHistoryItems } from '@/mock/data/brugere'

// Fallback mock data in case imports aren't available
const mockBrugereData = [
  { 
    id: 1, 
    name: 'Anders Jensen', 
    role: 'Service Bruger', 
    email: 'a@b.dk', 
    telefon: '12345678', 
    gruppe: 'Gruppe 1', 
    adresse: 'Adresselinje 1', 
    postnummer: '1234', 
    by: 'Bynavn', 
    leder: 'Christian Hansen', 
    ansvarlig_for_egenkontrol: 'Egenkontrol 1' 
  },
  { 
    id: 2, 
    name: 'Tanja Lund', 
    role: 'Facility Manager', 
    email: 'a@b.dk', 
    telefon: '12345678', 
    gruppe: 'Gruppe 2', 
    adresse: 'Adresselinje 1', 
    postnummer: '1234', 
    by: 'Bynavn', 
    leder: 'Christian Hansen', 
    ansvarlig_for_egenkontrol: 'Egenkontrol 2' 
  }
]

const mockBrugerHistoryItems = []

export const brugerStore = defineStore('bruger', () => {
  // State
  const brugere = ref(mockBrugereData)
  const historyItems = ref(mockBrugerHistoryItems)

  // Getters
  const getBrugereByRole = (role) => {
    return brugere.value.filter(bruger => bruger.role === role)
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
  const addBruger = (bruger) => {
    console.log('Adding bruger to store:', bruger)
    // Generate a new ID
    const newId = Math.max(0, ...brugere.value.map(b => b.id)) + 1

    // Add the new user with the generated ID
    const newBruger = {
      id: newId,
      ...bruger,
      status: 'normal'
    }
    
    brugere.value.push(newBruger)
    console.log('Brugere after adding:', brugere.value)
    return newId
  }

  const updateBruger = (id, updatedData) => {
    const index = brugere.value.findIndex(bruger => bruger.id === id)
    if (index !== -1) {
      brugere.value[index] = { ...brugere.value[index], ...updatedData }
      return true
    }
    return false
  }

  const deleteBruger = (id) => {
    brugere.value = brugere.value.filter(bruger => bruger.id !== id)
  }

  // Add a history entry for a user
  const addHistoryEntry = (brugerId, entry) => {
    const newEntry = {
      id: Math.max(0, ...historyItems.value.map(h => h.id)) + 1,
      brugerId,
      date: new Date().toLocaleDateString('da-DK'),
      ...entry
    }

    historyItems.value.unshift(newEntry)
    return newEntry.id
  }

  return {
    brugere,
    historyItems,
    getBrugereByRole,
    getBrugereByGruppe,
    getBrugerById,
    getHistoryForBruger,
    addBruger,
    updateBruger,
    deleteBruger,
    addHistoryEntry
  }
})
