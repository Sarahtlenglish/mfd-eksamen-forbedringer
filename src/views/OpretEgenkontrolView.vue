<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { egenkontrolFormData } from '@/mock'
import DetailPanel from '@/components/ui/panels/DetailPanelComponent.vue'
import InputComponent from '@/components/ui/InputComponent.vue'
import DropdownComponent from '@/components/ui/DropdownComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import { IconX, IconClipboard, IconUsers, IconBell } from '@tabler/icons-vue'
import { enhederStandardData } from '@/mock/data/enheder'
// Import FormWizard komponenter
import { FormWizard, TabContent } from 'vue3-form-wizard'
import 'vue3-form-wizard/dist/style.css'

const router = useRouter()

// Form data
const egenkontrolTitle = ref('')
const egenkontrolBeskrivelse = ref('')
const selectedCheckliste = ref('')
const selectedStartDato = ref('')
const selectedEnheder = ref('')
const selectedAnsvarlige = ref('')
const reminderFrekvens = ref('')
const reminderTidspunkt = ref('')
const deadlineFrekvens = ref('')
const deadlineTidspunkt = ref('')
const kvitteringModtager = ref('')
const afvigelseModtager = ref('')

// Reference to form wizard
const formWizard = ref(null)

// Active tab tracking
const activeTabIndex = ref(0)

// Overstyring af wizard-checked-status baseret på aktivt trin
const isStepChecked = (index) => {
  return index < activeTabIndex.value
}

// Update step class when tab changes and manage checked state
const updateActiveTab = () => {
  if (formWizard.value) {
    const prevIndex = activeTabIndex.value
    activeTabIndex.value = formWizard.value.activeTabIndex
    // Update step class
    const container = document.querySelector('.wizard-container')
    if (container) {
      container.classList.remove(`step-${prevIndex}`)
      container.classList.add(`step-${activeTabIndex.value}`)
    }
    // Update checked state for steps
    const steps = document.querySelectorAll('.wizard-nav-item')
    steps.forEach((step, idx) => {
      if (idx < activeTabIndex.value) {
        step.classList.add('checked')
      } else if (idx > activeTabIndex.value) {
        step.classList.remove('checked')
      }
    })
  }
}

