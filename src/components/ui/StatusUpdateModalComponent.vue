<!-- StatusUpdateModal.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { IconX, IconCheck } from '@tabler/icons-vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import { useBrugerStore } from '@/stores/brugerStore'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'update'])

const brugerStore = useBrugerStore()

const formData = ref({
  afvigelseUdbedret: null, // 'ja' eller 'nej'
  udbedringsBeskrivelse: '',
  udbedretAf: '', // Bruger ID
  udbedringsDato: new Date().toISOString().split('T')[0]
})

onMounted(() => {
  // Sørg for at brugere er loaded
  if (brugerStore.brugere.length === 0) {
    brugerStore.fetchBrugere()
  }
})

const brugerOptions = computed(() => {
  return brugerStore.brugere.map(bruger => ({
    value: bruger.id,
    label: bruger.fuldeNavn || bruger.navn || bruger.id
  }))
})

const canComplete = computed(() => {
  return formData.value.afvigelseUdbedret !== null && formData.value.udbedringsBeskrivelse.trim() !== '' && formData.value.udbedretAf !== ''
})

const formatDate = (dateString) => {
  if (!dateString) return 'Ukendt dato'
  try {
    return new Date(dateString).toLocaleDateString('da-DK')
  } catch {
    return 'Ukendt dato'
  }
}

const getOriginalDeviationDate = () => {
  // Få den dato hvor afvigelsen blev registreret
  return props.task?.afsluttetDato || props.task?.dato || new Date().toISOString()
}

const handleComplete = () => {
  if (!canComplete.value) return

  emit('update', {
    ...formData.value,
    originalDate: props.task.dato,
    taskId: props.task.id
  })
}

const handleClose = () => {
  // Reset form
  formData.value = {
    afvigelseUdbedret: null,
    udbedringsBeskrivelse: '',
    udbedretAf: '',
    udbedringsDato: new Date().toISOString().split('T')[0]
  }
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Opdater Egenkontrol Status</h2>
        <button class="close-button" @click="handleClose">
          <IconX />
        </button>
      </div>

      <div class="modal-content">
        <div class="info-section">
          <p class="task-info">
            <strong>Egenkontrol:</strong> {{ task?.title || task?.navn }}
          </p>
          <p class="date-info">
            <strong>Oprindelig dato:</strong> {{ task?.dato }}
          </p>
          <p class="status-info">
            <strong>Status:</strong> Afvigelse registreret d. {{ formatDate(getOriginalDeviationDate()) }}
          </p>
        </div>

        <div class="form-section">
          <div class="field-group">
            <label class="field-label">
              Er afvigelsen blevet udbedret? <span class="required">*</span>
            </label>
            <div class="radio-options">
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="formData.afvigelseUdbedret"
                  value="ja"
                >
                <span>Ja, afvigelsen er udbedret</span>
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="formData.afvigelseUdbedret"
                  value="nej"
                >
                <span>Nej, afvigelsen er ikke udbedret endnu</span>
              </label>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">
              Beskrivelse af udbedring/status <span class="required">*</span>
            </label>
            <textarea
              v-model="formData.udbedringsBeskrivelse"
              class="description-textarea"
              :placeholder="formData.afvigelseUdbedret === 'ja'
                ? 'Beskriv hvordan afvigelsen blev udbedret...'
                : 'Beskriv nuværende status og planlagte tiltag...'"
              rows="4"
            ></textarea>
          </div>

          <div class="field-group">
            <label class="field-label">
              Udbedret af <span class="required">*</span>
            </label>
            <select
              v-model="formData.udbedretAf"
              class="select-input"
            >
              <option value="">Vælg bruger</option>
              <option
                v-for="bruger in brugerOptions"
                :key="bruger.value"
                :value="bruger.value"
              >
                {{ bruger.label }}
              </option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label">
              Dato for udbedring
            </label>
            <input
              type="date"
              v-model="formData.udbedringsDato"
              class="date-input"
            >
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <ButtonComponent
          variant="secondary"
          @click="handleClose"
        >
          Annuller
        </ButtonComponent>
        <ButtonComponent
          variant="primary"
          @click="handleComplete"
          :disabled="!canComplete"
        >
          <template #icon>
            <IconCheck />
          </template>
          Opdater Status
        </ButtonComponent>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: $spacing-large;
}

.modal-container {
  background: $neutral-100;
  border-radius: $border-radius-lg;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-large;
  border-bottom: 1px solid $neutral-300;
  flex-shrink: 0;
}

.modal-title {
  font-size: $subtitle-1-font-size;
  font-weight: $subtitle-1-font-weight;
  margin: 0;
  color: $neutral-900;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: $secondary-500;
  padding: $spacing-xs;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $border-radius-sm;
  transition: $transition-base;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    color: $neutral-900;
    background: $neutral-200;
  }
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-large;
}

.info-section {
  background: $secondary-50;
  padding: $spacing-medium;
  border-radius: $border-radius-md;
  margin-bottom: $spacing-large;

  p {
    margin: 0 0 $spacing-xs 0;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-large;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-small;
}

.field-label {
  font-weight: $body-1-font-weight-semibold;
  color: $neutral-900;
  font-size: $body-2-font-size;
}

.required {
  color: $error-base;
}

.radio-options {
  display: flex;
  flex-direction: column;
  gap: $spacing-small;
}

.radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: $spacing-small;
  border-radius: $border-radius-sm;
  transition: $transition-base;

  &:hover {
    background: $neutral-200;
  }

  input[type="radio"] {
    margin-right: $spacing-small;
    transform: scale(1.2);
  }

  span {
    font-weight: $body-1-font-weight-semibold;
    color: $neutral-900;
  }
}

.description-textarea {
  width: 100%;
  padding: $spacing-small $spacing-medium;
  border: 1px solid $neutral-300;
  border-radius: $border-radius-sm;
  font-size: $body-2-font-size;
  resize: vertical;
  font-family: inherit;
  background-color: $neutral-200;

  &:focus {
    outline: none;
    border-color: $secondary-500;
    box-shadow: 0 0 0 2px rgba(75, 151, 192, 0.1);
  }
}

.text-input, .date-input, .select-input {
  padding: $spacing-small $spacing-medium;
  border: 1px solid $neutral-300;
  border-radius: $border-radius-sm;
  font-size: $body-2-font-size;
  background-color: $neutral-200;

  &:focus {
    outline: none;
    border-color: $secondary-500;
    box-shadow: 0 0 0 2px rgba(75, 151, 192, 0.1);
  }
}

.select-input {
  width: 100%;
  cursor: pointer;

  option {
    background-color: $neutral-100;
    color: $neutral-900;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-medium;
  padding: $spacing-large;
  border-top: 1px solid $neutral-300;
  flex-shrink: 0;
}
</style>
