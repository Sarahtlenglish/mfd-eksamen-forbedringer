<script setup>
import { computed, ref, nextTick } from 'vue'
import { useEgenkontrolStore } from '@/stores/egenkontrolStore'
import { useBrugerStore } from '@/stores/brugerStore'
import { useEnhedStore } from '@/stores/enhedStore'
import { useTjeklisteStore } from '@/stores/tjeklisteStore'
import { getDaysOverdue } from '@/utils/dateHelpers'
import BannerComponent from '@/components/ui/BannerComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import TjeklisteModal from '@/components/ui/TjeklisteModalComponent.vue'
import StatusUpdateModal from '@/components/ui/StatusUpdateModalComponent.vue'
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

// Modal states
const showTjeklisteModal = ref(false)
const showStatusUpdateModal = ref(false)

const selectedTask = computed(() => {
  if (!props.item) return null
  const allTasks = egenkontrolStore.getCalendarTasksSync()
  const dateKey = props.item.dato
  if (!allTasks[dateKey]) return null
  return allTasks[dateKey].find(t => t.id === props.item.id) || null
})

const bannerType = computed(() => {
  if (!selectedTask.value) return null

  // Hvis opgaven har en korrektion der er markeret som korrigeret, vis som completed
  if (selectedTask.value.korrektion?.korrigeret) {
    return 'completed'
  }

  return getBannerType(selectedTask.value.status)
})

const sendReminder = () => alert('Påmindelse sendt til ansvarlige brugere')

const performInspection = async () => {
  try {
    if (!selectedTask.value?.tjeklisteFields || selectedTask.value.tjeklisteFields.length === 0) {
      await egenkontrolStore.fetchEgenkontroller()
      await nextTick()
    }

    const fields = selectedTask.value?.tjeklisteFields || []

    if (fields.length === 0) {
      alert('Ingen tjekliste felter fundet for denne egenkontrol')
      return
    }

    showTjeklisteModal.value = true
  } catch (error) {
    console.error('Fejl ved åbning af modal:', error)
  }
}

const handleTjeklisteComplete = async (completionData) => {
  try {
    if (!selectedTask.value) return

    await egenkontrolStore.updateFieldResults(
      selectedTask.value.id,
      selectedTask.value.dato,
      completionData.tjeklisteFields,
      completionData.completedBy
    )

    showTjeklisteModal.value = false
  } catch (error) {
    console.error('Fejl ved fuldførelse af egenkontrol:', error)
    alert('Der opstod en fejl ved fuldførelse af egenkontrollen')
  }
}

const handleModalClose = () => {
  showTjeklisteModal.value = false
}

const createDeviationTask = () => alert('Opgave for afvigelse oprettet')

// Nye funktioner til status opdatering
const openStatusUpdateModal = () => {
  showStatusUpdateModal.value = true
}

const handleStatusUpdate = async (updateData) => {
  try {
    if (!selectedTask.value) return

    // Find brugernavnet baseret på ID
    const selectedBruger = brugerStore.brugere.find(b => b.id === updateData.udbedretAf)
    const brugerNavn = selectedBruger?.fuldeNavn || selectedBruger?.navn || 'Ukendt bruger'

    await egenkontrolStore.updateEgenkontrolStatusWithCorrection(
      updateData.taskId,
      updateData.originalDate,
      {
        afvigelseUdbedret: updateData.afvigelseUdbedret,
        udbedringsBeskrivelse: updateData.udbedringsBeskrivelse,
        udbedretAf: brugerNavn, // Gem navnet, ikke ID'et
        udbedringsDato: updateData.udbedringsDato
      }
    )

    showStatusUpdateModal.value = false
  } catch (error) {
    console.error('Fejl ved opdatering af status:', error)
    alert('Der opstod en fejl ved opdatering af status')
  }
}

const handleStatusUpdateClose = () => {
  showStatusUpdateModal.value = false
}

const overdueDays = computed(() => {
  if (!selectedTask.value || selectedTask.value.status !== 'overskredet') return 0
  return getDaysOverdue(selectedTask.value.dato)
})

