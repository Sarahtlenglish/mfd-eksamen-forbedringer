<script setup>
// Use script setup for Composition API
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

const emit = defineEmits(['close', 'edit', 'delete', 'microcopy'])

</script>

<template>
  <div v-if="context === 'tjeklister'">
    <div class="detail-section">
      <div v-if="item.description" class="detail-description">
        {{ item.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi.' }}
      </div>

      <div class="detail-body">
        <p class="body-1-semibold">{{ item.frequency || 'Body 1 (SemiBold)' }}</p>
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
