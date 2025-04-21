<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue'
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
  }
})

const emit = defineEmits(['update:activeTabIndex', 'next', 'previous', 'complete'])

// Reference to form wizard
const formWizard = ref(null)

// Overstyring af wizard-checked-status baseret på aktivt trin
const isStepChecked = (index) => {
  return index < props.activeTabIndex
}

// Update step class when tab changes
const updateActiveTab = () => {
  if (formWizard.value) {
    const newActiveTabIndex = formWizard.value.activeTabIndex
    emit('update:activeTabIndex', newActiveTabIndex)
  }
}

// Navigation methods
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
  emit('complete')
}

// Expose methods
defineExpose({
  nextTab,
  prevTab,
  formWizard
})

// Initialiser step-klasse ved mount
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
      :subtitle="false"
      stepSize="md"
      backButtonText="Tilbage"
      nextButtonText="Næste"
      finishButtonText="Opret">
      <!-- Add a custom class to track current step -->
      <template v-slot:wizard="wizardProps">
        <div :class="['wizard-navigation-container', `step-${props.activeTabIndex}`]">
          <div class="wizard-nav">
            <slot name="step" v-for="tab in wizardProps.tabs" :tab="tab" :index="tab.index" :transition="wizardProps.transition"></slot>
          </div>
          <slot name="content" :transition="wizardProps.transition"></slot>
        </div>
      </template>

      <!-- Custom step styling -->
      <template v-slot:step="stepProps">
        <div
          class="custom-step-container"
          :class="{
            'active': stepProps.tab.active,
            'checked': isStepChecked(stepProps.index)
          }">
          <div class="custom-icon-container">
            <component :is="props.stepIcons[stepProps.index]" v-if="props.stepIcons[stepProps.index]" />
          </div>
          <div class="step-title">{{ stepProps.tab.title }}</div>
        </div>
      </template>

      <!-- Pass through the default slot -->
      <slot></slot>
    </FormWizard>

    <!-- Footer slot -->
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

/* Wizard styling */
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

/* Base gray line */
:deep(.wizard-nav)::before {
  content: "";
  position: absolute;
  top: 40px;
  left: 20%;
  width: 60%;
  height: 2px;
  background-color: #E5E5E5;
  z-index: 1;
}

/* Blue overlay line - controlled by step classes */
:deep(.wizard-nav)::after {
  content: "";
  position: absolute;
  top: 40px;
  left: 20%;
  height: 2px;
  background-color: $secondary-500;
  z-index: 2;
  width: 0%; /* Start with no blue line */
  transition: width 0.3s ease;
}

/* Step width classes */
.step-0 :deep(.wizard-nav)::after {
  width: 0%;
}

.step-1 :deep(.wizard-nav)::after {
  width: 30%;
}

.step-2 :deep(.wizard-nav)::after {
  width: 60%;
}

:deep(.wizard-nav-item) {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

/* Hide unwanted wizard elements */
:deep(.wizard-progress-with-circle),
:deep(.wizard-icon-circle),
:deep(.wizard-icon),
:deep(.stepTitle) {
  display: none !important;
}

/* Custom step styling */
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

/* Tab content styling */
:deep(.wizard-tab-content) {
  padding: $spacing-medium-plus;
  border-radius: $border-radius-lg;
  margin-bottom: $spacing-medium;
  flex: 1;
  overflow-y: visible;
  max-height: calc(100vh - 250px);
}

:deep(.wizard-footer-buttons) {
  display: none !important; /* Hide default buttons */
}
</style>
