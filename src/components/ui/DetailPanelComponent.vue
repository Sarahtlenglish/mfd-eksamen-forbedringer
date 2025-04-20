<script setup>
import { ref, computed } from 'vue'
import { IconX, IconTrash, IconChevronLeft, IconPencil } from '@tabler/icons-vue'
import EgenkontrolDetailContent from '@/components/detailpanel/EgenkontrolDetailContent.vue'
import EnhederDetailContent from '@/components/detailpanel/EnhederDetailContent.vue'
import EnhederHistoryContent from '@/components/detailpanel/EnhederHistoryContent.vue'
import CalendarDetailContent from '@/components/detailpanel/CalendarDetailContent.vue'

const props = defineProps({
  context: {
    type: String,
    required: true,
    validator: value => ['calendar', 'egenkontroller', 'enheder', 'tjeklister', 'brugere'].includes(value)
  },
  item: {
    type: Object,
    default: null
  },
  historyItems: {
    type: Array,
    default: () => []
  },
  // New props for controlling variants
  showBackButton: {
    type: Boolean,
    default: true
  },
  showDeleteButton: {
    type: Boolean,
    default: true
  },
  showEditButton: {
    type: Boolean,
    default: null // Will use canEdit computed property if null
  },
  // New prop for custom title
  customTitle: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'edit', 'delete', 'back', 'history-toggle'])

// State
const isHistoryMode = ref(false)
const previousItems = ref([])

// Computed properties
const panelTitle = computed(() => {
  if (!props.item) return ''

  // For calender context, brug en anden titling (dato)
  if (props.context === 'calendar') {
    if (props.item.date) {
      // Format dato som "2. marts 2025" eller "3. marts 2025"
      return props.item.date.toLocaleDateString('da-DK', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }
    return 'Kalender'
  }

  // For calender context, brug en anden titling (dato)
  if (props.context === 'calendar') {
    if (props.item.date) {
      // Format dato som "2. marts 2025" eller "3. marts 2025"
      return props.item.date.toLocaleDateString('da-DK', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }
    return 'Kalender'
  }

  // Handle history mode title format
  if (isHistoryMode.value && props.context === 'enheder') {
    return `${props.item.name} - ${props.item.location || ''}`
  }

  return props.item.name
})

// Computed property for styling classes
const titleClasses = computed(() => {
  if (props.context === 'calendar') {
    return 'detail-title calendar-title'
  }
  return 'detail-title'
})

// Determined if the item can be edited
const canEdit = computed(() => {
  return ['egenkontroller', 'enheder', 'brugere'].includes(props.context)
})

// Methods
const toggleHistoryMode = () => {
  isHistoryMode.value = !isHistoryMode.value
  // Emit an event so parent components can react if needed
  emit('history-toggle', isHistoryMode.value)
}

function resetHistoryMode() {
  isHistoryMode.value = false
}

// Make sure to expose it
defineExpose({
  resetHistoryMode
})

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
  <div class="detail-panel" :class="{ 'calendar-panel': context === 'calendar' }" v-if="item">
    <!-- Header - Directly in the main component -->
    <div class="detail-panel-header" :class="{ 'calendar-header': context === 'calendar' }">
      <div class="back-button-container" v-if="context !== 'calendar'">
        <span @click="handleBackClick" class="back-button">
          <IconChevronLeft/>
        </span>
      </div>
      <div class="detail-title-container">
        <h2 :class="titleClasses">{{ panelTitle }}</h2>
      </div>
      <div class="detail-actions">
        <span v-if="canEdit && context !== 'calendar'" @click="handleEdit" class="edit-button">
          <IconPencil/>
        </span>
        <span @click="close" class="close-button" :class="{ 'calendar-close': context === 'calendar' }">
          <IconX/>
        </span>
      </div>
    </div>

    <!-- Dynamic content based on context and mode -->
    <div class="detail-content">
      <!-- Calendar Detail -->
      <CalendarDetailContent
        v-if="context === 'calendar'"
        :item="item"
      />

      <!-- Egenkontrol Detail -->
      <EgenkontrolDetailContent
        v-else-if="context === 'egenkontroller'"
        :item="item"
      />

      <!-- Enheder - Content (Detail or History based on isHistoryMode) -->
      <template v-else-if="context === 'enheder'">
        <EnhederDetailContent
          v-if="!isHistoryMode"
          :item="item"
          @toggle-history="toggleHistoryMode"
        />
        <EnhederHistoryContent
          v-else
          :item="item"
          :history-items="historyItems"
        />
      </template>

      <!-- Tjeklister Detail -->
      <TjeklisteDetailContent
        v-else-if="context === 'tjeklister'"
        :context="context"
        :item="item"
      />

      <!-- Additional contexts can be added here -->

      <!-- Default slot for custom content -->
      <slot name="content"></slot>
    </div>

    <!-- Footer - Directly in the main component -->
    <div v-if="showDeleteButton" class="detail-bottom">
      <div class="detail-actions-bottom">
        <span class="delete-button" @click="handleDelete">
          <IconTrash class="trash-icon"/>
          <span>Slet</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;
@use '@/assets/icons' as *;

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
  width: 100%;
  overflow: scroll;

  &.calendar-panel {
    padding: 18px;
  }

  .detail-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: $neutral-200;

    &.calendar-header {
      margin-bottom: $spacing-medium;
      border-bottom: 1px solid $neutral-300;
    }

    .back-button-container {
      min-width: 24px;
    }

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

    .detail-title-container {
      flex: 1;
      text-align: center;

      &.no-back-button {
        text-align: left;
      }
    }

    .detail-title-container {
      flex: 1;
    }

    .detail-title {
      margin: 0;
      line-height: $subtitle-1-line-height;
      font-size: $subtitle-1-font-size;
      color: $secondary-900;
      font-weight: $subtitle-1-font-weight;
    }

    .calendar-title {
      font-size: 18px !important;
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

      .calendar-close {
        font-size: 20px;
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

/* Specifik styling for kalendervisningen */
.detail-panel.calendar-panel .detail-content {
  padding-top: 0 !important;
}
</style>
