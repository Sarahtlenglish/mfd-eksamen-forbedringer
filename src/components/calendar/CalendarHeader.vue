<script setup>
import { computed } from 'vue'
import { IconChevronDown } from '@tabler/icons-vue'

const props = defineProps({
  currentMonth: {
    type: Number,
    required: true
  },
  currentYear: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['navigate'])

const months = [
  'JANUAR', 'FEBRUAR', 'MARTS', 'APRIL', 'MAJ', 'JUNI',
  'JULI', 'AUGUST', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DECEMBER'
]

const displayMonth = computed(() => months[props.currentMonth])
</script>

<template>
  <div class="calendar-header">
    <div class="month-selector" @click="emit('navigate', 0)">
      <span class="month">{{ displayMonth }}</span>
      <span class="year">{{ currentYear }}</span>
      <IconChevronDown class="dropdown-icon" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.calendar-header {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: $neutral-200;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: $neutral-900;
  cursor: pointer;
}

.month {
  text-transform: uppercase;
  font-weight: 600;
}

.year {
  font-weight: 500;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
  color: $secondary-500;
  margin-left: 4px;
}
</style>
