import { defineStore } from 'pinia'
import { db } from '@/configs/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { ref } from 'vue'

export const useTjeklisteStore = defineStore('tjekliste', {
  state: () => ({
    tjeklister: ref([]),
    loading: false,
    error: null
  }),

  getters: {
    tjeklisterData: state => state.tjeklister
  },

  actions: {
    async fetchTjeklister() {
      this.loading = true
      try {
        const querySnapshot = await getDocs(collection(db, 'Tjeklister'))
        this.tjeklister = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error fetching tjeklister:', error)
        this.error = error
      } finally {
        this.loading = false
      }
    },

    async addTjekliste(tjekliste) {
      try {
        // Add to Firestore 'Tjeklister' collection
        const docRef = await addDoc(collection(db, 'Tjeklister'), tjekliste)
        return docRef.id
      } catch (error) {
        console.error('Error adding tjekliste:', error)
        throw error
      }
    },

    async deleteTjekliste(id) {
      try {
        await deleteDoc(doc(db, 'Tjeklister', id))
        // Remove from local state
        this.tjeklister = this.tjeklister.filter(t => t.id !== id)
      } catch (error) {
        console.error('Error deleting tjekliste:', error)
        throw error
      }
    },

    // Set up real-time listener for tjeklister
    setupTjeklisterListener() {
      const unsubscribe = onSnapshot(collection(db, 'Tjeklister'),
        (snapshot) => {
          this.tjeklister = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        },
        (error) => {
          console.error('Error in tjeklister listener:', error)
          this.error = error
        }
      )
      return unsubscribe
    }
  }
})
