<script setup>
import { computed } from 'vue'

const props = defineProps({
  date: {
    type: Date,
    required: true
  },
  isCurrentMonth: {
    type: Boolean,
    default: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const isToday = computed(() => {
  const today = new Date()
  return today.toDateString() === props.date.toDateString()
})

const dayClasses = computed(() => {
  return {
    'current-month': props.isCurrentMonth,
    'other-month': !props.isCurrentMonth,
    'selected': props.isSelected,
    'today': isToday.value
  }
})

const dayNumber = computed(() => props.date.getDate())
</script>

<template>
  <div
    class="calendar-day"
    :class="dayClasses"
    @click="emit('click')"
  >
    <div class="day-header">
      <div class="day-number">{{ dayNumber }}</div>
      <slot name="counter"></slot>
    </div>
    <div class="day-content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.calendar-day {
  aspect-ratio: 10 / 8;
  background-color: $neutral-200;
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: $transition-base;
  border: 1px solid $neutral-250;

  &.other-month {
    background-color: $neutral-250;

    .day-number {
      color: $neutral-500;
    }
  }

  &.selected {
    border: 1px solid $secondary-500;

    .day-number {
      color: $neutral-900;
      font-weight: $body-2-font-weight-semibold;
    }
  }

  &.today {
    .day-number {
      color: $neutral-100;
      font-weight: $body-2-font-weight-semibold;
      background-color: $secondary-500;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-small;
  height: $spacing-large;
  min-height: $spacing-large;
  position: relative;
  z-index: 1;
}

.day-number {
  font-size: $body-2-font-size;
  font-weight: $body-2-font-weight-regular;
  color: $neutral-800;
  text-align: left;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
}

.day-content {
  position: absolute;
  top: $spacing-large;
  left: $spacing-small;
  right: $spacing-small;
  bottom: $spacing-small;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  overflow: hidden;
}

@media (max-width: $desktop) {
  .calendar-day {
    aspect-ratio: 5.5 / 6;
    font-size: 0.95rem;
    padding: 0;
  }
  .day-header {
    padding: $spacing-xs;
    height: 28px;
    min-height: 28px;
  }
  .day-number {
    font-size: $body-3-font-size;
    min-width: 18px;
    height: 18px;
  }

  .calendar-container {
    height: fit-content !important;
  }
}

@media (max-width: $mobile) {
  .calendar-day {
    aspect-ratio: 3.5 / 6;
  }
}
</style>
