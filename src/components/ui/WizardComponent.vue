<script setup>
import { ref, computed } from 'vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'

const props = defineProps({
  steps: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['complete', 'cancel'])

// State
const currentStep = ref(0)

// Computed properties
const isFirstStep = computed(() => currentStep.value === 0)
const isLastStep = computed(() => currentStep.value === props.steps.length - 1)
const currentStepComponent = computed(() => props.steps[currentStep.value].component)

// Navigation methods
const nextStep = () => {
  if (isLastStep.value) {
    emit('complete')
    return
  }
  currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const cancel = () => {
  emit('cancel')
}
</script>

<template>
  <div class="wizard">
    <!-- Step indicators -->
    <div class="wizard-steps">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="wizard-step"
        :class="{
          'active': index === currentStep,
          'completed': index < currentStep
        }"
      >
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-title">{{ step.title }}</div>
      </div>
    </div>

    <!-- Step content -->
    <div class="wizard-content">
      <component :is="currentStepComponent" />
    </div>

    <!-- Navigation -->
    <div class="wizard-navigation">
      <div class="nav-left">
        <ButtonComponent
          v-if="!isFirstStep"
          variant="secondary"
          @click="prevStep"
        >
          Tilbage
        </ButtonComponent>

        <ButtonComponent
          v-if="isFirstStep"
          variant="tertiary"
          @click="cancel"
        >
          Annuller
        </ButtonComponent>
      </div>

      <div class="nav-right">
        <ButtonComponent
          variant="primary"
          @click="nextStep"
        >
          {{ isLastStep ? 'Opret' : 'Næste' }}
        </ButtonComponent>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.wizard {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.wizard-steps {
  display: flex;
  margin-bottom: $spacing-large;
  border-bottom: 1px solid $neutral-200;
  padding-bottom: $spacing-medium;
}

.wizard-step {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 16px;
    left: calc(100% - 16px);
    width: calc(100% - 48px);
    height: 1px;
    background-color: $neutral-300;
    z-index: 0;
  }

  &.active .step-number {
    background-color: $primary-500;
    color: white;
    border-color: $primary-500;
  }

  &.completed .step-number {
    background-color: $success-500;
    color: white;
    border-color: $success-500;
  }

  &.completed::after {
    background-color: $success-500;
  }
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid $neutral-300;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $spacing-small;
  font-weight: 600;
  z-index: 1;
}

.step-title {
  font-weight: 500;
}

.wizard-content {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-medium 0;
}

.wizard-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: $spacing-large;
  padding-top: $spacing-medium;
  border-top: 1px solid $neutral-200;

  .nav-left, .nav-right {
    display: flex;
    gap: $spacing-small;
  }
}
</style>
