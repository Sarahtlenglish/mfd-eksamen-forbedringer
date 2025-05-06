<script setup>
import { ref, onMounted, computed } from 'vue'
import CalendarComponent from '../components/calendar/CalendarComponent.vue'
import ButtonComponent from '../components/ui/ButtonComponent.vue'
import DetailPanel from '../components/ui/panels/DetailPanelComponent.vue'
import { IconPlus } from '@tabler/icons-vue'
import { useRouter } from 'vue-router'
import { useEgenkontrolStore } from '../stores/egenkontrolStore'
import { useEnhedStore } from '@/stores/enhedStore'
import { processEnheder } from '@/utils/labelHelpers'

// Get store
const egenkontrolStore = useEgenkontrolStore()

// Calendar state management
const calendarTasks = ref({})
const selectedItem = ref(null)
const router = useRouter()
const enhedStore = useEnhedStore()

// Process checklist data to include labels
const processedEnheder = computed(() => processEnheder(enhedStore.enheder))

// Prepare calendar tasks based on store data
onMounted(async () => {
  // Fetch egenkontroller and get calendar tasks
  await egenkontrolStore.fetchEgenkontroller()
  calendarTasks.value = await egenkontrolStore.getCalendarTasks()
  console.log('Calendar tasks in HomeView:', calendarTasks.value)
})

// Helper to format date as YYYY-MM-DD (Danish compatible, but always ISO)
function formatDateToISO(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Handle calendar date clicks
const handleDateClick = (date) => {
  const dateKey = formatDateToISO(date)
  // Find alle tasks for dagen
  const tasks = (calendarTasks.value[dateKey] || []).map((task) => {
    // Find enhed i processedEnheder med samme id/location
    const enhed = processedEnheder.value.find(
      e => e.id === task.details || e.id === task.lokation || e.id === task.location
        || e.location === task.details || e.location === task.lokation || e.location === task.location
    )
    return {
      ...task,
      details: enhed ? enhed.location : (task.details || task.lokation || task.location)
    }
  })
  selectedItem.value = {
    date,
    tasks
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
    // Update calendar tasks after deletion
    calendarTasks.value = await egenkontrolStore.getCalendarTasks()
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
