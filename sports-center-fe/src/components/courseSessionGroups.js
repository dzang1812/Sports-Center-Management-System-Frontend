// Group the complete filtered result before paginating; course names are not unique IDs.
export function groupCourseSessions(sessions) {
  const groups = new Map()
  for (const session of sessions) {
    const key = session.classId != null ? `course:${session.classId}` : `session:${session.id}`
    if (!groups.has(key)) groups.set(key, { key, classId: session.classId, name: session.className, sessions: [] })
    groups.get(key).sessions.push(session)
  }
  for (const group of groups.values()) group.sessions.sort((a, b) => a.date.localeCompare(b.date)
    || a.startTime.localeCompare(b.startTime) || a.id - b.id)
  return [...groups.values()].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'vi-VN')
    || (a.classId ?? 0) - (b.classId ?? 0))
}
