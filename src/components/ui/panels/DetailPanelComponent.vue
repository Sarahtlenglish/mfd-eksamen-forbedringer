<script setup>
import { ref, computed } from 'vue'
import { IconChevronLeft, IconX, IconPencil, IconTrash } from '@tabler/icons-vue'
import BasePanel from '@/components/ui/panels/BasePanelComponent.vue'
import EgenkontrolDetailContent from '@/components/detailpanel/EgenkontrolDetailContent.vue'
import EnhederDetailContent from '@/components/detailpanel/EnhederDetailContent.vue'
import EnhederHistoryContent from '@/components/detailpanel/EnhederHistoryContent.vue'
import TjeklisteDetailContent from '@/components/detailpanel/TjeklisteDetailContent.vue'
import CalendarDetailContent from '@/components/detailpanel/CalendarDetailContent.vue'
import BrugerDetailContent from '@/components/detailpanel/BrugerDetailContent.vue'

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

  // Use custom title if provided
  if (props.customTitle) return props.customTitle

  // For calendar context, use date formatting
  if (props.context === 'calendar') {
    if (props.item.date) {
      // Format date as "2. marts 2025" or "3. marts 2025"
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

  // Context-specific title properties
  if (props.context === 'tjeklister' && props.item.tjekliste) {
    return props.item.tjekliste + ' - Tjekliste'
  }

  if (props.context === 'egenkontroller' && props.item.title) {
    return props.item.title
  }

  // Default to name property
  return props.item.name || ''
})

// Computed property for styling classes
const titleClasses = computed(() => {
  if (props.context === 'calendar') {
    return 'detail-title calendar-title'
  }
  return 'detail-title'
})

const canEdit = computed(() => {
  // Determine if the current item can be edited based on context
  // Don't allow editing in history mode
  return ['egenkontroller', 'enheder', 'brugere'].includes(props.context) && !isHistoryMode.value
})

const shouldShowEditButton = computed(() => {
  // Use the showEditButton prop if provided, otherwise fall back to canEdit
  return props.showEditButton !== null ? props.showEditButton : canEdit.value
})

// Determine when to show back button
const shouldShowBackButton = computed(() => {
  // If we're in history mode, show the back button regardless of prop
  // Otherwise, use the prop value
  return isHistoryMode.value || props.showBackButton
})

// Determine when to show delete button
const shouldShowDeleteButton = computed(() => {
  // If we're in history mode, show the delete button regardless of prop
  return props.showDeleteButton
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
    handleClose()
  }
}

const handleClose = () => {
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
  <BasePanel v-if="item" :class="{ 'calendar-panel': context === 'calendar' }">
    <!-- Header - Explicitly in the DetailPanel -->
    <template #header>
      <div class="detail-panel-header"
        :class="{
          'calendar-header': context === 'calendar',
          'bruger-header': context === 'brugere'
         }">
        <div v-if="shouldShowBackButton" class="back-button-container">
          <button @click="handleBackClick" class="back-button">
            <IconChevronLeft/>
          </button>
        </div>
        <div class="detail-title-container" :class="{ 'no-back-button': !shouldShowBackButton }">
          <h2 :class="titleClasses">{{ panelTitle }}</h2>
        </div>
        <div class="detail-actions">
          <button v-if="shouldShowEditButton" @click="handleEdit" class="edit-button">
            <IconPencil/>
          </button>
          <button @click="handleClose" class="close-button" :class="{ 'calendar-close': context === 'calendar' }">
            <IconX/>
          </button>
        </div>
      </div>
    </template>

    <!-- Main content -->
    <template #default>
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

      <!-- Brugere Detail -->
      <BrugerDetailContent
        v-else-if="context === 'brugere'"
        :item="item"
      />

    </template>

    <!-- Footer -->
    <template #footer>
      <div v-if="shouldShowDeleteButton && !isHistoryMode" class="detail-actions-bottom">
        <span class="delete-button" @click="handleDelete">
          <IconTrash class="trash-icon"/>
          <span>Slet</span>
        </span>
      </div>
    </template>
  </BasePanel>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;
@use '@/assets/icons' as *;

:deep(.base-panel) {
  &.calendar-panel {
    padding: 18px;
  }
}

.detail-panel-header {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-large;
  width: 100%;

  &.calendar-header {
    margin-bottom: $spacing-medium;
    border-bottom: 1px solid $neutral-300;
  }

  &.bruger-header {
    margin-bottom: $spacing-small;
  }

  .back-button-container {
    display: flex;
    align-items: center;
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
    margin-left: auto;

    .edit-button, .close-button {
      background: none;
      border: none;
      font-size: $icon-medium;
      color: $secondary-500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .calendar-close {
      font-size: 20px;
    }
  }
}

.detail-actions-bottom {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;

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

/* Special styling for calendar view */
:deep(.calendar-panel) .detail-content {
  padding-top: 0 !important;
}
</style>
