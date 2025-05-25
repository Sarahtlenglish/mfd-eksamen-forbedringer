<script setup>
import { useRouter } from 'vue-router'
import { reactive, ref, computed, watch, provide } from 'vue'
import DetailPanel from '@/components/panels/DetailPanelComponent.vue'
import { IconX } from '@tabler/icons-vue'
import WizardFormComponent from '@/components/forms/WizardFormComponent.vue'
import { getWizardConfig } from '@/components/forms/WizardFormConfig.js'
import { useEnhedStore } from '@/stores/enhedStore'
import { enhederConfig } from '@/configs/enhederConfig'

const router = useRouter()
const enhedStore = useEnhedStore()

const enhedType = ref('single')
const wizardRef = ref(null)

const forceRecreateKey = ref(0)

const formData = reactive({
  enhedType: 'single',
  location: '',

  enhedNavn: '',
  beskrivelse: '',

  gruppeTitel: '',
  gruppeBeskrivelse: '',

  underenheder: []
})

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

  forceRecreateKey.value++
})

// Watch for location changes to update underenheder locations
watch(() => formData.location, (newValue, oldValue) => {
  if (newValue === oldValue || enhedType.value !== 'gruppe') return

  formData.underenheder = []
})

const config = computed(() => {
  const context = 'enheder'
  const mockOptions = {
    dropdownOptions: {
      locationOptions: enhederConfig.locations,
      enhedTypeOptions: enhederConfig.types
    }
  }

  const wizardConfig = getWizardConfig(context, mockOptions)

  if (enhedType.value === 'gruppe') {
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

const detailItem = computed(() => {
  if (formData.enhedType === 'gruppe') {
    return {
      name: formData.gruppeTitel || 'Ny gruppeenhed',
      description: formData.gruppeBeskrivelse || 'Ingen beskrivelse angivet',
      type: 'Gruppe',
      status: 'normal',
      location: formData.location || 'Lokation ikke angivet',
      underenheder: formData.underenheder || []
    }
  } else {
    return {
      name: formData.enhedNavn || 'Ny enhed',
      description: formData.beskrivelse || 'Ingen beskrivelse angivet',
      type: 'Enkelt Enhed',
      status: 'normal',
      location: formData.location || 'Lokation ikke angivet'
    }
  }
})

const handleFormUpdate = (newFormData) => {
  Object.assign(formData, newFormData)
}

const handleComplete = async () => {
  try {
    const enhedData = {
      name: formData.enhedType === 'gruppe' ? formData.gruppeTitel : formData.enhedNavn,
      description: formData.enhedType === 'gruppe' ? formData.gruppeBeskrivelse : formData.beskrivelse,
      location: formData.location,
      type: formData.enhedType === 'gruppe' ? 'Gruppe' : 'single'
    }

    if (formData.enhedType === 'gruppe') {
      enhedData.underenheder = formData.underenheder
      await enhedStore.addGruppe(enhedData)
    } else {
      await enhedStore.addEnhed(enhedData)
    }

    router.push('/enheder')
  } catch (error) {
    alert('Der opstod en fejl ved oprettelse af enheden: ' + error.message)
  }
}

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
