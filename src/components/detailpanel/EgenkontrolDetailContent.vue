<script setup>
import { useBrugerStore } from '@/stores/brugerStore'
import { useEnhedStore } from '@/stores/enhedStore'
import { useTjeklisteStore } from '@/stores/tjeklisteStore'
import { getFrekvensLabel, getTidspunktLabel, getUserName, getEnhedName, getTjeklisteName, getTjeklisteFrekvens } from '@/utils/labelHelpers'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const brugerStore = useBrugerStore()
const enhedStore = useEnhedStore()
const tjeklisteStore = useTjeklisteStore()
</script>

<template>
  <div>
    <!-- Beskrivelse - altid vist (hvis der er en) -->
    <div v-if="props.item.beskrivelse" class="description">
      {{ props.item.beskrivelse }}
    </div>

    <!-- Udføres hver [frekvens] - altid vist -->
    <div class="detail-section">
      <div class="detail-row">
        <span class="detail-label">
          Udføres {{ getTjeklisteFrekvens(props.item.checkliste, tjeklisteStore) || '-' }}
        </span>
      </div>
      <div v-if="props.item.startDato" class="detail-row">
        <span>Fra d. {{ props.item.startDato }}</span>
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

    <!-- Ansvarlige -->
    <div v-if="props.item.ansvarligeBrugere?.length" class="detail-section">
      <div class="detail-row">
        <span class="detail-label">Ansvarlige brugere</span>
      </div>
      <div class="detail-row user-row">
        <span v-for="(bruger, idx) in props.item.ansvarligeBrugere" :key="idx">{{ getUserName(bruger, brugerStore) }}</span>
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
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.panel-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 16px;
}

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
