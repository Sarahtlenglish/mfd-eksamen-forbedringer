<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import CalendarComponent from '../components/calendar/CalendarComponent.vue'
import ButtonComponent from '../components/ui/ButtonComponent.vue'
import DetailPanel from '../components/ui/panels/DetailPanelComponent.vue'
import { IconPlus } from '@tabler/icons-vue'
import { useRouter } from 'vue-router'
import { useEgenkontrolStore } from '../stores/egenkontrolStore'
import { useEnhedStore } from '@/stores/enhedStore'
import { formatDateToISO } from '@/utils/dateHelpers'
import { processCalendarTasks } from '@/utils/labelHelpers'

// Get stores
const egenkontrolStore = useEgenkontrolStore()
const enhedStore = useEnhedStore()

// Calendar state management
const calendarTasks = computed(() => {
  const raw = egenkontrolStore.getCalendarTasksSync()
  return Object.fromEntries(
    Object.entries(raw).map(([date, tasks]) => [
      date,
      processCalendarTasks(tasks)
    ])
  )
})

watch(calendarTasks, (val) => {
  console.log('calendarTasks changed:', val)
})

const selectedItem = ref(null)
const selectedTaskId = ref(null)
const selectedTask = computed(() => {
  if (!selectedTaskId.value) return null
  // Find task i alle datoer
  return Object.values(calendarTasks.value)
    .flat()
    .find(task => task.id === selectedTaskId.value) || null
})
const detailPanelRef = ref(null)
const router = useRouter()

let unsubscribe = null

// Prepare calendar tasks based on store data
onMounted(async () => {
  // Fetch egenkontroller and get calendar tasks
  await egenkontrolStore.fetchEgenkontroller()
  unsubscribe = egenkontrolStore.setupEgenkontrollerListener()
  await enhedStore.fetchEnheder()
  console.log('Calendar tasks in HomeView:', calendarTasks.value)
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

// Handle calendar date clicks - send både dato og tasks
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

const closeDetailPanel = () => {
  selectedItem.value = null
}

const handleEdit = (item) => {
  // Handle edit
  console.log('Edit item:', item)
}

const handleDelete = async (item) => {
  if (item.id) {
    await egenkontrolStore.deleteEgenkontrol(item.id)
    selectedItem.value = null
  }
}

// Handle create egenkontrol button click
const createEgenkontrol = () => {
  router.push('/egenkontrol/opret')
}

function toggleSelectedTask(task = null) {
  selectedTaskId.value = task?.id || null
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
        @select-task="toggleSelectedTask"
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
