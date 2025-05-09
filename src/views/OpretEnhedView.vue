<script setup>
import { useRouter } from 'vue-router'
import { reactive, ref, computed, watch, provide } from 'vue'
import DetailPanel from '@/components/panels/DetailPanelComponent.vue'
import { IconX } from '@tabler/icons-vue'
import WizardFormComponent from '@/components/forms/WizardFormComponent.vue'
import { getWizardConfig, prepareDetailItem } from '@/components/forms/WizardFormConfig.js'
import { useEnhedStore } from '@/stores/enhedStore'
import { enhederConfig } from '@/configs/enhederConfig'

const router = useRouter()
const enhedStore = useEnhedStore()

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
    dropdownOptions: {
      locationOptions: enhederConfig.locations,
      enhedTypeOptions: enhederConfig.types
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
          title: enhederConfig.defaults.gruppe.steps[0].title,
          heading: enhederConfig.defaults.gruppe.steps[0].heading
        },
        {
          title: 'Underenheder',
          heading: 'Opret underenheder for gruppen'
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
          title: enhederConfig.defaults.single.title,
          heading: enhederConfig.defaults.single.heading
        }
      ],
      fields: {
        step1: enhederConfig.defaults.single.fields
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
const handleComplete = async () => {
  try {
    console.log('Form data before submission:', formData)

    const enhedData = {
      name: formData.enhedType === 'gruppe' ? formData.gruppeTitel : formData.enhedNavn,
      description: formData.enhedType === 'gruppe' ? formData.gruppeBeskrivelse : formData.beskrivelse,
      location: formData.location,
      type: formData.enhedType === 'gruppe' ? 'Gruppe' : 'single'
    }

    console.log('Prepared enhed data:', enhedData)

    if (formData.enhedType === 'gruppe') {
      enhedData.underenheder = formData.underenheder
      console.log('Adding gruppe:', enhedData)
      await enhedStore.addGruppe(enhedData)
    } else {
      console.log('Adding single enhed:', enhedData)
      await enhedStore.addEnhed(enhedData)
    }

    // Navigate back on success
    router.push('/enheder')
  } catch (error) {
    console.error('Error creating enhed:', error)
    alert('Der opstod en fejl ved oprettelse af enheden: ' + error.message)
  }
}

// Afbryder oprettelse uden at gemme
const handleCancel = () => {
  router.push('/enheder')
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
