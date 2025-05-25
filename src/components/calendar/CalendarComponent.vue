<script setup>
import { ref, computed, onMounted } from 'vue'
import CalendarHeader from './CalendarHeader.vue'
import WeekDaysHeader from './WeekDaysHeader.vue'
import CalendarGrid from './CalendarGrid.vue'
import CalendarDayTask from './CalendarDayTask.vue'
import { formatDateToISO } from '@/utils/dateHelpers'

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

onMounted(() => {
  currentDate.value = new Date(props.initialDate)
  selectedDate.value = new Date(props.initialDate)
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

const getTasksForDate = (date) => {
  const dateKey = formatDateToISO(date)
  return props.customTasks[dateKey] || []
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
              :historik="task.historik"
              :dato="task.dato"
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
  height: 100%;
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
