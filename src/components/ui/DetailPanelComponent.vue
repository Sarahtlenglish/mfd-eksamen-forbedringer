<script setup>
import { ref, computed } from 'vue'
import { IconChevronLeft, IconX, IconPencil, IconTrash } from '@tabler/icons-vue'

const props = defineProps({
  context: {
    type: String,
    required: true,
    validator: (value) => ['calendar', 'egenkontroller', 'enheder', 'tjeklister', 'brugere'].includes(value)
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
const historyMode = ref(false)
const previousItems = ref([])

// Default values
const defaultReminders = [
  '1 dag før, kl. 09.00',
  'dagligt kl. 09.00 efter overskredet deadline'
]

// Computed properties
const panelTitle = computed(() => {
  if (!props.item) return ''

  if (historyMode.value) {
    return `${props.item.name} - ${props.item.location || ''}`
  }

  return props.item.name || 'Detaljer'
})

function handleBackClick() {
  if (previousItems.value.length > 0) {
    // Go back to the previous item in the detail panel
    item.value = previousItems.value.pop()
  } else {
    // Nothing to go back to – close the detail panel
    close()
  }
}

const canEdit = computed(() => {
  // Determine if the current item can be edited based on context
  return ['egenkontroller', 'enheder', 'brugere'].includes(props.context)
})

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

      <!-- Other templates for different contexts will be added later -->
      <div v-else>
        <div class="detail-section">
          <p>Detail view for {{ context }} context will be implemented next.</p>
          <pre>{{ item }}</pre>
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
</style>
