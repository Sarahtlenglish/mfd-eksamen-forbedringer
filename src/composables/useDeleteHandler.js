export function useDeleteHandler({ store, getName = item => item.name || item.navn || item.tjeklisteNavn || item.fuldeNavn || 'element', onDeleted = () => {} }) {
  const handleDelete = async (item) => {
    const name = getName(item)
    if (confirm(`Er du sikker på, at du vil slette ${name}?`)) {
      try {
        await store.delete(item.id)
        onDeleted(item)
      } catch (error) {
        alert('Der opstod en fejl under sletningen.')
        console.error('Error deleting:', error)
      }
    }
  }
  return { handleDelete }
}
