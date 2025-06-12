<script setup>
import { ref } from 'vue'
import { IconMessage, IconPhoto, IconToggleLeft, IconPlus } from '@tabler/icons-vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  previewTitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedFieldType = ref(null)
const activeAddForm = ref(null) // 'first', 'end', 'after-0', 'after-1', etc.
const newField = ref({
  title: '',
  description: '',
  required: false
})

const fieldTypes = [
  {
    type: 'yes_no_comment',
    label: 'Ja/Nej + Kommentar',
    icon: IconToggleLeft
  },
  {
    type: 'comment',
    label: 'Kun kommentar',
    icon: IconMessage
  },
  {
    type: 'upload',
    label: 'Upload billede',
    icon: IconPhoto
  }
]

const showAddForm = (position) => {
  activeAddForm.value = position
  selectedFieldType.value = null
  newField.value = {
    title: '',
    description: '',
    required: false
  }
}

const selectFieldType = (type) => {
  selectedFieldType.value = type
  newField.value = {
    title: newField.value.title,
    description: newField.value.description,
    required: false
  }
}

const addField = () => {
  if (!newField.value.title) return

  const field = {
    type: selectedFieldType.value,
    title: newField.value.title,
    description: newField.value.description,
    required: newField.value.required || false,
    id: Date.now() // Simple ID generation
  }

  const updatedFields = [...props.modelValue, field]
  emit('update:modelValue', updatedFields)

  cancelAddField()
}

const addFieldAfter = (index) => {
  if (!newField.value.title) return

  const field = {
    type: selectedFieldType.value,
    title: newField.value.title,
    description: newField.value.description,
    required: newField.value.required || false,
    id: Date.now()
  }

  const updatedFields = [...props.modelValue]
  updatedFields.splice(index + 1, 0, field)
  emit('update:modelValue', updatedFields)

  cancelAddField()
}

const removeField = (index) => {
  const updatedFields = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', updatedFields)
}

const cancelAddField = () => {
  activeAddForm.value = null
  selectedFieldType.value = null
  newField.value = {
    title: '',
    description: '',
    required: false
  }
}
</script>

