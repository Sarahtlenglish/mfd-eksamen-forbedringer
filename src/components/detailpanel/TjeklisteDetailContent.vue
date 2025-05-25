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
        <div class="preview-container">
          <img src='@/assets/tjekliste.png?url' alt="Preview" class="preview-image" />
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
  margin-bottom: 1.25rem
}

.preview-container {
  border: 1px solid $neutral-300;
  border-radius: 4px;
  overflow: hidden;
  background-color: $neutral-100;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;

  .preview-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: fill;
  }
}

</style>
