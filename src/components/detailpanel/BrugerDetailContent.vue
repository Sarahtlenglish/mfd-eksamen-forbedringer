<script setup>
import { ref, computed } from 'vue'

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

// Check if ansvarlig message is the default message
const isDefaultAnsvarligMessage = computed(() => {
  return props.item.ansvarlig_for_egenkontrol === 'Denne bruger er endnu ikke ansvarlig for nogle egenkontrol'
})

// Check if user is chef
const isBrugerChef = computed(() => {
  return props.item.leder === 'Denne bruger er chef'
})
</script>

<template>
  <div class="bruger-detail-content">
    <!-- Arbejdsfunktioner section -->
    <div class="detail-section">
        <div class="section-title">Arbejdsfunktioner</div>
      <div class="detail-row">
        <div class="role-value">{{ item.role }}</div>
      </div>

      <div class="detail-row" v-if="item.leder && !isBrugerChef">
        <div class="label">Nærmeste leder</div>
        <div class="separator">-</div>
        <div class="value">{{ item.leder }}</div>
      </div>

      <div class="detail-row" v-if="isBrugerChef">
        <div class="value chef-status">{{ item.leder }}</div>
      </div>
    </div>

    <div class="detail-section">
      <div class="section-title">Ansvarlig for</div>
      <div class="detail-row">
        <!-- Adjusted to always show the message -->
        <div class="value default-message" v-if="isDefaultAnsvarligMessage">
          {{ item.ansvarlig_for_egenkontrol }}
        </div>
        <div class="value" v-else>
          {{ item.ansvarlig_for_egenkontrol }}
        </div>
      </div>
    </div>

    <!-- Tilhørende Grupper section -->
    <div class="detail-section">
      <h3 class="section-title">Tilhørende Grupper</h3>
      <div class="value">{{ item.gruppe }}</div>
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

  .default-message {
    color: $neutral-600;
    font-style: italic;
  }
}

.value {
  font-size: 0.9375rem;
  color: $neutral-800;
}
</style>
