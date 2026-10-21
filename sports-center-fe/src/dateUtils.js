// Round-trip helpers for ASP.NET DateOnly ("yyyy-MM-dd") and TimeOnly ("HH:mm:ss") values,
// matching what native <input type="date"> / <input type="time"> produce and expect.

const pad = (n) => String(n).padStart(2, '0')

export const toDateOnly = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const fromDateOnly = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// "HH:mm" (input value) <-> "HH:mm:ss" (API value).
export const toTimeOnly = (hhmm) => (hhmm.length === 5 ? `${hhmm}:00` : hhmm)
export const fromTimeOnly = (hhmmss) => hhmmss.slice(0, 5)

export const formatDate = (dateOnlyStr) => fromDateOnly(dateOnlyStr).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })

export const formatTimeRange = (start, end) => `${fromTimeOnly(start)} - ${fromTimeOnly(end)}`

// Monday-start week containing `date` (defaults to today), as [startDateOnly, endDateOnly].
export function weekRange(date = new Date()) {
  const day = date.getDay() // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day
  const start = new Date(date)
  start.setDate(date.getDate() + diffToMonday)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return [toDateOnly(start), toDateOnly(end)]
}

export function addDays(dateOnlyStr, days) {
  const d = fromDateOnly(dateOnlyStr)
  d.setDate(d.getDate() + days)
  return toDateOnly(d)
}

// ISO-8601 week <-> Monday date, to match native <input type="week"> ("yyyy-Www").
const firstThursdayOf = (year) => {
  const d = new Date(year, 0, 1)
  while (d.getDay() !== 4) d.setDate(d.getDate() + 1)
  return d
}

export function toIsoWeek(mondayDateOnlyStr) {
  const thursday = fromDateOnly(mondayDateOnlyStr)
  thursday.setDate(thursday.getDate() + 3)
  const year = thursday.getFullYear()
  const week = 1 + Math.round((thursday - firstThursdayOf(year)) / (7 * 86400000))
  return `${year}-W${String(week).padStart(2, '0')}`
}

export function fromIsoWeek(value) {
  const [year, week] = value.split('-W').map(Number)
  const thursday = firstThursdayOf(year)
  thursday.setDate(thursday.getDate() + (week - 1) * 7)
  const monday = new Date(thursday)
  monday.setDate(thursday.getDate() - 3)
  return toDateOnly(monday)
}
