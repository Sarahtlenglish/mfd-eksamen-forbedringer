import { ref, computed } from 'vue'
import { egenkontrolFormData } from '@/mock'
import { enhederStandardData } from '@/mock/data/enheder'

// Format handler for dates in the detail panel
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  // Danish month names
  const months = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december']
  // Format to Danish format: "d. 17. marts 2025"
  return `Fra d. ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`
}

// Helper function to find labels
export function findLabel(options, value) {
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
export function getEnhedsStandardData(enhederLabel, tjeklisteLabel) {
  let standardInfo = enhederStandardData.defaultValues.standard
  let standardTitleInfo = enhederStandardData.defaultValues.standardTitle
  let enhederDisplay = enhederStandardData.defaultValues.displayText
  let frekvens = enhederStandardData.defaultValues.frekvens

  // Find relevant enhedsgruppe based on valgt enhed
  let enhedsGruppe = null

  // Check if an entity is selected
  if (enhederLabel) {
    // Find the appropriate group based on label
    for (const key in enhederStandardData.enhederGrupper) {
      if (enhederLabel.includes(key)) {
        enhedsGruppe = enhederStandardData.enhederGrupper[key]
        break
      }
    }
  } else if (tjeklisteLabel) {
    // Find matching key in tjeklisteMapping
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

  // Apply data from the found group, if found
  if (enhedsGruppe) {
    standardInfo = enhedsGruppe.standard
    standardTitleInfo = enhedsGruppe.standardTitle
    // Only update enhederDisplay if an entity is selected, otherwise keep default value
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

// Create a composable for the egenkontrol form
export function useEgenkontrolForm() {
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

  // Helper function to update all ref values from a form data object
  const updateDetailItem = (formData) => {
    if (!formData) return

    // Update each ref with corresponding formData values
    egenkontrolTitle.value = formData.egenkontrolTitle
    egenkontrolBeskrivelse.value = formData.egenkontrolBeskrivelse
    selectedCheckliste.value = formData.selectedCheckliste
    selectedStartDato.value = formData.selectedStartDato
    selectedEnheder.value = formData.selectedEnheder
    selectedAnsvarlige.value = formData.selectedAnsvarlige
    reminderFrekvens.value = formData.reminderFrekvens
    reminderTidspunkt.value = formData.reminderTidspunkt
    deadlineFrekvens.value = formData.deadlineFrekvens
    deadlineTidspunkt.value = formData.deadlineTidspunkt
    kvitteringModtager.value = formData.kvitteringModtager
    afvigelseModtager.value = formData.afvigelseModtager
  }

  // Detail panel data computed property
  const detailItem = computed(() => {
    // Find labels for selected values
    const tjeklisteLabel = findLabel(egenkontrolFormData.checklistOptions, selectedCheckliste.value)
    // Format the date correctly when selected
    const startDatoFormatted = selectedStartDato.value ? formatDate(selectedStartDato.value) : ''
    const enhederLabel = findLabel(egenkontrolFormData.locationOptions, selectedEnheder.value)
    const ansvarligeLabel = findLabel(egenkontrolFormData.responsibleOptions, selectedAnsvarlige.value)
    const reminderFrekvensLabel = findLabel(egenkontrolFormData.frekvensOptions, reminderFrekvens.value)
    const reminderTidspunktLabel = findLabel(egenkontrolFormData.tidspunktOptions, reminderTidspunkt.value)
    const kvitteringModtagerLabel = findLabel(egenkontrolFormData.brugerOptions, kvitteringModtager.value)
    const afvigelseModtagerLabel = findLabel(egenkontrolFormData.brugerOptions, afvigelseModtager.value)

    // Get standard values
    const { standard, standardTitle, enhederDisplay, frekvens } = getEnhedsStandardData(enhederLabel, tjeklisteLabel)

    // Display standard values for preview
    return {
      name: egenkontrolTitle.value || 'Inspektion af røgdetektore',
      title: egenkontrolTitle.value || 'Inspektion af røgdetektore',
      description: egenkontrolBeskrivelse.value || 'Røgdetektorens testknap aktiveres for at sikre, at alarmen fungerer korrekt. Batteriniveau og eventuelle fejlindikatorer gennemgås for at identificere potentielle funktionsfejl. Detektoren inspiceres for støv eller snavs, der kan reducere følsomheden.',
      checkliste: tjeklisteLabel, // Shows the selected checklist directly
      frequency: frekvens,
      startDate: startDatoFormatted || 'Fra d. 17. marts 2025',
      standard,
      standardTitle,
      responsibleUsers: [ansvarligeLabel || 'Hans Christiansen'],
      enheder: enhederDisplay, // Shows the selected entity group
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

  // Helper function to prepare egenkontrol data for store
  const prepareEgenkontrolData = () => {
    // Find labels for selected values
    const tjeklisteLabel = findLabel(egenkontrolFormData.checklistOptions, selectedCheckliste.value)
    const enhederLabel = findLabel(egenkontrolFormData.locationOptions, selectedEnheder.value)
    const ansvarligeLabel = findLabel(egenkontrolFormData.responsibleOptions, selectedAnsvarlige.value) || 'Hans Christiansen'
    const reminderFrekvensLabel = findLabel(egenkontrolFormData.frekvensOptions, reminderFrekvens.value)
    const reminderTidspunktLabel = findLabel(egenkontrolFormData.tidspunktOptions, reminderTidspunkt.value)
    const kvitteringModtagerLabel = findLabel(egenkontrolFormData.brugerOptions, kvitteringModtager.value) || 'Facility'
    const afvigelseModtagerLabel = findLabel(egenkontrolFormData.brugerOptions, afvigelseModtager.value) || 'Hans Christiansen'

    // Get standard values
    const { standard, standardTitle, enhederDisplay, frekvens } = getEnhedsStandardData(enhederLabel, tjeklisteLabel)

    return {
      name: egenkontrolTitle.value || 'Ny Egenkontrol',
      title: egenkontrolTitle.value || 'Ny Egenkontrol',
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
      // Format recipients as EgenkontrolDetailContent.vue expects
      modtagere: [
        `${kvitteringModtagerLabel} modtager kvittering`,
        `${afvigelseModtagerLabel} modtager besked om afvigelser`
      ],
      // Keep deadlineNotifications for compatibility with existing data
      deadlineNotifications: [
        { recipient: kvitteringModtagerLabel, description: 'modtager kvittering' },
        { recipient: afvigelseModtagerLabel, description: 'modtager besked om afvigelser' }
      ]
    }
  }

  return {
    // Form data
    egenkontrolTitle,
    egenkontrolBeskrivelse,
    selectedCheckliste,
    selectedStartDato,
    selectedEnheder,
    selectedAnsvarlige,
    reminderFrekvens,
    reminderTidspunkt,
    deadlineFrekvens,
    deadlineTidspunkt,
    kvitteringModtager,
    afvigelseModtager,
    // Computed properties
    detailItem,
    // Helper functions
    prepareEgenkontrolData,
    updateDetailItem
  }
}
