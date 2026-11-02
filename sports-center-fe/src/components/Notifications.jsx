import { useCallback, useEffect, useRef, useState } from 'react'
import { api, query } from '../api'
import { formatTimestamp } from '../dateUtils'
import { Alert, Icon, Modal, Pagination, btnOutline, btnPrimary } from './ui'
import { markAllNotificationsRead } from './notificationActions'

// Mounted inside the token-keyed authenticated layout: no user-specific cache survives account changes.
export default function Notifications() {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(null)
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [readingId, setReadingId] = useState(null)
  const reading = useRef(false)
  const listRequest = useRef(null)
  const badgeRequest = useRef(null)
  const readAllRequest = useRef(null)

  useEffect(() => () => readAllRequest.current?.abort(), [])

  const loadBadge = useCallback(async () => {
    badgeRequest.current?.abort()
    const controller = new AbortController()
    badgeRequest.current = controller
    try {
      const result = await api('/me/notifications?unreadOnly=true&page=1&pageSize=10', { signal: controller.signal })
      if (!controller.signal.aborted) setUnread(result.total)
    } catch (err) {
      if (err.name !== 'AbortError') setUnread(null)
    }
  }, [])

  const load = useCallback(async () => {
    listRequest.current?.abort()
    const controller = new AbortController()
    listRequest.current = controller
    setLoading(true)
    setError('')
    try {
      const result = await api(`/me/notifications${query({ unreadOnly: onlyUnread, page, pageSize })}`, { signal: controller.signal })
      if (!controller.signal.aborted) {
        setData(result)
        if (page > 1 && !result.items.length) setPage(Math.max(1, Math.ceil(result.total / pageSize)))
      }
    } catch (err) {
      if (err.name !== 'AbortError') { setError(err.message); setData({ items: [], total: 0 }) }
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [onlyUnread, page, pageSize])

  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => { if (active) { loadBadge(); if (open) load() } })
    const refresh = () => { loadBadge(); if (open) load() }
    const focus = () => { if (document.visibilityState === 'visible') refresh() }
    window.addEventListener('sc:api-mutated', refresh)
    window.addEventListener('focus', focus)
    const timer = setInterval(focus, 30000)
    return () => {
      active = false
      window.removeEventListener('sc:api-mutated', refresh)
      window.removeEventListener('focus', focus)
      clearInterval(timer)
      listRequest.current?.abort()
      badgeRequest.current?.abort()
    }
  }, [open, load, loadBadge])

  const markRead = async (id) => {
    if (reading.current) return
    reading.current = true
    setReadingId(id)
    setError('')
    try {
      await api(`/me/notifications/${id}/read`, { method: 'PATCH' })
      // The API mutation event reloads the list and the unread total only after success.
    } catch (err) { setError(err.message) }
    finally { reading.current = false; setReadingId(null) }
  }

  const markAllRead = async () => {
    if (reading.current) return
    reading.current = true
    const controller = new AbortController()
    readAllRequest.current = controller
    setReadingId('all')
    setError('')
    let failure = ''
    try {
      await markAllNotificationsRead(api, controller.signal)
    } catch (err) { if (!controller.signal.aborted) failure = err.message }
    finally {
      if (!controller.signal.aborted) {
        // Refresh from the server even after partial failure; never assume the count is zero.
        await Promise.all([load(), loadBadge()])
        if (failure) setError(failure)
        reading.current = false
        setReadingId(null)
      }
    }
  }

  return <>
    <button type="button" className="relative p-2 rounded-lg hover:bg-surface-container-high shrink-0" onClick={() => setOpen(true)} aria-label={`Thông báo${unread == null ? '' : `, ${unread} chưa đọc`}`}>
      <Icon name="notifications" />
      {unread > 0 && <span className="absolute -top-1 -right-1 bg-error text-white rounded-full px-1.5 text-xs">{unread > 99 ? '99+' : unread}</span>}
    </button>
    {open && <Modal title="Thông báo" onClose={() => setOpen(false)} footer={<div className="flex w-full flex-wrap justify-between gap-2">
      <button type="button" className={btnPrimary} disabled={readingId != null || unread === 0} onClick={markAllRead}>
        <Icon name="done_all" />{readingId === 'all' ? 'Đang đánh dấu…' : 'Đánh dấu đọc tất cả'}
      </button>
      <button type="button" className={btnOutline} onClick={() => setOpen(false)}>Đóng</button>
    </div>}>
      <div className="flex items-center justify-between gap-3 pb-3">
        <label className="flex items-center gap-2"><input type="checkbox" checked={onlyUnread} disabled={readingId != null} onChange={(e) => { setOnlyUnread(e.target.checked); setPage(1) }} /> Chỉ chưa đọc</label>
        <button type="button" className={btnOutline} onClick={() => { load(); loadBadge() }} disabled={loading || readingId != null}>Làm mới</button>
      </div>
      {error && <Alert>{error}</Alert>}
      {loading ? <p role="status" className="py-4 text-secondary">Đang tải thông báo…</p> : <div className="space-y-3">
        {data.items.map((n) => <article key={n.id} className={`border rounded-lg p-3 ${n.isRead ? 'border-outline-variant' : 'border-primary-container bg-primary-container/10'}`}>
          <div className="flex justify-between gap-2"><h3 className="font-semibold">{n.title}</h3><span className="text-body-sm shrink-0">{n.isRead ? 'Đã đọc' : 'Chưa đọc'}</span></div>
          <p className="text-body-sm whitespace-pre-wrap py-1">{n.body}</p>
          <time className="text-body-sm text-secondary" dateTime={n.createdAt}>{formatTimestamp(n.createdAt)}</time>
          {!n.isRead && <button type="button" className={btnOutline + ' !h-8 mt-2 w-full'} disabled={readingId != null} onClick={() => markRead(n.id)}>{readingId === n.id ? 'Đang lưu…' : 'Đánh dấu đã đọc'}</button>}
        </article>)}
        {!data.items.length && !error && <p className="text-secondary text-center py-6">Không có thông báo.</p>}
      </div>}
      <Pagination page={page} pageSize={pageSize} total={data.total} onPage={value => { if (!reading.current) setPage(value) }} onPageSize={(size) => { if (!reading.current) { setPageSize(size); setPage(1) } }} />
    </Modal>}
  </>
}
