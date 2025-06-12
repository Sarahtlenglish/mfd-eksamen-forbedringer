<script setup>
import { getTjeklisteTypeLabel, getFrekvensLabel } from '@/utils/labelHelpers'

const props = defineProps({
  context: {
    type: String,
    required: true
  },
  item: {
    type: Object,
    required: true
  }
})

defineEmits(['close', 'edit', 'delete', 'microcopy'])
</script>

<template>
  <div v-if="context === 'tjeklister'">
    <div class="detail-section">
      <div v-if="item.beskrivelse" class="detail-description">
        {{ item.beskrivelse || 'Ingen beskrivelse angivet.' }}
      </div>

      <div class="detail-body">
        <p class="body-1-semibold">
          {{ getTjeklisteTypeLabel(props.item.type) || 'Type ikke angivet' }}
        </p>
        <p class="body-1-semibold">
          {{ getFrekvensLabel(props.item.frekvens) || 'Frekvens ikke angivet' }}
        </p>
      </div>

      <div class="preview-section">
        <h3 class="detail-heading">FORHÅNDSVISNING</h3>

        <!-- Debug info (kan fjernes senere) -->
        <div v-if="false" class="debug-info">
          <p>tjeklisteFields length: {{ item.tjeklisteFields?.length || 0 }}</p>
          <pre>{{ JSON.stringify(item.tjeklisteFields, null, 2) }}</pre>
        </div>

        <!-- Hvis der er tjeklisteFields, vis dem -->
        <div v-if="item.tjeklisteFields && item.tjeklisteFields.length > 0" class="preview-container">
          <div class="preview-header">
            <h4 class="preview-title">{{ item.tjeklisteNavn || item.tjeklistenavn || 'Tjekliste' }}</h4>
          </div>

          <div class="preview-fields">
            <div
              v-for="(field, index) in item.tjeklisteFields"
              :key="field.id || `field-${index}`"
              class="preview-field-item"
            >
              <!-- Yes/No + Comment field -->
              <div v-if="field.type === 'yes_no_comment'" class="preview-yes-no-comment">
                <div class="preview-question">{{ field.title }}</div>
                <div v-if="field.description && field.description.trim()" class="preview-description">{{ field.description }}</div>
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
                <div v-if="field.description && field.description.trim()" class="preview-description">{{ field.description }}</div>
                <div class="comment-field-container">
                  <textarea disabled class="comment-textarea" placeholder="Skriv kommentar her..." rows="3"></textarea>
                </div>
              </div>

              <!-- Upload field -->
              <div v-else-if="field.type === 'upload'" class="preview-upload">
                <div class="preview-question">{{ field.title }}</div>
                <div v-if="field.description && field.description.trim()" class="preview-description">{{ field.description }}</div>
                <div class="preview-upload-area">
                  <span>📷 Klik for at uploade billede</span>
                </div>
              </div>

              <!-- Fallback for unknown field types -->
              <div v-else class="preview-unknown">
                <div class="preview-question">{{ field.title }}</div>
                <div class="preview-description">Type: {{ field.type }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hvis der ikke er nogen felter endnu -->
        <div v-else class="preview-container empty-preview">
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <p class="empty-text">Ingen felter tilføjet endnu</p>
            <p class="empty-subtext">Rediger tjeklisten for at tilføje felter</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.detail-description {
  margin-bottom: $spacing-medium-plus;
}

.detail-body {
  margin-bottom: $spacing-xlarge;
}

.detail-heading {
  margin-bottom: 1.25rem;
}

.preview-container {
  border: 1px solid $neutral-300;
  border-radius: 8px;
  overflow: hidden;
  background-color: $neutral-100;
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: $neutral-200;
  }

  &::-webkit-scrollbar-thumb {
    background: $neutral-400;
    border-radius: 3px;
  }

  &.empty-preview {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.preview-header {
  background: $table-header;
  padding: $spacing-medium;
  border-bottom: 1px solid $neutral-300;

  .preview-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    color: $neutral-900;
  }
}

.preview-fields {
  padding: $spacing-medium;
}

.preview-field-item {
  background: $neutral-100;
  border: 1px solid $neutral-200;
  border-radius: 6px;
  padding: $spacing-medium;
  margin-bottom: $spacing-medium;

  &:last-child {
    margin-bottom: 0;
  }
}

.preview-question {
  font-weight: 500;
  margin-bottom: $spacing-xs;
  color: $neutral-900;
  font-size: 0.9rem;
}

.preview-description {
  font-size: 0.8rem;
  color: $neutral-600;
  margin-bottom: $spacing-small;
  font-style: italic;
}

.preview-options {
  display: flex;
  gap: $spacing-large;
  margin-bottom: $spacing-small;
}

.custom-radio-option {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
}

.custom-radio {
  width: 16px;
  height: 16px;
  border: 2px solid $neutral-400;
  border-radius: 50%;
  margin-right: $spacing-xs;
  background: $neutral-100;
}

.radio-label {
  font-weight: 500;
  color: $neutral-700;
}

.preview-comment {
  label {
    display: block;
    font-weight: 500;
    margin-bottom: $spacing-xs;
    font-size: 0.85rem;
    color: $neutral-800;
  }

  textarea {
    width: 100%;
    padding: $spacing-xs $spacing-small;
    border: 1px solid $neutral-300;
    border-radius: 4px;
    resize: none;
    background: $neutral-200;
    font-size: 0.8rem;
    color: $neutral-600;
  }
}

.preview-comment-only {
  .comment-field-container {
    margin-top: $spacing-xs;
  }

  .comment-textarea {
    width: 100%;
    padding: $spacing-xs $spacing-small;
    border: 1px solid $neutral-300;
    border-radius: 4px;
    resize: none;
    background: $neutral-200;
    font-size: 0.8rem;
    color: $neutral-600;
  }
}

.preview-upload {
  .preview-upload-area {
    border: 2px dashed $neutral-300;
    border-radius: 4px;
    padding: $spacing-medium;
    text-align: center;
    color: $neutral-500;
    background: $neutral-200;
    font-size: 0.85rem;
    margin-top: $spacing-xs;
  }
}

.empty-state {
  text-align: center;
  color: $neutral-500;

  .empty-icon {
    font-size: 2rem;
    margin-bottom: $spacing-small;
  }

  .empty-text {
    font-weight: 500;
    margin-bottom: $spacing-xs;
    color: $neutral-600;
  }

  .empty-subtext {
    font-size: 0.85rem;
    color: $neutral-500;
    margin: 0;
  }
}
</style>
