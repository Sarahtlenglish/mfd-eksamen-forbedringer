<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useEgenkontrolStore } from '@/stores/egenkontrolStore'
import { useBrugerStore } from '@/stores/brugerStore'
import { useEnhedStore } from '@/stores/enhedStore'
import { useTjeklisteStore } from '@/stores/tjeklisteStore'
import { getDaysOverdue } from '@/utils/dateHelpers'
import BannerComponent from '@/components/ui/BannerComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import { IconCheck } from '@tabler/icons-vue'
import { getBannerType, getUserName, getEnhedName, getTjeklisteName, getFrekvensLabel, getTidspunktLabel } from '@/utils/labelHelpers'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

// State
const selectedTask = ref(null)
const calendarTasksCache = ref({})

// Stores
const egenkontrolStore = useEgenkontrolStore()
const brugerStore = useBrugerStore()
const enhedStore = useEnhedStore()
const tjeklisteStore = useTjeklisteStore()

// Load calendar tasks on mount
onMounted(async () => {
  calendarTasksCache.value = await egenkontrolStore.getCalendarTasks()
})

// Reset selectedTask when date changes
watch(() => props.item, () => {
  selectedTask.value = null
}, { deep: true })

// Update cache only when store data changes
watch(() => egenkontrolStore.egenkontrollerData, async (newEgenkontroller) => {
  if (newEgenkontroller && newEgenkontroller.length > 0) {
    try {
      const storeTasks = await egenkontrolStore.getCalendarTasks()
      calendarTasksCache.value = storeTasks
    } catch (error) {
      console.error('Error updating calendar tasks:', error)
    }
  }
}, { deep: true })

// Banner type based on task status
const bannerType = computed(() => {
  if (!props.item) return null
  return getBannerType(props.item.status)
})

// Action handlers
const sendReminder = () => alert('Påmindelse sendt til ansvarlige brugere')
const performInspection = async () => {
  try {
    // Opdater status til 'udført' i storen
    await egenkontrolStore.updateEgenkontrolStatus(props.item.id, 'udført')
    // Opdater den lokale cache
    const storeTasks = await egenkontrolStore.getCalendarTasks()
    calendarTasksCache.value = storeTasks
  } catch (error) {
    console.error('Fejl ved opdatering af egenkontrol status:', error)
    alert('Der opstod en fejl ved opdatering af egenkontrol status')
  }
}
const createDeviationTask = () => alert('Opgave for afvigelse oprettet')

watch(selectedTask, () => {})

const overdueDays = computed(() => {
  if (!props.item || !props.item.startDato) return 0
  return getDaysOverdue(props.item.startDato)
})
</script>

<template>
  <div class="calendar-detail-content">
    <!-- Task detail view -->
    <div class="task-detail-view">
      <div class="task-content">
        <div class="detail-section">
        <!-- Description -->
        <p v-if="props.item.description || props.item.beskrivelse" class="task-description">
          {{ props.item.description || props.item.beskrivelse }}
        </p>
        <!-- Deadline info -->
        <div class="detail-section" v-if="bannerType === 'overdue'">
          <div class="deadline-info">
            <div class="detail-row">
              <span class="detail-label">
                Deadline - overskredet {{ overdueDays }} dag{{ overdueDays === 1 ? '' : 'e' }}
              </span>
            </div>
          </div>
        </div>
        <!-- Status banners -->
        <BannerComponent
          v-if="bannerType === 'overdue'"
          variant="warning"
          text="Denne egenkontrol har overskredet deadline."
          link="#"
          link-text="Send påmindelse til ansvarlige"
          :link-break="true"
          @click:link="sendReminder"
        />
        <BannerComponent
          v-if="bannerType === 'deviation'"
          variant="error"
          text="Denne egenkontrol har en afvigelse."
          link="#"
          link-text="Opret opgave til afvigelsen"
          :link-break="true"
          @click:link="createDeviationTask"
        />
        <BannerComponent
          v-if="bannerType === 'completed'"
          variant="success"
          text="Egenkontrol udført d. 6 Marts af Børge Jakobsen"
        />
        <!-- Action button -->
        <div class="action-button-container" v-if="bannerType === 'active' || bannerType === 'overdue'">
          <ButtonComponent
            variant="secondary"
            @click="performInspection"
            :full-width="false"
          >
            <template #icon>
              <IconCheck />
            </template>
            Udfør egenkontrol
          </ButtonComponent>
        </div>
      </div>
        <!-- Rest of details sections -->
        <!-- Standard og specifikation -->
        <div v-if="props.item.standard" class="detail-section">
          <div class="detail-row">
            <span class="detail-label">{{ props.item.standard }} - {{ props.item.standardTitle }}</span>
          </div>
          <div class="detail-row">
            <span>{{ props.item.name }}</span>
          </div>
          <div class="detail-row">
            <span>{{ props.item.location }}</span>
          </div>
        </div>
        <!-- Tjekliste og enhed -->
        <div v-if="props.item.checkliste || props.item.lokation" class="detail-section">
          <div v-if="props.item.checkliste" class="detail-row">
            <strong>{{ getTjeklisteName(props.item.checkliste, tjeklisteStore) }}</strong>
          </div>
          <div v-if="props.item.lokation" class="detail-row">
            <span>{{ getEnhedName(props.item.lokation, enhedStore) }}</span>
          </div>
        </div>
        <!-- Users -->
        <div v-if="props.item.ansvarligeBrugere?.length" class="detail-section">
          <div class="detail-row">
            <span class="detail-label">Ansvarlige brugere:</span>
          </div>
          <div class="detail-row user-row">
            <span v-for="(bruger, idx) in props.item.ansvarligeBrugere" :key="idx">
              {{ getUserName(bruger, brugerStore) }}
            </span>
          </div>
        </div>
        <!-- Påmindelser -->
        <div v-if="props.item.påmindelser?.length" class="detail-section">
          <div v-for="(påmindelse, idx) in props.item.påmindelser" :key="idx" class="detail-row">
            <span class="detail-label">
              Påmindelse -
              {{ getFrekvensLabel(påmindelse.frekvens) }}
              kl. {{ getTidspunktLabel(påmindelse.tidspunkt) }}
              <template v-if="idx === 1">efter overskredet deadline</template>
            </span>
          </div>
        </div>
        <!-- Notifikationsmodtagere -->
        <div v-if="props.item.modtagere?.length" class="detail-section">
          <div v-for="(modtager, idx) in props.item.modtagere" :key="idx" class="detail-row">
            <span class="detail-label">
              {{ getUserName(modtager, brugerStore) }}
              <template v-if="idx === 0">modtager kvittering</template>
              <template v-else-if="idx === 1">modtager besked om afvigelser</template>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.calendar-detail-content {
  padding: $spacing-small 0;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-medium;
}

