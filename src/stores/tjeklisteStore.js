import { defineStore } from 'pinia'
import { tjeklisteData } from '@/mock'

export const useTjeklisteStore = defineStore('tjekliste', {
  state: () => ({
    tjeklisterData: [...tjeklisteData]
  }),

  getters: {
    getTjeklisteById: state => (id) => {
      return state.tjeklisterData.find(item => item.id === id) || null
    }
  },

  actions: {
    addTjekliste(tjekliste) {
      // Sikrer at tjeklisten har et id
      if (!tjekliste.id) {
        tjekliste.id = Math.max(...this.tjeklisterData.map(item => item.id), 0) + 1
      }
      this.tjeklisterData.push(tjekliste)
    },

    updateTjekliste(tjekliste) {
      const index = this.tjeklisterData.findIndex(item => item.id === tjekliste.id)
      if (index !== -1) {
        this.tjeklisterData[index] = tjekliste
      }
    },

    deleteTjekliste(id) {
      this.tjeklisterData = this.tjeklisterData.filter(item => item.id !== id)
    }
  }
})
