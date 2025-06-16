<script setup>
import { computed } from 'vue'
import { IconAlertCircle, IconAlertTriangle } from '@tabler/icons-vue'
import { useEnhedStore } from '@/stores/enhedStore'
import { getLocationLabel } from '@/utils/labelHelpers'

const enhedStore = useEnhedStore()

const getEnhedLocation = (id) => {
  const enhed = enhedStore.getEnhedById(id)
  return enhed ? getLocationLabel(enhed.location) : id
}

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
    default: 'inaktiv',
    validator: value => ['aktiv', 'inaktiv', 'udført', 'afvigelse', 'overskredet'].includes(value)
  },
  historik: {
    type: Array,
    default: () => []
  },
  dato: {
    type: String,
    default: ''
  }
})

const hasDetails = computed(() => !!props.details)

const getStatusIcon = computed(() => {
  const status = props.historik?.find(entry => entry.dato === props.dato)?.status || props.status
  switch (status) {
    case 'aktiv':
      return null
    case 'udført':
      return null
    case 'afvigelse':
      return IconAlertTriangle
    case 'overskredet':
      return IconAlertCircle
    case 'inaktiv':
    default:
      return null
  }
})

const getStatusIconClass = computed(() => {
  const status = props.historik?.find(entry => entry.dato === props.dato)?.status || props.status
  return `status-icon status-icon-${status}`
})
</script>

<template>
  <div
    class="calendar-day-task"
    :class="[
      `status-${props.historik?.find(entry => entry.dato === props.dato)?.status || props.status}`,
      { 'has-details': hasDetails }
    ]"
  >
    <div class="task-content">
      <div class="task-title">{{ title }}</div>
      <div class="task-details" v-if="hasDetails">{{ getEnhedLocation(details) }}</div>
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
  max-width: 100%;
  cursor: pointer;
  line-height: 1.2;
  justify-content: space-between;
  align-items: center;
  color: $neutral-800;
  transition: $transition-base;

  &.status-aktiv {
    background-color: $secondary-100;
    border: 1px solid $secondary-200;

    &:hover {
      background-color: $secondary-200;
    }

    &:active {
      background-color: $secondary-300;
    }
  }

  &.status-inaktiv {
    background-color: $secondary-100;
    border: 1px solid $secondary-300;

    &:hover {
      background-color: $secondary-200;
    }

    &:active {
      background-color: $neutral-300;
    }
  }

  &.status-udført {
    background-color: $secondary-100;
    border: 1px solid $secondary-200;
    opacity: $opacity-64;

    &:hover {
      background-color: $secondary-200;
    }

    &:active {
      background-color: $secondary-300;
    }
  }

  &.status-afvigelse {
    background-color: $error-100;

    &:hover {
      background-color: $error-200;
    }

    &:active {
      background-color: $error-300;
    }
  }

  &.status-overskredet {
    background-color: $warning-100;

    &:hover {
      background-color: $warning-200;
    }

    &:active {
      background-color: $warning-300;
    }
  }
}

.task-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-right: 4px;
  max-width: calc(100% - 2px);
  overflow: hidden;
}

.task-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: $body-2-font-weight-regular;
  font-size: $body-2-font-size;
  width: 100%;
}

.task-details {
  font-size: $body-3-font-size;
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
}

.task-icon {
  width: 20px;
  height: 20px;

  &.status-icon-aktiv {
    color: $secondary-500;
  }

  &.status-icon-inaktiv {
    color: $secondary-100;
  }

  &.status-icon-udført {
    color: $success-base;
  }

  &.status-icon-afvigelse {
    color: $error-base;
  }

  &.status-icon-overskredet {
    color: $warning-base;
  }
}

@media (max-width: $tablet) {
  .calendar-day-task {
    padding: 2px 4px;
    font-size: 0.95rem;
  }
  .task-title {
    font-size: $body-3-font-size;
  }
  .task-details {
    font-size: 0.75rem;
  }
  .task-icon {
    width: 16px;
    height: 16px;
  }
}
</style>
