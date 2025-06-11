<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { IconX, IconCheck } from '@tabler/icons-vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  task: {
    type: Object,
    required: true
  },
  tjeklisteFields: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'complete'])

const formTjeklisteFields = ref([])

// Simple initialization function
const initializeFields = () => {
  if (!props.tjeklisteFields || !Array.isArray(props.tjeklisteFields)) {
    formTjeklisteFields.value = []
    return
  }

  formTjeklisteFields.value = props.tjeklisteFields.map(field => ({
    ...field,
    answer: field.answer || null,
    comment: field.comment || '',
    imageUrl: field.imageUrl || null,
    completed: field.completed || false
  }))
}

watch(() => props.isOpen, (newIsOpen) => {
  if (newIsOpen) {
    initializeFields()
  }
})

onMounted(() => {
  if (props.isOpen) {
    initializeFields()
  }
})

const updateFieldResult = (fieldId, updates) => {
  const index = formTjeklisteFields.value.findIndex(f => f.id === fieldId)
  if (index !== -1) {
    formTjeklisteFields.value[index] = {
      ...formTjeklisteFields.value[index],
      ...updates,
      completed: isFieldCompleted(formTjeklisteFields.value[index], updates)
    }
  }
}

const isFieldCompleted = (field, updates = {}) => {
  const updatedField = { ...field, ...updates }

  switch (updatedField.type) {
    case 'yes_no_comment':
      return updatedField.answer !== null && (!updatedField.required || updatedField.comment.trim() !== '')
    case 'comment':
      return updatedField.comment.trim() !== ''
    case 'upload':
      return updatedField.imageUrl !== null
    default:
      return true
  }
}

const canComplete = computed(() => {
  const requiredFields = formTjeklisteFields.value.filter(field => field.required)
  return requiredFields.every(field => field.completed)
})

const handleComplete = () => {
  if (!canComplete.value) return

  emit('complete', {
    tjeklisteFields: formTjeklisteFields.value,
    completedBy: 'Current User',
    completedAt: new Date().toISOString()
  })
}

const handleClose = () => {
  emit('close')
}

const handleImageUpload = (fieldId, event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      updateFieldResult(fieldId, {
        imageUrl: e.target.result,
        completed: true
      })
    }
    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">{{ task?.title || task?.navn || 'Udfør Egenkontrol' }} - Udfør Egenkontrol</h2>
        <button class="close-button" @click="handleClose">
          <IconX />
        </button>
      </div>

      <div class="modal-content">
        <div v-if="task?.beskrivelse" class="task-description">
          Udfyld felterne under eftersynet af enheden
        </div>

        <div class="fields-container">
          <div
            v-for="field in formTjeklisteFields"
            :key="field.id"
            class="field-item"
          >
            <!-- Yes/No + Comment field -->
            <div v-if="field.type === 'yes_no_comment'" class="field-yes-no-comment">
              <div class="field-question">
                {{ field.title }}
                <span v-if="field.required" class="required-star">*</span>
              </div>
              <div v-if="field.description" class="field-description">{{ field.description }}</div>

              <div class="radio-options">
                <label class="radio-option">
                  <input
                    type="radio"
                    :name="`field-${field.id}`"
                    value="ja"
                    :checked="field.answer === 'ja'"
                    @change="updateFieldResult(field.id, { answer: 'ja' })"
                  >
                  <span class="radio-label">Ja</span>
                </label>
                <label class="radio-option">
                  <input
                    type="radio"
                    :name="`field-${field.id}`"
                    value="nej"
                    :checked="field.answer === 'nej'"
                    @change="updateFieldResult(field.id, { answer: 'nej' })"
                  >
                  <span class="radio-label">Nej</span>
                </label>
              </div>

              <div class="comment-section">
                <label class="comment-label">
                  Kommentar{{ field.required ? ' *' : '' }}
                </label>
                <textarea
                  v-model="field.comment"
                  @input="updateFieldResult(field.id, { comment: $event.target.value })"
                  class="comment-textarea"
                  placeholder="Tilføj kommentar..."
                  rows="3"
                ></textarea>
              </div>
            </div>

            <!-- Comment only field -->
            <div v-else-if="field.type === 'comment'" class="field-comment-only">
              <div class="field-question">
                {{ field.title }}
                <span v-if="field.required" class="required-star">*</span>
              </div>
              <div v-if="field.description" class="field-description">{{ field.description }}</div>

              <textarea
                v-model="field.comment"
                @input="updateFieldResult(field.id, { comment: $event.target.value })"
                class="comment-textarea"
                placeholder="Skriv din kommentar her..."
                rows="4"
              ></textarea>
            </div>

            <!-- Upload field -->
            <div v-else-if="field.type === 'upload'" class="field-upload">
              <div class="field-question">
                {{ field.title }}
                <span v-if="field.required" class="required-star">*</span>
              </div>
              <div v-if="field.description" class="field-description">{{ field.description }}</div>

              <div class="upload-area">
                <input
                  type="file"
                  :id="`upload-${field.id}`"
                  accept="image/*"
                  @change="handleImageUpload(field.id, $event)"
                  class="upload-input"
                >
                <label :for="`upload-${field.id}`" class="upload-label">
                  <div v-if="!field.imageUrl" class="upload-placeholder">
                    📷 Klik for at uploade billede
                  </div>
                  <div v-else class="upload-preview">
                    <img :src="field.imageUrl" alt="Uploaded image" class="preview-image">
                    <span class="upload-success">✓ Billede uploadet</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Hvis der ikke er nogen felter endnu -->
          <div v-if="formTjeklisteFields.length === 0" class="no-fields">
            <p>Denne tjekliste har ingen felter at udfylde.</p>
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
          Fuldfør udførelse
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

  @media (max-width: $tablet) {
    padding: $spacing-medium;
    align-items: flex-start;
    padding-top: 3vh;
  }

  @media (max-width: $mobile) {
    padding: $spacing-small;
    align-items: flex-start;
    padding-top: 1vh;
  }
}

