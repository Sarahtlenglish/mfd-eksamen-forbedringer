import { indexedDBManager } from '@/utils/indexedDB'
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
          adresse: data.adresse || '',
          brugereRef: data.brugereRef || '',
          by: data.by || '',
          egenkontrolRef: data.egenkontrolRef || '',
          email: data.email || '',
          fuldeNavn: data.fuldeNavn || '',
          postnummer: data.postnummer || '',
          rolle: data.rolle || '',
          telefon: data.telefon || '',
          createdAt: new Date()
        })

      case 'UPDATE_BRUGER': {
        const updateFields = {}
        if (data.updatedData.adresse !== undefined) updateFields.adresse = data.updatedData.adresse
        if (data.updatedData.brugereRef !== undefined) updateFields.brugereRef = data.updatedData.brugereRef
        if (data.updatedData.by !== undefined) updateFields.by = data.updatedData.by
        if (data.updatedData.egenkontrolRef !== undefined) updateFields.egenkontrolRef = data.updatedData.egenkontrolRef
        if (data.updatedData.email !== undefined) updateFields.email = data.updatedData.email
        if (data.updatedData.fuldeNavn !== undefined) updateFields.fuldeNavn = data.updatedData.fuldeNavn
        if (data.updatedData.postnummer !== undefined) updateFields.postnummer = data.updatedData.postnummer
        if (data.updatedData.rolle !== undefined) updateFields.rolle = data.updatedData.rolle
        if (data.updatedData.telefon !== undefined) updateFields.telefon = data.updatedData.telefon

        return await updateDoc(doc(db, 'Brugere', data.id), updateFields)
      }

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

      case 'ADD_TJEKLISTE': {
        const tjeklisteFields = (data.tjeklisteFields || []).map((f, i) => ({
          ...f,
          id: f.id || `field_${Date.now()}_${i}`,
          order: f.order || i + 1
        }))

        const docRef = await addDoc(collection(db, 'Tjeklister'), {
          tjeklisteNavn: data.tjeklisteNavn,
          beskrivelse: data.beskrivelse,
          type: data.type,
          frekvens: data.frekvens,
          tjeklisteFields,
          opgaver: data.opgaver || [],
          createdAt: new Date(),
          updatedAt: new Date()
        })

        /* 🔶 Vend tilbage med map-info */
        return { firestoreId: docRef.id, tempId: data.tempId }
      }

      case 'UPDATE_TJEKLISTE': {
        const updatePayload = {
          ...data.updatedData,
          updatedAt: new Date()
        }

        // If tjeklisteFields are being updated, ensure they have IDs
        if (data.updatedData.tjeklisteFields) {
          updatePayload.tjeklisteFields = data.updatedData.tjeklisteFields.map((field, index) => ({
            ...field,
            id: field.id || `field_${Date.now()}_${index}`,
            order: index + 1
          }))
        }

        return await updateDoc(doc(db, 'Tjeklister', data.id), updatePayload)
      }

      case 'DELETE_TJEKLISTE':
        return await deleteDoc(doc(db, 'Tjeklister', data.id))

      case 'ADD_EGENKONTROL': {
        // Get tjekliste data to build proper egenkontrol structure
        const { useTjeklisteStore } = await import('@/stores/tjeklisteStore')
        const tjeklisteStore = useTjeklisteStore()

        const tjeklisteId = data.tjekliste || data.checkliste
        const tjekliste = tjeklisteStore.getTjeklisteById(tjeklisteId)

        if (!tjekliste) {
          throw new Error('Tjekliste ikke fundet')
        }

        const { generateDateArray } = await import('@/utils/dateHelpers')
        const startDato = data.startDato || new Date().toISOString().split('T')[0]
        const frekvens = tjekliste.frekvens
        const datoer = generateDateArray(startDato, frekvens, 10)

        const historik = datoer.map((dato) => {
          // Initialize tjeklisteFields based on tjekliste template
          const baseTjeklisteFields = tjekliste.tjeklisteFields || []
          const tjeklisteFields = baseTjeklisteFields.map(field => ({
            id: field.id,
            title: field.title,
            description: field.description || '',
            type: field.type,
            required: field.required || false,
            order: field.order || 1,
            // Answer fields
            answer: null,
            comment: '',
            imageUrl: null,
            completed: false
          }))

          return {
            dato,
            status: 'inaktiv',
            afsluttetAf: '',
            noter: '',
            tjeklisteFields: tjeklisteFields
          }
        })

        const egenkontrolDoc = {
          navn: data.navn || tjekliste.tjeklisteNavn,
          beskrivelse: data.beskrivelse || tjekliste.beskrivelse || '',
          checkliste: tjeklisteId,
          tjeklisterRef: `/Tjeklister/${tjeklisteId}`,
          lokation: data.lokation || '',
          ansvarligeBrugere: data.ansvarligeBrugere || [],
          modtagere: data.modtagere || [],
          påmindelser: data.påmindelser || [],
          frekvens,
          startDato,
          historik,
          type: 'Egenkontrol',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const docRef = await addDoc(collection(db, 'Egenkontrol'), egenkontrolDoc)
        return { id: docRef.id, tempId: data.tempId }
      }

      case 'DELETE_EGENKONTROL':
        return await deleteDoc(doc(db, 'Egenkontrol', data.id))

      case 'UPDATE_EGENKONTROL_STATUS': {
        const taskRef = doc(db, 'Egenkontrol', data.taskId)
        const taskDoc = await getDoc(taskRef)
        const taskData = taskDoc.data()
        const historyIndex = taskData.historik.findIndex(entry => entry.dato === data.targetDate)

        if (historyIndex !== -1) {
          const currentEntry = taskData.historik[historyIndex]

          // Respect manually completed tasks
          if (currentEntry.manueltFuldført && (currentEntry.status === 'udført' || currentEntry.status === 'afvigelse')) {
            return // Avoid overwriting manually completed tasks
          }

          const updatedHistorik = [...taskData.historik]
          updatedHistorik[historyIndex] = {
            ...updatedHistorik[historyIndex],
            status: data.newStatus,
            ...(data.completedData && {
              afsluttetAf: data.completedData.afsluttetAf,
              afsluttetDato: data.completedData.afsluttetDato,
              tjeklisteResultat: data.completedData.tjeklisteResultat
            })
          }
          return await updateDoc(taskRef, { historik: updatedHistorik })
        }
        break
      }

      case 'UPDATE_FIELD_RESULTS': {
        const taskRef = doc(db, 'Egenkontrol', data.taskId)
        const taskDoc = await getDoc(taskRef)
        const taskData = taskDoc.data()

        const historyIndex = taskData.historik.findIndex(entry => entry.dato === data.targetDate)
        if (historyIndex === -1) {
          throw new Error('No history entry found for the target date')
        }

        // Check if there are any "no" answers in yes_no_comment fields
        const hasAnyDeviations = data.tjeklisteFields
          .filter(field => field.type === 'yes_no_comment')
          .some(field => field.answer === 'nej')

        // Determine status based on answers
        const newStatus = hasAnyDeviations ? 'afvigelse' : 'udført'

        const updatedHistorik = [...taskData.historik]
        updatedHistorik[historyIndex] = {
          ...updatedHistorik[historyIndex],
          status: newStatus,
          tjeklisteFields: data.tjeklisteFields,
          afsluttetAf: data.completedBy,
          afsluttetDato: new Date().toISOString(),
          manueltFuldført: true
        }

        return await updateDoc(taskRef, {
          historik: updatedHistorik,
          updatedAt: new Date().toISOString()
        })
      }

      case 'UPDATE_EGENKONTROL_STATUS_WITH_CORRECTION': {
        const { taskId, originalDate, correctionData } = data
      
        const taskRef  = doc(db, 'Egenkontrol', taskId)
        const taskSnap = await getDoc(taskRef)
        if (!taskSnap.exists()) throw new Error('Egenkontrol ikke fundet')
      
        const taskData = taskSnap.data()
        const histIdx  = taskData.historik.findIndex(h => h.dato === originalDate)
        if (histIdx === -1) throw new Error('No history entry found for the original date')
      
        const originalEntry = taskData.historik[histIdx]
        if (originalEntry.status !== 'afvigelse') {
          throw new Error('Can only correct entries with deviation status')
        }
      
        /* ---------- byg opdateret historik ---------- */
        const updatedHistorik = [...taskData.historik]
      
        if (correctionData.afvigelseUdbedret === 'ja') {
          // ✔️ afvigelsen er udbedret → markér som udført + gem korrektion
          updatedHistorik[histIdx] = {
            ...originalEntry,
            status: 'udført',
            manueltFuldført: true,
            oprindeligAfvigelse: {
              status:          'afvigelse',
              afsluttetDato:   originalEntry.afsluttetDato,
              afsluttetAf:     originalEntry.afsluttetAf,
              tjeklisteFields: originalEntry.tjeklisteFields
            },
            korrektion: {
              korrigeret:             true,
              korrektionsDato:        correctionData.udbedringsDato,
              korrigeretAf:           correctionData.udbedretAf,
              korrektionsBeskrivelse: correctionData.udbedringsBeskrivelse,
              korrektionsTidspunkt:   new Date().toISOString()
            },
            afsluttetDato: correctionData.udbedringsDato,
            afsluttetAf:   correctionData.udbedretAf
          }
        } else {
          // ↩️  afvigelsen er stadig åben ⇒ blot status-opdatering
          updatedHistorik[histIdx] = {
            ...originalEntry,
            statusOpdatering: {
              dato:                 correctionData.udbedringsDato,
              opdateretAf:          correctionData.udbedretAf,
              beskrivelse:          correctionData.udbedringsBeskrivelse,
              opdateringsTidspunkt: new Date().toISOString()
            }
          }
        }
      
        /* ---------- skriv til Firestore ---------- */
        await updateDoc(taskRef, {
          historik: updatedHistorik,
          updatedAt: new Date()
        })
      
        return { id: taskId }                // ←  giver processAll ”success”-hint
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
    const idMap = {}            //  temp-id  →  Firestore-id
  
    try {
      console.log(`🔄 Processing ${actions.length} pending actions`)
  
      /* 1) kør først de handlinger der OPRETTER dokumenter */
      const order = {
        ADD_TJEKLISTE: 0,
        ADD_EGENKONTROL: 1, // altid efter tjeklisten
        UPDATE_FIELD_RESULTS: 2,
        UPDATE_EGENKONTROL_STATUS_WITH_CORRECTION: 3
      }
      const sorted = [...actions].sort(
        (a, b) => (order[a.type] ?? 99) - (order[b.type] ?? 99)
      )

      for (const action of sorted) {
        /* ─────────────────────────────────────────────
           2) Erstat ALLE temp-id’er i action.data før sync
           ───────────────────────────────────────────── */
        if (action.data) {
          for (const [key, val] of Object.entries(action.data)) {
            if (typeof val === 'string' && idMap[val]) {
              action.data[key] = idMap[val]        // temp → ægte id
            }
          }
        }
  
        try {
          /* 3) Kør selve sync-funktionen */
          const syncResult = await this.processAction(action)
  
          /* 4) Hvis vi lige har OPRETTET noget, gem mapping + ryd temp */
          if ((action.type === 'ADD_TJEKLISTE' || action.type === 'ADD_EGENKONTROL') && syncResult?.id) {
            idMap[syncResult.tempId] = syncResult.id        // temp → ægte

            const realId = syncResult.firestoreId || syncResult.id
            const tempId = syncResult.tempId || action.data.id || action.data.tempId
            idMap[tempId] = realId
  
            const storeName = action.type === 'ADD_TJEKLISTE' ? 'tjeklister' : 'egenkontrol'
            await indexedDBManager.delete(storeName, tempId)
            console.log(`🧹 Deleted temp ${storeName} with ID ${tempId}`)
          }
  
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
