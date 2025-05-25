<script setup>
import { useRouter } from 'vue-router'
import { reactive, ref, computed, provide, onMounted } from 'vue'
import DetailPanel from '@/components/panels/DetailPanelComponent.vue'
import { IconX } from '@tabler/icons-vue'
import WizardFormComponent from '@/components/forms/WizardFormComponent.vue'
import { getWizardConfig } from '@/components/forms/WizardFormConfig.js'
import { useBrugerStore } from '@/stores/brugerStore'
import { brugerConfig, getRoleLabel } from '@/configs/brugerConfig'

const router = useRouter()
const brugerStore = useBrugerStore()
const wizardRef = ref(null)

const forceRecreateKey = ref(0)

const formData = reactive({
  fuldeNavn: '',
  rolle: '',
  brugereRef: '',

  adresse: '',
  postnummer: '',
  by: '',

  email: '',
  telefon: ''
})

provide('formData', formData)

const leaderOptions = computed(() => {
  const options = [
    { value: 'bruger_er_chef', label: 'Denne bruger er chef' }
  ]
  brugerStore.brugere.forEach((bruger) => {
    options.push({
      value: bruger.id,
      label: bruger.fuldeNavn
    })
  })
  return options
})

const config = computed(() => {
  const context = 'brugere'
  const options = {
    dropdownOptions: {
      rolleOptions: brugerConfig.fieldDefinitions.rolle.options,
      brugereRefOptions: leaderOptions.value
    }
  }

  const baseConfig = getWizardConfig(context, options)

  return {
    ...baseConfig,
    fields: {
      step1: ['fuldeNavn', 'rolle', 'brugereRef'],
      step2: ['adresse', 'postnummer', 'by'],
      step3: ['email', 'telefon']
    }
  }
})

const detailItem = computed(() => {
  const selectedLeader = formData.brugereRef && formData.brugereRef !== 'bruger_er_chef'
    ? leaderOptions.value.find(opt => opt.value === formData.brugereRef)
    : null

  return {
    id: 'preview',
    fuldeNavn: formData.fuldeNavn || 'Ny Bruger',
    rolle: getRoleLabel(formData.rolle) || 'Rolle ikke angivet',
    brugereRef: formData.brugereRef || '',
    lederNavn: selectedLeader ? selectedLeader.label : '',
    adresse: formData.adresse || 'Adresse ikke angivet',
    postnummer: formData.postnummer || 'By ikke angivet',
    by: formData.by || '',
    email: formData.email || 'Email ikke angivet',
    telefon: formData.telefon || 'Telefonnummer ikke angivet'
  }
})

const handleFormUpdate = (newFormData) => {
  Object.assign(formData, newFormData)
}

const handleComplete = async () => {
  try {
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

    try {
      await brugerStore.addBruger(newBruger)

      router.push('/brugere')
    } catch (error) {
      alert('Der opstod en fejl ved oprettelse af brugeren: ' + error.message)
    }
  } catch (error) {
    alert('Der opstod en fejl ved håndtering af formulardata: ' + error.message)
  }
}

const handleCancel = () => {
  router.push('/brugere')
}

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
