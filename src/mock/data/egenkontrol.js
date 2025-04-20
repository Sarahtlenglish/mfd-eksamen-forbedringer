// Mockdata for egenkontroller
export const egenkontrollerData = [
  {
    id: 1,
    name: 'Reparer slangevinder - A1.27',
    type: 'Opgave',
    status: 'normal',
    location: 'A1.27',
    startDate: '2025-03-05',
    description: 'Reparation af defekt slangevinder der ikke ruller korrekt tilbage. Skal efterses og justeres, så den fungerer optimalt ved nødsituationer.',
    responsibleUsers: ['Christian Hansen'],
    reminders: [
      { description: '1 dag før, kl. 09.00' },
      { description: 'Dagligt kl. 09.00 efter overskredet deadline' }
    ],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Christian Hansen', description: 'modtager besked om afvigelser' }
    ]
  },
  {
    id: 2,
    name: 'Håndtryksknap inspektion',
    type: 'Egenkontrol',
    status: 'afvigelse',
    location: 'Udendørs A5.05',
    standard: 'BR18',
    standardTitle: 'Brand Håndtrykskammer',
    description: 'Funktionaliteten testes for at sikre, at alarmen aktiveres korrekt. Brandslukningseffektivitet og slangeutvikling vurderes for at sikre, at knappen er let at identificere og anvende i en nødsituation.',
    frequency: 'Ugentlig',
    startDate: '2025-03-11',
    responsibleUsers: ['Christian Hansen'],
    reminders: [
      { description: '1 dag før, kl. 09.00' },
      { description: 'Dagligt kl. 09.00 efter overskredet deadline' }
    ],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Christian Hansen', description: 'modtager besked om afvigelser' }
    ]
  },
  {
    id: 3,
    name: 'Branddørs inspektion',
    type: 'Egenkontrol',
    status: 'normal',
    location: 'Indgang A3.15',
    standard: 'BR18',
    standardTitle: 'Branddøre og brandadskillelser',
    description: 'Branddørens lukkemekanisme kontrolleres for at sikre korrekt selvlukning. Der kontrolleres for skader, revner eller deformationer, som kan påvirke dørens brandmodstandsevne. Tætningslister og eventuelle brandpakninger inspiceres for at sikre, at de er intakte og fungerer korrekt.',
    frequency: 'Månedlig',
    startDate: '2025-03-01',
    responsibleUsers: ['Christian Hansen'],
    reminders: [
      { description: '1 dag før, kl. 09.00' },
      { description: 'Dagligt kl. 09.00 efter overskredet deadline' }
    ],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Christian Hansen', description: 'modtager besked om afvigelser' }
    ]
  },
  {
    id: 4,
    name: 'Flugtvejsskilt Inspektion',
    type: 'Egenkontrol',
    status: 'normal',
    location: 'Lokale A5.05',
    standard: 'BR18',
    standardTitle: 'Flugtvejs- & panikbelysning 7.5.5.1',
    description: 'Belysningen testes for at bekræfte, at skiltet forbliver synligt i nødsituationer. Eventuelle skader, misfarvninger eller manglende dele vurderes, da disse kan påvirke skiltets effektivitet.',
    frequency: 'Ugentlig',
    startDate: '2025-03-01',
    responsibleUsers: ['Christian Hansen'],
    reminders: [
      { description: '1 dag før, kl. 09.00' },
      { description: 'Dagligt kl. 09.00 efter overskredet deadline' }
    ],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Christian Hansen', description: 'modtager besked om afvigelser' }
    ]
  },
  {
    id: 5,
    name: 'Brandtrappe Inspektion',
    type: 'Egenkontrol',
    status: 'normal',
    location: 'Bygning A, nord',
    standard: 'DKV',
    standardTitle: 'Brandtrappe (Månedlig)',
    description: 'Brandtrappets opbevaring og tilgængelighed vurderes for at sikre hurtig adgang i nødsituationer. Forseglingen kontrolleres for tegn på manipulation eller skader. Derudover inspiceres eventuelle brugsanvisninger for at sikre, at de er læsbare og korrekt placeret.',
    frequency: 'Månedlig',
    startDate: '2025-03-07',
    responsibleUsers: ['Kasper Bohr'],
    reminders: [
      { description: '1 dag før, kl. 09.00' },
      { description: 'Dagligt kl. 09.00 efter overskredet deadline' }
    ],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Christian Hansen', description: 'modtager besked om afvigelser' }
    ]
  },
  {
    id: 6,
    name: 'Varslingssystem Inspektion',
    type: 'Egenkontrol',
    status: 'afvigelse',
    location: 'Hele bygningen',
    standard: 'BR18',
    standardTitle: 'Brandtekniske installationer',
    description: 'Test af varslingssystemets funktionalitet og lydstyrke for at sikre, at det kan høres i alle dele af bygningen. Batteristatus og reservestrømsforsyning kontrolleres, og alle sirener og højtalere testes for korrekt funktion.',
    frequency: 'Månedlig',
    startDate: '2025-03-18',
    responsibleUsers: ['Christian Hansen'],
    reminders: [
      { description: '1 dag før, kl. 09.00' },
      { description: 'Dagligt kl. 09.00 efter overskredet deadline' }
    ],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Christian Hansen', description: 'modtager besked om afvigelser' }
    ]
  },
  {
    id: 7,
    name: 'Brandslukker Inspektion',
    type: 'Egenkontrol',
    status: 'normal',
    location: 'Lokale B2.11',
    standard: 'BR18',
    standardTitle: 'Brandslukningsudstyr',
    description: 'Inspektion af brandslukkere for at sikre, at trykmåleren viser korrekt tryk (grønt område). Kontrol af at plomberingen er intakt, og at der ikke er tegn på skader eller korrosion. Verifikation af, at sidste og næste inspektionsdato er tydeligt markeret på slukkerudstyret.',
    frequency: 'Kvartalsvis',
    startDate: '2025-03-25',
    responsibleUsers: ['Kasper Bohr'],
    reminders: [
      { description: '1 dag før, kl. 09.00' },
      { description: 'Dagligt kl. 09.00 efter overskredet deadline' }
    ],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Kasper Bohr', description: 'modtager besked om afvigelser' }
    ]
  },
  {
    id: 8,
    name: 'Brandtrappe Inspektion',
    type: 'Egenkontrol',
    status: 'normal',
    location: 'Bygning B, syd',
    standard: 'DKV',
    standardTitle: 'Brandtrappe (Månedlig)',
    description: 'Brandtrappets opbevaring og tilgængelighed vurderes for at sikre hurtig adgang i nødsituationer. Forseglingen kontrolleres for tegn på manipulation eller skader. Derudover inspiceres eventuelle brugsanvisninger for at sikre, at de er læsbare og korrekt placeret.',
    frequency: 'Månedlig',
    startDate: '2025-03-14',
    responsibleUsers: ['Kasper Bohr'],
    reminders: [
      { description: '1 dag før, kl. 09.00' },
      { description: 'Dagligt kl. 09.00 efter overskredet deadline' }
    ],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Christian Hansen', description: 'modtager besked om afvigelser' }
    ]
  },
  {
    id: 9,
    name: 'Røgdetektor Inspektion',
    type: 'Egenkontrol',
    status: 'error',
    location: 'Etage 3',
    standard: 'BR18',
    standardTitle: 'Automatisk brandalarmeringsanlæg',
    description: 'Test af røgdetektorernes funktionalitet ved hjælp af testspray. Kontrol af at detektorerne er rene og fri for støv eller andre forhindringer. Kontrol af at statuslys fungerer korrekt, og at detektorerne er korrekt forbundet til brandalarmsystemet.',
    frequency: 'Kvartalsvis',
    startDate: '2025-03-19',
    responsibleUsers: ['Christian Hansen'],
    reminders: [
      { description: '1 dag før, kl. 09.00' },
      { description: 'Dagligt kl. 09.00 efter overskredet deadline' }
    ],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Christian Hansen', description: 'modtager besked om afvigelser' }
    ],
    completed: false
  },
  {
    id: 10,
    name: 'Sprinkleranlæg Inspektion',
    type: 'Egenkontrol',
    status: 'normal',
    location: 'Lagerrum C1.05',
    standard: 'BR18',
    standardTitle: 'Automatisk sprinkleranlæg',
    description: 'Visuel inspektion af sprinklerhoveder for at sikre, at de er fri for maling, korrosion og fysiske skader. Kontrol af ventiler for at sikre, at de er i korrekt position (åbne). Verifikation af vandtryk og alarmfunktioner i kontrolpanelet.',
    frequency: 'Kvartalsvis',
    startDate: '2025-03-26',
    responsibleUsers: ['Christian Hansen'],
    reminders: [
      { description: '1 dag før, kl. 09.00' },
      { description: 'Dagligt kl. 09.00 efter overskredet deadline' }
    ],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Christian Hansen', description: 'modtager besked om afvigelser' }
    ]
  },
  {
    id: 11,
    name: 'Brandmandsskab Inspektion',
    type: 'Egenkontrol',
    status: 'normal',
    location: 'Hovedindgang',
    standard: 'BR18',
    standardTitle: 'Brandmandspanel',
    description: 'Kontrol af at brandmandsskabet er let tilgængeligt og tydeligt markeret. Inspektion af indholdet for at sikre, at alle nødvendige redskaber og informationer er til stede. Verifikation af at nøgleboksen fungerer korrekt og indeholder de relevante nøgler.',
    frequency: 'Månedlig',
    startDate: '2025-03-03',
    responsibleUsers: ['Kasper Bohr'],
    reminders: [
      { description: '1 dag før, kl. 09.00' },
      { description: 'Dagligt kl. 09.00 efter overskredet deadline' }
    ],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Christian Hansen', description: 'modtager besked om afvigelser' }
    ]
  },
  {
    id: 12,
    name: 'Førstehjælpskasser Inspektion',
    type: 'Egenkontrol',
    status: 'warning',
    location: 'Alle etager',
    standard: 'AT',
    standardTitle: 'Arbejdstilsynets krav til førstehjælpsudstyr',
    description: 'Kontrol af at førstehjælpskasserne er intakte og indeholder alle nødvendige elementer. Verifikation af at medicin, bandager og andre forbrugsvarer ikke er udløbet. Sikring af at kasserne er let tilgængelige og tydeligt markeret.',
    frequency: 'Kvartalsvis',
    startDate: '2025-03-04',
    responsibleUsers: ['Christian Hansen'],
    reminders: [
      { description: '1 dag før, kl. 09.00' },
      { description: 'Dagligt kl. 09.00 efter overskredet deadline' }
    ],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Christian Hansen', description: 'modtager besked om afvigelser' }
    ]
  },
  {
    id: 13,
    name: 'Brandslange Inspektion',
    type: 'Egenkontrol',
    status: 'normal',
    location: 'Hal C, midt i hallen',
    standard: 'BR18',
    standardTitle: 'Brandslanger og standrør',
    description: 'Inspektion af brandslanger for at kontrollere for slid, revner eller andre skader på slangerne. Test af vandtrykket for at sikre tilstrækkelig funktionalitet i nødsituationer. Kontrol af at slangetrommens oprulningsmekanisme fungerer korrekt, og at slangen er korrekt oprullet.',
    frequency: 'Kvartalsvis',
    startDate: '2025-03-21',
    responsibleUsers: ['Kasper Bohr'],
    reminders: [
      { description: '1 dag før, kl. 09.00' },
      { description: 'Dagligt kl. 09.00 efter overskredet deadline' }
    ],
    deadlineNotifications: [
      { recipient: 'Børge Jakobsen', description: 'modtager kvittering' },
      { recipient: 'Christian Hansen', description: 'modtager besked om afvigelser' }
    ]
  }
]

// Default reminders som bruges flere steder
export const defaultReminders = [
  '1 dag før, kl. 09.00',
  'dagligt kl. 09.00 efter overskredet deadline'
]

// Utility funktioner for egenkontroller
export const mapStatusForCalendar = (status) => {
  if (!status) return 'normal'
  switch (status) {
    case 'afvigelse':
      return 'warning'
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    default:
      return 'normal'
  }
}

// Format egenkontroller til kalendervisning
export const formatTasksForCalendar = (tasks) => {
  const calendarTasks = {}
  tasks.forEach((task) => {
    if (task.startDate) {
      const dateKey = new Date(task.startDate).toISOString().split('T')[0]
      if (!calendarTasks[dateKey]) {
        calendarTasks[dateKey] = []
      }
      // Map til format der forventes af CalendarDayTask-komponenten
      calendarTasks[dateKey].push({
        id: task.id,
        title: task.name,
        details: task.location || '',
        status: mapStatusForCalendar(task.status),
        // Behold original task til detaljeret visning
        originalTask: task
      })
    }
  })
  return calendarTasks
}
