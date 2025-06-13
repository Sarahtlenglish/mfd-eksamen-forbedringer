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
      setTimeout(async () => {
        const pending = await indexedDBManager.getAll('pendingActions')
        if (pending.length > 0) {
          await processPendingActions()
        }
      }, 1000)
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
      /* 1. hent alle ventende handlinger */
      const actionsToProcess = await indexedDBManager.getAll('pendingActions')
      if (actionsToProcess.length === 0) return
  
      /* 2. kør syncManager */
      const results = await syncManager.processAll(actionsToProcess)
  
      /* 3. fjern KUN succes-handlinger i ét hug */
      const finished = results
        .filter(r => r.status === 'success')
        .map(r => r.id)
  
      if (finished.length) {
        await Promise.all(
          finished.map(id => indexedDBManager.delete('pendingActions', id))
        )
        console.log(`🗑️  Removed ${finished.length} synced pending actions`)

        hasPendingActions.value = false
      }
  
      /* 4. gå alle succes-handlinger igennem for at rydde temp-data + refresh */
      for (const result of results) {
        if (result.status !== 'success') continue
  
        const actionIndex = pendingActions.value.findIndex(a => a.id === result.id)
        if (actionIndex === -1) continue
  
        const action = pendingActions.value[actionIndex]
        pendingActions.value.splice(actionIndex, 1)           // fjern fra reactive state
  
        /* --- a) ADD-handlinger: fjern temp og refresh cache --- */
        if (action.type.startsWith('ADD_')) {
          const collection   = getCollectionFromActionType(action.type)
          const tempId       = action.data.tempId || action.data.id
          const tempItems    = await indexedDBManager.getAll(collection)
          const tempItem     = tempItems.find(t => t.id === tempId)
  
          if (tempItem) await indexedDBManager.delete(collection, tempItem.id)
  
          /* speciel oprydning for egenkontrol */
          if (action.type === 'ADD_EGENKONTROL' && tempId) {
            await indexedDBManager.delete('egenkontrol', tempId)
          }
  
          /* refresh fra Firebase */
          const addRefresh = {
            ADD_ENHED:        () => import('@/stores/enhedStore').then(m => m.useEnhedStore().fetchEnheder()),
            ADD_BRUGER:       () => import('@/stores/brugerStore').then(m => m.useBrugerStore().fetchBrugere()),
            ADD_TJEKLISTE:    () => import('@/stores/tjeklisteStore').then(m => m.useTjeklisteStore().fetchTjeklister()),
            ADD_EGENKONTROL:  () => import('@/stores/egenkontrolStore').then(m => m.useEgenkontrolStore().fetchEgenkontroller())
          }
          if (addRefresh[action.type]) await addRefresh[action.type]()
        }
  
        /* --- b) UPDATE-handlinger: refresh én af de relevante stores --- */
        if (action.type.startsWith('UPDATE_')) {
          const updRefresh = {
            UPDATE_BRUGER:     () => import('@/stores/brugerStore').then(m => m.useBrugerStore().fetchBrugere()),
            UPDATE_ENHED:      () => import('@/stores/enhedStore').then(m => m.useEnhedStore().fetchEnheder()),
            UPDATE_TJEKLISTE:  () => import('@/stores/tjeklisteStore').then(m => m.useTjeklisteStore().fetchTjeklister()),
            UPDATE_EGENKONTROL_STATUS:              () => import('@/stores/egenkontrolStore').then(m => m.useEgenkontrolStore().fetchEgenkontroller()),
            UPDATE_FIELD_RESULTS:                   () => import('@/stores/egenkontrolStore').then(m => m.useEgenkontrolStore().fetchEgenkontroller()),
            UPDATE_EGENKONTROL_STATUS_WITH_CORRECTION: () => import('@/stores/egenkontrolStore').then(m => m.useEgenkontrolStore().fetchEgenkontroller())
          }
          if (updRefresh[action.type]) await updRefresh[action.type]()
        }
  
        /* --- c) DELETE-handlinger: refresh for at sikre konsistens --- */
        if (action.type.startsWith('DELETE_')) {
          const delRefresh = {
            DELETE_BRUGER:       () => import('@/stores/brugerStore').then(m => m.useBrugerStore().fetchBrugere()),
            DELETE_ENHED:        () => import('@/stores/enhedStore').then(m => m.useEnhedStore().fetchEnheder()),
            DELETE_TJEKLISTE:    () => import('@/stores/tjeklisteStore').then(m => m.useTjeklisteStore().fetchTjeklister()),
            DELETE_EGENKONTROL:  () => import('@/stores/egenkontrolStore').then(m => m.useEgenkontrolStore().fetchEgenkontroller())
          }
          if (delRefresh[action.type]) await delRefresh[action.type]()
        }
      }
    } catch (error) {
      console.error('Failed to process pending actions:', error.message)
    }
  }
  

  // Helper function to get collection name from action type
  const getCollectionFromActionType = (actionType) => {
    const typeToCollection = {
      ADD_BRUGER: 'brugere',
      ADD_ENHED: 'enheder',
      ADD_TJEKLISTE: 'tjeklister',
      ADD_EGENKONTROL: 'egenkontrol'
    }
    return typeToCollection[actionType] || ''
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

  async function removeDuplicatePendingAction(type, taskId, targetDate) {
    const actions = await indexedDBManager.getAll('pendingActions')
    const filtered = actions.filter(a => !(a.type === type && a.data?.taskId === taskId && a.data?.targetDate === targetDate))
    await indexedDBManager.clear('pendingActions')
    for (const action of filtered) {
      await indexedDBManager.put('pendingActions', action)
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
    removeDuplicatePendingAction,
    processPendingActions,
    loadPendingActions,

    // Cache management
    cacheResponseData: storeLocalData,
    getCachedData: getLocalData,
    clearOfflineData
  }
})