<template>
  <div class="tjekliste-setup">
    <div class="setup-header">
      <h3 class="setup-title">Tilføj felter til din tjekliste</h3>
      <p class="setup-description">Vælg hvilke typer felter der skal være i tjeklisten når den udføres</p>
    </div>

    <div class="scrollable-content">
      <!-- Live preview/build area -->
      <div class="tjekliste-builder">
        <div class="builder-header">
          <h4>{{ previewTitle || 'Din tjekliste' }}</h4>
        </div>

        <!-- Eksisterende felter som interaktiv liste -->
        <div class="field-list">
          <!-- Første felt eller "tilføj første felt" -->
          <div v-if="modelValue.length === 0 && activeAddForm !== 'first'" class="add-first-field">
            <ButtonComponent
              variant="tertiary"
              @click="showAddForm('first')"
              type="button">
              <template #icon>
                <IconPlus />
              </template>
              Tilføj første felt
            </ButtonComponent>
          </div>

          <!-- Eksisterende felter med tilføj knapper -->
          <template v-for="(field, index) in modelValue" :key="field.id">
            <!-- Field preview -->
            <div class="field-preview-item">
              <!-- Remove button in corner -->
              <button
                @click="removeField(index)"
                class="remove-field-corner"
                type="button">
                ×
              </button>

              <div class="field-preview">
                <!-- Yes/No + Comment field -->
                <div v-if="field.type === 'yes_no_comment'" class="preview-yes-no-comment">
                  <div class="preview-question">{{ field.title }}</div>
                  <div v-if="field.description" class="preview-description">{{ field.description }}</div>
                  <div class="preview-options">
                    <div class="custom-radio-option">
                      <span class="custom-radio"></span>
                      <span class="radio-label">Ja</span>
                    </div>
                    <div class="custom-radio-option">
                      <span class="custom-radio"></span>
                      <span class="radio-label">Nej</span>
                    </div>
                  </div>
                  <div class="preview-comment">
                    <label>Kommentar{{ field.required ? ' *' : '' }}</label>
                    <textarea disabled placeholder="Kommentar..." rows="2"></textarea>
                  </div>
                </div>

                <!-- Comment only field -->
                <div v-else-if="field.type === 'comment'" class="preview-comment-only">
                  <div class="preview-question">{{ field.title }}</div>
                  <div v-if="field.description" class="preview-description">{{ field.description }}</div>
                  <div class="comment-field-container">
                    <textarea disabled class="comment-textarea" placeholder="Skriv kommentar her..." rows="3"></textarea>
                  </div>
                </div>

                <!-- Upload field -->
                <div v-else-if="field.type === 'upload'" class="preview-upload">
                  <label class="preview-question">{{ field.title }}</label>
                  <div v-if="field.description" class="preview-description">{{ field.description }}</div>
                  <div class="preview-upload-area">
                    <span>📷 Klik for at uploade billede</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add field form (conditionally shown AFTER each field) -->
            <div
              v-if="activeAddForm === `after-${index}`"
              class="add-field-form-inline">
              <div class="add-field-section">
                <h4 class="add-field-title">Tilføj nyt felt</h4>

                <div class="field-types">
                  <button
                    v-for="fieldType in fieldTypes"
                    :key="fieldType.type"
                    @click="selectFieldType(fieldType.type)"
                    :class="['field-type-button', { active: selectedFieldType === fieldType.type }]"
                    type="button">
                    <component :is="fieldType.icon" class="field-type-icon" />
                    <span>{{ fieldType.label }}</span>
                  </button>
                </div>

                <!-- Felt konfiguration -->
                <div v-if="selectedFieldType" class="field-config">
                  <div class="form-group">
                    <label class="field-label">Felt titel *</label>
                    <input
                      v-model="newField.title"
                      type="text"
                      class="form-input"
                      placeholder="F.eks. 'Er brandtæppet tydeligt skiltet og ophængt?'"
                      required>
                  </div>

                  <div v-if="selectedFieldType !== 'upload'" class="form-group">
                    <label class="field-label">Beskrivelse (valgfrit)</label>
                    <textarea
                      v-model="newField.description"
                      class="form-textarea"
                      placeholder="Uddybende beskrivelse af hvad der skal tjekkes"
                      rows="3"></textarea>
                  </div>

                  <div v-if="selectedFieldType === 'yes_no_comment'" class="form-group">
                    <label class="checkbox-label">
                      <input
                        v-model="newField.required"
                        type="checkbox"
                        class="form-checkbox">
                      Kommentar er påkrævet
                    </label>
                  </div>

                  <div class="form-actions">
                    <ButtonComponent
                      variant="primary"
                      @click="addFieldAfter(index)"
                      :disabled="!newField.title"
                      type="button">
                      Tilføj felt
                    </ButtonComponent>
                    <ButtonComponent
                      variant="secondary"
                      @click="cancelAddField"
                      type="button">
                      Annuller
                    </ButtonComponent>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Add field at end -->
          <div v-if="modelValue.length > 0 && !activeAddForm" class="add-field-end">
            <ButtonComponent
              variant="tertiary"
              @click="showAddForm('end')"
              type="button">
              <template #icon>
                <IconPlus />
              </template>
              Tilføj felt
            </ButtonComponent>
          </div>

          <!-- Add field form for first field or end -->
          <div
            v-if="activeAddForm === 'first' || activeAddForm === 'end'"
            class="add-field-form-inline">
            <div class="add-field-section">
              <h4 class="add-field-title">{{ activeAddForm === 'first' ? 'Tilføj dit første felt' : 'Tilføj nyt felt' }}</h4>

              <div class="field-types">
                <button
                  v-for="fieldType in fieldTypes"
                  :key="fieldType.type"
                  @click="selectFieldType(fieldType.type)"
                  :class="['field-type-button', { active: selectedFieldType === fieldType.type }]"
                  type="button">
                  <component :is="fieldType.icon" class="field-type-icon" />
                  <span>{{ fieldType.label }}</span>
                </button>
              </div>

              <!-- Felt konfiguration -->
              <div v-if="selectedFieldType" class="field-config">
                <div class="form-group">
                  <label class="field-label">Felt titel *</label>
                  <input
                    v-model="newField.title"
                    type="text"
                    class="form-input"
                    placeholder="F.eks. 'Er brandtæppet tydeligt skiltet og ophængt?'"
                    required>
                </div>

                <div v-if="selectedFieldType !== 'upload'" class="form-group">
                  <label class="field-label">Beskrivelse (valgfrit)</label>
                  <textarea
                    v-model="newField.description"
                    class="form-textarea"
                    placeholder="Uddybende beskrivelse af hvad der skal tjekkes"
                    rows="3"></textarea>
                </div>

                <div v-if="selectedFieldType === 'yes_no_comment'" class="form-group">
                  <label class="checkbox-label">
                    <input
                      v-model="newField.required"
                      type="checkbox"
                      class="form-checkbox">
                    Kommentar er påkrævet
                  </label>
                </div>

                <div class="form-actions">
                  <ButtonComponent
                    variant="primary"
                    @click="addField"
                    :disabled="!newField.title"
                    type="button">
                    Tilføj felt
                  </ButtonComponent>
                  <ButtonComponent
                    variant="secondary"
                    @click="cancelAddField"
                    type="button">
                    Annuller
                  </ButtonComponent>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.tjekliste-setup {
  padding: $spacing-medium 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 400px);
}

