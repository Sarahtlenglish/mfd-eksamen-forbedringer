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
  const idMapping = ref({})

  // Initializes IndexedDB and loads cached data
  const initDatabase = async () => {
    try {
      const result = await indexedDBManager.init()
      dbInitialized.value = result

      await loadPendingActions()
      for (const collection of Object.keys(offlineData.value)) {
        try {
          const cachedData = await indexedDBManager.getAll(collection)
          if (cachedData.length > 0) {
            offlineData.value[collection] = cachedData
          }
        } catch (error) {
          console.warn(`Could not load cached ${collection}:`, error.message)
        }
      }
    } catch (error) {
      console.error('Failed to initialize offline database:', error.message)
      dbInitialized.value = false
    }
  }

  // Updates online/offline status and triggers sync
  const updateOnlineStatus = () => {
    const wasOffline = !isOnline.value
    isOnline.value = navigator.onLine

    if (wasOffline && isOnline.value) {
      setTimeout(() => processPendingActions(), 1000)
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
      } else {
        await indexedDBManager.put(collection, data)
        const existingIndex = offlineData.value[collection]?.findIndex(item => item.id === data.id)
        if (existingIndex >= 0) {
          offlineData.value[collection][existingIndex] = data
        } else {
          if (!offlineData.value[collection]) offlineData.value[collection] = []
          offlineData.value[collection].push(data)
        }
      }
    } catch (error) {
      console.error(`Failed to store ${collection} data:`, error.message)
    }
  }

  // Gets data from local IndexedDB
  const getLocalData = async (collection) => {
    try {
      const data = await indexedDBManager.getAll(collection)
      offlineData.value[collection] = data
      return data
    } catch (error) {
      console.warn(`Could not get local ${collection} data:`, error.message)
      return []
    }
  }

  // Deletes data from local IndexedDB
  const deleteLocalData = async (collection, id) => {
    try {
      await indexedDBManager.delete(collection, id)
      offlineData.value[collection] = offlineData.value[collection].filter(item => item.id !== id)
    } catch (error) {
      console.error(`Failed to delete ${collection} item:`, error.message)
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

      if (action.type.startsWith('ADD_') && action.tempId) {
        actionWithTimestamp.tempId = action.tempId
      }

      pendingActions.value.push(actionWithTimestamp)
      await indexedDBManager.put('pendingActions', actionWithTimestamp)
    } catch (error) {
      console.warn('Failed to persist pending action:', error.message)
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

      for (const result of results) {
        if (result.status === 'success') {
          await indexedDBManager.delete('pendingActions', result.id)
          const actionIndex = pendingActions.value.findIndex(a => a.id === result.id)
          if (actionIndex >= 0) {
            pendingActions.value.splice(actionIndex, 1)
          }

          if (result.tempReplacement) {
            await replaceTempWithReal(result.tempReplacement)
          }
        }
      }

      if (results.some(r => r.id.includes('EGENKONTROL'))) {
        try {
          const { useEgenkontrolStore } = await import('./egenkontrolStore')
          const egenkontrolStore = useEgenkontrolStore()
          await egenkontrolStore.fetchEgenkontroller()
        } catch (error) {
          console.warn('Failed to refresh egenkontrol data:', error)
        }
      }
    } catch (error) {
      console.error('Failed to process pending actions:', error.message)
    }
  }

  // Replace temp record with real Firebase data
  const replaceTempWithReal = async (replacement) => {
    const { collection, tempId, realRecord } = replacement

    try {
      idMapping.value[tempId] = realRecord.id

      if (typeof window !== 'undefined' && window.updateSelectedTaskId) {
        window.updateSelectedTaskId(tempId, realRecord.id)
      }

      await indexedDBManager.delete(collection, tempId)
      await indexedDBManager.put(collection, realRecord)

      if (offlineData.value[collection]) {
        const tempIndex = offlineData.value[collection].findIndex(item => item.id === tempId)
        if (tempIndex >= 0) {
          offlineData.value[collection][tempIndex] = realRecord
        }
      }

      await updateStoreReactiveState(collection, tempId, realRecord)
    } catch (error) {
      console.error(`Failed to replace temp data for ${collection}:`, error.message)
    }
  }

  // Get the real ID for a temp ID
  const getRealId = (tempId) => {
    return idMapping.value[tempId] || tempId
  }

  // Update store-specific reactive arrays
  const updateStoreReactiveState = async (collection, tempId, realRecord) => {
    try {
      switch (collection) {
        case 'enheder': {
          const { useEnhedStore } = await import('./enhedStore')
          const enhedStore = useEnhedStore()
          const tempIndex = enhedStore.enheder.findIndex(item => item.id === tempId)
          if (tempIndex >= 0) {
            enhedStore.enheder[tempIndex] = realRecord
          }
          break
        }
        case 'brugere': {
          const { useBrugerStore } = await import('./brugerStore')
          const brugerStore = useBrugerStore()
          const tempIndex = brugerStore.brugere.findIndex(item => item.id === tempId)
          if (tempIndex >= 0) {
            brugerStore.brugere[tempIndex] = realRecord
          }
          break
        }
        case 'tjeklister': {
          const { useTjeklisteStore } = await import('./tjeklisteStore')
          const tjeklisteStore = useTjeklisteStore()
          const tempIndex = tjeklisteStore.tjeklister.findIndex(item => item.id === tempId)
          if (tempIndex >= 0) {
            tjeklisteStore.tjeklister[tempIndex] = realRecord
          }
          break
        }
        case 'egenkontrol': {
          const { useEgenkontrolStore } = await import('./egenkontrolStore')
          const egenkontrolStore = useEgenkontrolStore()
          const tempIndex = egenkontrolStore.egenkontrollerData.findIndex(item => item.id === tempId)
          if (tempIndex >= 0) {
            egenkontrolStore.egenkontrollerData[tempIndex] = realRecord
          } else {
            egenkontrolStore.egenkontrollerData.push(realRecord)
          }
          break
        }
      }
    } catch (error) {
      console.error(`Failed to update ${collection} store reactive state:`, error)
    }
  }

  // Load pending actions from IndexedDB on init
  const loadPendingActions = async () => {
    try {
      const savedActions = await indexedDBManager.getAll('pendingActions')
      pendingActions.value = savedActions
    } catch (error) {
      console.warn('Could not load pending actions:', error.message)
      pendingActions.value = []
    }
  }

  // Clear all offline data
  const clearOfflineData = async () => {
    try {
      for (const collection of Object.keys(offlineData.value)) {
        await indexedDBManager.clear(collection)
        offlineData.value[collection] = []
      }
      await indexedDBManager.clear('pendingActions')
      pendingActions.value = []
    } catch (error) {
      console.error('Failed to clear offline data:', error.message)
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
    clearOfflineData,

    // ID mapping
    getRealId
  }
})
