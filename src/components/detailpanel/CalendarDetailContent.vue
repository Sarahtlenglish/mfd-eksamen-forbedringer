<script setup>
import { ref, computed, watch } from 'vue'
import { useEgenkontrolStore } from '@/stores/egenkontrolStore'
import CalendarDayTask from '@/components/calendar/CalendarDayTask.vue'
import BannerComponent from '@/components/ui/BannerComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import { IconInfoCircle, IconAlertTriangle, IconChevronLeft, IconPencil, IconCheck } from '@tabler/icons-vue'
import { calendarTaskData, exampleDateTasks } from '@/mock/index'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

// State for visning
const selectedTask = ref(null)

// Nulstil selectedTask når item (dagen) ændres
watch(() => props.item, () => {
  selectedTask.value = null
}, { deep: true })

// Hent store og tasks for valgt dato
const egenkontrolStore = useEgenkontrolStore()
const tasksForSelectedDate = computed(() => {
  if (!props.item || !props.item.date) return []
  const dateKey = props.item.date.toISOString().split('T')[0]
  const tasks = egenkontrolStore.getCalendarTasks()[dateKey] || []
  return tasks.map(task => task.originalTask).filter(Boolean)
})

// Check om det er den 2. eller 3. marts
const isExampleDate = computed(() => {
  if (!props.item.date) return false
  const date = props.item.date
  return (date.getDate() === 2 || date.getDate() === 3) && date.getMonth() === 2
})

// Maps status values to the format expected by CalendarDayTask
const mapStatus = (status) => {
  switch (status) {
    case 'afvigelse': return 'warning'
    case 'error': return 'error'
    case 'warning': return 'warning'
    default: return 'normal'
  }
}

// Håndter klik på task
const handleTaskClick = (task) => {
  selectedTask.value = task
}

// Gå tilbage til task-listen
const goBackToList = () => {
  selectedTask.value = null
}

// Simuler at klikke på en task med korrekt mockdata baseret på typen
const handleMockTaskClick = (title) => {
  selectedTask.value = calendarTaskData[title] || null
}

