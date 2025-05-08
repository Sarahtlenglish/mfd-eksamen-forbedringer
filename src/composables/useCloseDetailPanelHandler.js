// src/composables/useDetailPanelHandler.js
export function useCloseDetailPanelHandler(options = {}) {
  const {
    selectedItem,
    historyItems = null
  } = options

  const closeDetailPanel = () => {
    // Nulstil det valgte element
    if (selectedItem) {
      selectedItem.value = null
    }

    // Håndter specielt tilfælde for EnhederView, hvor historyItems også nulstilles
    if (historyItems) {
      historyItems.value = []
    }
  }

  return { closeDetailPanel }
}
