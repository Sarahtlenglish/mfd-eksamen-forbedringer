<script setup>
import { useRouter } from 'vue-router'
import { reactive, computed, onMounted } from 'vue'
import DetailPanel from '@/components/panels/DetailPanelComponent.vue'
import { IconX } from '@tabler/icons-vue'
import { useTjeklisteStore } from '@/stores/tjeklisteStore'
import WizardFormComponent from '@/components/forms/WizardFormComponent.vue'
import { getWizardConfig } from '@/components/forms/WizardFormConfig.js'
import { tjeklisteConfig } from '@/configs/tjeklisteConfig'

const router = useRouter()
const tjeklisteStore = useTjeklisteStore()

onMounted(() => {
  tjeklisteStore.fetchTjeklister()
})

const formData = reactive({
  navn: '',
  beskrivelse: '',
  type: '',
  frekvens: '',
  tidspunkt: '',
  opgaver: [],
  tjeklisteFields: []
})

const detailItem = computed(() => ({
  tjeklisteNavn: formData.navn || 'Ny tjekliste',
  beskrivelse: formData.beskrivelse || 'Ingen beskrivelse angivet',
  type: formData.type || 'Type ikke angivet',
  frekvens: formData.frekvens || 'Frekvens ikke angivet',
  tjeklisteFields: formData.tjeklisteFields || []
}))

const context = 'tjeklister'
const config = computed(() => getWizardConfig(context, {
  dropdownOptions: {
    typeOptions: tjeklisteConfig.typeOptions,
    frekvensOptions: tjeklisteConfig.frekvensOptions
  }
}))

const handleFormUpdate = (newFormData) => {
  Object.assign(formData, newFormData)
}

const handleComplete = async () => {
  try {
    const nyTjekliste = {
      tjeklisteNavn: formData.navn,
      beskrivelse: formData.beskrivelse,
      type: formData.type,
      frekvens: formData.frekvens,
      tjeklisteFields: formData.tjeklisteFields || [],
      opgaver: formData.opgaver || []
    }

    await tjeklisteStore.addTjekliste(nyTjekliste)
    router.push('/tjeklister')
  } catch (error) {
    console.error('Fejl ved oprettelse:', error)
    alert('Der opstod en fejl under oprettelsen af tjeklisten: ' + error.message)
  }
}

const handleCancel = () => {
  router.push('/tjeklister')
}
</script>

<template>
  <div class="opret-tjekliste-view">
    <div class="page-header">
      <h1 class="heading-1">Opret Tjekliste</h1>
      <button class="close-button" @click="handleCancel">
        <IconX />
      </button>
    </div>

    <div class="content-layout">
      <div class="form-container">
        <WizardFormComponent
          :context="context"
          :config="config"
          :formData="formData"
          @update:formData="handleFormUpdate"
          @complete="handleComplete"
          @cancel="handleCancel"
        />
      </div>

      <DetailPanel
        context="tjeklister"
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

.opret-tjekliste-view {
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
