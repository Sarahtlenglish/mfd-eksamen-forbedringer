export function useEditHandler() {
  const handleEdit = (item) => {
    console.log('Edit item:', item)

    const name = item.name || item.navn || item.tjeklisteNavn || item.fuldeNavn || 'element'

    alert(`Redigering af ${name} - denne funktionalitet er ikke implementeret endnu`)
  }

  return { handleEdit }
}
