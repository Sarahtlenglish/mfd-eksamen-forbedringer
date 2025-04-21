<script setup>
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'
import { egenkontrolFormData } from '@/mock'
import DetailPanel from '@/components/ui/panels/DetailPanelComponent.vue'
import InputComponent from '@/components/ui/InputComponent.vue'
import DropdownComponent from '@/components/ui/DropdownComponent.vue'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import DatePickerComponent from '@/components/ui/DatePickerComponent.vue'
import WizardStepperComponent from '@/components/forms/WizardStepperComponent.vue'
import { IconX, IconClipboard, IconUsers, IconBell, IconPlus } from '@tabler/icons-vue'
import { enhederStandardData } from '@/mock/data/enheder'
// Import FormWizard komponenter
import { TabContent } from 'vue3-form-wizard'
import 'vue3-form-wizard/dist/style.css'
// Import store
import { useEgenkontrolStore } from '@/stores/egenkontrolStore'

const router = useRouter()
const egenkontrolStore = useEgenkontrolStore()

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

// Reference to wizard stepper
const wizardStepper = ref(null)

// Active tab tracking
const activeTabIndex = ref(0)

// Array of step icons for the WizardStepperComponent
const stepIcons = [IconClipboard, IconUsers, IconBell]

// Datepicker format handler for display in the detail panel
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  // Danske navne for måneder
  const months = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december']
  // Formater til dansk format: "d. 17. marts 2025"
  return `Fra d. ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`
}

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

// Helper to get standard values based on selected entity or checklist
function getEnhedsStandardData(enhederLabel, tjeklisteLabel) {
  let standardInfo = enhederStandardData.defaultValues.standard
  let standardTitleInfo = enhederStandardData.defaultValues.standardTitle
  let enhederDisplay = enhederStandardData.defaultValues.displayText
  let frekvens = enhederStandardData.defaultValues.frekvens

  // Find relevant enhedsgruppe based on valgt enhed
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

  return {
    standard: standardInfo,
    standardTitle: standardTitleInfo,
    enhederDisplay,
    frekvens
  }
}

