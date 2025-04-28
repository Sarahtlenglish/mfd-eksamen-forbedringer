<script setup>
import { ref } from 'vue'
import InputComponent from '@/components/ui/InputComponent.vue'
import DropdownComponent from '@/components/ui/DropdownComponent.vue'
import DatePickerComponent from '@/components/ui/DatePickerComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import WizardStepperComponent from '@/components/forms/WizardStepperComponent.vue'
import { IconClipboard, IconUsers, IconBell, IconPlus } from '@tabler/icons-vue'
import { TabContent } from 'vue3-form-wizard'
import 'vue3-form-wizard/dist/style.css'
import { egenkontrolFormData } from '@/mock'

const props = defineProps({
  // Form data binding
  formData: {
    type: Object,
    required: true
  },
  // Context will determine the form structure and behavior
  context: {
    type: String,
    required: true,
    default: 'egenkontroller',
    validator: value => ['egenkontroller', 'inspektion', 'vedligehold'].includes(value)
  }
})

// Form configuration based on context
const contextConfig = {
  egenkontroller: {
    stepIcons: [IconClipboard, IconUsers, IconBell],
    steps: [
      {
        title: 'Egenkontrol Information',
        heading: 'Udfyld information for egenkontrollen'
      },
      {
        title: 'Enheder & Ansvarlige',
        heading: 'Enheder og ansvarlige'
      },
      {
        title: 'Notifikationer',
        heading: 'Notifikations indstillinger for egenkontrollen'
      }
    ],
    fields: {
      step1: ['egenkontrolTitle', 'egenkontrolBeskrivelse', 'selectedCheckliste', 'selectedStartDato'],
      step2: ['selectedEnheder', 'selectedAnsvarlige'],
      step3: ['reminderFrekvens', 'reminderTidspunkt', 'deadlineFrekvens', 'deadlineTidspunkt', 'kvitteringModtager', 'afvigelseModtager']
    },
    dropdownOptions: egenkontrolFormData
  },
  inspektion: {
    // Similar config for inspektion...
    stepIcons: [IconClipboard, IconUsers, IconBell],
    steps: [
      {
        title: 'Inspektion Information',
        heading: 'Udfyld information for inspektionen'
      },
      {
        title: 'Enheder & Ansvarlige',
        heading: 'Enheder og ansvarlige'
      },
      {
        title: 'Notifikationer',
        heading: 'Notifikations indstillinger for inspektionen'
      }
    ],
    fields: {
      step1: ['egenkontrolTitle', 'egenkontrolBeskrivelse', 'selectedCheckliste', 'selectedStartDato'],
      step2: ['selectedEnheder', 'selectedAnsvarlige'],
      step3: ['reminderFrekvens', 'reminderTidspunkt', 'deadlineFrekvens', 'deadlineTidspunkt', 'kvitteringModtager', 'afvigelseModtager']
    },
    dropdownOptions: egenkontrolFormData
  },
  vedligehold: {
    // Similar config for vedligehold...
    stepIcons: [IconClipboard, IconUsers, IconBell],
    steps: [
      {
        title: 'Vedligehold Information',
        heading: 'Udfyld information for vedligeholdelse'
      },
      {
        title: 'Enheder & Ansvarlige',
        heading: 'Enheder og ansvarlige'
      },
      {
        title: 'Notifikationer',
        heading: 'Notifikations indstillinger for vedligeholdelse'
      }
    ],
    fields: {
      step1: ['egenkontrolTitle', 'egenkontrolBeskrivelse', 'selectedCheckliste', 'selectedStartDato'],
      step2: ['selectedEnheder', 'selectedAnsvarlige'],
      step3: ['reminderFrekvens', 'reminderTidspunkt', 'deadlineFrekvens', 'deadlineTidspunkt', 'kvitteringModtager', 'afvigelseModtager']
    },
    dropdownOptions: egenkontrolFormData
  }
}

// Get config for current context
const config = contextConfig[props.context]

// Reference to wizard stepper
const wizardStepper = ref(null)

// Active tab tracking
const activeTabIndex = ref(0)

// Emit events to parent component
const emit = defineEmits(['update:formData', 'next', 'prev', 'complete', 'cancel'])

// Event handlers
const handleComplete = () => {
  emit('complete')
}

const handleCancel = () => {
  emit('cancel')
}

const handleNextTab = () => {
  if (activeTabIndex.value < config.steps.length - 1) {
    wizardStepper.value.nextTab()
    emit('next')
  } else {
    // Complete the wizard first, then emit complete
    // This ensures the progress bar reaches 100%
    if (wizardStepper.value && wizardStepper.value.formWizard) {
      wizardStepper.value.formWizard.value.isLastStep = true
      wizardStepper.value.completeWizard()
    }
    handleComplete()
  }
}

const handlePrevTab = () => {
  wizardStepper.value.prevTab()
  emit('prev')
}