// Detail panel data
const detailItem = computed(() => {
  // Find labels for selected values
  const tjeklisteLabel = findLabel(egenkontrolFormData.checklistOptions, selectedCheckliste.value)
  const startDatoLabel = findLabel(egenkontrolFormData.dateOptions, selectedStartDato.value)
  const enhederLabel = findLabel(egenkontrolFormData.locationOptions, selectedEnheder.value)
  const ansvarligeLabel = findLabel(egenkontrolFormData.responsibleOptions, selectedAnsvarlige.value)
  const reminderFrekvensLabel = findLabel(egenkontrolFormData.frekvensOptions, reminderFrekvens.value)
  const reminderTidspunktLabel = findLabel(egenkontrolFormData.tidspunktOptions, reminderTidspunkt.value)
  const kvitteringModtagerLabel = findLabel(egenkontrolFormData.brugerOptions, kvitteringModtager.value)
  const afvigelseModtagerLabel = findLabel(egenkontrolFormData.brugerOptions, afvigelseModtager.value)

  // Bestem standard/tjekliste baseret på valgte enheder
  let standardInfo = enhederStandardData.defaultValues.standard
  let standardTitleInfo = enhederStandardData.defaultValues.standardTitle
  let enhederDisplay = enhederStandardData.defaultValues.displayText
  let frekvens = enhederStandardData.defaultValues.frekvens

  // Find relevant enhedsgruppe baseret på valgt enhed
  let enhedsGruppe = null

  // Tjek om der er valgt en enhed
  if (enhederLabel) {
    // Find den passende gruppe baseret på label
    for (const key in enhederStandardData.enhederGrupper) {
      if (enhederLabel.includes(key)) {
        enhedsGruppe = enhederStandardData.enhederGrupper[key]
        break
      }
    }
  } else if (tjeklisteLabel) {
    // Find matchende nøgle i tjeklisteMapping
    for (const key in enhederStandardData.tjeklisteMapping) {
      if (tjeklisteLabel.includes(key)) {
        const gruppeKey = enhederStandardData.tjeklisteMapping[key]
        if (enhederStandardData.enhederGrupper[gruppeKey]) {
          enhedsGruppe = enhederStandardData.enhederGrupper[gruppeKey]
        }
        break
      }
    }
  }

  // Anvend data fra den fundne gruppe, hvis fundet
  if (enhedsGruppe) {
    standardInfo = enhedsGruppe.standard
    standardTitleInfo = enhedsGruppe.standardTitle
    // Kun opdater enhederDisplay hvis der er valgt en enhed, ellers behold defaultværdi
    if (enhederLabel) {
      enhederDisplay = enhedsGruppe.displayText
    }
    frekvens = enhedsGruppe.frekvens
  }

  // Vis standardværdier for eksempelvisning
  return {
    name: egenkontrolTitle.value || 'Inspektion af røgdetektore',
    title: egenkontrolTitle.value || 'Inspektion af røgdetektore',
    description: egenkontrolBeskrivelse.value || 'Røgdetektorens testknap aktiveres for at sikre, at alarmen fungerer korrekt. Batteriniveau og eventuelle fejlindikatorer gennemgås for at identificere potentielle funktionsfejl. Detektoren inspiceres for støv eller snavs, der kan reducere følsomheden.',
    checkliste: tjeklisteLabel, // Viser den valgte tjekliste direkte
    frequency: frekvens,
    startDate: startDatoLabel || 'Fra d. 17/03/2025',
    standard: standardInfo,
    standardTitle: standardTitleInfo,
    responsibleUsers: [ansvarligeLabel || 'Hans Christiansen'],
    enheder: enhederDisplay, // Viser den valgte enhedsgruppe
    ansvarlige: 'Ansvarlige',
    ansvarligeGruppe: 'Facility (Gruppe)',
    reminders: [
      reminderFrekvensLabel && reminderTidspunktLabel ? `${reminderFrekvensLabel} kl. ${reminderTidspunktLabel}` : '1 dag før, kl. 09.00',
      deadlineFrekvens.value && deadlineTidspunkt.value ? `dagligt kl. ${deadlineTidspunkt.value} efter overskredet deadline` : 'dagligt kl. 09.00 efter overskredet deadline'
    ],
    modtagere: [
      kvitteringModtagerLabel ? `${kvitteringModtagerLabel} modtager kvittering` : 'Facility modtager kvittering',
      afvigelseModtagerLabel ? `${afvigelseModtagerLabel} modtager besked om afvigelser` : 'Hans Christiansen modtager besked om afvigelser'
    ]
  }
})

// Hjælpefunktion til at finde labels
function findLabel(options, value) {
  if (!value) return ''
  const option = options.find((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return opt.value === value
    }
    return opt === value
  })
  return option && typeof option === 'object' ? option.label : option
}

// Event handlers
const handleComplete = () => {
  alert('Egenkontrol oprettet!')
  router.push('/egenkontrol')
}

const handleCancel = () => {
  router.push('/egenkontrol')
}

const handleNextTab = () => {
  if (formWizard.value) {
    if (activeTabIndex.value < 2) {
      formWizard.value.nextTab()
    } else {
      handleComplete()
    }
    updateActiveTab()
  }
}

const handlePrevTab = () => {
  if (formWizard.value) {
    formWizard.value.prevTab()
  }
}

