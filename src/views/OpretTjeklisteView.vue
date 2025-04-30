<script setup>
import { useRouter } from 'vue-router'
import { reactive, computed } from 'vue'
import DetailPanel from '@/components/ui/panels/DetailPanelComponent.vue'
import { IconX } from '@tabler/icons-vue'
import { useTjeklisteStore } from '@/stores/tjeklisteStore'
import WizardFormComponent from '@/components/forms/WizardFormComponent.vue'
import { getWizardConfig } from '@/components/forms/WizardFormConfig.js'
import { tjeklisteFormData, prepareTjeklisteDetailItem } from '@/mock'

const router = useRouter()
const tjeklisteStore = useTjeklisteStore()

// Definer kontekst og konfiguration
const context = 'tjeklister'
const config = getWizardConfig(context, { mockData: { tjeklister: tjeklisteFormData } })

// Opret form data state
const formData = reactive({
  name: '',
  description: '',
  type: '',
  frekvens: ''
})

// Hjælpefunktioner til at hente label fra værdi
const labelHelpers = {
  getTypeLabel: (value) => {
    const option = tjeklisteFormData.tjeklisteTypeOptions.find(opt => opt.value === value)
    return option ? option.label : value
  },
  getFrekvensLabel: (value) => {
    const option = tjeklisteFormData.frekvensOptions.find(opt => opt.value === value)
    return option ? option.label : value
  }
}

// Computed property for detail panel
const detailItem = computed(() => prepareTjeklisteDetailItem(formData, labelHelpers))

// Event handlers
const handleFormUpdate = (newFormData) => {
  // Opdater formData objektet
  Object.assign(formData, newFormData)
}

const handleComplete = () => {
  // Forbered data til store
  const nyTjekliste = {
    id: Math.max(...tjeklisteStore.tjeklisterData.map(item => item.id), 0) + 1,
    ...detailItem.value
  }

  // Tilføj til store
  tjeklisteStore.addTjekliste(nyTjekliste)

  // Naviger tilbage til oversigt
  router.push('/tjeklister')
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
      <!-- Brug WizardFormComponent -->
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

      <!-- Detail panel preview -->
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