// Helper function to update form data (for two-way binding)
const updateFormValue = (key, value) => {
  // Create a new object with the updated value
  const updatedFormData = { ...props.formData, [key]: value }
  // Emit the entire updated form data object
  emit('update:formData', updatedFormData)
}

// Field definitions with translations
const fieldDefinitions = {
  egenkontrolTitle: {
    label: 'Egenkontrol title',
    placeholder: 'En kort beskrivende title',
    required: true,
    component: 'InputComponent'
  },
  egenkontrolBeskrivelse: {
    label: 'Beskrivelse',
    placeholder: 'En dybdegående beskrivelse hjælper de ansvarlige',
    required: false,
    component: 'InputComponent'
  },
  selectedCheckliste: {
    label: 'Tjekliste i denne egenkontrol',
    placeholder: 'Vælg den tjekliste der skal fyldes ud ved kontrollen',
    required: true,
    component: 'DropdownComponent',
    options: 'checklistOptions'
  },
  selectedStartDato: {
    label: 'Start Dato',
    placeholder: 'Vælg start dato for denne egenkontrol',
    required: true,
    component: 'DatePickerComponent'
  },
  selectedEnheder: {
    label: 'Enheder tilknyttet egenkontrollen',
    placeholder: 'Vælg den/de enheder kontrollen skal udføres på',
    required: true,
    component: 'DropdownComponent',
    options: 'locationOptions'
  },
  selectedAnsvarlige: {
    label: 'Ansvarlige for at udføre kontrollen',
    placeholder: 'Vælg brugere eller grupper ansvarlige for at udføre kontrollen',
    required: true,
    component: 'DropdownComponent',
    options: 'responsibleOptions'
  },
  reminderFrekvens: {
    label: '',
    placeholder: 'Vælg frekvens',
    required: false,
    component: 'DropdownComponent',
    options: 'frekvensOptions'
  },
  reminderTidspunkt: {
    label: '',
    placeholder: 'Vælg tidspunkt',
    required: false,
    component: 'DropdownComponent',
    options: 'tidspunktOptions'
  },
  deadlineFrekvens: {
    label: '',
    placeholder: 'Vælg frekvens',
    required: false,
    component: 'DropdownComponent',
    options: 'frekvensOptions'
  },
  deadlineTidspunkt: {
    label: '',
    placeholder: 'Vælg tidspunkt',
    required: false,
    component: 'DropdownComponent',
    options: 'tidspunktOptions'
  },
  kvitteringModtager: {
    label: '',
    placeholder: 'Vælg brugere eller gruppe',
    required: false,
    component: 'DropdownComponent',
    options: 'brugerOptions'
  },
  afvigelseModtager: {
    label: '',
    placeholder: 'Vælg brugere eller gruppe',
    required: false,
    component: 'DropdownComponent',
    options: 'brugerOptions'
  }
}
</script>

