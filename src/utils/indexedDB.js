// Cleans data before saving to IndexedDB
class IndexedDBManager {
  constructor(dbName = 'mfd-offline-db', version = 1) {
    this.dbName = dbName
    this.version = version
    this.db = null
    // Collections we need to store offline
    this.collections = ['brugere', 'enheder', 'egenkontrol', 'tjeklister', 'pendingActions']
  }

  // Clean up data so IndexedDB can store it
  sanitizeData(data) {
    if (data === null || data === undefined) {
      return data
    }

    // Simple values can be stored directly
    if (typeof data !== 'object') {
      return data
    }

    // Convert dates to strings
    if (data instanceof Date) {
      return data.toISOString()
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item))
    }

    // Handle objects - remove things that can't be stored
    if (typeof data === 'object') {
      const sanitized = {}
      for (const [key, value] of Object.entries(data)) {
        // Skip functions and undefined values
        if (typeof value === 'function' || typeof value === 'symbol' || value === undefined) {
          continue
        }

        try {
          sanitized[key] = this.sanitizeData(value)
        } catch (error) {
          console.warn(`⚠️ Skipping non-serializable property: ${key}`, error)
        }
      }
      return sanitized
    }

    return data
  }

  // Set up IndexedDB for offline storage
  async init() {
    return new Promise((resolve, reject) => {
      // Check if browser supports IndexedDB
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported, falling back to localStorage')
        resolve(false)
        return
      }

      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error('IndexedDB error:', request.error)
        reject(request.error)
      }

      request.onsuccess = (event) => {
        this.db = event.target.result
        console.log('🗄️ IndexedDB initialized: Successfully')
        resolve(true)
      }

      // Create database structure
      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create tables for each data type
        this.collections.forEach((collection) => {
          if (!db.objectStoreNames.contains(collection)) {
            const objectStore = db.createObjectStore(collection, { keyPath: 'id' })

            // Add indexes for faster searching
            if (collection === 'brugere') {
              objectStore.createIndex('email', 'email', { unique: false })
              objectStore.createIndex('fuldeNavn', 'fuldeNavn', { unique: false })
              objectStore.createIndex('rolle', 'rolle', { unique: false })
            } else if (collection === 'enheder') {
              objectStore.createIndex('navn', 'navn', { unique: false })
              objectStore.createIndex('type', 'type', { unique: false })
            } else if (collection === 'pendingActions') {
              // For tracking sync queue
              objectStore.createIndex('type', 'type', { unique: false })
              objectStore.createIndex('timestamp', 'timestamp', { unique: false })
            }
          }
        })
      }
    })
  }

  // Add or update a record
  async put(collection, data) {
    if (!this.db) {
      return this.fallbackToLocalStorage('put', collection, data)
    }

    // Sanitize data before storing
    const sanitizedData = this.sanitizeData(data)

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readwrite')
      const objectStore = transaction.objectStore(collection)

      const request = objectStore.put(sanitizedData)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => {
        console.error('Error storing data in IndexedDB:', request.error)
        reject(request.error)
      }
    })
  }

  // Get a record by ID
  async get(collection, id) {
    if (!this.db) {
      return this.fallbackToLocalStorage('get', collection, id)
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readonly')
      const objectStore = transaction.objectStore(collection)

      const request = objectStore.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Get all records from a collection
  async getAll(collection) {
    if (!this.db) {
      return this.fallbackToLocalStorage('getAll', collection)
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readonly')
      const objectStore = transaction.objectStore(collection)

      const request = objectStore.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  // Delete a record by ID
  async delete(collection, id) {
    if (!this.db) {
      return this.fallbackToLocalStorage('delete', collection, id)
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readwrite')
      const objectStore = transaction.objectStore(collection)

      const request = objectStore.delete(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Update multiple records
  async putMany(collection, dataArray) {
    if (!this.db) {
      return this.fallbackToLocalStorage('putMany', collection, dataArray)
    }

    // Sanitize all data before storing
    const sanitizedDataArray = dataArray.map(data => this.sanitizeData(data))

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readwrite')
      const objectStore = transaction.objectStore(collection)

      let completed = 0
      const total = sanitizedDataArray.length

      if (total === 0) {
        resolve([])
        return
      }

      const results = []

      sanitizedDataArray.forEach((data, index) => {
        const request = objectStore.put(data)

        request.onsuccess = () => {
          results[index] = request.result
          completed++
          if (completed === total) {
            resolve(results)
          }
        }

        request.onerror = () => {
          console.error('Error storing data in IndexedDB putMany:', request.error)
          reject(request.error)
        }
      })
    })
  }

  // Clear all data from a collection
  async clear(collection) {
    if (!this.db) {
      return this.fallbackToLocalStorage('clear', collection)
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readwrite')
      const objectStore = transaction.objectStore(collection)

      const request = objectStore.clear()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Search records by index
  async getByIndex(collection, indexName, value) {
    if (!this.db) {
      return this.fallbackToLocalStorage('getByIndex', collection, indexName, value)
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readonly')
      const objectStore = transaction.objectStore(collection)

      if (!objectStore.indexNames.contains(indexName)) {
        resolve([])
        return
      }

      const index = objectStore.index(indexName)
      const request = index.getAll(value)

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  // Fallback to localStorage for compatibility
  fallbackToLocalStorage(operation, collection, data, extra) {
    const key = `offline_${collection}`

    try {
      switch (operation) {
        case 'put': {
          const existing = JSON.parse(localStorage.getItem(key) || '[]')
          const index = existing.findIndex(item => item.id === data.id)

          if (index >= 0) {
            existing[index] = data
          } else {
            existing.push(data)
          }

          localStorage.setItem(key, JSON.stringify(existing))
          return Promise.resolve(data.id)
        }

        case 'get': {
          const existing = JSON.parse(localStorage.getItem(key) || '[]')
          const item = existing.find(item => item.id === data)
          return Promise.resolve(item)
        }

        case 'getAll': {
          const existing = JSON.parse(localStorage.getItem(key) || '[]')
          return Promise.resolve(existing)
        }

        case 'delete': {
          const existing = JSON.parse(localStorage.getItem(key) || '[]')
          const filtered = existing.filter(item => item.id !== data)
          localStorage.setItem(key, JSON.stringify(filtered))
          return Promise.resolve(true)
        }

        case 'putMany': {
          const existing = JSON.parse(localStorage.getItem(key) || '[]')

          data.forEach((item) => {
            const index = existing.findIndex(existingItem => existingItem.id === item.id)
            if (index >= 0) {
              existing[index] = item
            } else {
              existing.push(item)
            }
          })

          localStorage.setItem(key, JSON.stringify(existing))
          return Promise.resolve(data.map(item => item.id))
        }

        case 'clear': {
          localStorage.removeItem(key)
          return Promise.resolve(true)
        }

        case 'getByIndex': {
          const existing = JSON.parse(localStorage.getItem(key) || '[]')
          const filtered = existing.filter(item => item[data] === extra)
          return Promise.resolve(filtered)
        }

        default:
          return Promise.resolve(null)
      }
    } catch (error) {
      console.error('localStorage fallback error:', error)
      return Promise.reject(error)
    }
  }

  // Close the database connection
  close() {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

// Export a singleton instance
export const indexedDBManager = new IndexedDBManager()

// Initialize on import
indexedDBManager.init().catch((error) => {
  console.error('Failed to initialize IndexedDB:', error)
})

export default indexedDBManager
