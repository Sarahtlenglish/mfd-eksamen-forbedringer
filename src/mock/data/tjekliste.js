// Tjekliste mock data
export const tjeklisteFormData = {
  tjeklisteTypeOptions: [
    { value: '', label: 'Vælg type' },
    { value: 'br18', label: 'BR18' },
    { value: 'iso9001', label: 'ISO 9001' },
    { value: 'custom', label: 'Brugerdefineret' }
  ],

  responsibleOptions: [
    { value: '', label: 'Vælg brugere eller grupper ansvarlige for at udføre kontrollen' },
    { value: 'person1', label: 'Hans Christiansen' },
    { value: 'person2', label: 'Facility (Gruppe)' },
    { value: 'person3', label: 'Teknisk Afdeling (Gruppe)' }
  ],

  // Frekvens options
  frekvensOptions: [
    { value: '', label: 'Vælg frekvens' },
    { value: 'daily', label: 'Dagligt' },
    { value: 'weekly', label: 'Ugentligt' },
    { value: 'monthly', label: 'Månedligt' },
    { value: 'quarterly', label: 'Kvartal' },
    { value: 'yearly', label: 'Årligt' }
  ]
}

// Sample tjekliste data til overblikssiden
export const tjeklisteData = [
  {
    id: 1,
    type: 'BR18',
    tjekliste: 'AVS anlæg',
    frequency: 'Ugentlig 7.5.2.1',
    description: 'Tjeklisten er til gennemgåelse af AVS anlæg, det er en type BR18 som skal udføres ugentlig'
  },
  {
    id: 2,
    type: 'BR18',
    tjekliste: 'Røgalarm anlæg',
    frequency: 'Kvartal 7.5.4.1',
    description: 'Tjeklisten er til gennemgåelse af Røgalarm anlæg, det er en type BR18 som skal udføres per kvartal'
  },
  {
    id: 3,
    type: 'ISO 9001',
    tjekliste: 'Proceskontrol',
    frequency: 'Månedlig',
    description: 'Tjekliste til opfølgning på ISO 9001 proceskontrol standarder'
  }
]

// Helper function til at konvertere formData til detailItem
export function prepareTjeklisteDetailItem(formData, helpers = {}) {
  // Opsæt frekvenstekst baseret på valgt værdi
  let frequencyText = helpers.getFrekvensLabel ? helpers.getFrekvensLabel(formData.frekvens) : formData.frekvens

  // Tilføj yderligere information baseret på type
  if (formData.type === 'br18' && frequencyText) {
    switch (formData.frekvens) {
      case 'weekly':
        frequencyText += ' (BR18 7.5.2.1)'
        break
      case 'quarterly':
        frequencyText += ' (BR18 7.5.4.1)'
        break
      default:
        frequencyText += ' (BR18)'
    }
  }

  return {
    id: formData.id || Math.floor(Math.random() * 1000),
    name: formData.name || 'Ny tjekliste',
    type: helpers.getTypeLabel ? helpers.getTypeLabel(formData.type) : formData.type,
    tjekliste: formData.name,
    description: formData.description || '',
    frequency: frequencyText || 'Ingen frekvens valgt'
  }
}