// Beregn hvilket banner der skal vises baseret på task status - skal matche farven i kalenderen
const bannerType = computed(() => {
  if (!selectedTask.value) return null

  // Hvis opgaven er markeret som udført, vis grønt banner
  if (selectedTask.value.completed) {
    return 'completed'
  }

  // Brug den originale status direkte (ikke den mappede) for at sikre konsistens
  const originalStatus = selectedTask.value.status

  // Vælg banner baseret på original status
  if (originalStatus === 'afvigelse' || originalStatus === 'error') {
    return 'deviation' // Rød banner for afvigelser og fejl
  } else if (originalStatus === 'warning') {
    return 'overdue' // Gult banner for advarsler/overskredet deadline
  } else if (originalStatus === 'normal' && selectedTask.value.startDate) {
    const taskDate = new Date(selectedTask.value.startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (taskDate < today) {
      return 'completed' // Grønt banner for udførte opgaver
    }
  }

  // Hvis ingen af ovenstående - ingen banner
  return null
})

// Send påmindelse til ansvarlige (dummy funktion)
const sendReminder = () => {
  alert('Påmindelse sendt til ansvarlige brugere')
}

// Udfør egenkontrol (dummy funktion)
const performInspection = () => {
  alert('Egenkontrol markeret som udført')
}

// Opret opgave for afvigelse (dummy funktion)
const createDeviationTask = () => {
  alert('Opgave for afvigelse oprettet')
}

// Formatér ansvarlige brugere som string
const responsibleUsersString = computed(() => {
  if (!selectedTask.value || !selectedTask.value.responsibleUsers) return ''
  return selectedTask.value.responsibleUsers.join(', ')
})
</script>

<template>
  <div class="calendar-detail-content">
    <!-- Liste over tasks -->
    <div v-if="!selectedTask" class="task-list">
      <!-- Hvis vi har tasks fra store, vis dem -->
      <div v-if="tasksForSelectedDate.length > 0">
        <div
          v-for="task in tasksForSelectedDate"
          :key="task.id"
          class="task-item"
          @click="handleTaskClick(task)"
        >
          <CalendarDayTask
            :title="task.name"
            :details="task.location"
            :status="mapStatus(task.status)"
          />
        </div>
      </div>

      <!-- Hvis vi er på 2. eller 3. marts, vis mockup data -->
      <div v-else-if="isExampleDate">
        <div
          v-for="task in exampleDateTasks"
          :key="task.title"
          class="inspection-item"
          :class="{ 'warning': task.status === 'warning' }"
          @click="handleMockTaskClick(task.title)"
        >
          <h3 class="inspection-title">{{ task.title }}</h3>
          <div class="inspection-location">{{ task.location }}</div>
          <div class="status-icon" :class="task.status">
            <IconInfoCircle v-if="task.status === 'normal'" />
            <IconAlertTriangle v-else />
          </div>
        </div>
      </div>

      <!-- Hvis ingen tasks, vis en tom state -->
      <div v-else class="no-tasks">
        <p>Ingen egenkontroller planlagt denne dag</p>
      </div>
    </div>

    <!-- Detaljeret visning af valgt task -->
    <div v-else class="task-detail-view">
      <div class="task-header">
        <button class="back-button" @click="goBackToList">
          <IconChevronLeft />
        </button>
        <h2 class="task-title">{{ selectedTask.name }}</h2>
        <button class="edit-button">
          <IconPencil />
        </button>
      </div>

      <div class="task-content">
        <!-- Beskrivelse og indhold - nu kommer beskrivelsen INDEN bannere -->
        <p v-if="selectedTask.description" class="task-description">
          {{ selectedTask.description }}
        </p>

        <!-- Bannere baseret på status - nu vises de EFTER beskrivelsen -->
        <!-- Advarselsbanner ved overskredet deadline (gul) -->
        <BannerComponent
          v-if="bannerType === 'overdue'"
          variant="warning"
          text="Denne egenkontrol har overskredet deadline."
          link="#"
          link-text="Send påmindelse til ansvarlige"
          :link-break="true"
          @click:link="sendReminder"
        />

        <!-- Afvigelsesbanner for opgaver med afvigelser (rød) -->
        <BannerComponent
          v-if="bannerType === 'deviation'"
          variant="error"
          text="Denne egenkontrol har en afvigelse."
          link="#"
          link-text="Opret opgave til afvigelsen"
          :link-break="true"
          @click:link="createDeviationTask"
        />

        <!-- Udført banner for gennemførte kontroller (grøn) -->
        <BannerComponent
          v-if="bannerType === 'completed'"
          variant="success"
          text="Egenkontrol udført d. 6 Marts af Børge Jakobsen"
        />

        <!-- Deadline information - kun for overskredet deadline -->
        <div class="detail-section" v-if="bannerType === 'overdue'">
          <div class="deadline-info">
            <div class="detail-row">
              <span class="detail-label">Deadline - overskredet 3 dage</span>
            </div>
          </div>
        </div>

        <!-- Standard og specifikation -->
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

        <!-- Detaljer for brugere -->
        <div class="detail-section user-section">
          <div class="location-info" v-if="selectedTask.location">
            <div class="detail-row">
              <span class="detail-label">{{ selectedTask.type === 'Branddør' ? 'Branddøre (Kvartalsvis)' : selectedTask.type }}</span>
            </div>
            <div class="detail-row">
              <span>{{ selectedTask.location }}</span>
            </div>
          </div>

          <div class="detail-row">
            <span class="detail-label">Ansvarlige brugere:</span>
          </div>
          <div class="detail-row">
            <span>{{ responsibleUsersString }}</span>
          </div>
        </div>

        <!-- Påmindelser -->
        <div class="detail-section">
          <div class="detail-row">
            <span class="detail-label">Påmindelse - 1 dag før, kl. 09.00</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Påmidelse - dagligt kl. 09.00 efter overskredet deadline</span>
          </div>
        </div>

        <!-- Notifikationsinfomation -->
        <div v-if="selectedTask.deadlineNotifications" class="detail-section">
          <div v-for="(notification, index) in selectedTask.deadlineNotifications" :key="index" class="detail-row notification-row">
            <span class="detail-label">{{ notification.recipient }} {{ notification.description }}</span>
          </div>
        </div>

        <!-- FORHÅNDSVISNING for brandtrappe-inspektion -->
        <div v-if="selectedTask.name && selectedTask.name.includes('Brandtrappe')" class="detail-section">
          <div class="detail-row">
            <span class="detail-label">FORHÅNDSVISNING</span>
          </div>
          <div class="checklist-preview">
            <div class="checklist-item">
              <span class="checklist-label">Brandtrappen er fri af genstande og farefri indgang?</span>
              <div class="checkbox-placeholder"></div>
            </div>
            <div class="checklist-item">
              <span class="checklist-label">Flugtvejsskilte er intakte og fungerende?</span>
              <div class="checkbox-placeholder"></div>
            </div>
            <div class="checklist-item">
              <span class="checklist-label">Selve brandtrappens konstruktion er stabil?</span>
              <div class="checkbox-placeholder"></div>
            </div>
          </div>
        </div>

        <!-- "Udfør egenkontrol" knap - kun vis hvis ikke allerede udført -->
        <div class="action-button-container" v-if="bannerType !== 'completed'">
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

.task-header {
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
  .task-title {
    flex: 1;
    font-size: 18px;
    font-weight: $subtitle-1-font-weight;
    margin: 0;
    color: $neutral-900;
  }
}

.task-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-large;
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