.setup-header {
  margin-bottom: $spacing-large;
  flex-shrink: 0;
}

.setup-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: $spacing-xs;
  color: $neutral-900;
}

.setup-description {
  color: $neutral-600;
  margin: 0;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding-right: $spacing-xs;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: $neutral-200;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: $neutral-400;
    border-radius: 3px;

    &:hover {
      background: $neutral-500;
    }
  }
}

.tjekliste-builder {
  background: $neutral-100;
  border: 1px solid $neutral-300;
  border-radius: $border-radius-lg;
  overflow: auto;
  max-height: 400px;

  // Fjern scroll arrows og scrollbar
  &::-webkit-scrollbar-button {
    display: none;
  }

  &::-webkit-scrollbar-button:start:decrement,
  &::-webkit-scrollbar-button:end:increment {
    display: none;
  }

  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer og Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari og Opera */
  }
}

.builder-header {
  background: $table-header;
  padding: $spacing-small $spacing-medium;
  border-bottom: 1px solid $neutral-300;

  h4 {
    margin: 0;
    font-weight: 500;
    color: $neutral-900;
  }
}

.field-list {
  padding: $spacing-medium;
}

.field-preview-item {
  background: $neutral-100;
  border: 1px solid $neutral-300;
  border-radius: $border-radius-md;
  margin-bottom: $spacing-medium;
  overflow: hidden;
  position: relative;
}

.remove-field-corner {
  position: absolute;
  top: $spacing-xs;
  right: $spacing-xs;
  background: $error-500;
  color: $neutral-100;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: $transition-base;

  &:hover {
    background: $error-600;
    transform: scale(1.1);
  }
}

.field-preview {
  padding: $spacing-medium;
  padding-top: calc($spacing-medium + 16px); // Extra padding for remove button
  background: $neutral-100;
}

