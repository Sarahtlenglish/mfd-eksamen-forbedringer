/**
 * WizardFormConfig
 * Centraliseret konfiguration for formular wizards i forskellige kontekster.
 */

import { IconClipboard, IconUsers, IconBell, IconChecklist } from '@tabler/icons-vue'
import InputComponent from '@/components/ui/InputComponent.vue'
import DropdownComponent from '@/components/ui/DropdownComponent.vue'
import DatePickerComponent from '@/components/ui/DatePickerComponent.vue'
import { egenkontrolFormData } from '@/mock/data/egenkontrol'

/**
 * Henter konfiguration for den specificerede formulartype
 * @param {string} context - Formulartype ('egenkontroller', 'tjeklister')
 * @param {Object} options - Mulighed for at override standardværdier
 * @returns {Object} Konfiguration til brug i WizardFormComponent
 */
export function getWizardConfig(context, options = {}) {
  const mockData = options.mockData || {}

  // Definition af alle formularfelter
  const fieldDefinitions = {
    // Generelle felter
    title: {
      label: 'Titel',
      placeholder: 'Angiv en titel',
      required: true,
      component: InputComponent
    },
    name: {
      label: 'Navn',
      placeholder: 'Angiv et navn',
      required: true,
      component: InputComponent
    },
    description: {
      label: 'Beskrivelse',
      placeholder: 'En dybdegående beskrivelse hjælper de ansvarlige',
      required: false,
      component: InputComponent
    },
    startDate: {
      label: 'Start Dato',
      placeholder: 'Vælg start dato',
      required: true,
      component: DatePickerComponent
    },

    // Egenkontrol-specifikke felter
    selectedCheckliste: {
      label: 'Tjekliste',
      placeholder: 'Vælg den tjekliste der skal fyldes ud ved kontrollen',
      required: true,
      component: DropdownComponent,
      options: 'checklistOptions'
    },
    selectedEnheder: {
      label: 'Enheder',
      placeholder: 'Vælg den/de enheder kontrollen skal udføres på',
      required: true,
      component: DropdownComponent,
      options: 'locationOptions'
    },
    selectedAnsvarlige: {
      label: 'Ansvarlige',
      placeholder: 'Vælg brugere eller grupper ansvarlige for at udføre kontrollen',
      required: true,
      component: DropdownComponent,
      options: 'responsibleOptions'
    },
    reminderFrekvens: {
      placeholder: 'Vælg frekvens',
      required: false,
      component: DropdownComponent,
      options: 'frekvensOptions'
    },
    reminderTidspunkt: {
      placeholder: 'Vælg tidspunkt',
      required: false,
      component: DropdownComponent,
      options: 'tidspunktOptions'
    },
    deadlineFrekvens: {
      placeholder: 'Vælg frekvens',
      required: false,
      component: DropdownComponent,
      options: 'frekvensOptions'
    },
    deadlineTidspunkt: {
      placeholder: 'Vælg tidspunkt',
      required: false,
      component: DropdownComponent,
      options: 'tidspunktOptions'
    },
    kvitteringModtager: {
      placeholder: 'Vælg brugere eller gruppe',
      required: false,
      component: DropdownComponent,
      options: 'brugerOptions'
    },
    afvigelseModtager: {
      placeholder: 'Vælg brugere eller gruppe',
      required: false,
      component: DropdownComponent,
      options: 'brugerOptions'
    },

    // Tjekliste-specifikke felter
    type: {
      label: 'Type',
      placeholder: 'Vælg type',
      required: true,
      component: DropdownComponent,
      options: 'tjeklisteTypeOptions'
    },
    frekvens: {
      label: 'Frekvens',
      placeholder: 'Vælg frekvens',
      required: true,
      component: DropdownComponent,
      options: 'frekvensOptions'
    }
  }

  // Konfigurationer for forskellige formulartyper
  const configs = {
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
        step1: ['title', 'description', 'selectedCheckliste', 'startDate'],
        step2: ['selectedEnheder', 'selectedAnsvarlige'],
        step3: ['reminderFrekvens', 'reminderTidspunkt', 'deadlineFrekvens', 'deadlineTidspunkt', 'kvitteringModtager', 'afvigelseModtager']
      },
      step3Groups: [
        {
          label: 'Påmindelse før deadline',
          fields: ['reminderFrekvens', 'reminderTidspunkt']
        },
        {
          label: 'Påmindelse ved overskredet deadline',
          fields: ['deadlineFrekvens', 'deadlineTidspunkt']
        },
        {
          label: 'Modtager af kvittering ved udførsels',
          fields: ['kvitteringModtager']
        },
        {
          label: 'Modtager af kvittering i tilfælde af afvigelser',
          fields: ['afvigelseModtager']
        }
      ],
      fieldDefinitions,
      dropdownOptions: mockData.egenkontroller || {}
    },

    tjeklister: {
      stepIcons: [IconChecklist, IconBell],
      steps: [
        {
          title: 'Tjekliste Information',
          heading: 'Udfyld information for tjeklisten'
        },
        {
          title: 'Frekvens',
          heading: 'Vælg frekvens for tjeklisten'
        }
      ],
      fields: {
        step1: ['name', 'description', 'type'],
        step2: ['frekvens']
      },
      fieldDefinitions,
      dropdownOptions: mockData.tjeklister || {}
    }
  }

  return configs[context] || configs.egenkontroller
}

