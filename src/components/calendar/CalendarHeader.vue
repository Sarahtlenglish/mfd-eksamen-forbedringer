<script setup>
import { ref } from 'vue'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-vue'

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

const emit = defineEmits(['select-month', 'select-year'])

const isDropdownOpen = ref(false)

const months = [
  'JANUAR', 'FEBRUAR', 'MARTS', 'APRIL', 'MAJ', 'JUNI',
  'JULI', 'AUGUST', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DECEMBER'
]

const monthsShort = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
]

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const selectMonth = (monthIndex) => {
  emit('select-month', monthIndex)
  isDropdownOpen.value = false
}

const changeYear = (direction) => {
  emit('select-year', props.currentYear + direction)
}
</script>

<template>
  <div class="calendar-header">
    <div class="month-selector" @click="toggleDropdown">
      <span class="current-date">
        <span class="month">{{ months[currentMonth] }}</span>
        <span class="year">{{ currentYear }}</span>
      </span>
      <IconChevronDown class="dropdown-icon" :class="{ 'rotated': isDropdownOpen }" />
    </div>
    <div v-if="isDropdownOpen" class="month-dropdown">
      <div class="year-selector">
        <div class="year">{{ currentYear }}</div>
        <div class="year-nav">
          <button @click.stop="changeYear(-1)" class="year-btn">
            <IconChevronUp class="year-icon" />
          </button>
          <button @click.stop="changeYear(1)" class="year-btn">
            <IconChevronDown class="year-icon" />
          </button>
        </div>
      </div>
      <div class="months-grid">
        <div
          v-for="(month, index) in monthsShort"
          :key="month"
          class="month-option"
          :class="{ 'selected': index === currentMonth }"
          @click="selectMonth(index)"
        >
          {{ month }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.calendar-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background-color: $neutral-200;
  border-bottom: 1px solid $neutral-200;
  position: relative;
}

.month-selector {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  &:hover .dropdown-icon {
    color: $neutral-900;
  }
}

.current-date {
  display: flex;
  align-items: baseline;
  gap: 8px;
  .month {
    font-size: 20px;
    font-weight: 600;
    color: $neutral-900;
  }
  .year {
    font-size: 20px;
    color: $neutral-900;
  }
}

.dropdown-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  color: $neutral-600;
  transition: all 0.2s ease;

  &.rotated {
    transform: rotate(180deg);
  }
}

.month-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 24px;
  background: white;
  border: 1px solid $neutral-200;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 280px;
  padding: 16px;
}

.year-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;

  .year {
    font-size: 16px;
    font-weight: 500;
    color: $neutral-900;
  }

  .year-nav {
    display: flex;
    flex-direction: row;
    gap: 4px;

    .year-btn {
      border: none;
      background: none;
      padding: 4px;
      cursor: pointer;
      color: $neutral-600;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: $neutral-100;
        color: $neutral-900;
      }
    }

    .year-icon {
      width: 16px;
      height: 16px;
      stroke-width: 2;
    }
  }
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.month-option {
  padding: 8px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  color: $neutral-800;
  transition: all 0.2s ease;

  &:hover {
    background-color: $neutral-100;
  }

  &.selected {
    background-color: $secondary-100;
    color: $secondary-500;
    font-weight: 500;
  }
}
</style>
