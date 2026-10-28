// Round-trip helpers for ASP.NET DateOnly ("yyyy-MM-dd") and TimeOnly ("HH:mm:ss") values,
// matching what native <input type="date"> / <input type="time"> produce and expect.

export const BUSINESS_TIME_ZONE = 'Asia/Ho_Chi_Minh'
const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
const timeFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: BUSINESS_TIME_ZONE, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
export const toDateOnly = (date = new Date()) => {
  const parts = Object.fromEntries(dateFormatter.formatToParts(date).map((p) => [p.type, p.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

export const fromDateOnly = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  // A calendar value for UTC calendar arithmetic, not a browser-local midnight.
  return new Date(Date.UTC(y, m - 1, d))
}

// "HH:mm" (input value) <-> "HH:mm:ss" (API value).
export const toTimeOnly = (hhmm) => (hhmm.length === 5 ? `${hhmm}:00` : hhmm)
export const fromTimeOnly = (hhmmss) => hhmmss.slice(0, 5)

export const formatDate = (dateOnlyStr, options = { weekday: 'short', day: '2-digit', month: '2-digit' }) =>
  fromDateOnly(dateOnlyStr).toLocaleDateString('vi-VN', { ...options, timeZone: 'UTC' })

export const formatTimestamp = (value, options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) => {
  const date = new Date(value)
  return value && !Number.isNaN(date.getTime()) ? date.toLocaleString('vi-VN', { ...options, timeZone: BUSINESS_TIME_ZONE }) : '—'
}

// DateOnly/TimeOnly are already business wall-clock values; compare as such without parsing in the host timezone.
const businessWallClock = (now) => `${toDateOnly(now)}T${timeFormatter.format(now)}`
export const hasScheduleStarted = (item, now = new Date()) => `${item.date}T${item.startTime}` <= businessWallClock(now)
export const isPastSchedule = (item, now = new Date()) => `${item.date}T${item.endTime}` <= businessWallClock(now)

export const formatTimeRange = (start, end) => `${fromTimeOnly(start)} - ${fromTimeOnly(end)}`

// Monday-start week containing `date` (defaults to today), as [startDateOnly, endDateOnly].
export function weekRange(date = new Date()) {
  const calendar = fromDateOnly(typeof date === 'string' ? date : toDateOnly(date))
  const day = calendar.getUTCDay() // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day
  calendar.setUTCDate(calendar.getUTCDate() + diffToMonday)
  const start = calendar.toISOString().slice(0, 10)
  return [start, addDays(start, 6)]
}

export function addDays(dateOnlyStr, days) {
  const d = fromDateOnly(dateOnlyStr)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// ISO-8601 week <-> Monday date, to match native <input type="week"> ("yyyy-Www").
const firstThursdayOf = (year) => {
  const d = new Date(Date.UTC(year, 0, 1))
  while (d.getUTCDay() !== 4) d.setUTCDate(d.getUTCDate() + 1)
  return d
}

export function toIsoWeek(mondayDateOnlyStr) {
  const thursday = fromDateOnly(mondayDateOnlyStr)
  thursday.setUTCDate(thursday.getUTCDate() + 3)
  const year = thursday.getUTCFullYear()
  const week = 1 + Math.round((thursday - firstThursdayOf(year)) / (7 * 86400000))
  return `${year}-W${String(week).padStart(2, '0')}`
}

export function fromIsoWeek(value) {
  const [year, week] = value.split('-W').map(Number)
  const thursday = firstThursdayOf(year)
  thursday.setUTCDate(thursday.getUTCDate() + (week - 1) * 7)
  const monday = new Date(thursday)
  monday.setUTCDate(thursday.getUTCDate() - 3)
  return monday.toISOString().slice(0, 10)
}
