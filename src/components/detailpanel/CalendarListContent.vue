<script setup>
import { computed } from 'vue'
import CalendarDayTask from '@/components/calendar/CalendarDayTask.vue'
import { useEgenkontrolStore } from '@/stores/egenkontrolStore'
import { processCalendarTasks } from '@/utils/labelHelpers'
import { formatDateToISO } from '@/utils/dateHelpers'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['select-task'])

const egenkontrolStore = useEgenkontrolStore()

const tasksForSelectedDate = computed(() => {
  if (!props.item?.date) return []
  const allTasks = egenkontrolStore.getCalendarTasksSync()
  const dateKey = formatDateToISO(props.item.date)
  return processCalendarTasks(allTasks[dateKey] || [])
})
</script>

<template>
  <div class="calendar-list-content">
    <div class="panel-body">
      <div v-if="tasksForSelectedDate.length > 0">
        <div
          v-for="task in tasksForSelectedDate"
          :key="task.id"
          class="task-item"
          @click="emit('select-task', task)"
        >
          <CalendarDayTask
            :title="task.title"
            :details="task.enhedId"
            :status="task.status"
          />
        </div>
      </div>
      <div v-else class="no-tasks">
        <p>Ingen egenkontroller planlagt denne dag</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.calendar-list-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.panel-body {
  flex: 1;
  padding-top: 16px;
}
.task-item {
  margin-bottom: 12px;
  cursor: pointer;
}
.no-tasks {
  text-align: center;
  color: #888;
  padding: 32px 0;
}
</style>
