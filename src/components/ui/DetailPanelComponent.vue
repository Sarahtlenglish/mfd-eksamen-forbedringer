<!-- DetailPanelComponent.vue -->
<script setup>
import { ref, computed } from 'vue'
import { IconChevronLeft, IconX, IconPencil, IconTrash } from '@tabler/icons-vue'
import EgenkontrolDetailContent from '@/components/detailpanel/EgenkontrolDetailContent.vue'
import EnhederDetailContent from '@/components/detailpanel/EnhederDetailContent.vue'
import EnhederHistoryContent from '@/components/detailpanel/EnhederHistoryContent.vue'

const props = defineProps({
  context: {
    type: String,
    required: true,
    validator: (value) => ['calendar', 'egenkontroller', 'enheder', 'tjeklister', 'brugere'].includes(value)
  },
  item: {
    type: Object,
    default: null
  },
  historyItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'edit', 'delete', 'back'])

// State
const isHistoryMode = ref(false)
const previousItems = ref([])

// Computed properties
const panelTitle = computed(() => {
  if (!props.item) return ''

  if (isHistoryMode.value && props.context === 'enheder') {
    return `${props.item.name} - ${props.item.location}`
  }

  return props.item.name
})

const canEdit = computed(() => {
  // Determine if the current item can be edited based on context
  return ['egenkontroller', 'enheder', 'brugere'].includes(props.context)
})

// Methods
const toggleHistoryMode = () => {
  isHistoryMode.value = !isHistoryMode.value
}

function handleBackClick() {
  // First check if we're in history mode
  if (isHistoryMode.value) {
    // If in history mode, go back to normal view
    isHistoryMode.value = false
    return
  }

  // If not in history mode, use the previous behavior
  if (previousItems.value.length > 0) {
    // Go back to the previous item in the detail panel
    emit('back', previousItems.value.pop())
  } else {
    // Nothing to go back to – close the detail panel
    close()
  }
}

const close = () => {
  emit('close')
}

const handleEdit = () => {
  emit('edit', props.item)
}

const handleDelete = () => {
  emit('delete', props.item)
}
</script>

<template>
  <div class="detail-panel" v-if="item">
    <!-- Header - Directly in the main component -->
    <div class="detail-panel-header">
      <div class="back-button-container">
        <span @click="handleBackClick" class="back-button">
          <IconChevronLeft/>
        </span>
      </div>
      <div class="detail-title-container">
        <h2 class="detail-title">{{ panelTitle }}</h2>
      </div>
      <div class="detail-actions">
        <span v-if="canEdit" @click="handleEdit" class="edit-button">
          <IconPencil/>
        </span>
        <span @click="close" class="close-button">
          <IconX/>
        </span>
      </div>
    </div>

    <!-- Dynamic content based on context and mode -->
    <div class="detail-content">
      <!-- Egenkontrol Detail -->
      <EgenkontrolDetailContent
        v-if="context === 'egenkontroller'"
        :item="item"
      />

      <!-- Enheder - Normal Mode -->
      <EnhederDetailContent
        v-else-if="context === 'enheder' && !isHistoryMode"
        :item="item"
        @toggle-history="toggleHistoryMode"
      />

      <!-- Enheder - History Mode -->
      <EnhederHistoryContent
        v-else-if="context === 'enheder' && isHistoryMode"
        :item="item"
        :history-items="historyItems"
      />

      <!-- Tjeklister Detail -->
      <!-- <TjeklisterDetailContent
        v-else-if="context === 'tjeklister'"
        :item="item"
      /> -->

      <!-- Brugere Detail -->
      <!-- <BrugereDetailContent
        v-else-if="context === 'brugere'"
        :item="item"
      /> -->

      <!-- Additional contexts can be added here -->
    </div>

    <!-- Footer - Directly in the main component -->
    <div class="detail-bottom">
      <div class="detail-actions-bottom">
        <span class="delete-button" @click="handleDelete">
          <span>
            <IconTrash class="trash-icon"/>
          </span>
          <span>Slet</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;
@use '@/assets/icons' as *;

.detail-panel {
  background-color: $neutral-200;
  border-radius: 8px;
  border: 1px solid $neutral-300;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: $detail-panel-padding;
  height: 823px;
  width: 33%;

  .detail-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: $neutral-200;

    .back-button {
      background: none;
      border: none;
      color: $secondary-500;
      font-size: $icon-medium;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .detail-title {
      flex: 1;
      margin: 0;
      line-height: $subtitle-1-line-height;
      font-size: $subtitle-1-font-size;
      color: $secondary-900;
      font-weight: $subtitle-1-font-weight;
    }

    .detail-actions {
      display: flex;
      align-items: center;
      gap: 16px;

      .edit-button, .close-button {
        background: none;
        border: none;
        font-size: $icon-medium;
        color: $secondary-500;
        cursor: pointer;
      }
    }
  }

  .detail-content {
    padding-top: $spacing-large;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    height: 100%;
    font-size: $body-1-font-size;
    color: $neutral-800;
  }

  .detail-bottom {
    margin-top: auto;

    .detail-actions-bottom {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;

      .delete-button {
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $spacing-small;
        color: $error-base;
        padding: $spacing-small $spacing-medium;
        border-radius: 4px;
        font-size: $body-2-font-size;
        font-weight: $body-2-font-weight-semibold;
        cursor: pointer;
      }

      .trash-icon {
        font-size: $icon-small;
      }
    }
  }
}
</style>
