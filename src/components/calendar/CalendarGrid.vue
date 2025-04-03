<script setup>
import { computed } from 'vue'
import CalendarDay from './CalendarDay.vue'

const props = defineProps({
  currentDate: {
    type: Date,
    required: true
  },
  selectedDate: {
    type: Date,
    required: true
  }
})

const emit = defineEmits(['select-date'])

const getDaysInMonth = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  return firstDay === 0 ? 6 : firstDay - 1 // Adjust for Monday start
}

const calendarDays = computed(() => {
  const days = []
  const daysInMonth = getDaysInMonth(props.currentDate)
  const firstDayOfMonth = getFirstDayOfMonth(props.currentDate)
  const year = props.currentDate.getFullYear()
  const month = props.currentDate.getMonth()

  // Previous month days
  const prevMonth = new Date(year, month - 1)
  const daysInPrevMonth = getDaysInMonth(prevMonth)
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false
    })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    })
  }

  // Next month days
  const remainingDays = 42 - days.length // Always show 6 weeks
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    })
  }

  return days
})
</script>

<template>
  <div class="calendar-grid">
    <CalendarDay
      v-for="day in calendarDays"
      :key="day.date.toISOString()"
      :date="day.date"
      :is-current-month="day.isCurrentMonth"
      :is-selected="selectedDate.toDateString() === day.date.toDateString()"
      @click="emit('select-date', day.date)"
    >
      <template #counter>
        <slot name="counter" :date="day.date"></slot>
      </template>
      <slot name="day" :date="day.date"></slot>
    </CalendarDay>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
  background: white;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  box-sizing: border-box;
  border-left: 1px solid $neutral-300;
  border-right: 1px solid $neutral-300;
  border-bottom: 1px solid $neutral-300;

  @media (max-width: $mobile) {
    gap: 0.5px;
    padding: 0.5px;
  }
}
</style>
