<script setup>
import { ref } from 'vue'
import CalendarComponent from '../components/calendar/CalendarComponent.vue'
import ButtonComponent from '../components/ui/ButtonComponent.vue'
import DetailPanel from '../components/ui/DetailPanelComponent.vue'
import { IconPlus } from '@tabler/icons-vue'

// Calendar state management
const calendarTasks = ref({})
const selectedItem = ref(null)

// Handle calendar date clicks
const handleDateClick = (date) => {
  selectedItem.value = {
    date: date,
    name: 'Egenkontrol for ' + date.toLocaleDateString('da-DK')
    // Add other necessary data
  }
}

const closeDetailPanel = () => {
  selectedItem.value = null
}

const handleEdit = (item) => {
  // Handle edit
  console.log('Edit item:', item)
}

const handleDelete = (item) => {
  // Handle delete
  console.log('Delete item:', item)
}

// Handle create egenkontrol button click
const createEgenkontrol = () => {
  console.log('Create egenkontrol clicked')
  // Handle navigation or modal opening here
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
  min-height: 0;

  .calendar-section {
    min-width: 66%;
    max-width: 66%;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
}
</style>