<template>
  <WizardStepperComponent
    ref="wizardStepper"
    v-model:activeTabIndex="activeTabIndex"
    :stepIcons="config.stepIcons"
    @complete="handleComplete">

    <!-- Step 1: Primary Information -->
    <TabContent :title="config.steps[0].title">
      <div class="step-content">
        <h2 class="step-heading">{{ config.steps[0].heading }}</h2>
        <div class="form-group" v-for="fieldKey in config.fields.step1" :key="fieldKey">
          <InputComponent
            v-if="fieldDefinitions[fieldKey].component === 'InputComponent'"
            :label="fieldDefinitions[fieldKey].label"
            :placeholder="fieldDefinitions[fieldKey].placeholder"
            :required="fieldDefinitions[fieldKey].required"
            :modelValue="formData[fieldKey]"
            @update:modelValue="updateFormValue(fieldKey, $event)"
          />
          <DropdownComponent
            v-else-if="fieldDefinitions[fieldKey].component === 'DropdownComponent'"
            :label="fieldDefinitions[fieldKey].label"
            :placeholder="fieldDefinitions[fieldKey].placeholder"
            :required="fieldDefinitions[fieldKey].required"
            :options="config.dropdownOptions[fieldDefinitions[fieldKey].options]"
            :modelValue="formData[fieldKey]"
            @update:modelValue="updateFormValue(fieldKey, $event)"
          />
          <DatePickerComponent
            v-else-if="fieldDefinitions[fieldKey].component === 'DatePickerComponent'"
            :label="fieldDefinitions[fieldKey].label"
            :placeholder="fieldDefinitions[fieldKey].placeholder"
            :required="fieldDefinitions[fieldKey].required"
            :modelValue="formData[fieldKey]"
            @update:modelValue="updateFormValue(fieldKey, $event)"
          />
        </div>
      </div>
    </TabContent>

    <!-- Step 2: Enheder & Ansvarlige -->
    <TabContent :title="config.steps[1].title">
      <div class="step-content">
        <h2 class="step-heading">{{ config.steps[1].heading }}</h2>
        <div class="form-group" v-for="fieldKey in config.fields.step2" :key="fieldKey">
          <InputComponent
            v-if="fieldDefinitions[fieldKey].component === 'InputComponent'"
            :label="fieldDefinitions[fieldKey].label"
            :placeholder="fieldDefinitions[fieldKey].placeholder"
            :required="fieldDefinitions[fieldKey].required"
            :modelValue="formData[fieldKey]"
            @update:modelValue="updateFormValue(fieldKey, $event)"
          />
          <DropdownComponent
            v-else-if="fieldDefinitions[fieldKey].component === 'DropdownComponent'"
            :label="fieldDefinitions[fieldKey].label"
            :placeholder="fieldDefinitions[fieldKey].placeholder"
            :required="fieldDefinitions[fieldKey].required"
            :options="config.dropdownOptions[fieldDefinitions[fieldKey].options]"
            :modelValue="formData[fieldKey]"
            @update:modelValue="updateFormValue(fieldKey, $event)"
          />
          <DatePickerComponent
            v-else-if="fieldDefinitions[fieldKey].component === 'DatePickerComponent'"
            :label="fieldDefinitions[fieldKey].label"
            :placeholder="fieldDefinitions[fieldKey].placeholder"
            :required="fieldDefinitions[fieldKey].required"
            :modelValue="formData[fieldKey]"
            @update:modelValue="updateFormValue(fieldKey, $event)"
          />
        </div>
      </div>
    </TabContent>

    <!-- Step 3: Notifikationer -->
    <TabContent :title="config.steps[2].title">
      <div class="step-content">
        <h2 class="step-heading">{{ config.steps[2].heading }}</h2>

        <div class="section-group">
          <h3 class="section-label">Påmindelse før deadline</h3>
          <div class="form-row">
            <div class="form-group">
              <DropdownComponent
                placeholder="Vælg frekvens"
                :options="config.dropdownOptions.frekvensOptions"
                :modelValue="formData.reminderFrekvens"
                @update:modelValue="updateFormValue('reminderFrekvens', $event)"
              />
            </div>
            <div class="form-group">
              <DropdownComponent
                placeholder="Vælg tidspunkt"
                :options="config.dropdownOptions.tidspunktOptions"
                :modelValue="formData.reminderTidspunkt"
                @update:modelValue="updateFormValue('reminderTidspunkt', $event)"
              />
            </div>
          </div>
        </div>

        <div class="section-group">
          <h3 class="section-label">Påmindelse ved overskredet deadline</h3>
          <div class="form-row">
            <div class="form-group">
              <DropdownComponent
                placeholder="Vælg frekvens"
                :options="config.dropdownOptions.frekvensOptions"
                :modelValue="formData.deadlineFrekvens"
                @update:modelValue="updateFormValue('deadlineFrekvens', $event)"
              />
            </div>
            <div class="form-group">
              <DropdownComponent
                placeholder="Vælg tidspunkt"
                :options="config.dropdownOptions.tidspunktOptions"
                :modelValue="formData.deadlineTidspunkt"
                @update:modelValue="updateFormValue('deadlineTidspunkt', $event)"
              />
            </div>
          </div>
        </div>

        <div class="section-group">
          <h3 class="section-label">Modtager af kvittering ved udførsels</h3>
          <div class="form-group">
            <DropdownComponent
              placeholder="Vælg brugere eller gruppe"
              :options="config.dropdownOptions.brugerOptions"
              :modelValue="formData.kvitteringModtager"
              @update:modelValue="updateFormValue('kvitteringModtager', $event)"
            />
          </div>
        </div>

        <div class="section-group">
          <h3 class="section-label">Modtager af kvittering i tilfælde af afvigelser</h3>
          <div class="form-group">
            <DropdownComponent
              placeholder="Vælg brugere eller gruppe"
              :options="config.dropdownOptions.brugerOptions"
              :modelValue="formData.afvigelseModtager"
              @update:modelValue="updateFormValue('afvigelseModtager', $event)"
            />
          </div>
        </div>
      </div>
    </TabContent>

    <!-- Custom navigation knapper -->
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
            variant="primary"
            @click="handleNextTab">
            <template v-if="activeTabIndex === (config.steps.length - 1)">
              <IconPlus class="button-icon" />
              Opret
            </template>
            <template v-else>
              Næste
            </template>
          </ButtonComponent>
        </div>
      </div>
    </template>
  </WizardStepperComponent>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.form-group {
  margin-bottom: $spacing-medium-plus;
}

.step-heading {
  font-size: 1.5rem;
  margin-bottom: $spacing-medium-plus;
  font-weight: 500;
  color: $neutral-800;
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
  padding: $spacing-small $spacing-medium;
  margin-top: auto;
  width: 100%;
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

.step-content {
  padding: $spacing-small 0;
}

/* Button icon styling */
.button-icon {
  width: 1.2rem;
  height: 1.2rem;
  margin-right: $spacing-xs;
  vertical-align: middle;
  margin-top: -2px;
}
</style>
