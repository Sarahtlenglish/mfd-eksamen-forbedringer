<script setup>
import { computed } from 'vue'
import { IconAlertCircle, IconInfoCircle, IconAlertTriangle } from '@tabler/icons-vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
    default: 'Egenkontrol'
  },
  details: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'normal',
    validator: value => ['normal', 'warning', 'error'].includes(value)
  }
})

const hasDetails = computed(() => !!props.details)

const getStatusIcon = computed(() => {
  switch (props.status) {
    case 'normal':
      return IconInfoCircle
    case 'warning':
      return IconAlertTriangle
    case 'error':
      return IconAlertCircle
    default:
      return null
  }
})

const getStatusIconClass = computed(() => {
  return `status-icon status-icon-${props.status}`
})
</script>

<template>
  <div
    class="calendar-day-task"
    :class="[
      `status-${status}`,
      { 'has-details': hasDetails }
    ]"
  >
    <div class="task-content">
      <div class="task-title">{{ title }}</div>
      <div class="task-details" v-if="hasDetails">{{ details }}</div>
    </div>
    <div class="task-icon-container">
      <component :is="getStatusIcon" class="task-icon" :class="getStatusIconClass" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;
@use '@/assets/icons' as *;

.calendar-day-task {
  display: flex;
  width: 100%;
  border-radius: $border-radius-sm;
  padding: 4px 8px;
  box-sizing: border-box;
  min-width: 0;
  cursor: pointer;
  font-size: $body-3-font-size;
  line-height: 1.3;
  justify-content: space-between;
  align-items: center;
  color: $neutral-800;

  // Status variants
  &.status-normal {
    background-color: $secondary-100;
  }

  &.status-warning {
    background-color: $warning-100;
  }

  &.status-error {
    background-color: $error-100;
  }
}

.task-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-right: 8px;
  width: calc(100% - 24px);
}

.task-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: $body-2-font-weight-regular;
  font-size: 14px;
  width: 100%;
}

.task-details {
  font-size: 12px;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: $body-2-font-weight-regular;
  width: 100%;
}

.task-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 16px;
}

.task-icon {
  width: 16px;
  height: 16px;

  &.status-icon-normal {
    color: $secondary-500;
  }

  &.status-icon-warning {
    color: $warning-base;
  }

  &.status-icon-error {
    color: $error-base;
  }
}
</style>
