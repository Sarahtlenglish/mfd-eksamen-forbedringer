// Handles Firebase synchronization of offline actions
export class SyncManager {
  constructor() {
    this.isProcessing = false
  }

  async processAction(action) {
    const { addDoc, updateDoc, deleteDoc, doc, collection } = await import('firebase/firestore')
    const { db } = await import('@/configs/firebase')

    const { type, data } = action

    switch (type) {
      case 'ADD_BRUGER':
        return await addDoc(collection(db, 'Brugere'), {
          fuldeNavn: data.fuldeNavn,
          email: data.email,
          rolle: data.rolle,
          telefon: data.telefon,
          createdAt: new Date()
        })

      case 'UPDATE_BRUGER':
        return await updateDoc(doc(db, 'Brugere', data.id), data.updatedData)

      case 'DELETE_BRUGER':
        return await deleteDoc(doc(db, 'Brugere', data.id))

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
        return await addDoc(collection(db, 'Enheder'), enhedData)
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
        return await updateDoc(doc(db, 'Enheder', data.id), updateData)
      }

      case 'DELETE_ENHED':
        return await deleteDoc(doc(db, 'Enheder', data.id))

      case 'ADD_TJEKLISTE':
        return await addDoc(collection(db, 'Tjeklister'), {
          tjeklisteNavn: data.tjeklisteNavn,
          beskrivelse: data.beskrivelse,
          type: data.type,
          frekvens: data.frekvens,
          opgaver: data.opgaver || [],
          tjeklisteFields: data.tjeklisteFields || [],
          createdAt: new Date()
        })

      case 'UPDATE_TJEKLISTE':
        return await updateDoc(doc(db, 'Tjeklister', data.id), data.updatedData)

      case 'DELETE_TJEKLISTE':
        return await deleteDoc(doc(db, 'Tjeklister', data.id))

      case 'ADD_EGENKONTROL': {
        // Remove temp fields that shouldn't be in Firebase
        const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...firebaseData } = data

        // Ensure we have the complete structure
        const egenkontrolDoc = {
          ...firebaseData,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        return await addDoc(collection(db, 'Egenkontrol'), egenkontrolDoc)
      }

      case 'DELETE_EGENKONTROL':
        return await deleteDoc(doc(db, 'Egenkontrol', data.id))

      case 'UPDATE_EGENKONTROL_STATUS': {
        const taskData = await this.waitForFirebaseDocument('Egenkontrol', data.taskId)
        if (!taskData) {
          throw new Error(`Task ${data.taskId} not found in Firebase after retries`)
        }

        const historyIndex = taskData.historik.findIndex(entry => entry.dato === data.targetDate)
        if (historyIndex === -1) {
          throw new Error(`No history entry found for date ${data.targetDate}`)
        }

        const taskRef = doc(db, 'Egenkontrol', data.taskId)
        const updatedHistorik = [...taskData.historik]
        updatedHistorik[historyIndex] = {
          ...updatedHistorik[historyIndex],
          status: data.newStatus
        }
        return await updateDoc(taskRef, { historik: updatedHistorik })
      }

      case 'UPDATE_EGENKONTROL_FIELD_RESULTS': {
        const taskData = await this.waitForFirebaseDocument('Egenkontrol', data.egenkontrolId)
        if (!taskData) {
          throw new Error(`Task ${data.egenkontrolId} not found in Firebase after retries`)
        }

        const historyIndex = taskData.historik.findIndex(entry => entry.dato === data.targetDate)
        if (historyIndex === -1) {
          throw new Error(`No history entry found for date ${data.targetDate}`)
        }

        // Check if there are any deviations in the field results
        const hasDeviations = data.fieldResults.some((field) => {
          if (field.type === 'yes_no_comment') {
            return field.answer === 'nej'
          }
          return false
        })

        // Determine the final status based on whether there are deviations
        const finalStatus = hasDeviations ? 'afvigelse' : 'udført'

        const taskRef = doc(db, 'Egenkontrol', data.egenkontrolId)
        const updatedHistorik = [...taskData.historik]
        updatedHistorik[historyIndex] = {
          ...updatedHistorik[historyIndex],
          status: finalStatus,
          afsluttetAf: data.completedBy,
          afsluttetDato: new Date().toISOString(),
          tjeklisteFieldResults: data.fieldResults
        }
        return await updateDoc(taskRef, {
          historik: updatedHistorik,
          updatedAt: new Date().toISOString()
        })
      }

      case 'UPDATE_EGENKONTROL_STATUS_WITH_CORRECTION': {
        const taskData = await this.waitForFirebaseDocument('Egenkontrol', data.egenkontrolId)
        if (!taskData) {
          throw new Error(`Task ${data.egenkontrolId} not found in Firebase after retries`)
        }

        const historyIndex = taskData.historik.findIndex(entry => entry.dato === data.targetDate)
        if (historyIndex === -1) {
          throw new Error(`No history entry found for date ${data.targetDate}`)
        }

        const taskRef = doc(db, 'Egenkontrol', data.egenkontrolId)
        const updatedHistorik = [...taskData.historik]
        updatedHistorik[historyIndex] = {
          ...updatedHistorik[historyIndex],
          status: data.correctionData.afvigelseUdbedret ? 'udført' : 'afvigelse',
          korrektion: {
            korrigeret: data.correctionData.afvigelseUdbedret,
            korrektionsDato: data.correctionData.udbedringsDato,
            korrigeretAf: data.correctionData.udbedretAf,
            korrektionsBeskrivelse: data.correctionData.udbedringsBeskrivelse
          },
          updatedAt: new Date().toISOString()
        }
        return await updateDoc(taskRef, {
          historik: updatedHistorik,
          updatedAt: new Date().toISOString()
        })
      }

      default:
        throw new Error(`Unknown action type: ${type}`)
    }
  }

  async processAll(actions) {
    if (this.isProcessing) {
      console.log('⏳ Sync already in progress')
      return []
    }

    this.isProcessing = true
    const results = []
    const idMapping = new Map() // Track temp ID -> real ID mappings

    try {
      console.log(`🔄 Processing ${actions.length} pending actions`)

      for (const action of actions) {
        try {
          // Update action data with real IDs if available
          const updatedAction = this.updateActionWithRealIds(action, idMapping)

          const result = await this.processAction(updatedAction)

          // For ADD operations, fetch the real data to replace temp records
          const tempReplacement = await this.getTempReplacement(action, result)

          // Store the mapping if this was an ADD operation
          if (action.type.startsWith('ADD_') && action.tempId && result?.id) {
            idMapping.set(action.tempId, result.id)
            console.log(`🔄 ID Mapping: ${action.tempId} → ${result.id}`)
          }

          results.push({
            id: action.id,
            status: 'success',
            tempReplacement
          })
          console.log(`✅ Synced action: ${action.type}`)
        } catch (error) {
          console.warn(`⚠️ Failed to sync action ${action.type}:`, error.message)
          results.push({ id: action.id, status: 'failed', error: error.message })
        }
      }

      console.log('🎉 All pending actions processed')
      return results
    } finally {
      this.isProcessing = false
    }
  }

  // Update action data to use real IDs instead of temp IDs
  updateActionWithRealIds(action, idMapping) {
    const updatedData = { ...action.data }

    // Check for temp IDs in common fields and replace with real IDs
    if (updatedData.egenkontrolId && idMapping.has(updatedData.egenkontrolId)) {
      updatedData.egenkontrolId = idMapping.get(updatedData.egenkontrolId)
      console.log(`🔄 Updated egenkontrolId: ${action.data.egenkontrolId} → ${updatedData.egenkontrolId}`)
    }

    if (updatedData.taskId && idMapping.has(updatedData.taskId)) {
      updatedData.taskId = idMapping.get(updatedData.taskId)
      console.log(`🔄 Updated taskId: ${action.data.taskId} → ${updatedData.taskId}`)
    }

    return {
      ...action,
      data: updatedData
    }
  }

  // Wait for Firebase document to be ready with proper structure
  async waitForFirebaseDocument(collection, id, maxRetries = 5) {
    const { getDoc, doc } = await import('firebase/firestore')
    const { db } = await import('@/configs/firebase')

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📋 Checking Firebase document: ${collection}/${id} (attempt ${attempt}/${maxRetries})`)

        const docRef = doc(db, collection, id)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          console.log(`⏳ Document ${id} doesn't exist yet, waiting...`)
          await this.sleep(1000 * attempt) // Exponential backoff
          continue
        }

        const data = docSnap.data()

        // Validate structure for egenkontrol documents
        if (collection === 'Egenkontrol') {
          if (!data.historik || !Array.isArray(data.historik)) {
            console.log(`⏳ Document ${id} exists but historik not ready, waiting...`)
            await this.sleep(1000 * attempt)
            continue
          }
        }

        console.log(`✅ Document ${id} is ready with proper structure`)
        return data
      } catch (error) {
        console.warn(`⚠️ Error checking document ${id} (attempt ${attempt}):`, error.message)
        if (attempt === maxRetries) {
          throw error
        }
        await this.sleep(1000 * attempt)
      }
    }

    return null
  }

  // Sleep utility for retry delays
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Get temp replacement data for ADD operations
  async getTempReplacement(action, firebaseResult) {
    console.log('🔍 getTempReplacement called with:', {
      actionType: action.type,
      tempId: action.tempId,
      firebaseResultId: firebaseResult?.id
    })

    if (!action.type.startsWith('ADD_')) {
      console.log('ℹ️ Not an ADD operation, skipping temp replacement')
      return null
    }

    if (!action.tempId) {
      console.warn('⚠️ No tempId found in action for temp replacement!')
      return null
    }

    if (!firebaseResult?.id) {
      console.warn('⚠️ No Firebase result ID for temp replacement!')
      return null
    }

    const { getDoc, doc } = await import('firebase/firestore')
    const { db } = await import('@/configs/firebase')

    try {
      const collection = this.getCollectionFromActionType(action.type)
      const firebaseCollection = this.getFirebaseCollectionName(collection)

      console.log(`📖 Fetching real Firebase data from ${firebaseCollection}/${firebaseResult.id}`)

      // Fetch the real document from Firebase
      const docRef = doc(db, firebaseCollection, firebaseResult.id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const realRecord = this.transformFirebaseData(collection, docSnap.id, docSnap.data())

        console.log('✅ Successfully created temp replacement:', {
          collection,
          tempId: action.tempId,
          realRecord: realRecord.id
        })

        return {
          collection,
          tempId: action.tempId,
          realRecord
        }
      } else {
        console.warn('⚠️ Firebase document does not exist!')
      }
    } catch (error) {
      console.error('❌ Failed to fetch real Firebase data:', error)
    }

    return null
  }

  getFirebaseCollectionName(collection) {
    const collectionMap = {
      brugere: 'Brugere',
      enheder: 'Enheder',
      tjeklister: 'Tjeklister',
      egenkontrol: 'Egenkontrol'
    }
    return collectionMap[collection]
  }

  // Transform Firebase data to match our local format
  transformFirebaseData(collection, id, data) {
    switch (collection) {
      case 'enheder':
        return {
          id,
          name: data.enhedsNavn,
          description: data.beskrivelse,
          location: data.lokation,
          type: data.type,
          underenheder: data.underenheder
        }
      case 'brugere':
        return {
          id,
          fuldeNavn: data.fuldeNavn,
          email: data.email,
          rolle: data.rolle,
          telefon: data.telefon,
          adresse: data.adresse,
          by: data.by,
          postnummer: data.postnummer,
          brugereRef: data.brugereRef,
          egenkontrolRef: data.egenkontrolRef,
          createdAt: data.createdAt
        }
      case 'tjeklister':
        return {
          id,
          tjeklisteNavn: data.tjeklisteNavn,
          beskrivelse: data.beskrivelse,
          type: data.type,
          frekvens: data.frekvens,
          opgaver: data.opgaver || [],
          tjeklisteFields: data.tjeklisteFields || []
        }
      case 'egenkontrol':
        return {
          id,
          ...data
        }
      default:
        return { id, ...data }
    }
  }

  // Extract cleanup information based on action type
  getCleanupInfo(action, firebaseResult) {
    const { type } = action

    if (type.startsWith('ADD_')) {
      // For ADD operations, we need to clean up temp records
      const collection = this.getCollectionFromActionType(type)
      return {
        collection,
        tempIdPattern: `temp_${collection.slice(0, -1)}_`,
        realId: firebaseResult?.id
      }
    }

    return null
  }

  getCollectionFromActionType(actionType) {
    const typeMap = {
      ADD_BRUGER: 'brugere',
      ADD_ENHED: 'enheder',
      ADD_TJEKLISTE: 'tjeklister',
      ADD_EGENKONTROL: 'egenkontrol'
    }
    return typeMap[actionType]
  }
}

export const syncManager = new SyncManager()
