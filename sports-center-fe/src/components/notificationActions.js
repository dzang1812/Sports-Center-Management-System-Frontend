// Read every page before mutations so the unread filter cannot shift items past us.
export async function markAllNotificationsRead(request, signal) {
  const ids = new Set()
  let total = 0
  for (let page = 1; page === 1 || (page - 1) * 50 < total; page++) {
    signal.throwIfAborted()
    const result = await request(`/me/notifications?unreadOnly=true&page=${page}&pageSize=50`, { signal })
    total = result.total
    for (const item of result.items) if (!item.isRead) ids.add(item.id)
  }
  const pending = [...ids]
  let completed = 0
  for (let offset = 0; offset < pending.length; offset += 4) {
    signal.throwIfAborted()
    const results = await Promise.allSettled(pending.slice(offset, offset + 4).map(id =>
      request(`/me/notifications/${id}/read`, { method: 'PATCH', signal, notify: false })))
    completed += results.filter(result => result.status === 'fulfilled').length
    const failure = results.find(result => result.status === 'rejected')
    if (failure) {
      signal.throwIfAborted()
      throw new Error(`Đã đánh dấu ${completed}/${pending.length} thông báo. ${failure.reason?.message ?? 'Vui lòng thử lại.'}`)
    }
  }
  return completed
}
