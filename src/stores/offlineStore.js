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

  // Adds an action to the sync queue with temp ID mapping
  const addPendingAction = async (action) => {
    try {
      const actionWithTimestamp = {
        ...action,
        timestamp: Date.now(),
        id: `${action.type}_${Date.now()}_${Math.random()}`
      }

      // For ADD operations, store the temp ID for later replacement
      if (action.type.startsWith('ADD_') && action.tempId) {
        actionWithTimestamp.tempId = action.tempId
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
    if (!isOnline.value) {
      console.log('❌ Cannot process pending actions - offline')
      return
    }

    console.log('🔄 Starting to process pending actions...')

    try {
      const actionsToProcess = await indexedDBManager.getAll('pendingActions')
      console.log(`📋 Found ${actionsToProcess.length} pending actions:`, actionsToProcess)

      if (actionsToProcess.length === 0) {
        console.log('✅ No pending actions to process')
        return
      }

      console.log('🚀 Calling syncManager.processAll...')
      const results = await syncManager.processAll(actionsToProcess)
      console.log('📊 Sync results:', results)

      // Process results and handle temp ID replacement
      for (const result of results) {
        console.log('🔍 Processing result:', result)

        if (result.status === 'success') {
          console.log('✅ Removing pending action:', result.id)

          // Remove the pending action
          await indexedDBManager.delete('pendingActions', result.id)
          const actionIndex = pendingActions.value.findIndex(a => a.id === result.id)
          if (actionIndex >= 0) {
            pendingActions.value.splice(actionIndex, 1)
            console.log('🗑️ Removed from local pendingActions array')
          }

          // Replace temp records with real Firebase data
          if (result.tempReplacement) {
            console.log('🔄 Processing temp replacement:', result.tempReplacement)
            await replaceTempWithReal(result.tempReplacement)
          } else {
            console.log('ℹ️ No temp replacement needed for this action')
          }
        } else {
          console.warn('⚠️ Action failed:', result)
        }
      }

      console.log('🎉 Finished processing all pending actions')

      // Force refresh of egenkontrol data to get latest status after sync
      if (results.some(r => r.id.includes('EGENKONTROL'))) {
        console.log('🔄 Refreshing egenkontrol data after sync...')
        try {
          const { useEgenkontrolStore } = await import('./egenkontrolStore')
          const egenkontrolStore = useEgenkontrolStore()
          await egenkontrolStore.fetchEgenkontroller()
          console.log('✅ Egenkontrol data refreshed')
        } catch (error) {
          console.warn('⚠️ Failed to refresh egenkontrol data:', error)
        }
      }
    } catch (error) {
      console.error('❌ Failed to process pending actions:', error.message, error)
    }
  }

  // Replace temp record with real Firebase data
  const replaceTempWithReal = async (replacement) => {
    const { collection, tempId, realRecord } = replacement

    console.log(`🔄 Starting replaceTempWithReal: ${replacement}`)

    try {
      // Delete temp record from IndexedDB
      console.log(`🗑️ Deleting temp record from IndexedDB: ${collection}/${tempId}`)
      await indexedDBManager.delete(collection, tempId)

      // Add real record with Firebase ID to IndexedDB
      console.log(`💾 Adding real record to IndexedDB: ${collection}/${realRecord.id}`)
      await indexedDBManager.put(collection, realRecord)

      // Update local reactive state
      console.log(`🔄 Updating local reactive state for ${collection}`)
      if (offlineData.value[collection]) {
        const tempIndex = offlineData.value[collection].findIndex(item => item.id === tempId)
        console.log(`📍 Found temp record at index: ${tempIndex}`)

        if (tempIndex >= 0) {
          offlineData.value[collection][tempIndex] = realRecord
          console.log('✅ Replaced temp record in offlineData')
        } else {
          console.warn(`⚠️ Temp record ${tempId} not found in offlineData`)
        }
      } else {
        console.warn(`⚠️ Collection ${collection} not found in offlineData`)
      }

      // CRITICAL: Also update the store-specific reactive arrays
      console.log('🔄 Updating store-specific reactive state')
      await updateStoreReactiveState(collection, tempId, realRecord)

      console.log(`✅ Successfully replaced temp ${collection} ${tempId} with real ${realRecord.id}`)
    } catch (error) {
      console.error(`❌ Failed to replace temp data for ${collection}:`, error.message, error)
    }
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
            console.log('✅ Updated enhedStore reactive state')
          }
          break
        }
        case 'brugere': {
          const { useBrugerStore } = await import('./brugerStore')
          const brugerStore = useBrugerStore()
          const tempIndex = brugerStore.brugere.findIndex(item => item.id === tempId)
          if (tempIndex >= 0) {
            brugerStore.brugere[tempIndex] = realRecord
            console.log('✅ Updated brugerStore reactive state')
          }
          break
        }
        case 'tjeklister': {
          const { useTjeklisteStore } = await import('./tjeklisteStore')
          const tjeklisteStore = useTjeklisteStore()
          const tempIndex = tjeklisteStore.tjeklister.findIndex(item => item.id === tempId)
          if (tempIndex >= 0) {
            tjeklisteStore.tjeklister[tempIndex] = realRecord
            console.log('✅ Updated tjeklisteStore reactive state')
          }
          break
        }
        case 'egenkontrol': {
          console.log(`🔍 Processing egenkontrol case for tempId: ${tempId}`)
          const { useEgenkontrolStore } = await import('./egenkontrolStore')
          const egenkontrolStore = useEgenkontrolStore()
          console.log(`📊 egenkontrolStore.egenkontrollerData length: ${egenkontrolStore.egenkontrollerData.length}`)
          console.log('📋 Current egenkontrollerData IDs:', egenkontrolStore.egenkontrollerData.map(item => item.id))

          const tempIndex = egenkontrolStore.egenkontrollerData.findIndex(item => item.id === tempId)
          console.log(`📍 Found temp record at index: ${tempIndex}`)
          if (tempIndex >= 0) {
            egenkontrolStore.egenkontrollerData[tempIndex] = realRecord
            console.log('✅ Updated egenkontrolStore reactive state')

            // Update any UI components that might be tracking this temp ID
            console.log(`🔍 Checking if we need to update selectedTaskId for: ${tempId}`)
            if (typeof window !== 'undefined') {
              console.log('🌐 Window object available, checking for updateSelectedTaskId function')
              if (window.updateSelectedTaskId) {
                console.log(`✅ Found updateSelectedTaskId function, calling with: ${tempId} → ${realRecord.id}`)
                window.updateSelectedTaskId(tempId, realRecord.id)
                console.log(`🔄 Updated selectedTaskId: ${tempId} → ${realRecord.id}`)
              } else {
                console.warn('⚠️ updateSelectedTaskId function not found on window object')
              }
            } else {
              console.warn('⚠️ Window object not available')
            }
          } else {
            console.warn(`⚠️ Temp record ${tempId} not found in egenkontrollerData`)
          }
          break
        }
      }
    } catch (error) {
      console.error(`❌ Failed to update ${collection} store reactive state:`, error)
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
