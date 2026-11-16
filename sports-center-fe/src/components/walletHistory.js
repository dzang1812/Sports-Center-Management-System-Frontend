// Presentation only: immutable wallet entries and actual refund processing stay unchanged.
export function groupCourseRefunds(entries, enrollments) {
  const ordered = [...new Map(entries.map(entry => [entry.id, entry])).values()].sort((a, b) => b.id - a.id)
  const fullyRefunded = new Map(enrollments.filter(enrollment => enrollment.orderId != null
    && enrollment.status === 'Cancelled' && enrollment.paidAmount > 0
    && enrollment.refundedAmount === enrollment.paidAmount).map(enrollment => [enrollment.orderId, enrollment]))
  const groups = new Map()
  for (const entry of ordered) {
    if (entry.kind !== 'Refund' || entry.amount <= 0 || !fullyRefunded.has(entry.orderId)
      || !/^course-unit:\d+:refund$/.test(entry.reference)) continue
    const group = groups.get(entry.orderId) ?? []
    group.push(entry)
    groups.set(entry.orderId, group)
  }
  // Never label a partial/incompletely loaded refund as a full course refund.
  for (const [orderId, group] of groups) {
    if (group.reduce((total, entry) => total + entry.amount, 0) !== fullyRefunded.get(orderId).paidAmount)
      groups.delete(orderId)
  }
  return ordered.flatMap(entry => {
    const group = groups.get(entry.orderId)
    if (!group?.some(item => item.id === entry.id)) return [entry]
    if (entry.id !== group[0].id) return []
    return [{ ...entry, kind: 'CourseRefund', amount: group.reduce((total, item) => total + item.amount, 0),
      courseName: fullyRefunded.get(entry.orderId).course, refundUnitCount: group.length,
      refundStartedAt: group[group.length - 1].createdAt }]
  })
}
