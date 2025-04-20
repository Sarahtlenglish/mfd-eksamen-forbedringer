<script setup>
import { ref, computed } from 'vue'
import { IconChevronLeft, IconX, IconPencil, IconTrash, IconUpload, IconPrinter, IconFileText } from '@tabler/icons-vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'

const props = defineProps({
  context: {
    type: String,
    required: true,
    validator: value => ['calendar', 'egenkontroller', 'enheder', 'tjeklister', 'brugere'].includes(value)
  },
  item: {
    type: Object,
    default: null
  },
  historyItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'edit', 'delete', 'back'])

// State
const isHistoryMode = ref(false)
const previousItems = ref([])

// Default values
const defaultReminders = [
  '1 dag før, kl. 09.00',
  'dagligt kl. 09.00 efter overskredet deadline'
]

// Computed properties
const panelTitle = computed(() => {
  if (!props.item) return ''

  if (isHistoryMode.value && props.context === 'enheder') {
    return `${props.item.name} - ${props.item.location}`
  }

  return props.item.name
})

const toggleHistoryMode = () => {
  isHistoryMode.value = !isHistoryMode.value
  console.log('History mode toggled to:', isHistoryMode.value)
}

function handleBackClick() {
  // First check if we're in history mode
  if (isHistoryMode.value) {
    // If in history mode, go back to normal view
    isHistoryMode.value = false
    return
  }

  // If not in history mode, use the previous behavior
  if (previousItems.value.length > 0) {
    // Go back to the previous item in the detail panel
    emit('back', previousItems.value.pop())
  } else {
    // Nothing to go back to – close the detail panel
    close()
  }
}

const canEdit = computed(() => {
  // Determine if the current item can be edited based on context
  return ['egenkontroller', 'enheder', 'brugere'].includes(props.context)
})

const getEventIconClass = (eventType) => {
  const iconClasses = {
    inspection: 'inspection-icon',
    document: 'document-icon',
    maintenance: 'maintenance-icon',
    comment: 'comment-icon',
    task: 'task-icon'
  }

  return iconClasses[eventType] || 'default-icon'
}

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('da-DK')
}

const close = () => {
  emit('close')
}

const handleEdit = () => {
  emit('edit', props.item)
}

const handleDelete = () => {
  emit('delete', props.item)
}
</script>

