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

    if (typeof data !== 'object') {
      return data
    }

    if (data instanceof Date) {
      return data.toISOString()
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item))
    }

    // Handle objects - remove things that can't be stored
    const sanitized = {}
    for (const [key, value] of Object.entries(data)) {
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

  // Set up IndexedDB for offline storage
  async init() {
    return new Promise((resolve, reject) => {
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

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        this.collections.forEach((collection) => {
          if (!db.objectStoreNames.contains(collection)) {
            const objectStore = db.createObjectStore(collection, { keyPath: 'id' })

            // Add relevant indexes
            if (collection === 'brugere') {
              objectStore.createIndex('email', 'email', { unique: false })
              objectStore.createIndex('rolle', 'rolle', { unique: false })
            } else if (collection === 'enheder') {
              objectStore.createIndex('navn', 'navn', { unique: false })
              objectStore.createIndex('type', 'type', { unique: false })
            } else if (collection === 'pendingActions') {
              objectStore.createIndex('type', 'type', { unique: false })
              objectStore.createIndex('timestamp', 'timestamp', { unique: false })
            }
          }
        })
      }
    })
  }

  // Generic method for database operations
  async performOperation(collection, operation, ...args) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], operation === 'get' || operation === 'getAll' ? 'readonly' : 'readwrite')
      const objectStore = transaction.objectStore(collection)

      let request
      switch (operation) {
        case 'put':
          request = objectStore.put(this.sanitizeData(args[0]))
          break
        case 'get':
          request = objectStore.get(args[0])
          break
        case 'getAll':
          request = objectStore.getAll()
          break
        case 'delete':
          request = objectStore.delete(args[0])
          break
        case 'clear':
          request = objectStore.clear()
          break
        default:
          reject(new Error(`Unknown operation: ${operation}`))
          return
      }

      // For write operations, wait for transaction to complete
      if (operation === 'put' || operation === 'delete' || operation === 'clear') {
        transaction.oncomplete = () => {
          resolve(request.result || (operation === 'getAll' ? [] : undefined))
        }
        transaction.onerror = () => reject(transaction.error)
        request.onerror = () => reject(request.error)
      } else {
        // For read operations, resolve immediately on request success
        request.onsuccess = () => resolve(request.result || (operation === 'getAll' ? [] : undefined))
        request.onerror = () => reject(request.error)
      }
    })
  }

  // Simplified API methods
  async put(collection, data) {
    return this.performOperation(collection, 'put', data)
  }

  async get(collection, id) {
    return this.performOperation(collection, 'get', id)
  }

  async getAll(collection) {
    return this.performOperation(collection, 'getAll')
  }

  async delete(collection, id) {
    return this.performOperation(collection, 'delete', id)
  }

  async clear(collection) {
    return this.performOperation(collection, 'clear')
  }

  // Batch operations
  async putMany(collection, dataArray) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized')
    }

    const sanitizedDataArray = dataArray.map(data => this.sanitizeData(data))

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readwrite')
      const objectStore = transaction.objectStore(collection)

      const results = []
      let completed = 0

      if (sanitizedDataArray.length === 0) {
        resolve([])
        return
      }

      sanitizedDataArray.forEach((data, index) => {
        const request = objectStore.put(data)
        request.onsuccess = () => {
          results[index] = request.result
          completed++
          if (completed === sanitizedDataArray.length) {
            resolve(results)
          }
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  // Search records by index
  async getByIndex(collection, indexName, value) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized')
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
