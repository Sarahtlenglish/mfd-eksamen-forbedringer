<script setup>
import { ref, computed, nextTick } from 'vue'
import { IconChevronLeft, IconX, IconPencil, IconTrash } from '@tabler/icons-vue'
import BasePanel from '@/components/ui/panels/BasePanelComponent.vue'
import EgenkontrolDetailContent from '@/components/detailpanel/EgenkontrolDetailContent.vue'
import EnhederDetailContent from '@/components/detailpanel/EnhederDetailContent.vue'
import EnhederHistoryContent from '@/components/detailpanel/EnhederHistoryContent.vue'
import TjeklisteDetailContent from '@/components/detailpanel/TjeklisteDetailContent.vue'
import CalendarDetailContent from '@/components/detailpanel/CalendarDetailContent.vue'
import CalendarListContent from '@/components/detailpanel/CalendarListContent.vue'
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
  selectedTask: {
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
  isCreationMode: {
    type: Boolean,
    default: false
  },
  // New prop for custom title
  customTitle: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'edit', 'delete', 'back', 'history-toggle', 'select-task'])

// State
const isHistoryMode = ref(false)
const isSelectedTaskMode = ref(false)
const previousItems = ref([])

// Computed properties
const panelTitle = computed(() => {
  if (!props.item) return ''

  if (props.customTitle) return props.customTitle

  if (props.context === 'calendar') {
    // Hvis item har en selectedTask, brug dens titel
    if (props.selectedTask && props.selectedTask.title) return props.selectedTask.title
    // Ellers brug title/navn/name direkte
    if (props.item.title) return props.item.title
    if (props.item.navn) return props.item.navn
    if (props.item.name) return props.item.name
    // Ellers vis datoen (listevisning)
    if (props.item.date) {
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
  if (props.context === 'tjeklister' && props.item.tjeklisteNavn) {
    return props.item.tjeklisteNavn + ' - Tjekliste'
  }

  if (props.context === 'egenkontroller' && props.item.navn) {
    return props.item.navn
  }

  if (props.context === 'brugere' && props.item.fuldeNavn) {
    return props.item.fuldeNavn
  }

  // Default to name property
  return props.item.name || ''
})

// Computed property for styling classes
const titleClasses = computed(() => {
  if (props.context === 'calendar' && !isSelectedTaskMode.value) {
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
  if (props.context === 'calendar') {
    // Vis kun edit-knap i selectedTaskMode (altså når en task er valgt)
    return isSelectedTaskMode.value
  }
  // Brug eksisterende logik for andre kontekster
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
function toggleHistoryMode(val) {
  isHistoryMode.value = val !== undefined ? val : !isHistoryMode.value
}
function resetHistoryMode() {
  isHistoryMode.value = false
}
function toggleSelectedTaskMode(val) {
  isSelectedTaskMode.value = val !== undefined ? val : !isSelectedTaskMode.value
}
function resetSelectedTaskMode() {
  isSelectedTaskMode.value = false
}

defineExpose({
  resetHistoryMode,
  resetSelectedTaskMode
})

function handleBackClick() {
  if (isHistoryMode.value) {
    resetHistoryMode()
    return
  }
  if (isSelectedTaskMode.value) {
    resetSelectedTaskMode()
    emit('select-task', null)
    return
  }
  if (previousItems.value.length > 0) {
    emit('back', previousItems.value.pop())
  } else {
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

function handleSelectTask(task) {
  if (isSelectedTaskMode.value) {
    resetSelectedTaskMode()
    nextTick(() => {
      emit('select-task', task)
      toggleSelectedTaskMode(true)
    })
  } else {
    emit('select-task', task)
    toggleSelectedTaskMode(true)
  }
}
</script>

<template>
  <BasePanel v-if="item" :class="{ 'calendar-panel': context === 'calendar' }">
    <!-- Header - Explicitly in the DetailPanel -->
    <template #header>
      <div class="detail-panel-header"
        :class="{
          'calendar-header': context === 'calendar' && !isSelectedTaskMode,
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
          <button v-if="!isCreationMode" @click="handleClose" class="close-button" :class="{ 'calendar-close': context === 'calendar' }">
            <IconX/>
          </button>
        </div>
      </div>
    </template>

    <!-- Main content -->
    <template #default>
      <!-- Kalender: Vis liste eller detalje -->
      <template v-if="context === 'calendar'">
        <CalendarListContent
          v-if="!isSelectedTaskMode"
          :item="item"
          @select-task="handleSelectTask"
        />
        <CalendarDetailContent
          v-else
          :item="selectedTask"
          @back="() => { emit('select-task', null); resetSelectedTaskMode(); }"
        />
      </template>
      <!-- Egenkontrol Detail -->
      <EgenkontrolDetailContent
        v-else-if="context === 'egenkontroller'"
        :item="item"
      />
      <template v-else-if="context === 'enheder'">
        <EnhederDetailContent
          v-if="!isHistoryMode"
          :item="item"
          :showHistoryButton="!isCreationMode"
          @toggle-history="toggleHistoryMode"
        />
        <EnhederHistoryContent
          v-else
          :item="item"
          :history-items="historyItems"
        />
      </template>
      <TjeklisteDetailContent
        v-else-if="context === 'tjeklister'"
        :context="context"
        :item="item"
      />
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