<template>
  <div class="detail-panel" v-if="item">
    <div class="detail-panel-header">
      <div class="back-button-container">
      <span @click="handleBackClick" class="back-button">
        <IconChevronLeft/>
      </span>
      </div>
      <div class="detail-title-container">
      <h2 class="detail-title">{{ panelTitle }}</h2>
      </div>
      <div class="detail-actions">
        <span v-if="canEdit" @click="handleEdit" class="edit-button">
          <IconPencil/>
        </span>
        <span @click="close" class="close-button">
          <IconX/>
        </span>
      </div>
    </div>

    <!-- Dynamic content based on context, item type and mode -->
    <div class="detail-content">
      <!-- Egenkontrol Detail -->
      <div v-if="context === 'egenkontroller'">
        <!-- For Opgave/Task type egenkontrol -->
        <div v-if="item.type === 'Opgave'">
          <div class="simple-content">
            <div class="detail-row">
              <span class="detail-label">Udføres:</span>
              <span>{{ item.frequency || 'Ugentlig' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Ansvarlige brugere:</span>
              <span>{{ item.responsibleUsers?.join(', ') || 'Christian Hansen' }}</span>
            </div>

            <div class="detail-section">
              <div v-for="(reminder, index) in item.reminders || defaultReminders" :key="index" class="detail-row">
                <span class="detail-label">Påmindelse:</span>
                <span>{{ reminder.description || reminder }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- For standard Egenkontrol type -->
        <div v-else>
          <div v-if="item.description" class="description">
            {{ item.description }}
          </div>

          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">Udføres ugentlig</span>
            </div>
            <div v-if="item.startDate" class="detail-row">
              <span>Starter d.</span>
              <span>{{ formatDate(item.startDate) }}</span>
            </div>
          </div>

          <div class="detail-section">
            <div class="detail-row">
            <span v-if="item.standard" class="detail-label">{{ item.standard }} - {{ item.standardTitle }}</span>
            </div>
            <div class="detail-row">
              <span>Flugtvejsskilte (Gruppe)</span>
            </div>
          </div>

          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">Ansvarlige brugere:</span>
            </div>
            <div class="detail-row user-row">
              <span>{{ item.responsibleUsers?.join(', ') || 'Christian Hansen' }}</span>
            </div>
            <div class="detail-row" v-if="item.bodyText">
              <span>{{ item.bodyText }}</span>
            </div>
          </div>

          <div class="detail-section">
            <div v-for="(reminder, index) in item.reminders || defaultReminders" :key="index" class="detail-row">
              <span class="detail-label">Påmindelse - </span>
              <span>{{ reminder.description || reminder }}</span>
            </div>
            <div class="detail-row notification-row">
              <span class="detail-label">Børge Jakobsen modtager kvittering</span>
            </div>
            <div class="detail-row notification-row">
              <span class="detail-label">Christian Hansen modtager besked om afvigelser</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Enheder -->
      <div v-else-if="context === 'enheder' && !isHistoryMode">
        <div class="detail-section">
          <div class="location body-1-semibold">{{ item.location }}</div>

          <p v-if="item.description" class="description">
            {{ item.description }}
          </p>

          <div class="action-buttons">
            <ButtonComponent
              size="small"
              variant="secondary"
              @click="toggleHistoryMode"
            >
            Se historik
            </ButtonComponent>
          </div>
        </div>

        <div class="detail-section" v-if="item.qrCode">
          <div class="detail-section-header">
          <h4>QR KODE</h4>
          <span class="detail-section-header-and-button">
              <IconPrinter class="icon-small"/>
            Tilføj til printkø
          </span>
          </div>
          <div class="qr-code-container">
            <img src='@/assets/qrcode.png?url' alt="QR Code" class="qr-code" />
          </div>
        </div>

        <div class="detail-section" v-if="item.files && item.files.length > 0">
          <div class="detail-section-header">
          <h4>FILER</h4>
          <span class="detail-section-header-and-button">
              <IconUpload class="icon-small"/>
            Upload fil
          </span>
          </div>
          <div class="files-list">
            <div v-for="(file, index) in item.files" :key="index" class="file-item">
              <span class="file-icon">
                <IconFileText/>
              </span>
              <span class="file-name">{{ file.name }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- næste -->
       <!-- History Mode for Enheder -->
      <div v-else-if="context === 'enheder' && isHistoryMode">
        <div class="detail-section">
          <h3 class="history-title">HISTORIK</h3>
          <div class="history-timeline">
            <div v-for="(event, index) in historyItems" :key="index" class="timeline-item">
              <div class="timeline-icon" :class="getEventIconClass(event.type)">
                <span v-if="event.type === 'document'">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.33333 1.33331H4.00001C3.64638 1.33331 3.30724 1.47379 3.05719 1.72384C2.80715 1.97389 2.66667 2.31302 2.66667 2.66665V13.3333C2.66667 13.6869 2.80715 14.0261 3.05719 14.2761C3.30724 14.5262 3.64638 14.6666 4.00001 14.6666H12C12.3536 14.6666 12.6928 14.5262 12.9428 14.2761C13.1929 14.0261 13.3333 13.6869 13.3333 13.3333V5.33331L9.33333 1.33331Z" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9.33333 1.33331V5.33331H13.3333" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span v-else-if="event.type === 'maintenance'">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.6667 10.6667C12.6667 11.0203 12.5262 11.3594 12.2762 11.6095C12.0261 11.8595 11.687 12 11.3334 12H5.33335L2.66669 14.6667V6.00001C2.66669 5.64638 2.80716 5.30724 3.05721 5.05719C3.30726 4.80715 3.64639 4.66667 4.00002 4.66667H11.3334C11.687 4.66667 12.0261 4.80715 12.2762 5.05719C12.5262 5.30724 12.6667 5.64638 12.6667 6.00001V10.6667Z" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5.33331 1.33333L2.66665 3.99999V6" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span v-else-if="event.type === 'inspection'">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.66669 2H2.66669C1.93031 2 1.33335 2.59695 1.33335 3.33333V13.3333C1.33335 14.0697 1.93031 14.6667 2.66669 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V9.33333" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12.6667 1.33333C13.0348 1.33333 13.3334 1.63181 13.3334 2V6C13.3334 6.36819 13.0348 6.66667 12.6667 6.66667H8.66669C8.29849 6.66667 8.00002 6.36819 8.00002 6V2C8.00002 1.63181 8.29849 1.33333 8.66669 1.33333H12.6667Z" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
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

        <div class="timeline-actions">
          <button class="secondary-button comment-button">
            <span class="comment-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 7.66669C14.0023 8.5466 13.7967 9.41461 13.4 10.2C12.9296 11.1411 12.2065 11.9328 11.3116 12.4862C10.4168 13.0396 9.3855 13.3329 8.33333 13.3334C7.45342 13.3356 6.58541 13.1301 5.8 12.7334L2 14L3.26667 10.2C2.86995 9.41461 2.66437 8.5466 2.66667 7.66669C2.66707 6.61452 2.96041 5.58325 3.51381 4.68839C4.06722 3.79352 4.85888 3.0704 5.8 2.60002C6.58541 2.20331 7.45342 1.99772 8.33333 2.00002H8.66667C10.0562 2.07668 11.3687 2.66319 12.3528 3.64726C13.3368 4.63132 13.9233 5.94379 14 7.33335V7.66669Z" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            Skriv kommentar
          </button>
        </div>
      </div>

      <div class="detail-bottom">
        <div class="detail-actions-bottom">
          <span class="delete-button" @click="handleDelete">
            <span>
              <IconTrash class="trash-icon"/>
            </span>
            <span>
            Slet
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;
@use '@/assets/icons' as *;

.detail-panel {
  background-color: $neutral-200;
  border-radius: 8px;
  border: 1px solid $neutral-300;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: $detail-panel-padding;
  height: 823px;
  width: 33%;

  .detail-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: $neutral-200;

    .back-button {
      background: none;
      border: none;
      color: $secondary-500;
      font-size: $icon-medium;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .detail-title {
      flex: 1;
      margin: 0;
      line-height: $subtitle-1-line-height;
      font-size: $subtitle-1-font-size;
      color: $secondary-900;
      font-weight: $subtitle-1-font-weight;
    }

    .detail-actions {
      display: flex;
      align-items: center;
      gap: 16px;

      .edit-button, .close-button {
        background: none;
        border: none;
        font-size: $icon-medium;
        color: $secondary-500;
        cursor: pointer;
      }
    }
  }
  .detail-label {
        font-size: $body-1-font-size;
        line-height: $body-1-line-height;
        font-weight: $body-1-font-weight-semibold;
        color: $neutral-900;
        margin-bottom: 4px;
      }

  .detail-content {
    padding-top: 32px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    height: 100%;
    font-size: $body-1-font-size;
    color: $neutral-800;

    .description {
      margin-bottom: 20px;
      line-height: 1.5;
    }

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

      .location {
        margin-bottom: 24px;
      }
    }

    .detail-row {
      margin-bottom: 8px;

      &.user-row {
        margin-top: -4px;
      }
    }

    .standard-ref {
      font-weight: 500;
      margin-bottom: 8px;
    }

    .detail-bottom {
      margin-top: auto;

      .detail-actions-bottom {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;

        .delete-button {
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: $error-base;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: $body-2-font-size;
          font-weight: $body-2-font-weight-semibold;
          cursor: pointer;
        }

        .trash-icon {
          font-size: $icon-small;
        }
      }
    }
  }
}

.qr-code-container {
  background-color: transparent;
  padding: 16px;
  display: flex;
  justify-content: center;
  border: 1px solid $secondary-300;
  margin-bottom: 16px;
  border-radius: 4px;

  .qr-code {
    max-width: 250px;
    height: auto;
  }
}

.files-list {
  margin-bottom: 16px;

  .file-item {
    display: flex;
    align-items: center;
    padding: 12px 0;

    .file-icon {
      color: #6B7280;
      margin-right: $spacing-small;
      display: flex;
    }

    .file-name {
      font-size: $body-2-font-size;
      font-weight: $body-2-font-weight-semibold;
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
      top: 24px;
      left: 8px;
      bottom: -12px;
      width: 1px;
      background-color: #E5E7EB;
    }

    .timeline-icon {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: #F3F4F6;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;
      color: #6B7280;

      &.inspection-icon {
        background-color: #EFF6FF;
        color: #3B82F6;
      }

      &.document-icon {
        background-color: #F5F3FF;
        color: #8B5CF6;
      }

      &.maintenance-icon {
        background-color: #FEF3C7;
        color: #D97706;
      }

      &.comment-icon {
        background-color: #ECFDF5;
        color: #10B981;
      }
    }

    .timeline-content {
      flex: 1;

      .event-title {
        font-weight: 500;
        color: #374151;
        margin-bottom: 4px;
      }

      .event-date {
        font-size: 0.875rem;
        color: #6B7280;
        margin-bottom: 4px;
      }

      .event-user {
        font-size: 0.875rem;
        color: #4B5563;
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
  }
}

</style>
