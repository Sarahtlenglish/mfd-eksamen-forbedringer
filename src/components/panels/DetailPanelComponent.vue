<script setup>
import { ref, computed } from 'vue'
import { IconChevronLeft, IconX, IconPencil, IconTrash } from '@tabler/icons-vue'
import BasePanel from '@/components/panels/BasePanelComponent.vue'
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
    default: null
  },
  isCreationMode: {
    type: Boolean,
    default: false
  },
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
const selectedTaskRef = ref(null)

const panelTitle = computed(() => {
  if (!props.item) return ''

  if (props.context === 'calendar') {
    // Hvis item har en selectedTask, brug dens titel
    if (isSelectedTaskMode.value && selectedTaskRef.value && selectedTaskRef.value.navn) return selectedTaskRef.value.navn
    if (props.item.date) {
      return props.item.date.toLocaleDateString('da-DK', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }
    return 'Kalender'
  }

  if (isHistoryMode.value && props.context === 'enheder') {
    return `${props.item.name} - ${props.item.location || ''}`
  }

  if (props.context === 'tjeklister' && props.item.tjeklisteNavn) {
    return props.item.tjeklisteNavn
  }

  if (props.context === 'egenkontroller' && props.item.navn) {
    return props.item.navn
  }

  if (props.context === 'brugere' && props.item.fuldeNavn) {
    return props.item.fuldeNavn
  }

  return props.item.name || ''
})

const titleClasses = computed(() => {
  if (props.context === 'calendar' && !isSelectedTaskMode.value) {
    return 'detail-title calendar-title'
  }
  return 'detail-title'
})

const canEdit = computed(() => {
  return ['egenkontroller', 'enheder', 'brugere'].includes(props.context) && !isHistoryMode.value
})

const shouldShowEditButton = computed(() => {
  if (props.context === 'calendar') {
    return isSelectedTaskMode.value
  }
  return props.showEditButton !== null ? props.showEditButton : canEdit.value
})

const shouldShowBackButton = computed(() => {
  return isHistoryMode.value || props.showBackButton
})

const shouldShowDeleteButton = computed(() => {
  return isSelectedTaskMode.value || props.showDeleteButton
})

function toggleHistoryMode(val) {
  isHistoryMode.value = val !== undefined ? val : !isHistoryMode.value
}
function resetHistoryMode() {
  isHistoryMode.value = false
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
  if (isSelectedTaskMode.value) {
    emit('delete', selectedTaskRef.value)
  } else {
    emit('delete', props.item)
  }
}

function handleSelectTask(task) {
  selectedTaskRef.value = task
  isSelectedTaskMode.value = true
}
</script>

<template>
  <BasePanel v-if="item" class="detail-panel" :class="{ 'calendar-panel': context === 'calendar', 'creation-mode': isCreationMode }">
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
          <h2 :class="titleClasses">{{ panelTitle }}
            <span v-if="context === 'enheder' && item.type === 'Gruppe'" class="group-indicator">(Gruppe)</span>
          </h2>
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

    <!-- Content -->
    <template #default>
      <!-- Kalender Detail -->
      <template v-if="context === 'calendar'">
        <CalendarListContent
          v-if="!isSelectedTaskMode"
          :item="item"
          @select-task="handleSelectTask"
        />
        <CalendarDetailContent
          v-else
          :item="selectedTaskRef"
          @back="() => { selectedTaskRef.value = null; isSelectedTaskMode.value = false; }"
        />
      </template>
      <EgenkontrolDetailContent
        v-else-if="context === 'egenkontroller'"
        :item="item"
      />
      <template v-else-if="context === 'enheder'">
        <!-- Enheder Detail -->
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

:deep(.calendar-panel) .detail-content {
  padding-top: 0 !important;
}
</style>
