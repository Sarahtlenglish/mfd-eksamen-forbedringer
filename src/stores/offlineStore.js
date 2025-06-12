// Handles offline data and sync for the PWA
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { indexedDBManager } from '@/utils/indexedDB'
import { syncManager } from './syncManager'

export const useOfflineStore = defineStore('offline', () => {
  // Track network status and offline data
  const isOnline = ref(navigator.onLine)
  const pendingActions = ref([])
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

      const results = await syncManager.processAll(actionsToProcess)

      // Clean up successful actions and refresh data
      for (const result of results) {
        if (result.status === 'success') {
          await indexedDBManager.delete('pendingActions', result.id)
          const actionIndex = pendingActions.value.findIndex(a => a.id === result.id)
          if (actionIndex >= 0) {
            const action = pendingActions.value[actionIndex]
            pendingActions.value.splice(actionIndex, 1)

            // For ADD actions: cleanup temp data and refresh cache
            if (action.type.startsWith('ADD_')) {
              const collection = action.type.replace('ADD_', '').toLowerCase() + (action.type === 'ADD_ENHED' ? 'er' : action.type === 'ADD_BRUGER' ? 'e' : action.type === 'ADD_TJEKLISTE' ? '' : '')

              // Find and delete temp item
              const tempItems = await indexedDBManager.getAll(collection)
              const tempItem = tempItems.find(item =>
                item.id && item.id.startsWith('temp_')
                && Object.keys(action.data).some(key => item[key] === action.data[key])
              )

              if (tempItem) {
                await indexedDBManager.delete(collection, tempItem.id)

                // Refresh data from Firebase
                const refreshMap = {
                  ADD_ENHED: () => import('@/stores/enhedStore').then(m => m.useEnhedStore().fetchEnheder()),
                  ADD_BRUGER: () => import('@/stores/brugerStore').then(m => m.useBrugerStore().fetchBrugere()),
                  ADD_TJEKLISTE: () => import('@/stores/tjeklisteStore').then(m => m.useTjeklisteStore().fetchTjeklister()),
                  ADD_EGENKONTROL: () => import('@/stores/egenkontrolStore').then(m => m.useEgenkontrolStore().fetchEgenkontroller())
                }

                if (refreshMap[action.type]) {
                  await refreshMap[action.type]()
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to process pending actions:', error.message)
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
    cacheResponseData: storeLocalData,
    getCachedData: getLocalData,
    clearOfflineData
  }
})
