<script setup>
import { ref, onMounted } from 'vue'
import CalendarComponent from '../components/calendar/CalendarComponent.vue'
import ButtonComponent from '../components/ui/ButtonComponent.vue'
import DetailPanel from '../components/ui/panels/DetailPanelComponent.vue'
import { IconPlus } from '@tabler/icons-vue'
import { useRouter } from 'vue-router'
import { useEgenkontrolStore } from '../stores/egenkontrolStore'
import { defaultCalendarDate } from '@/mock/index'

// Get store
const egenkontrolStore = useEgenkontrolStore()

// Calendar state management
const calendarTasks = ref({})
const selectedItem = ref(null)
const router = useRouter()

// Brug defaultCalendarDate fra mock data
const defaultDate = defaultCalendarDate

// Prepare calendar tasks based on store data
onMounted(() => {
  // Get tasks from store and format them for the calendar component
  calendarTasks.value = egenkontrolStore.getCalendarTasks()
})

// Handle calendar date clicks
const handleDateClick = (date) => {
  // Format the date as ISO string to match the calendar task keys
  const dateKey = date.toISOString().split('T')[0]
  // Check if there are tasks for this date
  const tasksForDate = calendarTasks.value[dateKey] || []
  if (tasksForDate.length > 0) {
    // If there are tasks for this date, show the first one
    // Get the original task data for the detail panel
    const originalTask = tasksForDate[0].originalTask
    // Show full task data in the detail panel
    selectedItem.value = {
      ...originalTask,
      date: date
    }
  } else {
    // If no tasks, just show the date
    selectedItem.value = {
      date: date,
      name: 'Egenkontrol for ' + date.toLocaleDateString('da-DK'),
      type: 'Egenkontrol'
    }
  }
}

const closeDetailPanel = () => {
  selectedItem.value = null
}

const handleEdit = (item) => {
  // Handle edit
  console.log('Edit item:', item)
}

const handleDelete = (item) => {
  // Handle delete
  console.log('Delete item:', item)
  if (item.id) {
    egenkontrolStore.deleteEgenkontrol(item.id)
    selectedItem.value = null
    // Update calendar tasks after deletion
    calendarTasks.value = egenkontrolStore.getCalendarTasks()
  }
}

// Handle create egenkontrol button click
const createEgenkontrol = () => {
  router.push('/egenkontrol/opret')
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
          :initialDate="defaultDate"
        />
      </div>
      <DetailPanel
        v-if="selectedItem"
        context="calendar"
        :item="selectedItem"
        :showDeleteButton="false"
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
