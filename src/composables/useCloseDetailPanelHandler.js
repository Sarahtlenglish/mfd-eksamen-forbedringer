export function useCloseDetailPanelHandler(options = {}) {
  const {
    selectedItem,
    historyItems = null
  } = options

  const closeDetailPanel = () => {
    if (selectedItem) {
      selectedItem.value = null
    }

    if (historyItems) {
      historyItems.value = []
    }
  }

  return { closeDetailPanel }
}
