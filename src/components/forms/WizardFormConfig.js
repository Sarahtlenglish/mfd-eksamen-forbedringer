/**
 * WizardFormConfig
 * Centraliseret konfiguration for formular wizards i forskellige kontekster.
 */

import { IconClipboard, IconUsers, IconBell, IconChecklist, IconBuilding, IconStack } from '@tabler/icons-vue'
import InputComponent from '@/components/ui/InputComponent.vue'
import DropdownComponent from '@/components/ui/DropdownComponent.vue'
import DatePickerComponent from '@/components/ui/DatePickerComponent.vue'
import UnderenhederListComponent from '@/components/forms/UnderenhederListComponent.vue'
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
    },

    // Enhed-specifikke felter
    enhedType: {
      label: 'Opret singel eller gruppe enhed',
      placeholder: 'Vælg type',
      required: true,
      component: DropdownComponent,
      options: 'enhedTypeOptions'
    },
    enhedNavn: {
      label: 'Enheds navn',
      placeholder: 'Angiv et navn',
      required: true,
      component: InputComponent
    },
    beskrivelse: {
      label: 'Beskrivelse',
      placeholder: 'Angiv beskrivelse af enheden',
      required: true,
      component: InputComponent
    },
    location: {
      label: 'Hvor befinder enheden sig?',
      placeholder: 'Vælg lokation',
      required: true,
      component: DropdownComponent,
      options: 'locationOptions'
    },
    gruppeTitel: {
      label: 'Gruppens titel - bruges som prefix til underenheder',
      placeholder: 'Angiv gruppens titel',
      required: true,
      component: InputComponent
    },
    gruppeBeskrivelse: {
      label: 'Beskrivelse',
      placeholder: 'Angiv beskrivelse af gruppen',
      required: false,
      component: InputComponent
    },
    underenheder: {
      label: 'Underenheder',
      placeholder: 'Tilføj underenheder',
      required: true,
      component: UnderenhederListComponent
    },

    // Bruger-specifikke felter
    brugername: {
      label: 'Navn',
      placeholder: 'Angiv brugerens navn',
      required: true,
      component: InputComponent
    },
    role: {
      label: 'Rolle',
      placeholder: 'Vælg brugerens rolle',
      required: true,
      component: DropdownComponent,
      options: 'roleOptions'
    },
    ansvarlig_for_egenkontrol: {
      label: 'Ansvarlig for',
      placeholder: 'Vælg egenkontrol-ansvar',
      required: false,
      component: DropdownComponent,
      options: 'egenkontrolOptions'
    },
    leder: {
      label: 'Nærmeste leder',
      placeholder: 'Vælg nærmeste leder',
      required: false,
      component: DropdownComponent,
      options: 'lederOptions'
    },
    adresse: {
      label: 'Adresse',
      placeholder: 'Angiv adresse',
      required: false,
      component: InputComponent
    },
    postnummer: {
      label: 'Postnummer',
      placeholder: 'Angiv postnummer',
      required: false,
      component: InputComponent
    },
    by: {
      label: 'By',
      placeholder: 'Angiv by',
      required: false,
      component: InputComponent
    },
    email: {
      label: 'Email',
      placeholder: 'Angiv email',
      required: true,
      component: InputComponent
    },
    telefon: {
      label: 'Telefon',
      placeholder: 'Angiv telefonnummer',
      required: false,
      component: InputComponent
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
    },

    // Configuration for enheder
    enheder: {
      stepIcons: [IconBuilding, IconStack],
      steps: [
        {
          title: 'Enheds Information',
          heading: 'Udfyld informationen for enheden'
        }
      ],
      fields: {
        step1: ['enhedType', 'enhedNavn', 'beskrivelse', 'location']
      },
      fieldDefinitions,
      dropdownOptions: mockData.enheder || {
        locationOptions: [
          { value: 'bygningA', label: 'Bygning A' },
          { value: 'bygningB', label: 'Bygning B' },
          { value: 'bygningC', label: 'Bygning C' }
        ],
        enhedTypeOptions: [
          { value: 'single', label: 'Single' },
          { value: 'gruppe', label: 'Gruppe' }
        ]
      }
    },
    // Configuration for brugere (users)
    brugere: {
      stepIcons: [IconClipboard, IconUsers, IconBell],
      steps: [
        {
          title: 'Arbejdsfunktioner',
          heading: 'Udfyld brugerens arbejdsfunktioner'
        },
        {
          title: 'Personlige oplysninger',
          heading: 'Udfyld brugerens personlige oplysninger'
        },
        {
          title: 'Kontakt oplysninger',
          heading: 'Udfyld brugerens kontakt oplysninger'
        }
      ],
      fields: {
        step1: ['name', 'role', 'ansvarlig_for_egenkontrol', 'leder'],
        step2: ['adresse', 'postnummer', 'by'],
        step3: ['email', 'telefon']
      },
      fieldDefinitions,
      dropdownOptions: mockData.brugere || {
        roleOptions: [
          { value: 'service_bruger', label: 'Service Bruger' },
          { value: 'facility_manager', label: 'Facility Manager' },
          { value: 'administrator', label: 'Administrator' },
          { value: 'visnings_bruger', label: 'Visnings Bruger' }
        ],
        lederOptions: [
          { value: 'christian_hansen', label: 'Christian Hansen' },
          { value: 'anders_jensen', label: 'Anders Jensen' },
          { value: 'tanja_lund', label: 'Tanja Lund' }
        ],
        egenkontrolOptions: [
          { value: 'egenkontrol_1', label: 'Egenkontrol 1' },
          { value: 'egenkontrol_2', label: 'Egenkontrol 2' },
          { value: 'egenkontrol_3', label: 'Egenkontrol 3' }
        ]
      }
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

    // Case for enheder
    case 'enheder': {
      // Afhængig af type ('singel' eller 'gruppe')
      if (formData.enhedType === 'gruppe') {
        return {
          ...baseDetailItem,
          title: formData.gruppeTitel || 'Ny gruppeenhed',
          name: formData.gruppeTitel || 'Ny gruppeenhed',
          description: formData.gruppeBeskrivelse || 'Ingen beskrivelse angivet',
          type: 'Gruppe',
          status: 'normal',
          location: findLabel([
            { value: 'bygningA', label: 'Bygning A' },
            { value: 'bygningB', label: 'Bygning B' },
            { value: 'bygningC', label: 'Bygning C' }
          ], formData.location),
          underenheder: formData.underenheder || []
        }
      } else {
        return {
          ...baseDetailItem,
          title: formData.enhedNavn || 'Ny enhed',
          name: formData.enhedNavn || 'Ny enhed',
          description: formData.beskrivelse || 'Ingen beskrivelse angivet',
          type: 'Enkelt Enhed',
          status: 'normal',
          location: findLabel([
            { value: 'bygningA', label: 'Bygning A' },
            { value: 'bygningB', label: 'Bygning B' },
            { value: 'bygningC', label: 'Bygning C' }
          ], formData.location)
        }
      }
    }
    // Add to prepareDetailItem function:
    case 'brugere': {
      return {
        ...baseDetailItem,
        name: formData.name || 'Ny Bruger',
        role: findLabel([
          { value: 'service_bruger', label: 'Service Bruger' },
          { value: 'facility_manager', label: 'Facility Manager' },
          { value: 'administrator', label: 'Administrator' },
          { value: 'visnings_bruger', label: 'Visnings Bruger' }
        ], formData.role) || 'Ikke valgt',
        ansvarlig_for_egenkontrol: findLabel([
          { value: 'egenkontrol_1', label: 'Egenkontrol 1' },
          { value: 'egenkontrol_2', label: 'Egenkontrol 2' },
          { value: 'egenkontrol_3', label: 'Egenkontrol 3' }
        ], formData.ansvarlig_for_egenkontrol) || '-',
        leder: findLabel([
          { value: 'christian_hansen', label: 'Christian Hansen' },
          { value: 'anders_jensen', label: 'Anders Jensen' },
          { value: 'tanja_lund', label: 'Tanja Lund' }
        ], formData.leder) || '-',
        adresse: formData.adresse || 'Ikke angivet',
        postnummer: formData.postnummer || '',
        by: formData.by || '',
        email: formData.email || 'Ikke angivet',
        telefon: formData.telefon || 'Ikke angivet',
        gruppe: 'Tilhører ingen gruppe endnu',
        status: 'normal'
      }
    }

    default:
      return baseDetailItem
  }
}