.modal-container {
  background: $neutral-100;
  border-radius: $border-radius-lg;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  @media (max-width: $tablet) {
    max-width: 95vw;
    max-height: 97vh;
    border-radius: $border-radius-md;
  }

  @media (max-width: $mobile) {
    max-width: 100vw;
    max-height: 99vh;
    border-radius: $border-radius-sm;
    margin: 0;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: $spacing-large;
  border-bottom: 1px solid $neutral-300;
  flex-shrink: 0;
  gap: $spacing-medium;

  @media (max-width: $tablet) {
    padding: $spacing-medium-plus;
  }

  @media (max-width: $mobile) {
    padding: $spacing-medium;
    gap: $spacing-small;
  }
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: $neutral-900;
  flex: 1;
  line-height: 1.3;

  @media (max-width: $tablet) {
    font-size: 1.3rem;
  }

  @media (max-width: $mobile) {
    font-size: 1.1rem;
    line-height: 1.4;
  }
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
  min-width: 44px;
  min-height: 44px;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    color: $neutral-900;
    background: $neutral-200;
  }

  @media (max-width: $mobile) {
    min-width: 48px;
    min-height: 48px;

    svg {
      width: 28px;
      height: 28px;
    }
  }
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-large;

  @media (max-width: $tablet) {
    padding: $spacing-medium-plus;
  }

  @media (max-width: $mobile) {
    padding: $spacing-medium;
  }
}

.task-description {
  background: $secondary-50;
  padding: $spacing-small $spacing-medium;
  border-radius: $border-radius-md $border-radius-md 0 0;
  color: $neutral-800;
  font-style: italic;

  @media (max-width: $mobile) {
    padding: $spacing-medium;
    font-size: $body-1-font-size;
    margin-bottom: $spacing-medium;
  }
}

.fields-container {
  display: flex;
  flex-direction: column;
  gap: $spacing-large;

  @media (max-width: $mobile) {
    gap: $spacing-medium;
  }
}

.field-item {
  background: $neutral-100;
  border: 1px solid $neutral-300;
  border-radius: $border-radius-md;
  padding: $spacing-medium-plus;

  @media (max-width: $mobile) {
    padding: $spacing-medium;
  }
}

.field-item:first-of-type {
  border-radius: 0 0 $border-radius-md $border-radius-md;
}

.field-question {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: $spacing-small;
  color: $neutral-900;

  @media (max-width: $mobile) {
    font-size: 1.2rem;
    line-height: 1.4;
  }
}