/**
 * Konverterer formulardata til et format til visning i DetailPanel
 * @param {string} context - Formulartype
 * @param {Object} formData - Brugerinput fra formularen
 * @returns {Object} Formateret objekt til DetailPanel
 */
export function prepareDetailItem(context, formData) {
  // Find label baseret på værdi fra dropdown-options
  const findLabel = (options, value) => {
    if (!options || !value) return value || 'Ikke valgt'
    const option = options.find(opt => opt.value === value)
    return option ? option.label : value
  }

  // Basis-information til alle typer
  const baseDetailItem = {
    title: formData.title || formData.name || 'Ny Item',
    name: formData.title || formData.name || 'Ny Item',
    description: formData.description || 'Ingen beskrivelse angivet',
    startDate: formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  }

  // Tilføj kontekst-specifik information
  switch (context) {
    case 'egenkontroller': {
      const reminderFrekvens = findLabel(egenkontrolFormData.frekvensOptions, formData.reminderFrekvens)
      const reminderTidspunkt = findLabel(egenkontrolFormData.tidspunktOptions, formData.reminderTidspunkt)
      const deadlineFrekvens = findLabel(egenkontrolFormData.frekvensOptions, formData.deadlineFrekvens)
      const deadlineTidspunkt = findLabel(egenkontrolFormData.tidspunktOptions, formData.deadlineTidspunkt)

      return {
        ...baseDetailItem,
        type: 'Egenkontrol',
        status: 'normal',
        location: findLabel(egenkontrolFormData.locationOptions, formData.selectedEnheder),
        checkliste: findLabel(egenkontrolFormData.checklistOptions, formData.selectedCheckliste),
        responsibleUsers: [findLabel(egenkontrolFormData.responsibleOptions, formData.selectedAnsvarlige)],
        reminders: [
          { description: `${reminderFrekvens} kl. ${reminderTidspunkt}` },
          { description: `${deadlineFrekvens} kl. ${deadlineTidspunkt} efter overskredet deadline` }
        ],
        modtagere: [
          `${findLabel(egenkontrolFormData.brugerOptions, formData.kvitteringModtager)} modtager kvittering`,
          `${findLabel(egenkontrolFormData.brugerOptions, formData.afvigelseModtager)} modtager besked om afvigelser`
        ]
      }
    }

    case 'tjeklister': {
      return {
        ...baseDetailItem,
        tjekliste: formData.name || 'Ny tjekliste',
        type: formData.type || 'Standard',
        status: 'normal',
        frequency: findLabel(egenkontrolFormData.frekvensOptions, formData.frekvens) || 'Ikke valgt'
      }
    }

    default:
      return baseDetailItem
  }
}
