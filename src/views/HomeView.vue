<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import CalendarComponent from '@/components/calendar/CalendarComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import DetailPanel from '@/components/panels/DetailPanelComponent.vue'
import { IconPlus } from '@tabler/icons-vue'
import { useRouter } from 'vue-router'
import { useEgenkontrolStore } from '@/stores/egenkontrolStore'
import { useEnhedStore } from '@/stores/enhedStore'
import { formatDateToISO } from '@/utils/dateHelpers'
import { processCalendarTasks } from '@/utils/labelHelpers'
import { useDeleteHandler } from '@/composables/useDeleteHandler'
import { useEditHandler } from '@/composables/useEditHandler'
import { useCloseDetailPanelHandler } from '@/composables/useCloseDetailPanelHandler'

const egenkontrolStore = useEgenkontrolStore()
const enhedStore = useEnhedStore()

const calendarTasks = computed(() => {
  const raw = egenkontrolStore.getCalendarTasksSync()
  return Object.fromEntries(
    Object.entries(raw).map(([date, tasks]) => [
      date,
      processCalendarTasks(tasks)
    ])
  )
})

const selectedItem = ref(null)
const selectedTaskId = ref(null)
const selectedTask = computed(() => {
  if (!selectedTaskId.value) return null

  const allTasks = Object.values(calendarTasks.value).flat()

  // First try to find by main ID
  let task = allTasks.find(task => task.id === selectedTaskId.value)

  // If not found, try to find by tempId
  if (!task) {
    task = allTasks.find(task => task.tempId === selectedTaskId.value)
  }

  return task || null
})
const detailPanelRef = ref(null)
const router = useRouter()

let unsubscribe = null

onMounted(async () => {
  await egenkontrolStore.fetchEgenkontroller()
  unsubscribe = egenkontrolStore.setupEgenkontrollerListener()
  await enhedStore.fetchEnheder()
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const handleDateClick = (date) => {
  const dateKey = formatDateToISO(date)
  const tasks = calendarTasks.value[dateKey] || []

  selectedItem.value = {
    date,
    tasks
  }
  if (detailPanelRef.value?.resetSelectedTaskMode) {
    detailPanelRef.value.resetSelectedTaskMode()
  }
}

const { closeDetailPanel } = useCloseDetailPanelHandler({ selectedItem })

const { handleEdit } = useEditHandler()

const { handleDelete } = useDeleteHandler({
  store: { delete: egenkontrolStore.deleteEgenkontrol },
  getName: item => item.navn || item.name || 'egenkontrol',
  onDeleted: () => selectedItem.value = null
})

const createEgenkontrol = () => {
  router.push('/egenkontrol/opret')
}

function onSelectTask(task) {
  selectedItem.value = task
  selectedTaskId.value = task?.id || null
}

function updateSelectedTaskId(oldId, newId) {
  if (selectedTaskId.value === oldId) {
    selectedTaskId.value = newId
    const allTasks = Object.values(calendarTasks.value).flat()
    const updatedTask = allTasks.find(t => t.id === newId)
    if (updatedTask) {
      selectedItem.value = updatedTask
    }
  }
}

// Make function available globally for offline store
if (typeof window !== 'undefined') {
  window.updateSelectedTaskId = updateSelectedTaskId
}
</script>

<template>
  <div class="calendar-view">
    <div class="page-header">
      <h1 class="heading-1">{{ $route.meta.title }}</h1>
      <ButtonComponent
        variant="primary"
        @click="createEgenkontrol"
      >
        <template #icon>
          <IconPlus />
        </template>
        Opret Egenkontrol
      </ButtonComponent>
    </div>
    <div class="content-layout">
      <div class="calendar-section">
        <CalendarComponent
          @date-click="handleDateClick"
          :customTasks="calendarTasks"
        />
      </div>
      <DetailPanel
        v-if="selectedItem"
        ref="detailPanelRef"
        context="calendar"
        :item="selectedItem"
        :selectedTask="selectedTask"
        :showDeleteButton="false"
        @select-task="onSelectTask"
        @close="closeDetailPanel"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.calendar-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 16px 0;

  .heading-1 {
    color: $neutral-900;
    margin: 0;
  }
}

.content-layout {
  display: flex;
  flex: 1;
  gap: $spacing-large;
  overflow: hidden;
  min-height: 800px;

  .calendar-section {
    min-width: 66%;
    max-width: 66%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow-y: scroll;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
