<script setup>
import { useRouter } from 'vue-router'
import { reactive, ref, computed, provide, onMounted } from 'vue'
import DetailPanel from '@/components/ui/panels/DetailPanelComponent.vue'
import { IconX } from '@tabler/icons-vue'
import WizardFormComponent from '@/components/forms/WizardFormComponent.vue'
import { getWizardConfig } from '@/components/forms/WizardFormConfig.js'
import { useBrugerStore } from '@/stores/brugerStore'
import { brugerConfig, getRoleLabel } from '@/configs/brugerConfig'

const router = useRouter()
const brugerStore = useBrugerStore()
const wizardRef = ref(null)

// Force re-create wizard when needed
const forceRecreateKey = ref(0)

// Template for form input data
const formData = reactive({
  // Step 1: Arbejdsfunktioner
  fuldeNavn: '',
  rolle: '',
  brugereRef: '',

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

// Get leader options from store
const leaderOptions = computed(() => {
  const options = [
    { value: 'bruger_er_chef', label: 'Denne bruger er chef' }
  ]
  // Add existing users as options
  brugerStore.brugere.forEach((bruger) => {
    options.push({
      value: bruger.id,
      label: bruger.fuldeNavn
    })
  })
  return options
})

// Get configuration for the wizard
const config = computed(() => {
  const context = 'brugere'
  const mockOptions = {
    mockData: {
      brugere: {
        rolleOptions: brugerConfig.fieldDefinitions.rolle.options,
        brugereRefOptions: leaderOptions.value
      }
    }
  }

  const baseConfig = getWizardConfig(context, mockOptions)

  return {
    ...baseConfig,
    fields: {
      ...baseConfig.fields,
      step1: brugerConfig.steps[0].fields,
      step2: brugerConfig.steps[1].fields,
      step3: brugerConfig.steps[2].fields
    }
  }
})

// Live preview of user in detail panel
const detailItem = computed(() => {
  const selectedLeader = formData.brugereRef && formData.brugereRef !== 'bruger_er_chef'
    ? leaderOptions.value.find(opt => opt.value === formData.brugereRef)
    : null

  return {
    id: 'preview',
    fuldeNavn: formData.fuldeNavn || 'Ny Bruger',
    rolle: getRoleLabel(formData.rolle) || 'Ikke valgt',
    brugereRef: formData.brugereRef === 'bruger_er_chef' ? '' : formData.brugereRef,
    lederNavn: selectedLeader ? selectedLeader.label : '',
    adresse: formData.adresse || 'Ikke angivet',
    postnummer: formData.postnummer || '',
    by: formData.by || 'Ikke angivet',
    email: formData.email || 'Ikke angivet',
    telefon: formData.telefon || 'Ikke angivet'
  }
})

// Handle form update
const handleFormUpdate = (newFormData) => {
  Object.assign(formData, newFormData)
}

// Save new user and navigate back
const handleComplete = async () => {
  try {
    console.log('Complete form with data:', formData)

    // Format the user data properly
    const newBruger = {
      fuldeNavn: formData.fuldeNavn,
      rolle: formData.rolle,
      brugereRef: formData.brugereRef === 'bruger_er_chef' ? '' : formData.brugereRef || '',
      adresse: formData.adresse || '',
      postnummer: formData.postnummer || '',
      by: formData.by || '',
      email: formData.email || '',
      telefon: formData.telefon || ''
    }

    // Add user to Firestore through store
    try {
      await brugerStore.addBruger(newBruger)
      console.log('New user added to store:', newBruger)

      // Navigate back to users overview
      router.push('/brugere')
    } catch (error) {
      console.error('Error adding user to store:', error)
      alert('Der opstod en fejl ved oprettelse af brugeren: ' + error.message)
    }
  } catch (error) {
    console.error('Error in form completion:', error)
    alert('Der opstod en fejl ved håndtering af formulardata: ' + error.message)
  }
}

// Cancel creation without saving
const handleCancel = () => {
  router.push('/brugere')
}

// Fetch users when component mounts
onMounted(async () => {
  try {
    await brugerStore.fetchBrugere()
  } catch (error) {
    console.error('Error fetching users:', error)
  }
})
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
