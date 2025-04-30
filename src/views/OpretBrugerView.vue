<script setup>
import { useRouter } from 'vue-router'
import { reactive, ref, computed, provide } from 'vue'
import DetailPanel from '@/components/ui/panels/DetailPanelComponent.vue'
import { IconX } from '@tabler/icons-vue'
import WizardFormComponent from '@/components/forms/WizardFormComponent.vue'
import { getWizardConfig } from '@/components/forms/WizardFormConfig.js'
import { brugerStore } from '@/stores/brugerStore'

const router = useRouter()
const brugerStoreInstance = brugerStore()
const wizardRef = ref(null)

// Force re-create wizard when needed
const forceRecreateKey = ref(0)

// Template for form input data
const formData = reactive({
  // Step 1: Arbejdsfunktioner
  name: '',
  role: '',
  ansvarlig_for_egenkontrol: '',
  leder: '',

  // Step 2: Personlige oplysninger
  adresse: '',
  postnummer: '',
  by: '',

  // Step 3: Kontakt oplysninger
  email: '',
  telefon: ''
})

// Provide formData to child components if needed
provide('formData', formData)

// Get configuration for the wizard
const config = computed(() => {
  const context = 'brugere'
  const mockOptions = {
    mockData: {
      brugere: {
        roleOptions: [
          { value: 'service_bruger', label: 'Service Bruger' },
          { value: 'facility_manager', label: 'Facility Manager' },
          { value: 'administrator', label: 'Administrator' },
          { value: 'visnings_bruger', label: 'Visnings Bruger' }
        ],
        lederOptions: [
          { value: 'bruger_er_chef', label: 'Denne bruger er chef' },
          { value: 'christian_hansen', label: 'Christian Hansen' },
          { value: 'anders_jensen', label: 'Anders Jensen' },
          { value: 'tanja_lund', label: 'Tanja Lund' }
        ],
        egenkontrolOptions: [
          { value: 'egenkontrol_1', label: 'Egenkontrol 1' },
          { value: 'egenkontrol_2', label: 'Egenkontrol 2' },
          { value: 'egenkontrol_3', label: 'Egenkontrol 3' }
        ]
      }
    }
  }

  const baseConfig = getWizardConfig(context, mockOptions)

  // Override the config to remove 'ansvarlig_for_egenkontrol' from step 1
  // and ensure step 3 has no fields (we'll handle them directly in the template)
  return {
    ...baseConfig,
    fields: {
      ...baseConfig.fields,
      step1: ['name', 'role', 'leder'], // Remove 'ansvarlig_for_egenkontrol'
      step3: [] // Empty array for step 3 to prevent default rendering
    }
  }
})

// Live preview of user in detail panel
const detailItem = computed(() => {
  // Get the active step to show the right data
  const activeStep = wizardRef.value?.wizardStepper?.value?.activeTabIndex || 0

  // Base detail item with data updated as the form is filled
  return {
    id: 'preview',
    name: formData.name || 'Ny Bruger',
    role: getRoleLabel(formData.role) || 'Ikke valgt',
    ansvarlig_for_egenkontrol: formData.ansvarlig_for_egenkontrol ? 
      getEgenkontrolLabel(formData.ansvarlig_for_egenkontrol) : 
      'Denne bruger er endnu ikke ansvarlig for nogle egenkontrol',
    leder: formData.leder ? getLederLabel(formData.leder) : 'Ikke valgt',
    adresse: formData.adresse || 'Ikke angivet',
    postnummer: formData.postnummer || '',
    by: formData.by || 'Ikke angivet', 
    email: formData.email || 'Ikke angivet',
    telefon: formData.telefon || 'Ikke angivet',
    gruppe: 'Tilhører ingen gruppe endnu'
  }
})

// Helper functions for label lookups
function getRoleLabel(value) {
  if (!value) return ''
  const options = [
    { value: 'service_bruger', label: 'Service Bruger' },
    { value: 'facility_manager', label: 'Facility Manager' },
    { value: 'administrator', label: 'Administrator' },
    { value: 'visnings_bruger', label: 'Visnings Bruger' }
  ]
  const option = options.find(opt => opt.value === value)
  return option ? option.label : value
}

function getLederLabel(value) {
  if (!value) return ''
  const options = [
    { value: 'bruger_er_chef', label: 'Denne bruger er chef' },
    { value: 'christian_hansen', label: 'Christian Hansen' },
    { value: 'anders_jensen', label: 'Anders Jensen' },
    { value: 'tanja_lund', label: 'Tanja Lund' }
  ]
  const option = options.find(opt => opt.value === value)
  return option ? option.label : value
}

function getEgenkontrolLabel(value) {
  if (!value) return ''
  const options = [
    { value: 'egenkontrol_1', label: 'Egenkontrol 1' },
    { value: 'egenkontrol_2', label: 'Egenkontrol 2' },
    { value: 'egenkontrol_3', label: 'Egenkontrol 3' }
  ]
  const option = options.find(opt => opt.value === value)
  return option ? option.label : value
}

// Handle form update
const handleFormUpdate = (newFormData) => {
  Object.assign(formData, newFormData)
}

// Save new user and navigate back
const handleComplete = () => {
  // Prepare user data for saving
  console.log('Complete form with data:', formData)

  // Format the user data properly
  const newBruger = {
    name: formData.name,
    role: getRoleLabel(formData.role),
    ansvarlig_for_egenkontrol: formData.ansvarlig_for_egenkontrol ? 
      getEgenkontrolLabel(formData.ansvarlig_for_egenkontrol) : 
      'Denne bruger er ikke ansvarlig for nogle egenkontrol',
    leder: formData.leder ? getLederLabel(formData.leder) : 'Ikke valgt',
    adresse: formData.adresse || 'Ikke angivet',
    postnummer: formData.postnummer || '',
    by: formData.by || 'Ikke angivet',
    email: formData.email || 'Ikke angivet',
    telefon: formData.telefon || 'Ikke angivet',
    gruppe: 'Ingen gruppe'
  }

  // Add user to store
  try {
    brugerStoreInstance.addBruger(newBruger)
    console.log('New user added to store:', newBruger)

    // Navigate back to users overview
    router.push('/brugere')
  } catch (error) {
    console.error('Error adding user to store:', error)
  }
}

// Cancel creation without saving
const handleCancel = () => {
  router.push('/brugere')
}
</script>

<template>
  <div class="opret-bruger-view">
    <div class="page-header">
      <h1 class="heading-1">Opret Bruger</h1>
      <button class="close-button" @click="handleCancel">
        <IconX />
      </button>
    </div>

    <div class="content-layout">
      <!-- Wizard form -->
      <div class="form-container">
        <WizardFormComponent
          :key="forceRecreateKey"
          ref="wizardRef"
          context="brugere"
          :config="config"
          :formData="formData"
          @update:formData="handleFormUpdate"
          @complete="handleComplete"
          @cancel="handleCancel"
        />
      </div>

      <!-- Live preview of the new user -->
      <DetailPanel
        context="brugere"
        :item="detailItem"
        :showBackButton="false"
        :showDeleteButton="false"
        :showEditButton="false"
        :isCreationMode="true"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.opret-bruger-view {
  height: 100%;
  min-height: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 24px 0;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: $neutral-600;
  padding: $spacing-xs;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    color: $neutral-900;
  }
}

.content-layout {
  display: flex;
  flex: 1;
  gap: $spacing-large;
  overflow: hidden;
  min-height: 800px;
}

.form-container {
  min-width: 66%;
  box-sizing: border-box;
  height: 100%;
}
</style>
