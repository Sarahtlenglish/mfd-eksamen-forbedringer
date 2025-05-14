import { useModal } from '@/composables/useModal'

function getDeleteWarning(entityType) {
  switch (entityType) {
    case 'egenkontrol':
      return 'Alle fremtidige egenkontroller i kalenderen vil også blive slettet'
    case 'enhed':
      return 'Dette kan påvirke andre tilknyttede elementer i systemet'
    case 'tjekliste':
      return 'Historikken vil blive gemt i 5 år. Tilknyttede opgaver kan blive påvirket.'
    case 'bruger':
      return 'Dette kan påvirke andre elementer som brugeren er ansvarlig for'
    default:
      return ''
  }
}

function getEntityLabel(type) {
  switch (type) {
    case 'egenkontrol':
      return 'egenkontrol'
    case 'enhed':
      return 'enhed'
    case 'tjekliste':
      return 'tjekliste'
    case 'bruger':
      return 'bruger'
    default:
      return 'element'
  }
}

export function useDeleteHandler({
  store,
  entityType = 'element',
  onDeleted = () => {}
}) {
  const { openModal, closeModal } = useModal()

  const handleDelete = async (item) => {
    openModal({
      title: `Er du sikker på, at du vil slette denne ${getEntityLabel(entityType)}?`,
      message: getDeleteWarning(entityType),
      primaryText: 'Ja, slet',
      secondaryText: 'Nej, annuller',
      onPrimary: async () => {
        try {
          await store.delete(item.id)
          closeModal()
          onDeleted(item)
        } catch {
          openModal({
            title: 'Fejl',
            message: 'Der opstod en fejl under sletningen.',
            primaryText: 'OK',
            secondaryText: ''
          })
        }
      }
    })
  }
  return { handleDelete }
}
