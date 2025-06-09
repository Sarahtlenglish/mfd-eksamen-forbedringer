export function useEditHandler() {
  const handleEdit = (item) => {
    const name = item.name || item.navn || item.tjeklisteNavn || item.fuldeNavn || 'element'

    alert(`Redigering af ${name} - denne funktionalitet er ikke implementeret endnu`)
  }

  return { handleEdit }
}

export function handleEdit(item, router, routeName) {
  router.push({ name: routeName, params: { id: item.id } })
}
