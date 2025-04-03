<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import CalendarComponent from '../components/calendar/CalendarComponent.vue'
import ButtonComponent from '../components/ui/ButtonComponent.vue'
import { IconPlus } from '@tabler/icons-vue'

const route = useRoute()

const pageTitle = computed(() => {
  const routeNames = {
    '/home': 'Kalender',
    '/egenkontrol': 'Egenkontrol',
    '/tjeklister': 'Tjeklister',
    '/enheder': 'Enheder',
    '/brugere': 'Brugere'
  }
  return routeNames[route.path] || 'Dashboard'
})

// Calendar state management
const calendarTasks = ref({})

// Handle calendar date clicks
const handleDateClick = (date) => {
  console.log('Date clicked:', date)
  // Here you would typically open a dialog to add a task
  // or fetch tasks for the selected date from your database
}

// Handle create egenkontrol button click
const createEgenkontrol = () => {
  console.log('Create egenkontrol clicked')
  // Handle navigation or modal opening here
}
</script>

<template>
  <div class="calendar-view">
    <div class="calendar-header">
      <h1 class="heading-1">{{ pageTitle }}</h1>
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
    <div class="calendar-container">
      <CalendarComponent
        @date-click="handleDateClick"
        :customTasks="calendarTasks"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.calendar-view {
  padding: $spacing-medium;
  max-width: 1200px;
  margin: 0 auto;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-large;
}

.heading-1 {
  color: $neutral-900;
  margin: 0;
}

.calendar-container {
  margin-top: $spacing-medium;
}
</style>
