<script setup>
import { ref, defineProps, defineEmits, onMounted, computed } from 'vue'
import { FormWizard } from 'vue3-form-wizard'
import 'vue3-form-wizard/dist/style.css'

const props = defineProps({
  activeTabIndex: {
    type: Number,
    default: 0
  },
  stepIcons: {
    type: Array,
    default: () => []
  },
  context: {
    type: String,
    default: ''
  },
  formData: {
    type: Object,
    default: () => ({})
  },
  config: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:activeTabIndex', 'next', 'previous', 'complete'])

const formWizard = ref(null)

const safeStepIcons = computed(() => props.stepIcons || [])

const isStepChecked = (index) => {
  return index < props.activeTabIndex
}

const updateActiveTab = () => {
  if (formWizard.value) {
    const newActiveTabIndex = formWizard.value.activeTabIndex
    emit('update:activeTabIndex', newActiveTabIndex)
  }
}

const nextTab = () => {
  if (formWizard.value) {
    formWizard.value.nextTab()
    updateActiveTab()
    emit('next')
  }
}

const prevTab = () => {
  if (formWizard.value) {
    formWizard.value.prevTab()
    updateActiveTab()
    emit('previous')
  }
}

const completeWizard = () => {
  const wizardContainer = document.querySelector('.wizard-navigation-container')
  if (wizardContainer) {
    wizardContainer.classList.add('completed')
  }
  emit('complete')
}

defineExpose({
  nextTab,
  prevTab,
  formWizard,
  completeWizard
})

onMounted(() => {
  updateActiveTab()
})
</script>

<template>
  <div class="wizard-container">
    <FormWizard
      ref="formWizard"
      shape="circle"
      color="#4B97C0"
      @on-complete="completeWizard"
      @on-change="updateActiveTab"
      :hide-buttons="true"
      subtitle=""
      stepSize="md"
      backButtonText="Tilbage"
      nextButtonText="Næste"
      finishButtonText="Opret">
      <template v-slot:wizard="wizardProps">
        <div :class="['wizard-navigation-container', { 'completed': props.activeTabIndex === wizardProps.tabs.length }]">
          <div class="wizard-nav">
            <slot name="step" v-for="tab in wizardProps.tabs" :tab="tab" :index="tab.index" :transition="wizardProps.transition"></slot>
          </div>
          <slot name="content" :transition="wizardProps.transition"></slot>
        </div>
      </template>

      <template v-slot:step="stepProps">
        <div
          class="custom-step-container"
          :class="{
            'active': stepProps.tab.active,
            'checked': isStepChecked(stepProps.index)
          }">
          <div class="custom-icon-container">
            <component :is="safeStepIcons[stepProps.index]" v-if="safeStepIcons[stepProps.index]" />
          </div>
          <div class="step-title">{{ stepProps.tab.title }}</div>
        </div>
      </template>

      <slot></slot>
    </FormWizard>

    <slot name="footer"></slot>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.wizard-container {
  background-color: #F7F7F7;
  border-radius: 8px;
  border: 1px solid #D1D3D4;
  display: flex;
  flex-direction: column;
  padding: 24px 24px 8px 24px;
  width: 100%;
  box-sizing: border-box;
  height: 100%;
  min-height: 823px;
}

:deep(.wizard-card) {
  background-color: transparent;
  box-shadow: none;
  padding: 0;
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.wizard-nav) {
  margin-bottom: $spacing-large;
  height: auto;
  min-height: 5rem;
  display: flex;
  justify-content: space-between;
  position: relative;
  padding: 0 $spacing-xlarge;
  flex-wrap: nowrap;
  max-width: 100%;
  width: 100%;
}

.wizard-navigation-container {
  position: relative;
  width: 100%;
}

:deep(.wizard-nav-item) {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

:deep(.wizard-progress-with-circle) {
  height: 2px !important;
  width: 100% !important;
}

.custom-step-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 5;
  width: 100%;
  text-align: center;
}

.custom-icon-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid $neutral-300;
  background-color: $neutral-200;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 2;
  svg {
    width: 33px;
    height: 33px;
    stroke: $neutral-600;
    stroke-width: 2;
  }
}

.custom-step-container.active .custom-icon-container {
  border-color: $secondary-500;
  background-color: $secondary-50;
  border-width: 2px;
}

.custom-step-container.checked .custom-icon-container {
  border-width: 2px;
  border-color: $secondary-500;
}

.custom-step-container.active .custom-icon-container svg,
.custom-step-container.checked .custom-icon-container svg {
  stroke-width: 2;
}

.step-title {
  font-size: 0.875rem;
  font-weight: 400;
  color: $neutral-700;
  text-align: center;
  width: 100%;
  padding: 0 $spacing-xs;
  margin-top: $spacing-xs;
}

:deep(.wizard-tab-content) {
  border-radius: $border-radius-lg;
  margin-bottom: $spacing-medium;
  flex: 1;
  overflow-y: visible;
  max-height: calc(100vh - 250px);
  padding: 2rem 0 !important;
}

:deep(.wizard-footer-buttons) {
  display: none !important;
}
</style>
