<script setup>
import { ref, computed } from 'vue'
import CalendarHeader from './CalendarHeader.vue'
import WeekDaysHeader from './WeekDaysHeader.vue'
import CalendarGrid from './CalendarGrid.vue'
import CalendarDayTask from './CalendarDayTask.vue'

defineProps({
  customTasks: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['date-click'])

const currentDate = ref(new Date())
const selectedDate = ref(new Date())

const currentMonth = computed(() => currentDate.value.getMonth())
const currentYear = computed(() => currentDate.value.getFullYear())

const navigateMonth = (direction) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + direction)
  currentDate.value = newDate
}

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
</script>

<template>
  <div class="calendar-container">
    <div class="calendar">
      <CalendarHeader
        :current-month="currentMonth"
        :current-year="currentYear"
        @navigate="navigateMonth"
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
            v-if="customTasks[date.toISOString().split('T')[0]] && customTasks[date.toISOString().split('T')[0]].length > 2"
            class="task-counter"
          >
            +{{ customTasks[date.toISOString().split('T')[0]].length - 2 }}
          </div>
        </template>
        <template #day="{ date }">
          <div class="day-tasks">
            <template v-if="customTasks[date.toISOString().split('T')[0]]">
              <CalendarDayTask
                v-for="task in customTasks[date.toISOString().split('T')[0]].slice(0, 2)"
                :key="task.id"
                :title="task.title"
                :details="task.details"
                :status="task.status"
              />
            </template>
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
}

.calendar-title {
  font-size: 48px;
  font-weight: 700;
  color: $neutral-900;
  margin-bottom: 24px;
}

.calendar {
  background: white;
  border-radius: $border-radius-md;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin: 0 auto;
  border: 1px solid $neutral-300;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  @media (max-width: $tablet) {
    border-radius: $border-radius-lg;
    box-shadow: $shadow-sm;
  }

  @media (max-width: $mobile) {
    border-radius: $border-radius-md;
    border-width: 0.5px;
  }
}

.day-tasks {
  display: flex;
  flex-direction: column;
  gap: $spacing-2xs;
  width: 100%;
  overflow: hidden;
}

.task-counter {
  font-size: 10px;
  color: $neutral-600;
  padding: 0;
  text-align: right;
  font-weight: 600;
}
</style>
