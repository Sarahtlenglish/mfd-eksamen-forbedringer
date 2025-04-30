<script setup>
import { useRouter } from 'vue-router'
import { reactive, ref, computed, watch, provide } from 'vue'
import DetailPanel from '@/components/ui/panels/DetailPanelComponent.vue'
import { IconX } from '@tabler/icons-vue'
import WizardFormComponent from '@/components/forms/WizardFormComponent.vue'
import { getWizardConfig, prepareDetailItem } from '@/components/forms/WizardFormConfig.js'
import { enhederData } from '@/mock/data/enheder'

const router = useRouter()

// Holder styr på om vi opretter en enkelt enhed eller en gruppe
const enhedType = ref('single')
const wizardRef = ref(null)

// Force re-create wizard when type changes
const forceRecreateKey = ref(0)

// Skabelon for form input data
const formData = reactive({
  // Fælles felter
  enhedType: 'single',
  location: '',

  // Felter for enkelt enhed
  enhedNavn: '',
  beskrivelse: '',

  // Felter for gruppe
  gruppeTitel: '',
  gruppeBeskrivelse: '',

  // Underenheder for gruppe (kun brugt når enhedType er 'gruppe')
  underenheder: []
})

// Provide formData to child components (especially UnderenhederListComponent)
provide('formData', formData)

// Opdater enhedType når formData.enhedType ændres og nulstil wizard
watch(() => formData.enhedType, (newValue, oldValue) => {
  if (newValue === oldValue) return

  enhedType.value = newValue

  // Nulstil relevante felter ved skift
  if (newValue === 'single' && oldValue === 'gruppe') {
    formData.gruppeTitel = ''
    formData.gruppeBeskrivelse = ''
    formData.underenheder = []
  } else if (newValue === 'gruppe' && oldValue === 'single') {
    formData.enhedNavn = ''
    formData.beskrivelse = ''
  }

  // Force re-render of the wizard component
  forceRecreateKey.value++
})

// Watch for location changes to update underenheder locations if needed
watch(() => formData.location, (newValue, oldValue) => {
  if (newValue === oldValue || enhedType.value !== 'gruppe') return

  // Reset underenheder when location changes to ensure consistent locations
  formData.underenheder = []
})

// Hent konfiguration baseret på valgt type
const config = computed(() => {
  const context = 'enheder'
  const mockOptions = {
    mockData: {
      enheder: {
        locationOptions: [
          { value: 'bygningA', label: 'Bygning A' },
          { value: 'bygningB', label: 'Bygning B' },
          { value: 'bygningC', label: 'Bygning C' }
        ],
        enhedTypeOptions: [
          { value: 'single', label: 'Single' },
          { value: 'gruppe', label: 'Gruppe' }
        ]
      }
    }
  }

  const wizardConfig = getWizardConfig(context, mockOptions)

  // Tilpas config baseret på enhedType
  if (enhedType.value === 'gruppe') {
    // Opdater konfiguration for gruppe
    return {
      ...wizardConfig,
      steps: [
        {
          title: 'Gruppe Information',
          heading: 'Udfyld informationen for gruppen'
        },
        {
          title: 'Underenheder',
          heading: 'Opret underenheder'
        }
      ],
      fields: {
        step1: ['enhedType', 'gruppeTitel', 'gruppeBeskrivelse', 'location'],
        step2: ['underenheder']
      }
    }
  } else {
    // Konfiguration for enkelt enhed
    return {
      ...wizardConfig,
      steps: [
        {
          title: 'Enheds Information',
          heading: 'Udfyld informationen for enheden'
        }
      ],
      fields: {
        step1: ['enhedType', 'enhedNavn', 'beskrivelse', 'location']
      }
    }
  }
})

// Live preview af enhed i detail panel
const detailItem = computed(() => {
  // Brug prepareDetailItem for at få et standardiseret objekt baseret på formData
  const item = prepareDetailItem('enheder', formData)

  // Sikrer at vi viser korrekt titel i detail panel uanset type
  if (enhedType.value === 'single') {
    item.title = formData.enhedNavn || 'Ny enhed'
    item.name = formData.enhedNavn || 'Ny enhed'
    item.description = formData.beskrivelse || 'Ingen beskrivelse angivet'
  } else {
    item.title = formData.gruppeTitel || 'Ny gruppeenhed'
    item.name = formData.gruppeTitel || 'Ny gruppeenhed'
    item.description = formData.gruppeBeskrivelse || 'Ingen beskrivelse angivet'
  }

  return item
})

// Håndterer opdatering af formular
const handleFormUpdate = (newFormData) => {
  Object.assign(formData, newFormData)
}

// Gemmer ny enhed og navigerer tilbage
const handleComplete = () => {
  const nyEnhed = {
    id: Math.max(...enhederData.map(item => item.id), 0) + 1,
    name: formData.enhedType === 'gruppe' ? formData.gruppeTitel : formData.enhedNavn,
    description: formData.enhedType === 'gruppe' ? formData.gruppeBeskrivelse : formData.beskrivelse,
    location: getLocationLabel(formData.location)
  }

  // Tilføj type-specifikke felter
  if (formData.enhedType === 'gruppe') {
    nyEnhed.type = 'Gruppe'
    nyEnhed.underenheder = formData.underenheder
  } else {
    nyEnhed.type = 'Enkelt Enhed'
  }

  // Tilføj enheden til den eksisterende array
  enhederData.push(nyEnhed)

  // Naviger tilbage til enheder oversigten
  router.push('/enheder')
}

// Afbryder oprettelse uden at gemme
const handleCancel = () => {
  router.push('/enheder')
}

// Hjælpefunktion til at hente locationLabel
function getLocationLabel(value) {
  const locationOptions = [
    { value: 'bygningA', label: 'Bygning A' },
    { value: 'bygningB', label: 'Bygning B' },
    { value: 'bygningC', label: 'Bygning C' }
  ]
  const option = locationOptions.find(opt => opt.value === value)
  return option ? option.label : value || 'Ikke valgt'
}
</script>

<template>
  <div class="opret-enhed-view">
    <div class="page-header">
      <h1 class="heading-1">Opret Enhed</h1>
      <button class="close-button" @click="handleCancel">
        <IconX />
      </button>
    </div>

    <div class="content-layout">
      <!-- Wizard formular - using key to force re-creation when type changes -->
      <div class="form-container">
        <WizardFormComponent
          :key="forceRecreateKey"
          ref="wizardRef"
          context="enheder"
          :config="config"
          :formData="formData"
          @update:formData="handleFormUpdate"
          @complete="handleComplete"
          @cancel="handleCancel"
        />
      </div>

      <!-- Live preview af den nye enhed -->
      <DetailPanel
        context="enheder"
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

.opret-enhed-view {
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
  color: $secondary-500;
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