.field-type-badge {
  background: $secondary-500;
  color: $neutral-100;
  padding: 2px 8px;
  border-radius: $border-radius-sm;
  font-size: 0.75rem;
  font-weight: 500;

  &.yes_no_comment { background: #3B82F6; }
  &.comment { background: $success-base; }
  &.upload { background: #8B5CF6; }
}

.add-field-trigger,
.add-first-field,
.add-field-end {
  text-align: center;
  margin: $spacing-medium 0;
}

.add-field-form-inline {
  background: $secondary-25;
  border: 2px solid $secondary-200;
  border-radius: $border-radius-md;
  padding: $spacing-large;
  margin: $spacing-medium 0;
}

.add-field-section {
  background: transparent;
  margin-bottom: 0;
}

.add-field-title {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: $spacing-medium;
  color: $neutral-900;
}

.field-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: $spacing-medium;
  margin-bottom: $spacing-medium;
}

.field-type-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-medium;
  border: 2px solid $neutral-300;
  border-radius: $border-radius-md;
  background: $neutral-100;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    border-color: $secondary-300;
    background: $secondary-50;
  }

  &.active {
    border-color: $secondary-500;
    background: $secondary-50;
  }
}

.field-type-icon {
  width: 32px;
  height: 32px;
  margin-bottom: $spacing-xs;
  color: $secondary-500;
}

.field-config {
  border-top: 1px solid $neutral-300;
  padding-top: $spacing-medium;
}

.form-group {
  margin-bottom: $spacing-medium;
}

.field-label {
  display: block;
  font-weight: 500;
  margin-bottom: $spacing-xs;
  color: $neutral-800;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: $spacing-small $spacing-medium;
  border: 1px solid $neutral-300;
  border-radius: $border-radius-sm;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: $secondary-500;
    box-shadow: 0 0 0 2px rgba(75, 151, 192, 0.1);
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-weight: normal;
  cursor: pointer;
}

.form-checkbox {
  margin-right: $spacing-xs;
}

.form-actions {
  display: flex;
  gap: $spacing-medium;
}

// Preview field styles
.preview-question {
  font-weight: 500;
  margin-bottom: $spacing-xs;
  color: $neutral-900;
}

.preview-description {
  font-size: 0.875rem;
  color: $neutral-600;
  margin-bottom: $spacing-small;
}

.preview-options {
  display: flex;
  gap: $spacing-large;
  margin-bottom: $spacing-small;
}

.custom-radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: $spacing-small;
  border-radius: $border-radius-sm;
  transition: $transition-base;

  &:hover {
    background: $neutral-200;
  }
}

.custom-radio {
  width: 20px;
  height: 20px;
  border: 2px solid $neutral-400;
  border-radius: 50%;
  margin-right: $spacing-small;
  position: relative;
  background: $neutral-100;
  transition: $transition-base;

  &.selected {
    border-color: $secondary-500;
    background: $secondary-50;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      background: $secondary-500;
      border-radius: 50%;
    }
  }
}

.radio-label {
  font-weight: 500;
  color: $neutral-900;
  user-select: none;
}

.preview-radio {
  display: flex;
  align-items: center;
  cursor: pointer;

  input {
    margin-right: $spacing-xs;
  }
}

.preview-comment {
  label {
    display: block;
    font-weight: 500;
    margin-bottom: $spacing-xs;
  }

  textarea {
    width: 100%;
    padding: $spacing-small;
    border: 1px solid $neutral-300;
    border-radius: $border-radius-sm;
    resize: vertical;
    background: $neutral-200;
  }
}

.preview-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;

  input {
    margin-right: $spacing-xs;
  }
}

.comment-field-container {
  margin-top: $spacing-small;
}

.comment-field-label {
  display: block;
  font-weight: 500;
  margin-bottom: $spacing-xs;
  color: $neutral-900;
  font-size: 0.875rem;
}

.comment-textarea {
  width: 100%;
  padding: $spacing-small;
  border: 1px solid $neutral-300;
  border-radius: $border-radius-sm;
  resize: vertical;
  font-size: 0.875rem;
  background: $neutral-200;
}

.preview-upload-area {
  border: 2px dashed $neutral-300;
  border-radius: $border-radius-sm;
  padding: $spacing-large;
  text-align: center;
  color: $neutral-500;
  background: $neutral-200;
}
</style>
