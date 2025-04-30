import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhederData, enhederHistoryItems, enhederStandardData } from '@/mock/data/enheder'

export const useEnhedStore = defineStore('enhedStore', () => {
  // State from your mock data
  const enhederData = ref(enhederData)
  const enhederHistoryItems = ref(enhederHistoryItems)
  const enhederStandardData = ref(enhederStandardData)

  // Getters
  const getEnhederByLocation = (location) => {
    return enhederData.value.filter(enhed => enhed.location === location)
  }

  const getEnhedById = (id) => {
    return enhederData.value.find(enhed => enhed.id === id)
  }

  const getHistoryForEnhed = (enhedId) => {
    // In a real app, this would filter by the actual enhed ID
    return enhederHistoryItems.value
  }

  const getGroupedEnheder = () => {
    // Group enheder by location
    const grouped = {}
    enhederData.value.forEach(enhed => {
      if (!grouped[enhed.location]) {
        grouped[enhed.location] = []
      }
      grouped[enhed.location].push(enhed)
    })
    return grouped
  }

  // Actions
  const addEnhed = (enhed) => {
    enhederData.value.push({
      id: Math.max(0, ...enhederData.value.map(e => e.id)) + 1,
      ...enhed
    })
  }

  const updateEnhed = (id, updatedData) => {
    const index = enhederData.value.findIndex(enhed => enhed.id === id)
    if (index !== -1) {
      enhederData.value[index] = { ...enhederData.value[index], ...updatedData }
    }
  }

  const deleteEnhed = (id) => {
    enhederData.value = enhederData.value.filter(enhed => enhed.id !== id)
  }

  // For gruppe enheder
  const addGruppe = (gruppe) => {
    // In a real app, this would handle the group differently
    addEnhed(gruppe)
  }

  return {
    enhederData,
    enhederHistoryItems,
    enhederStandardData,
    getEnhederByLocation,
    getEnhedById,
    getHistoryForEnhed,
    getGroupedEnheder,
    addEnhed,
    addGruppe,
    updateEnhed,
    deleteEnhed
  }
})