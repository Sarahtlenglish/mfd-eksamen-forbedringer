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
      return this.fallbackToLocalStorage(operation, collection, ...args)
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

      request.onsuccess = () => resolve(request.result || (operation === 'getAll' ? [] : undefined))
      request.onerror = () => reject(request.error)
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
      return this.fallbackToLocalStorage('putMany', collection, dataArray)
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

  // Efficiently find and delete records matching ID pattern
  async findAndDeleteByPattern(collection, idPattern) {
    if (!this.db) {
      return this.fallbackToLocalStorage('deleteByPattern', collection, idPattern)
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readwrite')
      const objectStore = transaction.objectStore(collection)
      const request = objectStore.openCursor()

      const deletedIds = []

      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          const record = cursor.value
          if (record.id && record.id.startsWith(idPattern)) {
            cursor.delete()
            deletedIds.push(record.id)
          }
          cursor.continue()
        } else {
          resolve(deletedIds)
        }
      }

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

        case 'deleteByPattern': {
          const existing = JSON.parse(localStorage.getItem(key) || '[]')
          const filtered = existing.filter(item => !item.id.startsWith(data))
          localStorage.setItem(key, JSON.stringify(filtered))
          return Promise.resolve(true)
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