// Initialiser step-klasse ved mount
onMounted(() => {
  document.querySelector('.wizard-container').classList.add(`step-${activeTabIndex.value}`)
})
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
      <div class="form-section">
        <div class="wizard-container">
          <FormWizard
            ref="formWizard"
            shape="circle"
            color="#4B97C0"
            @on-complete="handleComplete"
            @on-change="updateActiveTab"
            :hide-buttons="true"
            :subtitle="false"
            stepSize="md"
            backButtonText="Tilbage"
            nextButtonText="Næste"
            finishButtonText="Opret">
            <!-- Add a custom class to track current step -->
            <template v-slot:wizard="props">
              <div :class="['wizard-navigation-container', `step-${activeTabIndex}`]">
                <div class="wizard-nav">
                  <slot name="step" v-for="tab in props.tabs" :tab="tab" :index="tab.index" :transition="props.transition"></slot>
                </div>
                <slot name="content" :transition="props.transition"></slot>
              </div>
            </template>

            <!-- Custom step styling -->
            <template v-slot:step="props">
              <div
                class="custom-step-container"
                :class="{
                  'active': props.tab.active,
                  'checked': isStepChecked(props.index)
                }">
                <div class="custom-icon-container">
                  <IconClipboard v-if="props.index === 0" />
                  <IconUsers v-if="props.index === 1" />
                  <IconBell v-if="props.index === 2" />
                </div>
                <div class="step-title">{{ props.tab.title }}</div>
              </div>
            </template>

            <!-- Step 1: Information -->
            <TabContent
              title="Egenkontrol Information">
              <div class="step-content">
                <h2 class="step-heading">Udfyld information for egenkontrollen</h2>
                <div class="form-group">
                  <InputComponent
                    label="Egenkontrol title"
                    placeholder="En kort beskrivende title"
                    :required="true"
                    v-model="egenkontrolTitle"
                  />
                </div>

                <div class="form-group">
                  <InputComponent
                    label="Beskrivelse"
                    placeholder="En dybdegående beskrivelse hjælper de ansvarlige"
                    v-model="egenkontrolBeskrivelse"
                  />
                </div>

                <div class="form-group">
                  <DropdownComponent
                    label="Tjekliste i denne egenkontrol"
                    placeholder="Vælg den tjekliste der skal fyldes ud ved kontrollen"
                    :required="true"
                    :options="egenkontrolFormData.checklistOptions"
                    v-model="selectedCheckliste"
                  />
                </div>

                <div class="form-group">
                  <DropdownComponent
                    label="Start Dato"
                    placeholder="Vælg start dato for denne egenkontrol"
                    :required="true"
                    :options="egenkontrolFormData.dateOptions"
                    v-model="selectedStartDato"
                  />
                </div>
              </div>
            </TabContent>

            <!-- Step 2: Enheder & Ansvarlige -->
            <TabContent
              title="Enheder & Ansvarlige">
              <div class="step-content">
                <h2 class="step-heading">Enheder og ansvarlige</h2>
                <div class="form-group">
                  <DropdownComponent
                    label="Enheder tilknyttet egenkontrollen"
                    placeholder="Vælg den/de enheder kontrollen skal udføres på"
                    :required="true"
                    :options="egenkontrolFormData.locationOptions"
                    v-model="selectedEnheder"
                  />
                </div>

                <div class="form-group">
                  <DropdownComponent
                    label="Ansvarlige for at udføre kontrollen"
                    placeholder="Vælg brugere eller grupper ansvarlige for at udføre kontrollen"
                    :required="true"
                    :options="egenkontrolFormData.responsibleOptions"
                    v-model="selectedAnsvarlige"
                  />
                </div>
              </div>
            </TabContent>

            <!-- Step 3: Notifikationer -->
            <TabContent
              title="Notifikationer">
              <div class="step-content">
                <h2 class="step-heading">Notifikations indstillinger for egenkontrollen</h2>
                <div class="section-group">
                  <h3 class="section-label">Påmindelse før deadline</h3>
                  <div class="form-row">
                    <div class="form-group">
                      <DropdownComponent
                        placeholder="Vælg frekvens"
                        :options="egenkontrolFormData.frekvensOptions"
                        v-model="reminderFrekvens"
                      />
                    </div>
                    <div class="form-group">
                      <DropdownComponent
                        placeholder="Vælg tidspunkt"
                        :options="egenkontrolFormData.tidspunktOptions"
                        v-model="reminderTidspunkt"
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
                        :options="egenkontrolFormData.frekvensOptions"
                        v-model="deadlineFrekvens"
                      />
                    </div>
                    <div class="form-group">
                      <DropdownComponent
                        placeholder="Vælg tidspunkt"
                        :options="egenkontrolFormData.tidspunktOptions"
                        v-model="deadlineTidspunkt"
                      />
                    </div>
                  </div>
                </div>

                <div class="section-group">
                  <h3 class="section-label">Modtager af kvittering ved udførsels</h3>
                  <div class="form-group">
                    <DropdownComponent
                      placeholder="Vælg brugere eller gruppe"
                      :options="egenkontrolFormData.brugerOptions"
                      v-model="kvitteringModtager"
                    />
                  </div>
                </div>

                <div class="section-group">
                  <h3 class="section-label">Modtager af kvittering i tilfælde af afvigelser</h3>
                  <div class="form-group">
                    <DropdownComponent
                      placeholder="Vælg brugere eller gruppe"
                      :options="egenkontrolFormData.brugerOptions"
                      v-model="afvigelseModtager"
                    />
                  </div>
                </div>
              </div>
            </TabContent>
          </FormWizard>
          <!-- Custom navigation knapper -->
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
                {{ activeTabIndex === 2 ? 'Opret' : 'Næste' }}
              </ButtonComponent>
            </div>
          </div>
        </div>
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

  .form-section {
    min-width: 66%;
    padding: 0;
    border: none;
  }
}

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
  border-top: 1px solid $neutral-300;
}

