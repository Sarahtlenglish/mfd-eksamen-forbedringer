import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  egenkontrollerData as initialData,
  formatTasksForCalendar
} from '@/mock/index'

export const useEgenkontrolStore = defineStore('egenkontrol', () => {
  // Brug data fra mockdata-filen
  const egenkontrollerData = ref([...initialData])

  // Methods for manipulating the data
  const addEgenkontrol = (egenkontrol) => {
    egenkontrollerData.value.push(egenkontrol)
  }

  const updateEgenkontrol = (updatedEgenkontrol) => {
    const index = egenkontrollerData.value.findIndex(e => e.id === updatedEgenkontrol.id)
    if (index !== -1) {
      egenkontrollerData.value[index] = updatedEgenkontrol
    }
  }

  const deleteEgenkontrol = (id) => {
    egenkontrollerData.value = egenkontrollerData.value.filter(e => e.id !== id)
  }

  // Get egenkontrol tasks for calendar - brug den delte formatteringsfunktion
  const getCalendarTasks = () => {
    return formatTasksForCalendar(egenkontrollerData.value)
  }

  return {
    egenkontrollerData,
    addEgenkontrol,
    updateEgenkontrol,
    deleteEgenkontrol,
    getCalendarTasks
  }
})
