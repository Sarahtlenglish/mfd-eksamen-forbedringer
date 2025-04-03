<script setup>
import { computed } from 'vue'
import { IconAlertCircle, IconInfoCircle, IconCircleCheck, IconAlertTriangle, IconCircleDashed } from '@tabler/icons-vue'

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
    validator: value => ['normal', 'success', 'warning', 'error', 'past'].includes(value)
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
    case 'success':
      return IconCircleCheck
    case 'past':
      return IconCircleDashed
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
    <div class="task-icon-container" v-if="getStatusIcon">
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
  padding: 2px 5px;
  box-sizing: border-box;
  min-width: 0;
  cursor: pointer;
  font-size: 11px;
  line-height: 1.3;
  margin-bottom: 2px;

  // Status variants
  &.status-normal {
    background-color: $secondary-100;
    color: $neutral-800;
  }

  &.status-success {
    background-color: $success-100;
    color: $neutral-800;
  }

  &.status-warning {
    position: relative;
    background-color: $warning-100;
    color: $neutral-800;
    &::before {
      content: "⚠";
      font-size: 10px;
      position: absolute;
      right: 5px;
      top: 2px;
      color: darken($warning-base, 10%);
    }
  }

  &.status-error {
    background-color: $error-100;
    color: $error-base;
  }

  &.status-past {
    background-color: $neutral-200;
    color: $neutral-600;
  }
}

.task-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-2xs;
  margin-right: $spacing-xs;
}

.task-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: $body-3-font-weight;
  max-width: calc(100% - 15px);
}

.task-details {
  font-size: $body-3-font-size;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: $body-2-font-weight-regular;
}

.task-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;

  &.status-icon-normal {
    color: $secondary-500;
  }

  &.status-icon-warning {
    color: $warning-base;
  }

  &.status-icon-error {
    color: $error-base;
  }

  &.status-icon-success {
    color: $success-base;
  }

  &.status-icon-past {
    color: $neutral-600;
  }
}
</style>