// Detail panel data
const detailItem = computed(() => {
  // Find labels for selected values
  const tjeklisteLabel = findLabel(egenkontrolFormData.checklistOptions, selectedCheckliste.value)
  // Format datoen korrekt når den er valgt
  const startDatoFormatted = selectedStartDato.value ? formatDate(selectedStartDato.value) : ''
  const enhederLabel = findLabel(egenkontrolFormData.locationOptions, selectedEnheder.value)
  const ansvarligeLabel = findLabel(egenkontrolFormData.responsibleOptions, selectedAnsvarlige.value)
  const reminderFrekvensLabel = findLabel(egenkontrolFormData.frekvensOptions, reminderFrekvens.value)
  const reminderTidspunktLabel = findLabel(egenkontrolFormData.tidspunktOptions, reminderTidspunkt.value)
  const kvitteringModtagerLabel = findLabel(egenkontrolFormData.brugerOptions, kvitteringModtager.value)
  const afvigelseModtagerLabel = findLabel(egenkontrolFormData.brugerOptions, afvigelseModtager.value)

  // Get standard values
  const { standard, standardTitle, enhederDisplay, frekvens } = getEnhedsStandardData(enhederLabel, tjeklisteLabel)

  // Vis standardværdier for eksempelvisning
  return {
    name: egenkontrolTitle.value || 'Inspektion af røgdetektore',
    title: egenkontrolTitle.value || 'Inspektion af røgdetektore',
    description: egenkontrolBeskrivelse.value || 'Røgdetektorens testknap aktiveres for at sikre, at alarmen fungerer korrekt. Batteriniveau og eventuelle fejlindikatorer gennemgås for at identificere potentielle funktionsfejl. Detektoren inspiceres for støv eller snavs, der kan reducere følsomheden.',
    checkliste: tjeklisteLabel, // Viser den valgte tjekliste direkte
    frequency: frekvens,
    startDate: startDatoFormatted || 'Fra d. 17. marts 2025',
    standard,
    standardTitle,
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

// Event handlers
const handleComplete = () => {
  // Find labels for de valgte værdier
  const tjeklisteLabel = findLabel(egenkontrolFormData.checklistOptions, selectedCheckliste.value)
  const enhederLabel = findLabel(egenkontrolFormData.locationOptions, selectedEnheder.value)
  const ansvarligeLabel = findLabel(egenkontrolFormData.responsibleOptions, selectedAnsvarlige.value) || 'Hans Christiansen'
  const reminderFrekvensLabel = findLabel(egenkontrolFormData.frekvensOptions, reminderFrekvens.value)
  const reminderTidspunktLabel = findLabel(egenkontrolFormData.tidspunktOptions, reminderTidspunkt.value)
  const kvitteringModtagerLabel = findLabel(egenkontrolFormData.brugerOptions, kvitteringModtager.value) || 'Facility'
  const afvigelseModtagerLabel = findLabel(egenkontrolFormData.brugerOptions, afvigelseModtager.value) || 'Hans Christiansen'

  // Get standard values
  const { standard, standardTitle, enhederDisplay, frekvens } = getEnhedsStandardData(enhederLabel, tjeklisteLabel)

  // Opret simpel egenkontrol med de nødvendige felter
  const nyEgenkontrol = {
    id: Math.max(...egenkontrolStore.egenkontrollerData.map(item => item.id)) + 1,
    name: egenkontrolTitle.value || 'Ny Egenkontrol',
    title: egenkontrolTitle.value || 'Ny Egenkontrol', // Detailpanelet bruger title i stedet for name nogle gange
    type: 'Egenkontrol',
    status: 'normal',
    location: enhederLabel || 'Ikke specificeret',
    enheder: enhederDisplay,
    standard,
    standardTitle,
    description: egenkontrolBeskrivelse.value || 'Ingen beskrivelse angivet',
    frequency: frekvens,
    startDate: selectedStartDato.value ? new Date(selectedStartDato.value).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    responsibleUsers: [ansvarligeLabel],
    checkliste: tjeklisteLabel,
    reminders: [
      {
        description: reminderFrekvensLabel && reminderTidspunktLabel
          ? `${reminderFrekvensLabel} kl. ${reminderTidspunktLabel}`
          : '1 dag før, kl. 09.00'
      },
      {
        description: deadlineFrekvens.value && deadlineTidspunkt.value
          ? `dagligt kl. ${deadlineTidspunkt.value} efter overskredet deadline`
          : 'dagligt kl. 09.00 efter overskredet deadline'
      }
    ],
    // Formatér modtagere som EgenkontrolDetailContent.vue forventer
    modtagere: [
      `${kvitteringModtagerLabel} modtager kvittering`,
      `${afvigelseModtagerLabel} modtager besked om afvigelser`
    ],
    // Behold deadlineNotifications for kompatibilitet med eksisterende data
    deadlineNotifications: [
      { recipient: kvitteringModtagerLabel, description: 'modtager kvittering' },
      { recipient: afvigelseModtagerLabel, description: 'modtager besked om afvigelser' }
    ]
  }

  // Tilføj til store
  egenkontrolStore.addEgenkontrol(nyEgenkontrol)

  // Naviger tilbage til oversigten
  router.push('/egenkontrol')
}

const handleCancel = () => {
  router.push('/egenkontrol')
}

const handleNextTab = () => {
  if (activeTabIndex.value < 2) {
    wizardStepper.value.nextTab()
  } else {
    handleComplete()
  }
}

const handlePrevTab = () => {
  wizardStepper.value.prevTab()
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
      <div class="form-section">
        <WizardStepperComponent
          ref="wizardStepper"
          v-model:activeTabIndex="activeTabIndex"
          :stepIcons="stepIcons"
          @complete="handleComplete">
          <!-- Step 1: Information -->
          <TabContent title="Egenkontrol Information">
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
                <DatePickerComponent
                  label="Start Dato"
                  placeholder="Vælg start dato for denne egenkontrol"
                  :required="true"
                  v-model="selectedStartDato"
                />
              </div>
            </div>
          </TabContent>

          <!-- Step 2: Enheder & Ansvarlige -->
          <TabContent title="Enheder & Ansvarlige">
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
          <TabContent title="Notifikationer">
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
                  <template v-if="activeTabIndex === 2">
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
