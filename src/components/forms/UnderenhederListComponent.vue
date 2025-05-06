<script setup>
import { ref, computed, inject } from 'vue'
import { IconPlus, IconX } from '@tabler/icons-vue'
import InputComponent from '@/components/ui/InputComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import { getLocationLabel } from '@/utils/labelHelpers'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  required: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: 'Underenheder'
  },
  placeholder: {
    type: String,
    default: 'Tilføj underenheder'
  }
})

const emit = defineEmits(['update:modelValue'])

// Inject formData from parent component to access location
const formData = inject('formData', {})

// Antal enheder at oprette
const antalEnheder = ref(4) // Default antal

// Underenheder data
const underenheder = computed({
  get: () => props.modelValue || [],
  set: value => emit('update:modelValue', value)
})

// Helper function to generate location codes based on selected location and index
function generateLocationCode(baseLocation, index) {
  // Map the base location to the first letter
  let prefix = ''
  if (baseLocation === 'bygningA') prefix = 'A'
  else if (baseLocation === 'bygningB') prefix = 'B'
  else if (baseLocation === 'bygningC') prefix = 'C'
  else return ''

  // Create a pattern like A0.15, A1.10, A2.10, A3.10
  const floor = Math.floor(index / 10)
  const room = (index % 10) + 10

  return `${prefix}${floor}.${room}`
}

// Generate location label
function generateLocationLabel(baseLocation, locationCode) {
  if (!baseLocation) return ''
  return getLocationLabel(baseLocation) + (locationCode ? ` - ${locationCode}` : '')
}

// Opret underenheder baseret på antal
const opretUnderenheder = () => {
  const count = parseInt(antalEnheder.value) || 0
  if (count <= 0) return

  // Get the selected location from formData
  const baseLocation = formData.location || ''

  // Create new array of underenheder
  const nyeUnderenheder = []
  for (let i = 1; i <= count; i++) {
    const locationCode = generateLocationCode(baseLocation, i)
    nyeUnderenheder.push({
      id: Date.now() + i,
      navn: `Branddør ${i}`,
      lokation: locationCode,
      // Use the function that's causing the lint error
      lokationLabel: generateLocationLabel(baseLocation, locationCode)
    })
  }

  // Update the model
  underenheder.value = nyeUnderenheder
}

// Remove an underenhed
const removeUnderenhed = (id) => {
  underenheder.value = underenheder.value.filter(item => item.id !== id)
}
</script>

<template>
  <div class="underenheder-component">
    <!-- Antal enheder sektion -->
    <div class="antal-enheder-section">
      <label class="field-label">
        Antal enheder der skal oprettes
        <span class="required-indicator" v-if="required">*</span>
      </label>
      <div class="antal-input-row">
        <InputComponent
          v-model="antalEnheder"
          type="number"
          min="1"
          class="antal-input"
        />
        <ButtonComponent
          variant="tertiary"
          @click="opretUnderenheder"
          class="opret-button"
        >
          <template #icon>
            <IconPlus />
          </template>
          Opret
        </ButtonComponent>
      </div>
    </div>

    <!-- Underenheder tabel -->
    <div v-if="underenheder.length > 0" class="underenheder-table-section">
      <div class="table-label">Underenheder - rediger hvis nødvendigt</div>

      <div class="underenheder-table">
        <div class="table-header">
          <div class="header-cell">Underenhed</div>
          <div class="header-cell">Lokation</div>
          <div class="header-cell-actions"></div>
        </div>
        <div class="table-body">
          <div
            v-for="(enhed, index) in underenheder"
            :key="enhed.id"
            class="table-row"
            :class="{ 'alternate-row': index % 2 === 1 }"
          >
            <div class="table-cell">
              {{ enhed.navn }}
            </div>
            <div class="table-cell">
              {{ enhed.lokation }}
            </div>
            <div class="table-cell-actions">
              <button class="remove-button" @click="removeUnderenhed(enhed.id)">
                <IconX />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.underenheder-component {
  width: 100%;
}

.field-label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: $neutral-800;
}

.required-indicator {
  color: $error-500;
  margin-left: 2px;
}

.antal-enheder-section {
  margin-bottom: $spacing-medium;
}

.antal-input-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.antal-input {
  width: 70%;
}

.table-label {
  font-weight: 500;
  margin-bottom: $spacing-small;
}

.underenheder-table {
  border: 1px solid $secondary-300;
  border-radius: $border-radius-md;
  overflow: hidden;
  color: $neutral-700;
  width: 70%;
}

.table-header {
  display: flex;
  background-color: $table-header;
  font-weight: 500;
  border-bottom: 1px solid $neutral-300;
}

.header-cell, .table-cell {
  padding: $spacing-small $spacing-medium;
  flex: 1;
}

.header-cell-actions, .table-cell-actions {
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.table-row {
  display: flex;
  align-items: center;
  background-color: $table-1st-row;
  padding: $spacing-small $spacing-medium;

  &:last-child {
    border-bottom: none;
  }

  &:nth-child(even) {
    background-color: $table-2nd-row;
  }
}

.remove-button {
  background: none;
  border: none;
  padding: $spacing-xs;
  color: $error-500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: $error-500;
  }

  svg {
    width: 18px;
    height: 18px;
  }
}
</style>
