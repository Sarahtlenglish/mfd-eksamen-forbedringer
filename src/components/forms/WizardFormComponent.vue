<script setup>
import { ref, computed, provide } from 'vue'
import WizardStepperComponent from '@/components/forms/WizardStepperComponent.vue'
import { TabContent } from 'vue3-form-wizard'
import 'vue3-form-wizard/dist/style.css'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import { IconPlus } from '@tabler/icons-vue'
const props = defineProps({
  // Bestemmer hvilken type formular der renderes
  context: {
    type: String,
    required: true,
    validator: value => ['egenkontroller', 'tjeklister', 'enheder', 'brugere'].includes(value)
  },
  // Data der opdateres via two-way binding
  formData: {
    type: Object,
    required: true
  },
  // Wizard konfiguration fra WizardFormConfig.js
  config: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:formData', 'next', 'previous', 'complete', 'cancel'])

const wizardStepper = ref(null)
const activeTabIndex = ref(0)

// Opdaterer formData med immutable pattern
const updateFormValue = (key, value) => {
  const updatedFormData = { ...props.formData, [key]: value }
  emit('update:formData', updatedFormData)
}

// Gør funktionalitet tilgængelig for børnekomponenter
provide('updateFormValue', updateFormValue)
provide('formData', props.formData)
provide('config', props.config)

const steps = computed(() => props.config.steps || [])
const stepIcons = computed(() => props.config.stepIcons || [])

// Wizard navigation
const handleNextTab = () => {
  if (activeTabIndex.value < steps.value.length - 1) {
    wizardStepper.value.nextTab()
    emit('next')
  } else {
    // Afslut wizard og emit complete
    if (wizardStepper.value && wizardStepper.value.formWizard && wizardStepper.value.formWizard.value) {
      wizardStepper.value.formWizard.value.isLastStep = true
      wizardStepper.value.completeWizard()
    }
    emit('complete')
  }
}

const handlePrevTab = () => {
  wizardStepper.value.prevTab()
  emit('previous')
}

const handleCancel = () => {
  emit('cancel')
}

const isLastStep = computed(() => activeTabIndex.value === steps.value.length - 1)

// Eksponér navigation til parent komponenter
defineExpose({
  wizardStepper,
  nextTab: handleNextTab,
  prevTab: handlePrevTab
})
</script>

<template>
  <div class="wizard-form">
    <WizardStepperComponent
      ref="wizardStepper"
      v-model:activeTabIndex="activeTabIndex"
      :stepIcons="stepIcons"
      @complete="emit('complete')">

      <!-- Wizard indhold for hvert trin -->
      <TabContent
        v-for="(step, index) in steps"
        :key="index"
        :title="step.title">
        <div class="step-content">
          <h2 class="step-heading heading-3">{{ step.heading }}</h2>

          <!-- Special-case for step 3 med grupperede felter -->
          <template v-if="index === 2 && config.step3Groups">
            <div v-for="(group, idx) in config.step3Groups" :key="idx">
              <h3 class="section-label">{{ group.label }}</h3>
              <div class="form-row">
                <div v-for="fieldKey in group.fields" :key="fieldKey" class="form-group">
                  <label v-if="config.fieldDefinitions[fieldKey].label" class="field-label">
                    {{ config.fieldDefinitions[fieldKey].label }}
                  </label>
                  <component
                    :is="config.fieldDefinitions[fieldKey].component"
                    v-if="config.fieldDefinitions[fieldKey]"
                    :placeholder="config.fieldDefinitions[fieldKey].placeholder"
                    :required="config.fieldDefinitions[fieldKey].required"
                    :options="config.fieldDefinitions[fieldKey].options ? config.dropdownOptions[config.fieldDefinitions[fieldKey].options] : undefined"
                    :modelValue="formData[fieldKey]"
                    @update:modelValue="updateFormValue(fieldKey, $event)"
                  />
                </div>
              </div>
            </div>
          </template>

          <!-- Standard feltlayout for andre steps -->
          <template v-else>
            <div class="form-group" v-for="fieldKey in config.fields[`step${index + 1}`]" :key="fieldKey">
              <component
                :is="config.fieldDefinitions[fieldKey].component"
                v-if="config.fieldDefinitions[fieldKey]"
                :label="config.fieldDefinitions[fieldKey].label"
                :placeholder="config.fieldDefinitions[fieldKey].placeholder"
                :required="config.fieldDefinitions[fieldKey].required"
                :options="config.fieldDefinitions[fieldKey].options ? config.dropdownOptions[config.fieldDefinitions[fieldKey].options] : undefined"
                :modelValue="formData[fieldKey]"
                @update:modelValue="updateFormValue(fieldKey, $event)"
              />
            </div>
          </template>
        </div>
      </TabContent>

      <!-- Wizard footer med navigation -->
      <template #footer>
        <div class="custom-wizard-footer">
          <div class="wizard-footer-left">
            <ButtonComponent
              variant="tertiary"
              @click="handleCancel">
              Annuller
            </ButtonComponent>
          </div>
          <div class="wizard-footer-right">
            <ButtonComponent
              v-if="activeTabIndex > 0"
              variant="secondary"
              class="tilbage-button"
              @click="handlePrevTab">
              Tilbage
            </ButtonComponent>
            <ButtonComponent
              v-if="isLastStep"
              variant="primary"
              @click="handleNextTab"
            >
              <template #icon>
                <IconPlus />
              </template>
              Opret
            </ButtonComponent>
            <ButtonComponent
              v-else
              variant="primary"
              @click="handleNextTab"
            >
              Næste
            </ButtonComponent>
          </div>
        </div>
      </template>
    </WizardStepperComponent>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.wizard-form {
  background-color: #F7F7F7;
  border-radius: 8px;
  border: 1px solid #D1D3D4;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  height: 100%;
  min-height: 823px;
  overflow: hidden;
}

.step-heading {
  margin-bottom: $spacing-xlarge;
}

.form-group {
  margin-bottom: $spacing-medium-plus;
}

.section-group {
  margin-bottom: $spacing-medium-plus;
}

.section-label {
  font-size: 1rem;
  margin-bottom: $spacing-small;
  font-weight: 400;
  color: $neutral-700;
}

.form-row {
  display: flex;
  gap: $spacing-medium;
  margin-bottom: 0;

  .form-group {
    flex: 1;
    margin-bottom: 0;
  }
}

/* Custom Wizard Footer */
.custom-wizard-footer {
  display: flex;
  justify-content: space-between;
  padding: $spacing-medium;
  margin-top: auto;
  width: 100%;
  border-top: 1px solid $neutral-300;
}

.wizard-footer-left,
.wizard-footer-right {
  display: flex;
  gap: $spacing-medium;
  align-items: center;
}

.tilbage-button {
  font-weight: 500;
}

.field-label {
  display: block;
  font-weight: 500;
  margin-bottom: 4px;
  color: $neutral-800;
}

.wizard-tab-content {
  padding: 0 !important;
}
</style>
