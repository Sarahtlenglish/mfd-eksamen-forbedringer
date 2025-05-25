<script setup>
import { computed } from 'vue'
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

const egenkontrolStore = useEgenkontrolStore()
const brugerStore = useBrugerStore()
const enhedStore = useEnhedStore()
const tjeklisteStore = useTjeklisteStore()

const selectedTask = computed(() => {
  if (!props.item) return null
  const allTasks = egenkontrolStore.getCalendarTasksSync()
  const dateKey = props.item.dato
  if (!allTasks[dateKey]) return null
  return allTasks[dateKey].find(t => t.id === props.item.id)
})

const bannerType = computed(() => {
  if (!selectedTask.value) return null
  return getBannerType(selectedTask.value.status)
})

const sendReminder = () => alert('Påmindelse sendt til ansvarlige brugere')
const performInspection = async () => {
  try {
    if (!selectedTask.value) return
    await egenkontrolStore.updateEgenkontrolStatus(selectedTask.value.id, 'udført', selectedTask.value.dato)
  } catch (error) {
    console.error('Fejl ved opdatering af egenkontrol status:', error)
    alert('Der opstod en fejl ved opdatering af egenkontrol status')
  }
}
const createDeviationTask = () => alert('Opgave for afvigelse oprettet')

const overdueDays = computed(() => {
  if (!selectedTask.value || selectedTask.value.status !== 'overskredet') return 0
  return getDaysOverdue(selectedTask.value.dato)
})
</script>

<template>
  <div class="calendar-detail-content">
    <div class="task-detail-view" v-if="selectedTask">
      <div class="task-content">
        <div class="detail-section">
        <p v-if="selectedTask.description || selectedTask.beskrivelse" class="task-description">
          {{ selectedTask.description || selectedTask.beskrivelse }}
        </p>
        <div class="detail-section" v-if="bannerType === 'overdue'">
          <div class="deadline-info">
            <div class="detail-row">
              <span class="detail-label">
                Deadline - overskredet {{ overdueDays }} dag{{ overdueDays === 1 ? '' : 'e' }}
              </span>
            </div>
          </div>
        </div>
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
          :text="`Egenkontrol udført d. ${new Date(selectedTask.dato).toLocaleDateString('da-DK')} af ${selectedTask.afsluttetAf || 'Ukendt'}`"
        />
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
        <div v-if="selectedTask.standard" class="detail-section">
          <div class="detail-row">
            <span class="detail-label">{{ selectedTask.standard }} - {{ selectedTask.standardTitle }}</span>
          </div>
          <div class="detail-row">
            <span>{{ selectedTask.name }}</span>
          </div>
          <div class="detail-row">
            <span>{{ selectedTask.location }}</span>
          </div>
        </div>
        <div v-if="selectedTask.checkliste || selectedTask.lokation" class="detail-section">
          <div v-if="selectedTask.checkliste" class="detail-row">
            <strong>{{ getTjeklisteName(selectedTask.checkliste, tjeklisteStore) }}</strong>
          </div>
          <div v-if="selectedTask.lokation" class="detail-row">
            <span>{{ getEnhedName(selectedTask.lokation, enhedStore) }}</span>
          </div>
        </div>
        <div v-if="selectedTask.ansvarligeBrugere?.length" class="detail-section">
          <div class="detail-row">
            <span class="detail-label">Ansvarlige brugere:</span>
          </div>
          <div class="detail-row user-row">
            <span v-for="(bruger, idx) in selectedTask.ansvarligeBrugere" :key="idx">
              {{ getUserName(bruger, brugerStore) }}
            </span>
          </div>
        </div>
        <div v-if="selectedTask.påmindelser?.length" class="detail-section">
          <div v-for="(påmindelse, idx) in selectedTask.påmindelser" :key="idx" class="detail-row">
            <span class="detail-label">
              Påmindelse -
              {{ getFrekvensLabel(påmindelse.frekvens) }}
              kl. {{ getTidspunktLabel(påmindelse.tidspunkt) }}
              <template v-if="idx === 1">efter overskredet deadline</template>
            </span>
          </div>
        </div>
        <div v-if="selectedTask.modtagere?.length" class="detail-section">
          <div v-for="(modtager, idx) in selectedTask.modtagere" :key="idx" class="detail-row">
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
