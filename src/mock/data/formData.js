// Egenkontrol form data
export const egenkontrolFormData = {
  checklistOptions: [
    { value: '', label: 'Vælg den checkliste der skal fyldes ud ved kontrollen' },
    { value: 'checklist2', label: 'Røgdetektor inspektionsliste' },
    { value: 'checklist3', label: 'Brandslukker kontrolliste' }
  ],

  dateOptions: [
    { value: '', label: 'Vælg start dato for denne egenkontrol' },
    { value: 'date2', label: '1. januar 2024' },
    { value: 'date3', label: '1. februar 2024' }
  ],

  locationOptions: [
    { value: '', label: 'Vælg den/de enheder kontrollen skal udføres på' },
    { value: 'location1', label: 'BR18 - Røgalarm anlæg (Kvartal) 7.5.4.1' },
    { value: 'location2', label: 'BR18 - Sprinkler anlæg' },
    { value: 'location3', label: 'BR18 - ABA Central' }
  ],

  responsibleOptions: [
    { value: '', label: 'Vælg brugere eller grupper ansvarlige for at udføre kontrollen' },
    { value: 'person1', label: 'Hans Christiansen' },
    { value: 'person2', label: 'Facility (Gruppe)' },
    { value: 'person3', label: 'Teknisk Afdeling (Gruppe)' }
  ],

  frekvensOptions: [
    { value: '', label: 'Vælg frekvens' },
    { value: 'daily', label: 'Dagligt' },
    { value: 'weekly', label: 'Ugentligt' },
    { value: 'monthly', label: 'Månedligt' }
  ],

  tidspunktOptions: [
    { value: '', label: 'Vælg tidspunkt' },
    { value: 'morning', label: '09:00' },
    { value: 'noon', label: '12:00' },
    { value: 'afternoon', label: '15:00' }
  ],

  brugerOptions: [
    { value: '', label: 'Vælg brugere eller gruppe' },
    { value: 'person1', label: 'Hans Christiansen' },
    { value: 'facility', label: 'Facility (Gruppe)' },
    { value: 'tech', label: 'Teknisk Afdeling (Gruppe)' }
  ]
}

// Enheder form data
export const enhederFormData = {
  // Her kan man tilføje specifik enheds-mockdata når det bliver relevant
}

// Fælles form data
export const commonFormData = {
  // Delte data for alle formularer kan placeres her
}
