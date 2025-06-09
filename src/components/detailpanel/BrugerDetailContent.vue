<script setup>
import { computed } from 'vue'
import { useBrugerStore } from '@/stores/brugerStore'

const brugerStore = useBrugerStore()

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  showHistoryButton: {
    type: Boolean,
    default: true
  }
})

const addressDisplay = computed(() => {
  if (props.item.postnummer && props.item.by) {
    return `${props.item.postnummer} ${props.item.by}`
  }
  // If only one is available
  if (props.item.postnummer) {
    return props.item.postnummer
  }
  if (props.item.by) {
    return props.item.by
  }
  return 'Ikke angivet'
})

const isBrugerChef = computed(() => {
  // Bruger er chef hvis "Denne bruger er chef" er valgt explicit
  if (props.item.id === 'preview') {
    return props.item.brugereRef === 'bruger_er_chef'
  } else {
    return !props.item.brugereRef
  }
})

const lederNavn = computed(() => {
  if (!props.item.brugereRef) return null

  // First try the already processed lederNavn
  if (props.item.lederNavn) {
    return props.item.lederNavn
  }

  // Fallback to looking up the name from brugerNavne
  return brugerStore.brugerNavne[props.item.brugereRef] || props.item.brugereRef
})

</script>

<template>
  <div class="bruger-detail-content">
    <div class="detail-section">
      <div class="section-title">Arbejdsfunktioner</div>

      <div class="detail-row">
        <div class="label">Rolle</div>
        <div class="separator">-</div>
        <div class="role-value">{{ item.rolle }}</div>
      </div>

      <div v-if="isBrugerChef" class="detail-row">
        <div class="value chef-status">Denne bruger er chef</div>
      </div>
      <div v-else-if="item.brugereRef" class="detail-row">
        <div class="label">Nærmeste leder</div>
        <div class="separator">-</div>
        <div class="value">{{ lederNavn }}</div>
      </div>
      <div v-else class="detail-row">
        <div class="label">Nærmeste leder</div>
        <div class="separator">-</div>
        <div class="value">Leder er ikke valgt</div>
      </div>
    </div>

    <div class="detail-section">
      <div class="section-title">Ansvarlig for</div>
      <div class="detail-row">
        <div class="value">{{ item.egenkontrolRef || 'Denne bruger er ikke ansvarlig for nogle egenkontrol' }}</div>
      </div>
    </div>

    <div class="detail-section">
      <h3 class="section-title">Tilhørende Grupper</h3>
      <div class="value">{{ item.gruppe || 'Brugeren er endnu ikke tilknyttet en gruppe' }}</div>
    </div>

    <div class="detail-section">
      <h3 class="section-title">Personlige oplysninger</h3>

      <div class="detail-row">
        <div class="label">Adresse</div>
        <div class="separator">-</div>
        <div class="value">{{ item.adresse }}</div>
      </div>

      <div class="detail-row">
        <div class="label">By</div>
        <div class="separator">-</div>
        <div class="value">{{ addressDisplay }}</div>
      </div>
    </div>

    <div class="detail-section">
      <h3 class="section-title">Kontakt oplysninger</h3>

      <div class="detail-row">
        <div class="label">Email</div>
        <div class="separator">-</div>
        <div class="value">{{ item.email || 'Ikke angivet' }}</div>
      </div>

      <div class="detail-row">
        <div class="label">Telefon</div>
        <div class="separator">-</div>
        <div class="value">{{ item.telefon || 'Ikke angivet' }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.bruger-detail-content {
  padding: $spacing-medium 0;
}

.detail-section {
  margin-bottom: $spacing-large;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: $neutral-800;
  margin: 0 0 $spacing-small 0;
}

.detail-row {
  display: flex;
  align-items: center;
  font-size: 0.9375rem;
  margin-bottom: $spacing-small;

  &:last-child {
    margin-bottom: 0;
  }

  .separator {
    margin: 0 $spacing-xs;
    color: $neutral-500;
  }

  .value {
    color: $neutral-900;
  }
}

.role-value {
  font-size: 0.9375rem;
  color: $neutral-800;
  font-weight: 500;
}
</style>
