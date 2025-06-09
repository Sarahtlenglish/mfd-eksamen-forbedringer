// Handles offline data and sync for the PWA
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { indexedDBManager } from '@/utils/indexedDB'

export const useOfflineStore = defineStore('offline', () => {
  // Track network status and offline data
  const isOnline = ref(navigator.onLine)
  const pendingActions = ref([]) // Actions waiting to sync when online
  const offlineData = ref({
    brugere: [],
    enheder: [],
    egenkontrol: [],
    tjeklister: []
  })
  const dbInitialized = ref(false)

  // Initializes IndexedDB and loads cached data
  const initDatabase = async () => {
    try {
      console.log('🗄️ Initializing offline database...')
      const result = await indexedDBManager.init()
      dbInitialized.value = result

      await loadPendingActions()
      for (const collection of Object.keys(offlineData.value)) {
        try {
          const cachedData = await indexedDBManager.getAll(collection)
          if (cachedData.length > 0) {
            offlineData.value[collection] = cachedData
            console.log(`📦 Loaded ${cachedData.length} cached ${collection}`)
          }
        } catch (error) {
          console.warn(`⚠️ Could not load cached ${collection}:`, error.message)
        }
      }
      console.log('✅ Offline database initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize offline database:', error.message)
      dbInitialized.value = false
    }
  }

  // Updates online/offline status and triggers sync
  const updateOnlineStatus = () => {
    const wasOffline = !isOnline.value
    isOnline.value = navigator.onLine

    if (wasOffline && isOnline.value) {
      console.log('🌐 Back online - processing pending actions')
      setTimeout(() => processPendingActions(), 1000)
    } else if (!isOnline.value) {
      console.log('📴 Gone offline - entering offline mode')
    }
  }

  // Set up event listeners for online/offline events
  const setupNetworkListeners = () => {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
  }

  const removeNetworkListeners = () => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
  }

  // Stores data locally in IndexedDB
  const storeLocalData = async (collection, data) => {
    try {
      if (Array.isArray(data)) {
        await indexedDBManager.putMany(collection, data)
        offlineData.value[collection] = data
        console.log(`💾 Cached ${data.length} ${collection} items`)
      } else {
        await indexedDBManager.put(collection, data)
        const existingIndex = offlineData.value[collection]?.findIndex(item => item.id === data.id)
        if (existingIndex >= 0) {
          offlineData.value[collection][existingIndex] = data
        } else {
          if (!offlineData.value[collection]) offlineData.value[collection] = []
          offlineData.value[collection].push(data)
        }
        console.log(`💾 Cached ${collection} item: ${data.id}`)
      }
    } catch (error) {
      console.error(`❌ Failed to store ${collection} data:`, error.message)
    }
  }

  // Gets data from local IndexedDB
  const getLocalData = async (collection) => {
    try {
      const data = await indexedDBManager.getAll(collection)
      offlineData.value[collection] = data
      return data
    } catch (error) {
      console.warn(`⚠️ Could not get local ${collection} data:`, error.message)
      return []
    }
  }

  // Deletes data from local IndexedDB
  const deleteLocalData = async (collection, id) => {
    try {
      await indexedDBManager.delete(collection, id)
      offlineData.value[collection] = offlineData.value[collection].filter(item => item.id !== id)
      console.log(`🗑️ Deleted ${collection} item: ${id}`)
    } catch (error) {
      console.error(`❌ Failed to delete ${collection} item:`, error.message)
    }
  }

  // Adds an action to the sync queue
  const addPendingAction = async (action) => {
    try {
      const actionWithTimestamp = {
        ...action,
        timestamp: Date.now(),
        id: `${action.type}_${Date.now()}_${Math.random()}`
      }

      pendingActions.value.push(actionWithTimestamp)
      await indexedDBManager.put('pendingActions', actionWithTimestamp)
      console.log(`📋 Added pending action: ${action.type}`)
    } catch (error) {
      // Fallback to memory only
      console.warn('⚠️ Failed to persist pending action, using memory only:', error.message)
      const actionWithTimestamp = {
        ...action,
        timestamp: Date.now(),
        id: `${action.type}_${Date.now()}_${Math.random()}`
      }
      pendingActions.value.push(actionWithTimestamp)
    }
  }

  // Processes all queued actions when online
  const processPendingActions = async () => {
    if (!isOnline.value) return

    try {
      const actionsToProcess = await indexedDBManager.getAll('pendingActions')
      if (actionsToProcess.length === 0) return

      console.log(`🔄 Processing ${actionsToProcess.length} pending actions`)

      for (const action of actionsToProcess) {
        try {
          await processAction(action)
          await indexedDBManager.delete('pendingActions', action.id)
          const actionIndex = pendingActions.value.findIndex(a => a.id === action.id)
          if (actionIndex >= 0) {
            pendingActions.value.splice(actionIndex, 1)
          }
          console.log(`✅ Synced action: ${action.type}`)
        } catch (error) {
          console.warn(`⚠️ Failed to sync action ${action.type}:`, error.message)
          // Keep the action for next sync attempt
        }
      }
      console.log('🎉 All pending actions processed')
    } catch (error) {
      console.error('❌ Failed to process pending actions:', error.message)
    }
  }

  // Single function to process any action type
  const processAction = async (action) => {
    const { addDoc, updateDoc, deleteDoc, doc, collection, getDoc } = await import('firebase/firestore')
    const { db } = await import('@/configs/firebase')

    const { type, data } = action

    switch (type) {
      case 'ADD_BRUGER':
        await addDoc(collection(db, 'Brugere'), {
          fuldeNavn: data.fuldeNavn,
          email: data.email,
          rolle: data.rolle,
          telefon: data.telefon,
          createdAt: new Date()
        })
        break

      case 'UPDATE_BRUGER':
        await updateDoc(doc(db, 'Brugere', data.id), data.updatedData)
        break

      case 'DELETE_BRUGER':
        await deleteDoc(doc(db, 'Brugere', data.id))
        break

      case 'ADD_ENHED': {
        const enhedData = {
          enhedsNavn: data.name,
          beskrivelse: data.description,
          lokation: data.location,
          type: data.type,
          createdAt: new Date()
        }
        if (data.underenheder !== undefined) {
          enhedData.underenheder = data.underenheder
        }
        await addDoc(collection(db, 'Enheder'), enhedData)
        break
      }

      case 'UPDATE_ENHED': {
        const updateData = {
          enhedsNavn: data.updatedData.name,
          beskrivelse: data.updatedData.description,
          lokation: data.updatedData.location,
          type: data.updatedData.type
        }
        if (data.updatedData.underenheder !== undefined) {
          updateData.underenheder = data.updatedData.underenheder
        }
        await updateDoc(doc(db, 'Enheder', data.id), updateData)
        break
      }

      case 'DELETE_ENHED':
        await deleteDoc(doc(db, 'Enheder', data.id))
        break

      case 'ADD_TJEKLISTE':
        await addDoc(collection(db, 'Tjeklister'), {
          tjeklisteNavn: data.tjeklisteNavn,
          beskrivelse: data.beskrivelse,
          type: data.type,
          frekvens: data.frekvens,
          tidspunkt: data.tidspunkt,
          opgaver: data.opgaver || [],
          createdAt: new Date()
        })
        break

      case 'UPDATE_TJEKLISTE':
        await updateDoc(doc(db, 'Tjeklister', data.id), data.updatedData)
        break

      case 'DELETE_TJEKLISTE':
        await deleteDoc(doc(db, 'Tjeklister', data.id))
        break

      case 'ADD_EGENKONTROL':
        await addDoc(collection(db, 'Egenkontrol'), data)
        break

      case 'DELETE_EGENKONTROL':
        await deleteDoc(doc(db, 'Egenkontrol', data.id))
        break

      case 'UPDATE_EGENKONTROL_STATUS': {
        const taskRef = doc(db, 'Egenkontrol', data.taskId)
        const taskDoc = await getDoc(taskRef)
        const taskData = taskDoc.data()
        const historyIndex = taskData.historik.findIndex(entry => entry.dato === data.targetDate)
        if (historyIndex !== -1) {
          const updatedHistorik = [...taskData.historik]
          updatedHistorik[historyIndex] = {
            ...updatedHistorik[historyIndex],
            status: data.newStatus
          }
          await updateDoc(taskRef, { historik: updatedHistorik })
        }
        break
      }
    }
  }

  // Load pending actions from IndexedDB on init
  const loadPendingActions = async () => {
    try {
      const savedActions = await indexedDBManager.getAll('pendingActions')
      pendingActions.value = savedActions
      if (savedActions.length > 0) {
        console.log(`📋 Loaded ${savedActions.length} pending actions`)
      }
    } catch (error) {
      console.warn('⚠️ Could not load pending actions:', error.message)
      pendingActions.value = []
    }
  }

  // Cache response data for offline use (alias for storeLocalData)
  const cacheResponseData = storeLocalData

  // Clear all offline data
  const clearOfflineData = async () => {
    try {
      console.log('🧹 Clearing all offline data...')
      for (const collection of Object.keys(offlineData.value)) {
        await indexedDBManager.clear(collection)
        offlineData.value[collection] = []
      }
      await indexedDBManager.clear('pendingActions')
      pendingActions.value = []
      console.log('✅ All offline data cleared')
    } catch (error) {
      console.error('❌ Failed to clear offline data:', error.message)
    }
  }

  // Computed properties
  const hasConnection = computed(() => isOnline.value)
  const hasPendingActions = computed(() => pendingActions.value.length > 0)
  const isOffline = computed(() => !isOnline.value)

  // Initialize database on store creation
  initDatabase()

  return {
    // State
    isOnline: hasConnection,
    isOffline,
    pendingActions,
    offlineData,
    hasPendingActions,
    dbInitialized,

    // Network management
    setupNetworkListeners,
    removeNetworkListeners,
    updateOnlineStatus,

    // Data management
    storeLocalData,
    getLocalData,
    deleteLocalData,

    // Pending actions
    addPendingAction,
    processPendingActions,
    loadPendingActions,

    // Cache management
    cacheResponseData,
    getCachedData: getLocalData, // Use getLocalData instead of duplicate function
    clearOfflineData
  }
})
