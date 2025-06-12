// Handles Firebase synchronization of offline actions
export class SyncManager {
  constructor() {
    this.isProcessing = false
  }

  async processAction(action) {
    const { addDoc, updateDoc, deleteDoc, doc, collection, getDoc } = await import('firebase/firestore')
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
          tidspunkt: data.tidspunkt,
          opgaver: data.opgaver || [],
          createdAt: new Date()
        })

      case 'UPDATE_TJEKLISTE':
        return await updateDoc(doc(db, 'Tjeklister', data.id), data.updatedData)

      case 'DELETE_TJEKLISTE':
        return await deleteDoc(doc(db, 'Tjeklister', data.id))

      case 'ADD_EGENKONTROL':
        return await addDoc(collection(db, 'Egenkontrol'), data)

      case 'DELETE_EGENKONTROL':
        return await deleteDoc(doc(db, 'Egenkontrol', data.id))

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
          return await updateDoc(taskRef, { historik: updatedHistorik })
        }
        break
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

    try {
      console.log(`🔄 Processing ${actions.length} pending actions`)

      for (const action of actions) {
        try {
          await this.processAction(action)
          results.push({ id: action.id, status: 'success' })
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
}

export const syncManager = new SyncManager()
