<script setup>
import { ref, computed, onMounted } from 'vue'
import CalendarHeader from './CalendarHeader.vue'
import WeekDaysHeader from './WeekDaysHeader.vue'
import CalendarGrid from './CalendarGrid.vue'
import CalendarDayTask from './CalendarDayTask.vue'

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

// Sæt initialDate når komponenten monteres
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
            v-if="customTasks[date.toISOString().split('T')[0]]?.length"
            class="task-counter"
          >
            +{{ customTasks[date.toISOString().split('T')[0]].length }}
          </div>
        </template>
        <template #day="{ date }">
          <div class="day-tasks">
            <template v-if="customTasks[date.toISOString().split('T')[0]]">
              <CalendarDayTask
                v-for="task in customTasks[date.toISOString().split('T')[0]].slice(0, 2)"
                :key="task.id"
                :title="task.title"
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
