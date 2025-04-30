// Mock data for brugere (users)
export const brugereData = [
  {
    id: 1,
    name: 'Anders Jensen',
    role: 'Service Bruger',
    email: 'a@b.dk',
    telefon: '12345678',
    gruppe: 'Gruppe 1',
    adresse: 'Adresselinje 1',
    postnummer: '1234',
    by: 'Bynavn',
    leder: 'Christian Hansen',
    ansvarlig_for_egenkontrol: 'Egenkontrol 1',
    status: 'normal'
  },
  {
    id: 2,
    name: 'Tanja Lund',
    role: 'Facility Manager',
    email: 'tanja@example.dk',
    telefon: '87654321',
    gruppe: 'Gruppe 2',
    adresse: 'Parkgade 45',
    postnummer: '2300',
    by: 'København',
    leder: 'Anders Jensen',
    ansvarlig_for_egenkontrol: 'Egenkontrol 2',
    status: 'normal'
  },
  {
    id: 3,
    name: 'Christian Hansen',
    role: 'Administrator',
    email: 'christian@example.dk',
    telefon: '45678912',
    gruppe: 'Admin',
    adresse: 'Hovedgaden 123',
    postnummer: '8000',
    by: 'Aarhus',
    leder: '',
    ansvarlig_for_egenkontrol: 'Egenkontrol 1, Egenkontrol 3',
    status: 'normal'
  },
  {
    id: 4,
    name: 'Mette Olsen',
    role: 'Visnings Bruger',
    email: 'mette@example.dk',
    telefon: '23456789',
    gruppe: 'Extern',
    adresse: 'Strandvejen 67',
    postnummer: '9000',
    by: 'Aalborg',
    leder: 'Christian Hansen',
    ansvarlig_for_egenkontrol: '',
    status: 'normal'
  }
]

// Mock data for bruger form options
export const brugerFormData = {
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
  ],
  gruppeOptions: [
    { value: 'gruppe_1', label: 'Gruppe 1' },
    { value: 'gruppe_2', label: 'Gruppe 2' },
    { value: 'admin', label: 'Admin' },
    { value: 'extern', label: 'Extern' }
  ]
}

// Mock data for user history - if needed
export const brugerHistoryItems = [
  {
    id: 1,
    type: 'update',
    title: 'Rolle ændret til Administrator',
    date: '15/3/2025',
    user: 'Christian Hansen'
  },
  {
    id: 2,
    type: 'add',
    title: 'Tilføjet til Gruppe 1',
    date: '10/3/2025',
    user: 'Christian Hansen'
  },
  {
    id: 3,
    type: 'update',
    title: 'Kontaktoplysninger opdateret',
    date: '5/3/2025',
    user: 'Anders Jensen'
  },
  {
    id: 4,
    type: 'create',
    title: 'Bruger oprettet',
    date: '1/3/2025',
    user: 'System'
  }
]

// Function to map role values to displayable text
export function getRoleLabel(value) {
  const option = brugerFormData.roleOptions.find(opt => opt.value === value)
  return option ? option.label : value
}

// Function to get leader name from value
export function getLederLabel(value) {
  const option = brugerFormData.lederOptions.find(opt => opt.value === value)
  return option ? option.label : value
}

// Function to get group name from value
export function getGruppeLabel(value) {
  const option = brugerFormData.gruppeOptions.find(opt => opt.value === value)
  return option ? option.label : value
}