.task-item {
  margin-bottom: $spacing-small;
  cursor: pointer;
}

.inspection-item {
  position: relative;
  padding: $spacing-small;
  border-radius: $border-radius-sm;
  background-color: $secondary-100;
  margin-bottom: $spacing-medium;
  padding-right: 36px;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    background-color: $secondary-200;
  }

  &.warning {
    background-color: $warning-100;
    &:hover {
      background-color: $warning-200;
    }
  }
}

.inspection-title {
  font-size: $body-1-font-size;
  font-weight: $body-1-font-weight-semibold;
  margin: 0 0 4px 0;
  color: $neutral-900;
}

.inspection-location {
  font-size: $body-2-font-size;
  color: $neutral-700;
}

.status-icon {
  position: absolute;
  right: $spacing-small;
  top: 50%;
  transform: translateY(-50%);

  &.normal svg {
    color: $secondary-500;
  }

  &.warning svg {
    color: $warning-base;
  }

  svg {
    width: 20px;
    height: 20px;
  }
}

.no-tasks {
  text-align: center;
  padding: $spacing-large 0;
  color: $neutral-600;
}

/* Styling for task-detaljer */
.task-detail-view {
  display: flex;
  flex-direction: column;
  gap: $spacing-medium;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: $spacing-small;
  margin-bottom: $spacing-medium;
  .back-button, .edit-button {
    background: none;
    border: none;
    color: $secondary-500;
    cursor: pointer;
    font-size: 20px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.task-content {
  display: flex;
  flex-direction: column;
}

.task-description {
  font-size: $body-1-font-size;
  color: $neutral-800;
  line-height: 1.5;
  margin: 0;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-small;
  margin-bottom: $spacing-medium;
}

.detail-row {
  display: flex;
  flex-direction: column;
  .detail-label {
    font-weight: $body-1-font-weight-semibold;
    color: $neutral-900;
  }
}

.notification-row {
  color: $neutral-700;
}

.deadline-info {
  margin-bottom: $spacing-small;
}

.action-button-container {
  display: flex;
  justify-content: flex-start;
  margin-top: $spacing-medium;
}

.user-section {
  margin-top: $spacing-medium;
}

.checklist-preview {
  margin-top: $spacing-small;
  border: 1px solid $neutral-300;
  border-radius: $border-radius-sm;
  padding: $spacing-small;
  background-color: white;
}

.checklist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-small 0;
  border-bottom: 1px solid $neutral-200;

  &:last-child {
    border-bottom: none;
  }
}

.checklist-label {
  font-size: $body-2-font-size;
  color: $neutral-800;
}

.checkbox-placeholder {
  width: 20px;
  height: 20px;
  border: 1px solid $neutral-400;
  border-radius: 4px;
}
</style>
