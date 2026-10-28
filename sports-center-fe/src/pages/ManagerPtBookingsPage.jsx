import { useCallback, useEffect, useRef, useState } from 'react'
import { api, query } from '../api'
import { MemberLookupField } from '../components/booking'
import { CancelBookingModal } from '../components/scheduleActions'
import { Alert, Badge, Field, Pagination, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { addDays, fromTimeOnly, hasScheduleStarted, toDateOnly } from '../dateUtils'
import { BOOKING_STATUS_LABEL } from '../labels'

export default function ManagerPtBookingsPage() {
  const [filters, setFilters] = useState({ from: toDateOnly(), to: addDays(toDateOnly(), 30), memberId: '', coachId: '', status: '' })
  const [coaches, setCoaches] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [cancelItem, setCancelItem] = useState(null)
  const request = useRef(null)
  const setFilter = (key, value) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1) }
  useEffect(() => {
    const controller = new AbortController()
    api('/users?role=Coach&page=1&pageSize=50', { signal: controller.signal }).then((r) => setCoaches(r.items)).catch((err) => { if (err.name !== 'AbortError') setError(err.message) })
    return () => controller.abort()
  }, [])
  const load = useCallback(async () => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setLoading(true); setError(''); setData({ items: [], total: 0 })
    try {
      const result = await api(`/pt/bookings${query({ ...filters, page, pageSize })}`, { signal: controller.signal })
      if (!controller.signal.aborted) {
        setData(result)
        if (!result.items.length && page > 1) setPage(Math.max(1, Math.ceil(result.total / pageSize)))
      }
    } catch (err) { if (!controller.signal.aborted) setError(err.message) }
    finally { if (!controller.signal.aborted) setLoading(false) }
  }, [filters, page, pageSize])
  const stop = useCallback(() => request.current?.abort(), [])
  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => { if (active) load() })
    return () => { active = false; stop() }
  }, [load, stop])
  return <div className="flex flex-col gap-4">
    <div><h1 className="font-headline-xl text-headline-xl">Lịch PT trung tâm</h1><p className="text-secondary">Quản lý lịch PT và hủy buổi do trung tâm. Quyền lợi được cập nhật sau khi xác nhận.</p></div>
    <div className="bg-surface-container rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Field label="Từ ngày"><input type="date" required className={inputCls} value={filters.from} onChange={(e) => setFilter('from', e.target.value)} /></Field>
        <Field label="Đến ngày"><input type="date" required className={inputCls} value={filters.to} onChange={(e) => setFilter('to', e.target.value)} /></Field>
        <Field label="Coach"><select className={inputCls} value={filters.coachId} onChange={(e) => setFilter('coachId', e.target.value)}><option value="">Tất cả Coach</option>{coaches.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}</select></Field>
        <Field label="Trạng thái"><select className={inputCls} value={filters.status} onChange={(e) => setFilter('status', e.target.value)}><option value="">Tất cả</option>{Object.entries(BOOKING_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
      </div>
      <MemberLookupField onSelect={(id) => setFilter('memberId', id)} />
      <button type="button" className={btnPrimary} disabled={loading} onClick={load}>Làm mới danh sách</button>
    </div>
    {error && <Alert>{error}</Alert>}
    {notice && <Alert type="success">{notice}</Alert>}
    {loading && <p role="status">Đang tải booking PT…</p>}
    <div className="bg-surface-container-low rounded-xl overflow-x-auto border border-outline-variant/40">
      <table className="w-full text-left"><thead><tr className="bg-surface-container text-secondary"><th className="p-3">Member / Coach</th><th className="p-3">Ngày / giờ</th><th className="p-3">Bộ môn / phòng</th><th className="p-3">Trạng thái</th><th className="p-3">Thao tác</th></tr></thead><tbody>
        {data.items.map((b) => <tr key={b.bookingId} className="border-t border-surface-container">
          <td className="p-3"><b>{b.member}</b><div className="text-secondary">HLV {b.coach}</div></td>
          <td className="p-3">{b.date}<div>{fromTimeOnly(b.startTime)}–{fromTimeOnly(b.endTime)}</div></td>
          <td className="p-3">{b.sport}<div className="text-secondary">{b.room ?? '—'}</div></td>
          <td className="p-3"><Badge tone={b.status === 'Confirmed' ? 'indigo' : 'slate'}>{BOOKING_STATUS_LABEL[b.status] ?? b.status}</Badge></td>
          <td className="p-3">{b.status === 'Confirmed' && !hasScheduleStarted(b) && <button type="button" className={btnOutline} onClick={() => setCancelItem({ ...b, type: 'PT', title: `PT của ${b.member}` })}>Hủy PT trung tâm</button>}</td>
        </tr>)}
        {!loading && !data.items.length && <tr><td colSpan={5} className="p-6 text-center text-secondary">Không có booking phù hợp.</td></tr>}
      </tbody></table>
      <Pagination page={page} pageSize={pageSize} total={data.total} onPage={setPage} onPageSize={(size) => { setPageSize(size); setPage(1) }} />
    </div>
    {cancelItem && <CancelBookingModal item={cancelItem} kind="manager" onClose={() => setCancelItem(null)} onDone={() => { setCancelItem(null); setNotice('Đã hủy buổi PT trung tâm.'); load() }} />}
  </div>
}
