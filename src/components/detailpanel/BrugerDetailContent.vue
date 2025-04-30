<script setup>
import { computed } from 'vue'

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

// Format address details
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

// Check if user is chef
const isBrugerChef = computed(() => {
  return !props.item.brugereRef
})
</script>

<template>
  <div class="bruger-detail-content">
    <!-- Arbejdsfunktioner section -->
    <div class="detail-section">
      <div class="section-title">Arbejdsfunktioner</div>

      <div class="detail-row">
        <div class="label">Rolle</div>
        <div class="separator">-</div>
        <div class="role-value">{{ item.rolle || 'Ikke angivet' }}</div>
      </div>

      <div class="detail-row" v-if="item.brugereRef">
        <div class="label">Nærmeste leder</div>
        <div class="separator">-</div>
        <div class="value">{{ item.lederNavn || item.brugereRef }}</div>
      </div>

      <div class="detail-row" v-if="isBrugerChef">
        <div class="value chef-status">Denne bruger er chef</div>
      </div>
    </div>

    <div class="detail-section">
      <div class="section-title">Ansvarlig for</div>
      <div class="detail-row">
        <div class="value">{{ item.egenkontrolRef || 'Denne bruger er ikke ansvarlig for nogle egenkontrol' }}</div>
      </div>
    </div>

    <!-- Tilhørende Grupper section -->
    <div class="detail-section">
      <h3 class="section-title">Tilhørende Grupper</h3>
      <div class="value">{{ item.gruppe || 'Brugeren er endnu ikke tilknyttet en gruppe' }}</div>
    </div>

    <!-- Personlige oplysninger section -->
    <div class="detail-section">
      <h3 class="section-title">Personlige oplysninger</h3>

      <div class="detail-row">
        <div class="label">Adresse</div>
        <div class="separator">-</div>
        <div class="value">{{ item.adresse || 'Ikke angivet' }}</div>
      </div>

      <!-- Always show the By (city) field -->
      <div class="detail-row">
        <div class="label">By</div>
        <div class="separator">-</div>
        <div class="value">{{ addressDisplay }}</div>
      </div>
    </div>

    <!-- Kontakt oplysninger section -->
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

  .label {
    color: $neutral-700;
  }

  .separator {
    margin: 0 $spacing-xs;
    color: $neutral-500;
  }

  .value {
    color: $neutral-900;
  }

  .chef-status {
    font-weight: 600;
    color: $primary-600;
  }
}

.role-value {
  font-size: 0.9375rem;
  color: $neutral-800;
  font-weight: 500;
}
</style>
