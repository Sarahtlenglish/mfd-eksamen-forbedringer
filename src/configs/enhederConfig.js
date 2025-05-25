export const enhederConfig = {
  locations: [
    { value: 'bygningA', label: 'Bygning A' },
    { value: 'bygningB', label: 'Bygning B' },
    { value: 'bygningC', label: 'Bygning C' }
  ],
  types: [
    { value: 'single', label: 'Single' },
    { value: 'gruppe', label: 'Gruppe' }
  ],

  defaults: {
    single: {
      title: 'Enheds Information',
      heading: 'Udfyld informationen for enheden',
      fields: ['enhedType', 'enhedNavn', 'beskrivelse', 'location']
    },
    gruppe: {
      steps: [
        {
          title: 'Gruppe Information',
          heading: 'Udfyld informationen for gruppen',
          fields: ['enhedType', 'gruppeTitel', 'gruppeBeskrivelse', 'location']
        },
        {
          title: 'Underenheder',
          heading: 'Opret underenheder',
          fields: ['underenheder']
        }
      ]
    }
  }
}