.wizard-footer-left,
.wizard-footer-right {
  display: flex;
  gap: $spacing-xlarge;
  align-items: center;
}

.tilbage-button {
  font-weight: 500;
}

/* Wizard Card Styling */
:deep(.wizard-card) {
  background-color: transparent;
  box-shadow: none;
  padding: 0;
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Navigation/Steps styling */
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

/* Progress line styling - very simple approach */
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

/* Step width classes that will be added dynamically based on activeTabIndex */
.step-0 :deep(.wizard-nav)::after {
  width: 0%;
}

.step-1 :deep(.wizard-nav)::after {
  width: 30%;
}

.step-2 :deep(.wizard-nav)::after {
  width: 60%;
}

/* Fjern de redundante CSS regler der nu ikke længere bruges */
:deep(.wizard-nav-item) {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

/* Kun behold de nødvendige skjul-regler */
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

/* Remove the custom connector lines since we're using the wizard's default line */
.custom-step-container:not(:last-child)::after {
  display: none;
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
}

.custom-icon-container svg {
  width: 33px;
  height: 33px;
  stroke: $neutral-600;
  stroke-width: 2;
}

/* Styling for active and completed steps - using only secondary-50 for active as shown in screenshots */
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

/* Remove special text color styling to match screenshots */
.custom-step-container.active .step-title,
.custom-step-container.checked .step-title {
  color: $neutral-700;
  font-weight: 400;
}

/* Responsive adjustments */
@media (max-width: $tablet) {
  :deep(.wizard-nav) {
    flex-direction: column;
    align-items: center;
    gap: $spacing-xlarge;
    padding: $spacing-medium 0;
  }

  :deep(.wizard-nav)::before {
    width: 2px;
    height: 100%;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  .custom-step-container {
    margin-bottom: $spacing-medium;
  }
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
  display: none !important; /* Hide default buttons, we use our own */
}

.step-content {
  padding: $spacing-small 0;
}
</style>