.required-star {
  color: $error-base;
  margin-left: 4px;
}

.field-description {
  font-size: 0.9rem;
  color: $neutral-600;
  margin-bottom: $spacing-medium;
  font-style: italic;

  @media (max-width: $mobile) {
    font-size: $body-2-font-size;
    line-height: 1.5;
  }
}

.radio-options {
  display: flex;
  gap: $spacing-large;
  margin-bottom: $spacing-medium;

  @media (max-width: $mobile) {
    flex-direction: column;
    gap: $spacing-small;
  }
}

.radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: $spacing-small;
  border-radius: $border-radius-sm;
  transition: $transition-base;
  min-height: 44px;

  &:hover {
    background: $neutral-200;
  }

  input[type="radio"] {
    margin-right: $spacing-xs;
    transform: scale(1.2);
    min-width: 20px;
    min-height: 20px;
  }

  @media (max-width: $mobile) {
    min-height: 52px;
    padding: $spacing-medium;

    input[type="radio"] {
      transform: scale(1.5);
      margin-right: $spacing-small;
      min-width: 24px;
      min-height: 24px;
    }
  }
}

.radio-label {
  font-weight: 500;
  color: $neutral-900;
  flex: 1;

  @media (max-width: $mobile) {
    font-size: $body-1-font-size;
  }
}

.comment-section {
  margin-top: $spacing-medium;
}

.comment-label {
  display: block;
  font-weight: 500;
  margin-bottom: $spacing-xs;
  color: $neutral-800;

  @media (max-width: $mobile) {
    font-size: $body-1-font-size;
  }
}

.comment-textarea {
  width: 100%;
  padding: $spacing-small $spacing-medium;
  border: 1px solid $neutral-300;
  border-radius: $border-radius-sm;
  font-size: 0.9rem;
  resize: vertical;
  font-family: inherit;
  background-color: $neutral-200;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: $secondary-500;
    box-shadow: 0 0 0 2px rgba(75, 151, 192, 0.1);
  }

  @media (max-width: $mobile) {
    padding: $spacing-medium;
    font-size: $body-2-font-size;
    min-height: 120px;
  }
}

.upload-area {
  margin-top: $spacing-small;
}

.upload-input {
  display: none;
}

.upload-label {
  display: block;
  cursor: pointer;
  border: 2px dashed $neutral-300;
  border-radius: $border-radius-md;
  padding: $spacing-large;
  text-align: center;
  transition: $transition-base;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $neutral-200;

  &:hover {
    border-color: $secondary-400;
    background: $secondary-50;
  }

  @media (max-width: $mobile) {
    padding: $spacing-medium-plus;
    min-height: 140px;
  }
}

.upload-placeholder {
  color: $neutral-600;
  font-size: 1rem;

  @media (max-width: $mobile) {
    font-size: $body-1-font-size;
  }
}

.upload-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-small;
}

.preview-image {
  max-width: 200px;
  max-height: 150px;
  object-fit: cover;
  border-radius: $border-radius-sm;
  border: 1px solid $neutral-300;

  @media (max-width: $mobile) {
    max-width: 150px;
    max-height: 120px;
  }
}

.upload-success {
  color: $success-base;
  font-weight: 500;
  font-size: 0.9rem;

  @media (max-width: $mobile) {
    font-size: $body-2-font-size;
  }
}

.no-fields {
  text-align: center;
  padding: $spacing-xlarge;
  color: $neutral-600;

  p {
    margin: 0;
    font-size: 1.1rem;
  }

  @media (max-width: $mobile) {
    padding: $spacing-large;

    p {
      font-size: $body-1-font-size;
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-medium;
  padding: $spacing-large;
  border-top: 1px solid $neutral-300;
  flex-shrink: 0;

  @media (max-width: $tablet) {
    padding: $spacing-medium-plus;
    gap: $spacing-small;
  }

  @media (max-width: $mobile) {
    padding: $spacing-medium;
    flex-direction: column;
    gap: $spacing-medium;
  }
}

/* Specifik styling for knapper i footer */
.modal-footer :deep(.button-component) {
  @media (max-width: $mobile) {
    width: 100%;
    min-height: 52px;
    font-size: $body-1-font-size;
  }
}
</style>
