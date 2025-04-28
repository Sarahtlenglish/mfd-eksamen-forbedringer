<script setup>
import { useRouter } from 'vue-router'
import { reactive, onMounted } from 'vue'
import DetailPanel from '@/components/ui/panels/DetailPanelComponent.vue'
import { IconX } from '@tabler/icons-vue'
import { useEgenkontrolStore } from '@/stores/egenkontrolStore'
import { useEgenkontrolForm } from '@/components/forms/EgenkontrolFormData.js'
import EgenkontrolFormContent from '@/components/forms/EgenkontrolFormContent.vue'

const router = useRouter()
const egenkontrolStore = useEgenkontrolStore()

// Get the computed detail panel data and helper function from the form logic
const { detailItem, prepareEgenkontrolData, updateDetailItem } = useEgenkontrolForm()

// Create form data state for the reusable component
const formData = reactive({
  egenkontrolTitle: '',
  egenkontrolBeskrivelse: '',
  selectedCheckliste: '',
  selectedStartDato: '',
  selectedEnheder: '',
  selectedAnsvarlige: '',
  reminderFrekvens: '',
  reminderTidspunkt: '',
  deadlineFrekvens: '',
  deadlineTidspunkt: '',
  kvitteringModtager: '',
  afvigelseModtager: ''
})

// Update form data handler
const handleFormUpdate = (newFormData) => {
  // Update local formData object
  Object.assign(formData, newFormData)
  // Update the detailItem (which is computed in useEgenkontrolForm)
  updateDetailItem(formData)
}

// Initialize detailItem med værdierne fra formData
onMounted(() => {
  updateDetailItem(formData)
})

// Event handlers
const handleComplete = () => {
  // Get prepared data for the store
  const nyEgenkontrol = {
    id: Math.max(...egenkontrolStore.egenkontrollerData.map(item => item.id)) + 1,
    ...prepareEgenkontrolData()
  }

  // Add to store
  egenkontrolStore.addEgenkontrol(nyEgenkontrol)

  // Navigate back to overview
  router.push('/egenkontrol')
}

const handleCancel = () => {
  router.push('/egenkontrol')
}
</script>

<template>
  <div class="opret-egenkontrol-view">
    <div class="page-header">
      <h1 class="heading-1">Opret Egenkontrol</h1>
      <button class="close-button" @click="handleCancel">
        <IconX />
      </button>
    </div>

    <div class="content-layout">
      <!-- Brug EgenkontrolFormContent direkte -->
      <div class="form-container form-egenkontroller">
        <EgenkontrolFormContent
          :formData="formData"
          context="egenkontroller"
          @update:formData="handleFormUpdate"
          @complete="handleComplete"
          @cancel="handleCancel"
        />
      </div>

      <DetailPanel
        context="egenkontroller"
        :item="detailItem"
        :showBackButton="false"
        :showDeleteButton="false"
        :showEditButton="false"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.opret-egenkontrol-view {
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
  background-color: #F7F7F7;
  border-radius: 8px;
  border: 1px solid #D1D3D4;
  display: flex;
  flex-direction: column;
  min-width: 66%;
  box-sizing: border-box;
  height: 100%;
  min-height: 823px;
}
</style>
