// Central eksport af alle mockdata

// Egenkontrol data og funktioner
import {
  egenkontrollerData,
  defaultReminders,
  mapStatusForCalendar,
  formatTasksForCalendar,
  egenkontrolFormData
} from './data/egenkontrol'

// Kalender-specifik data
import {
  calendarTaskData,
  exampleDateTasks,
  defaultCalendarDate
} from './data/calendar'

// Enheder-specifik data
import {
  enhederData,
  enhederHistoryItems
} from './data/enheder'

// Eksporter alt samlet
export {
  // Egenkontrol
  egenkontrollerData,
  defaultReminders,
  mapStatusForCalendar,
  formatTasksForCalendar,
  egenkontrolFormData,
  // Kalender
  calendarTaskData,
  exampleDateTasks,
  defaultCalendarDate,
  // Enheder
  enhederData,
  enhederHistoryItems
}
