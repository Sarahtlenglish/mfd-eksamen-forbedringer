import { ref } from 'vue'

const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalPrimaryText = ref('OK')
const modalSecondaryText = ref('Luk')
const modalPrimaryAction = ref(() => {
  showModal.value = false
})
const modalSecondaryAction = ref(() => {
  showModal.value = false
})

function closeModal() {
  showModal.value = false
}

export function useModal() {
  function openModal({ title, message, primaryText = 'OK', secondaryText = 'Luk', onPrimary, onSecondary }) {
    modalTitle.value = title
    modalMessage.value = message
    modalPrimaryText.value = primaryText
    modalSecondaryText.value = secondaryText
    modalPrimaryAction.value = onPrimary || (() => {
      showModal.value = false
    })
    modalSecondaryAction.value = onSecondary || (() => {
      showModal.value = false
    })
    showModal.value = true
  }

  return {
    showModal,
    modalTitle,
    modalMessage,
    modalPrimaryText,
    modalSecondaryText,
    modalPrimaryAction,
    modalSecondaryAction,
    openModal,
    closeModal
  }
}
