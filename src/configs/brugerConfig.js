export const rolleOptions = [
  { value: 'service_bruger', label: 'Service Bruger' },
  { value: 'facility_manager', label: 'Facility Manager' },
  { value: 'administrator', label: 'Administrator' },
  { value: 'visnings_bruger', label: 'Visnings Bruger' }
]

export function getRoleLabel(value) {
  if (!value) return ''
  const option = rolleOptions.find(opt => opt.value === value)
  return option ? option.label : value
}

export const brugerConfig = {
  fieldDefinitions: {
    fuldeNavn: {
      type: 'text',
      label: 'Fulde navn',
      placeholder: 'Indtast brugerens fulde navn',
      required: true
    },
    rolle: {
      type: 'select',
      label: 'Rolle',
      placeholder: 'Vælg brugerens rolle',
      required: true,
      options: rolleOptions
    },
    brugereRef: {
      type: 'select',
      label: 'Nærmeste leder',
      placeholder: 'Vælg nærmeste leder',
      required: true
    },
    adresse: {
      type: 'text',
      label: 'Adresse',
      placeholder: 'Indtast adresse'
    },
    postnummer: {
      type: 'text',
      label: 'Postnummer',
      placeholder: 'Indtast postnummer'
    },
    by: {
      type: 'text',
      label: 'By',
      placeholder: 'Indtast by'
    },
    email: {
      type: 'email',
      label: 'Email',
      placeholder: 'Indtast email',
      required: true
    },
    telefon: {
      type: 'tel',
      label: 'Telefon',
      placeholder: 'Indtast telefonnummer'
    }
  }
}
