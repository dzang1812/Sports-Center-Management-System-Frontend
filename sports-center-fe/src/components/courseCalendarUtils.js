import { addDays, fromDateOnly, weekRange } from '../dateUtils.js'

export const minutesOf = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))

export function monthDates(date) {
  const start = weekRange(`${date.slice(0, 7)}-01`)[0]
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

export function shiftMonth(date, delta) {
  const calendar = fromDateOnly(`${date.slice(0, 7)}-01`)
  calendar.setUTCMonth(calendar.getUTCMonth() + delta)
  return calendar.toISOString().slice(0, 10)
}

// Connected overlapping events share equal-width lanes; touching end/start times do not overlap.
export function layoutDayEvents(events) {
  const ordered = [...events].sort((a, b) => minutesOf(a.startTime) - minutesOf(b.startTime) || minutesOf(a.endTime) - minutesOf(b.endTime))
  const result = []
  let group = []
  let groupEnd = -1
  const flush = () => {
    const laneEnds = []
    const placed = group.map(event => {
      const start = minutesOf(event.startTime)
      let lane = laneEnds.findIndex(end => end <= start)
      if (lane === -1) lane = laneEnds.length
      laneEnds[lane] = minutesOf(event.endTime)
      return { event, lane }
    })
    result.push(...placed.map(item => ({ ...item, lanes: laneEnds.length })))
  }
  for (const event of ordered) {
    const start = minutesOf(event.startTime)
    if (group.length && start >= groupEnd) { flush(); group = []; groupEnd = -1 }
    group.push(event)
    groupEnd = Math.max(groupEnd, minutesOf(event.endTime))
  }
  if (group.length) flush()
  return result
}
