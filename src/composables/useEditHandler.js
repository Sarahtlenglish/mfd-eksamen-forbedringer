export function useEditHandler() {
  const handleEdit = (item) => {
    console.log('Edit item:', item)

    // Get the appropriate name property based on the item type
    const name = item.name || item.navn || item.tjeklisteNavn || item.fuldeNavn || 'element'

    // Show alert that functionality is not implemented yet (in Danish)
    alert(`Redigering af ${name} - denne funktionalitet er ikke implementeret endnu`)
  }

  return { handleEdit }
}
