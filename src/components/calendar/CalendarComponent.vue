<script setup>
import { ref, computed, onMounted } from 'vue'
import CalendarHeader from './CalendarHeader.vue'
import WeekDaysHeader from './WeekDaysHeader.vue'
import CalendarGrid from './CalendarGrid.vue'
import CalendarDayTask from './CalendarDayTask.vue'
import { useEgenkontrolStore } from '@/stores/egenkontrolStore'

const props = defineProps({
  customTasks: {
    type: Object,
    default: () => ({})
  },
  initialDate: {
    type: Date,
    default: () => new Date()
  }
})

const emit = defineEmits(['date-click'])

const currentDate = ref(new Date())
const selectedDate = ref(new Date())

const egenkontrolStore = useEgenkontrolStore()
const calendarTasks = ref({})

// Sæt initialDate når komponenten monteres og hent kalender tasks
onMounted(async () => {
  currentDate.value = new Date(props.initialDate)
  selectedDate.value = new Date(props.initialDate)
  calendarTasks.value = await egenkontrolStore.getCalendarTasks()
})

const currentMonth = computed(() => currentDate.value.getMonth())
const currentYear = computed(() => currentDate.value.getFullYear())

const selectMonth = (monthIndex) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(monthIndex)
  currentDate.value = newDate
}

const selectYear = (year) => {
  const newDate = new Date(currentDate.value)
  newDate.setFullYear(year)
  currentDate.value = newDate
}

const selectDate = (date) => {
  selectedDate.value = date
  emit('date-click', date)
}

// Hjælpefunktion til at formatere dato til ISO string
const formatDateToISO = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Brug det formatterede kalender-objekt til at få tasks for en specifik dato
const getTasksForDate = (date) => {
  const dateKey = formatDateToISO(date)
  return calendarTasks.value[dateKey] || []
}
</script>

<template>
  <div class="calendar-container">
    <div class="calendar">
      <CalendarHeader
        :current-month="currentMonth"
        :current-year="currentYear"
        @select-month="selectMonth"
        @select-year="selectYear"
      />
      <WeekDaysHeader />
      <CalendarGrid
        :current-date="currentDate"
        :selected-date="selectedDate"
        @select-date="selectDate"
      >
        <template #counter="{ date }">
          <div
            v-if="getTasksForDate(date).length > 2"
            class="task-counter"
          >
            +{{ getTasksForDate(date).length - 2 }}
          </div>
        </template>
        <template #day="{ date }">
          <div class="day-tasks">
            <CalendarDayTask
              v-for="task in getTasksForDate(date).slice(0, 2)"
              :key="task.id"
              :title="task.title || task.name"
              :status="task.status"
            />
          </div>
        </template>
      </CalendarGrid>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.calendar-container {
  width: 100%;
  background-color: $neutral-200;
  border-radius: 8px;
  border: 1px solid $neutral-300;
  display: flex;
  flex-direction: column;
}

.calendar {
  background: $neutral-200;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
}

.day-tasks {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  width: 100%;
  min-height: 0;
}

.task-counter {
  font-size: 12px;
  color: $secondary-500;
  padding: 0;
  text-align: right;
  font-weight: $body-2-font-weight-semibold;
}
</style>
