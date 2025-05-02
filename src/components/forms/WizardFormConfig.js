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
import { egenkontrolConfig } from '@/config/egenkontrolConfig'

/**
 * Henter konfiguration for den specificerede formulartype
 * @param {string} context - Formulartype ('egenkontroller', 'tjeklister')
 * @param {Object} options - Mulighed for at override standardværdier
 * @returns {Object} Konfiguration til brug i WizardFormComponent
 */
export function getWizardConfig(context, options = {}) {
  const fieldDefinitions = {
    // Generelle felter
    navn: {
      label: 'Navn',
      placeholder: 'Angiv et navn',
      required: true,
      component: InputComponent
    },
    beskrivelse: {
      label: 'Beskrivelse',
      placeholder: 'En dybdegående beskrivelse hjælper de ansvarlige',
      required: false,
      component: InputComponent
    },
    startDato: {
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
      label: 'Frekvens',
      placeholder: 'Vælg frekvens',
      required: false,
      component: DropdownComponent,
      options: 'frekvensOptions'
    },
    reminderTidspunkt: {
      label: 'Tidspunkt',
      placeholder: 'Vælg tidspunkt',
      required: false,
      component: DropdownComponent,
      options: 'tidspunktOptions'
    },
    deadlineFrekvens: {
      label: 'Frekvens',
      placeholder: 'Vælg frekvens',
      required: false,
      component: DropdownComponent,
      options: 'frekvensOptions'
    },
    deadlineTidspunkt: {
      label: 'Tidspunkt',
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
      options: 'typeOptions'
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
      label: 'Opret single eller gruppe enhed',
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
    enhedBeskrivelse: {
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
    fuldeNavn: {
      label: 'Fulde navn',
      placeholder: 'Angiv brugerens fulde navn',
      required: true,
      component: InputComponent
    },
    rolle: {
      label: 'Rolle',
      placeholder: 'Vælg brugerens rolle',
      required: true,
      component: DropdownComponent,
      options: 'rolleOptions'
    },
    brugereRef: {
      label: 'Nærmeste leder',
      placeholder: 'Vælg nærmeste leder',
      required: false,
      component: DropdownComponent,
      options: 'brugereRefOptions'
    },
    egenkontrolRef: {
      label: 'Ansvarlig for',
      placeholder: 'Vælg egenkontrol-ansvar',
      required: false,
      component: DropdownComponent,
      options: 'egenkontrolRefOptions'
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
        step1: ['navn', 'beskrivelse', 'selectedCheckliste', 'startDato'],
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
      dropdownOptions: {
        ...options.dropdownOptions,
        ...egenkontrolConfig
      }
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
        step1: ['navn', 'beskrivelse', 'type'],
        step2: ['frekvens']
      },
      fieldDefinitions,
      dropdownOptions: options.dropdownOptions || {}
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
      dropdownOptions: options.dropdownOptions || {
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
        step1: ['navn', 'rolle', 'ansvarlig_for_egenkontrol', 'leder'],
        step2: ['adresse', 'postnummer', 'by'],
        step3: ['email', 'telefon']
      },
      fieldDefinitions,
      dropdownOptions: options.dropdownOptions || {
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
    navn: formData.navn || 'Ny Item',
    beskrivelse: formData.beskrivelse || 'Ingen beskrivelse angivet',
    startDato: formData.startDato ? new Date(formData.startDato).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  }

  // Tilføj kontekst-specifik information
  switch (context) {
    case 'egenkontroller': {
      // Gem kun rå data for påmindelser og brug danske feltnavne
      return {
        ...baseDetailItem,
        type: 'Egenkontrol',
        status: 'normal',
        lokation: formData.selectedEnheder || formData.enhed || '',
        checkliste: formData.selectedCheckliste || formData.tjekliste || '',
        ansvarligeBrugere: [formData.selectedAnsvarlige || formData.ansvarlige || ''],
        påmindelser: [
          { frekvens: formData.reminderFrekvens, tidspunkt: formData.reminderTidspunkt },
          { frekvens: formData.deadlineFrekvens, tidspunkt: formData.deadlineTidspunkt }
        ],
        modtagere: [
          formData.kvitteringModtager || '',
          formData.afvigelseModtager || ''
        ]
      }
    }

    case 'tjeklister': {
      return {
        ...baseDetailItem,
        tjekliste: formData.navn || 'Ny tjekliste',
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
          navn: formData.gruppeTitel || 'Ny gruppeenhed',
          enhedBeskrivelse: formData.gruppeBeskrivelse || 'Ingen beskrivelse angivet',
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
          navn: formData.enhedNavn || 'Ny enhed',
          enhedBeskrivelse: formData.beskrivelse || 'Ingen beskrivelse angivet',
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
        navn: formData.navn || 'Ny Bruger',
        rolle: findLabel([
          { value: 'service_bruger', label: 'Service Bruger' },
          { value: 'facility_manager', label: 'Facility Manager' },
          { value: 'administrator', label: 'Administrator' },
          { value: 'visnings_bruger', label: 'Visnings Bruger' }
        ], formData.rolle) || 'Ikke valgt',
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
