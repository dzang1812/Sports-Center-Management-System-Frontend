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