const getCompletedDate = () => {
  if (!selectedTask.value) return 'Ukendt dato'

  const completedDate = selectedTask.value.afsluttetDato || selectedTask.value.completedAt || selectedTask.value.updatedAt || new Date().toISOString()

  try {
    return new Date(completedDate).toLocaleDateString('da-DK')
  } catch {
    return new Date().toLocaleDateString('da-DK')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Ukendt dato'
  try {
    return new Date(dateString).toLocaleDateString('da-DK')
  } catch {
    return 'Ukendt dato'
  }
}

// Computed properties for modal data
const tjeklisteFields = computed(() => {
  return selectedTask.value?.tjeklisteFields || []
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

        <!-- Overskredet deadline banner -->
        <BannerComponent
          v-if="bannerType === 'overdue'"
          variant="warning"
          text="Denne egenkontrol har overskredet deadline."
          link="#"
          link-text="Send påmindelse til ansvarlige"
          :link-break="true"
          @click:link="sendReminder"
        />

        <!-- Standard afvigelse banner -->
        <BannerComponent
          v-if="bannerType === 'deviation' && !selectedTask.korrektion"
          variant="error"
          text="Denne egenkontrol har en afvigelse."
        >
          <template #actions>
            <div class="banner-actions">
              <button
                class="banner-link-action"
                @click="createDeviationTask"
              >
                Opret opgave til afvigelsen
              </button>
              <button
                class="banner-link-action"
                @click="openStatusUpdateModal"
              >
                Opdater egenkontrol status
              </button>
            </div>
          </template>
        </BannerComponent>

        <!-- Udbedret afvigelse banner -->
        <BannerComponent
          v-if="bannerType === 'completed' && selectedTask.korrektion?.korrigeret"
          variant="success"
          :text="`Egenkontrol udbedret d. ${formatDate(selectedTask.korrektion?.korrektionsDato)} af ${selectedTask.korrektion?.korrigeretAf || 'Ukendt'}`"
        >
          <template #actions>
            <div class="banner-actions correction-actions">
              <div class="correction-action">
                <strong>Afvigelse:</strong> Registreret d.
                {{ formatDate(selectedTask.oprindeligAfvigelse?.afsluttetDato) }}
                af {{ selectedTask.oprindeligAfvigelse?.afsluttetAf || 'Ukendt' }}
              </div>
              <div class="correction-action">
                <strong>Udbedret:</strong> {{ selectedTask.korrektion?.korrektionsBeskrivelse || 'Ingen beskrivelse' }}
              </div>
            </div>
          </template>
        </BannerComponent>

        <!-- Standard udført banner -->
        <BannerComponent
          v-if="bannerType === 'completed' && !selectedTask.korrektion?.korrigeret"
          variant="success"
          :text="`Egenkontrol udført d. ${getCompletedDate()} af ${selectedTask.afsluttetAf || 'Ukendt'}`"
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
            <span class="detail-label">{{ getTjeklisteName(selectedTask.checkliste, tjeklisteStore) }}</span>
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

    <!-- Tjekliste Modal -->
    <TjeklisteModal
      :isOpen="showTjeklisteModal"
      :task="selectedTask"
      :tjeklisteFields="tjeklisteFields"
      @complete="handleTjeklisteComplete"
      @close="handleModalClose"
    />

    <!-- Status Update Modal -->
    <StatusUpdateModal
      :isOpen="showStatusUpdateModal"
      :task="selectedTask"
      @update="handleStatusUpdate"
      @close="handleStatusUpdateClose"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.calendar-detail-content {
  padding: $spacing-small 0;
}

.banner-actions {
  display: flex;
  flex-direction: row;
  gap: $spacing-xlarge;
  margin-top: 0 !important;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-between !important;

  &.correction-actions {
    flex-direction: column;
    gap: 0;
    justify-content: flex-start !important;
  }
}

.banner-link-action {
  background: none;
  border: none;
  color: $neutral-700;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-size: $body-2-font-size;
  font-family: inherit;
  text-align: left;
  transition: $transition-base;
  flex: 0 0 auto;

  &:hover {
    color: $neutral-900;
    text-decoration: none;
  }
}

.correction-action {
  background: none;
  border: none;
  color: $neutral-700;
  cursor: default;
  padding: 0;
  font-size: $body-2-font-size;
  font-family: inherit;
  text-align: left;
  flex: 0 0 auto;

  strong {
    color: $neutral-800;
    font-weight: $body-1-font-weight-semibold;
  }
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
