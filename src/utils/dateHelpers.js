/**
 * Utility functions for date handling in the application.
 * Standardized to ensure consistent date formatting throughout the app.
 */

/**
 * Format a date to ISO format (YYYY-MM-DD)
 * Ensures dates are formatted consistently for both display and data lookup
 *
 * @param {Date|string} date - A Date object or date string to format
 * @returns {string|null} The formatted date string or null if input is invalid
 */
export function formatDateToISO(date) {
  if (!date) return null

  // Handle both Date objects and strings
  const dateObj = date instanceof Date ? date : new Date(date)

  // Ensure we're working with local time, not UTC
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Beregn antal dage mellem to datoer (returnerer altid >= 0)
export function getDaysOverdue(fromDate, toDate = new Date()) {
  if (!fromDate) return 0
  const from = new Date(fromDate)
  const to = new Date(toDate)
  // Sæt begge til lokal midnat
  from.setHours(0, 0, 0, 0)
  to.setHours(0, 0, 0, 0)
  const diff = Math.floor((to - from) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}
