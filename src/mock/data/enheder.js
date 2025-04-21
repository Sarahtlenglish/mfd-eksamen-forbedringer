// Mock data for enheder
export const enhederData = [
  {
    id: 1,
    name: 'Branddør',
    location: 'Bygning A',
    description: 'Tjek at alle branddøre i Bygning A er op til standard og fungere som de skal',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=branddoer-bygningA',
    files: [
      { id: 1, name: 'Faktura fra Kasper Bohr', type: 'pdf' }
    ]
  },
  { id: 2, name: 'Flugtvejs skilte', location: 'Bygning A' },
  { id: 3, name: 'Slangevinder', location: 'Bygning A' },
  { id: 4, name: 'Brandslukker', location: 'Bygning A' },
  { id: 5, name: 'Flugtvejs plan', location: 'Bygning A' },
  { id: 6, name: 'Sprinkler', location: 'Bygning A' },
  { id: 7, name: 'Brandalarm', location: 'Bygning A' },
  { id: 8, name: 'Branddør', location: 'Bygning B' },
  { id: 9, name: 'Flugtvejs skilte', location: 'Bygning B' },
  { id: 10, name: 'Slangevinder', location: 'Bygning B' },
  { id: 11, name: 'Brandslukker', location: 'Bygning B' },
  { id: 12, name: 'Flugtvejs plan', location: 'Bygning B' },
  { id: 13, name: 'Sprinkler', location: 'Bygning B' }
]

// Mock data for enheder history
export const enhederHistoryItems = [
  {
    id: 1,
    type: 'NextInspection',
    title: 'Næste egenkontrol om 336 dage',
    date: 'Egenkontrol title',
    user: 'Christian Hansen'
  },
  {
    id: 2,
    type: 'dokumenter',
    title: 'Faktura fra Kasper Bohr',
    date: '1/3/2025',
    user: 'Christian Hansen'
  },
  {
    id: 3,
    type: 'opgave',
    title: 'Udført brændørs lukkemekaniske - Bygning A',
    date: '24/2/2025',
    user: 'Kasper Bohr'
  },
  {
    id: 4,
    type: 'kommentar',
    title: 'Mekaniker er tilkaldt til at fikse døren',
    date: '22/2/2025',
    user: 'Christian Hansen'
  },
  {
    id: 5,
    type: 'udført',
    title: 'Egenkontrol udført',
    date: '18/2/2025',
    user: 'Christian Hansen'
  }
]

// Mock data for enheder displays og standarder
export const enhederStandardData = {
  // Grupper af enheder som kan vælges i dropdown
  enhederGrupper: {
    Røgalarm: {
      displayText: 'Røgdetektore (Gruppe)',
      standard: 'BR18',
      standardTitle: 'Røgalarm anlæg (Kvartal) 7.5.4.1',
      frekvens: 'hver 3. måned',
      medlemmer: [
        { id: 101, name: 'Røgdetektor', location: 'Bygning A, 1. sal' },
        { id: 102, name: 'Røgdetektor', location: 'Bygning A, 2. sal' },
        { id: 103, name: 'Røgdetektor', location: 'Bygning B, stuen' }
      ]
    },
    Sprinkler: {
      displayText: 'Sprinklerhoveder (Gruppe)',
      standard: 'BR18',
      standardTitle: 'Sprinkler anlæg (Månedlig) 6.3.2',
      frekvens: 'månedligt',
      medlemmer: [
        { id: 201, name: 'Sprinklerhoved', location: 'Bygning A, kælder' },
        { id: 202, name: 'Sprinklerhoved', location: 'Bygning A, 1. sal' },
        { id: 203, name: 'Sprinklerhoved', location: 'Bygning B, 1. sal' }
      ]
    },
    ABA: {
      displayText: 'ABA Centraler (Gruppe)',
      standard: 'BR18',
      standardTitle: 'ABA Central (Kvartal) 8.1.1',
      frekvens: 'kvartalsvis',
      medlemmer: [
        { id: 301, name: 'ABA Central', location: 'Bygning A, teknikrum' },
        { id: 302, name: 'ABA Central', location: 'Bygning B, teknikrum' }
      ]
    },
    Flugtvej: {
      displayText: 'Flugtvejsskilte (Gruppe)',
      standard: 'BR18',
      standardTitle: 'Flugtvejsskilte (Månedlig) 5.2.2',
      frekvens: 'månedligt',
      medlemmer: [
        { id: 401, name: 'Flugtvejsskilt', location: 'Bygning A, stuen' },
        { id: 402, name: 'Flugtvejsskilt', location: 'Bygning A, 1. sal' },
        { id: 403, name: 'Flugtvejsskilt', location: 'Bygning B, stuen' }
      ]
    }
  },

  // Mapping for tjeklister til enheder
  tjeklisteMapping: {
    Røgdetektor: 'Røgalarm',
    Brandslukker: 'Brandslukkere',
    Flugtvej: 'Flugtvej',
    Sprinkler: 'Sprinkler',
    ABA: 'ABA'
  },

  // Default værdier
  defaultValues: {
    displayText: 'Flugtvejsskilte (Gruppe)',
    standard: 'BR18',
    standardTitle: 'Flugtvejsskilte (Månedlig) 5.2.2',
    frekvens: 'månedligt'
  }
}
