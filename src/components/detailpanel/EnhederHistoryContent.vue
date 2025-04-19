<script setup>
import { IconMessage, IconClipboardList, IconFileText, IconTool, IconClipboardCheck } from '@tabler/icons-vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  historyItems: {
    type: Array,
    default: () => []
  }
})

// Helper function to get the appropriate icon class for history events
const getEventIconClass = (eventType) => {
  const iconClasses = {
    nextInspection: 'IconClipboardList',
    dokumenter: 'IconFileText',
    opgave: 'IconTool',
    kommentar: 'IconMessage',
    udført: 'IconClipboardCheck'
  }

  return iconClasses[eventType] || 'default-icon'
}
</script>

<template>
    <div class="detail-section">
      <div class="detail-section-header">
        <h3 class="subtitle-2">HISTORIK</h3>
        <span class="detail-section-header-and-button">
          <IconMessage class="icon-small"/>
          Skriv kommentar
        </span>
      </div>
      <div class="history-timeline">
        <div v-for="(event, index) in historyItems" :key="index" class="timeline-item">
          <div class="timeline-icon" :class="getEventIconClass(event.type)">
            <span v-if="event.type === 'dokumenter'">
              <IconFileText class="icon-small"/>
            </span>
            <span v-else-if="event.type === 'opgave'">
              <IconTool class="icon-small"/>
            </span>
            <span v-else-if="event.type === 'NextInspection'">
              <IconClipboardList class="icon-small"/>
            </span>
            <span v-else-if="event.type === 'kommentar'">
              <IconMessage class="icon-small"/>
            </span>
            <span v-else-if="event.type === 'udført'">
              <IconClipboardCheck class="icon-small"/>
            </span>
          </div>
          <div class="timeline-content">
            <div class="event-title">{{ event.title }}</div>
            <div class="event-date">{{ event.date }}</div>
            <div class="event-user">{{ event.user }}</div>
          </div>
        </div>
      </div>
    </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.detail-section {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;

  .detail-section-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .detail-section-header-and-button {
      padding: 8px 16px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: $body-2-font-size;
      font-weight: $body-2-font-weight-semibold;
      line-height: 24px;
    }
  }
}

.history-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4B5563;
  margin: 0 0 16px 0;
}

.history-timeline {
  .timeline-item {
    display: flex;
    margin-bottom: 24px;
    position: relative;

    &:not(:last-child):before {
      content: '';
      position: absolute;
      top: 40px;
      left: 20px;
      bottom: -12px;
      width: 0.5px;
      background-color: $neutral-400;
    }

    .timeline-icon {
      width: 40px;
      height: 40px;
      padding: 10px;
      border-radius: 50%;
      border: 1px solid $neutral-400;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;
      color: $secondary-700;
    }

    .timeline-content {
      flex: 1;

      .event-title {
        font-weight: $body-1-font-weight-semibold;
        font-size: $body-1-font-size;
        color: $neutral-800;
        margin-bottom: 4px;
      }

      .event-date {
        font-size: $body-2-font-size;
        font-weight: $body-2-font-weight-regular;
        color: $neutral-800;
      }

      .event-user {
        font-size: $body-2-font-size;
        color: $neutral-800;
        font-weight: $body-2-font-weight-regular;
      }
    }
  }
}

.timeline-actions {
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  justify-content: center;
  margin-top: 16px;

  .comment-button {
    background-color: #F3F4F6;
    border: 1px solid #E5E7EB;
    border-radius: 4px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4B5563;
    cursor: pointer;

    .comment-icon {
      color: #6B7280;
    }

    &:hover {
      background-color: #E5E7EB;
    }
  }
}
</style>
