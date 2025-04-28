<script setup>
import { computed } from 'vue'
import { enhederStandardData } from '@/mock/data/enheder'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const enhedData = computed(() => {
  const tjeklisteNavn = props.item.checkliste || props.item.selectedEnheder || ''
  return Object.values(enhederStandardData.enhederGrupper).find(
    g => g.displayText === tjeklisteNavn || g.displayText === props.item.location
  ) || null
})

// Hjælper til at tjekke om en værdi er gyldig - ikke tom og ikke "Ikke valgt"
function isValid(value) {
  return value && value !== '' && value !== 'Ikke valgt' && !value.includes('Ikke valgt')
}
</script>

<template>
  <div>
    <!-- Beskrivelse - altid vist (hvis der er en) -->
    <div v-if="props.item.description" class="description">
      {{ props.item.description }}
    </div>

    <!-- Udføres hver [frekvens] - altid vist -->
    <div class="detail-section">
      <div class="detail-row">
        <span class="detail-label">
          Udføres hver {{ enhedData?.value?.frekvens || props.item.frequency }}
        </span>
      </div>
      <div v-if="props.item.startDate" class="detail-row">
        <span>Fra d. {{ props.item.startDate }}</span>
      </div>
    </div>

    <!-- Standard og enhed/gruppe -->
    <div v-if="enhedData?.value?.standard || isValid(props.item.standard)" class="detail-section">
      <div class="detail-row">
        <span class="detail-label">
          {{ enhedData?.value
             ? `${enhedData.value.standard} - ${enhedData.value.standardTitle}`
             : `${props.item.standard} - ${props.item.standardTitle}` }}
        </span>
      </div>
    </div>

    <!-- Tjekliste og lokation/enhed i samme gruppe -->
    <div v-if="isValid(props.item.checkliste) || (enhedData?.value?.displayText || isValid(props.item.location))" class="detail-section">
      <div v-if="isValid(props.item.checkliste)" class="detail-row">
        <strong>{{ props.item.checkliste }}</strong>
      </div>
      <div v-if="enhedData?.value?.displayText || isValid(props.item.location)" class="detail-row">
        <span>{{ enhedData?.value?.displayText || props.item.location }}</span>
      </div>
    </div>

    <!-- Ansvarlige -->
    <div v-if="props.item.responsibleUsers?.length && isValid(props.item.responsibleUsers[0])" class="detail-section">
      <div class="detail-row">
        <span class="detail-label">Ansvarlige</span>
      </div>
      <div class="detail-row user-row">
        <span v-for="(user, idx) in props.item.responsibleUsers" :key="idx">{{ user }}</span>
      </div>
    </div>

    <!-- Påmindelser -->
    <div v-if="props.item.reminders?.length" class="detail-section">
      <div v-for="(reminder, idx) in props.item.reminders" :key="idx" class="detail-row">
        <span v-if="isValid(reminder.description || reminder)" class="detail-label">
          Påmindelse - {{ reminder.description || reminder }}
        </span>
      </div>
    </div>

    <!-- Notifikationsmodtagere -->
    <div v-if="props.item.modtagere?.length" class="detail-section">
      <div v-for="(modtager, idx) in props.item.modtagere" :key="idx" class="detail-row">
        <span v-if="isValid(modtager)" class="detail-label">{{ modtager }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.detail-label {
  font-size: $body-1-font-size;
  line-height: $body-1-line-height;
  font-weight: $body-1-font-weight-semibold;
  color: $neutral-900;
  margin-bottom: 4px;
}

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
</style>
