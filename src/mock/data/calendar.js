// Mock data for kalender-detaljevisning

// Mock data for udvalgte calendar task detaljer
export const calendarTaskData = {
  'Flugtvejsskilt Inspektion': {
    id: 'flugtvej-1',
    name: 'Flugtvejsskilt Inspektion',
    location: 'Udendør A0.10',
    standard: 'BR18',
    standardTitle: 'Flugtvejs- & panikbelysning 7.5.5.1',
    description: 'Belysningen testes for at bekræfte, at skiltet forbliver synligt i nødsituationer. Eventuelle skader, misfarvninger eller manglende dele vurderes, da disse kan påvirke skiltets effektivitet.',
    responsibleUsers: ['Christian Hansen'],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Christian Hansen', description: 'modtager besked om afvigelser' }
    ]
  },
  'Branddørs Inspektion': {
    id: 'brandder-1',
    name: 'Branddørs Inspektion',
    location: 'B1 - Glasgangen',
    standard: 'BR18',
    standardTitle: 'Branddøre',
    description: 'Belysningen testes for at bekræfte, at skiltet forbliver synligt i nødsituationer. Eventuelle skader, misfarvninger eller manglende dele vurderes, da disse kan påvirke skiltets effektivitet.',
    responsibleUsers: ['Christian Hansen'],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Christian Hansen', description: 'modtager besked om afvigelser' }
    ]
  },
  'Brandslange Inspektion': {
    id: 'brandslange-1',
    name: 'Brandslange Inspektion',
    location: 'Hal C - Midt i hallen',
    standard: 'BR18',
    standardTitle: 'Brandslukningsudstyr',
    description: 'Belysningen testes for at bekræfte, at skiltet forbliver synligt i nødsituationer. Eventuelle skader, misfarvninger eller manglende dele vurderes, da disse kan påvirke skiltets effektivitet.',
    responsibleUsers: ['Christian Hansen'],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Christian Hansen', description: 'modtager besked om afvigelser' }
    ]
  },
  'Varslingssystem Inspektion': {
    id: 'varsling-1',
    name: 'Varslingssystem Inspektion',
    location: 'Kælderen bygning B',
    standard: 'BR18',
    standardTitle: 'Varslingssystemer',
    description: 'Belysningen testes for at bekræfte, at skiltet forbliver synligt i nødsituationer. Eventuelle skader, misfarvninger eller manglende dele vurderes, da disse kan påvirke skiltets effektivitet.',
    responsibleUsers: ['Christian Hansen'],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Christian Hansen', description: 'modtager besked om afvigelser' }
    ]
  }
}

// Specifikke eksempeldatoer (2. og 3. marts 2025)
export const exampleDateTasks = [
  {
    title: 'Branddørs Inspektion',
    location: 'B1 - Glasgangen',
    status: 'normal'
  },
  {
    title: 'Brandslange Inspektion',
    location: 'Hal C - Midt i hallen',
    status: 'warning'
  },
  {
    title: 'Varslingssystem Inspektion',
    location: 'Kælderen bygning B',
    status: 'normal'
  }
]

// Default dato for kalendervisning
export const defaultCalendarDate = new Date(2025, 2, 2) // Marts 2025
