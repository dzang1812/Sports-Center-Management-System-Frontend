import { useCallback, useEffect, useState } from 'react'
import { api, query } from '../api'
import { Alert, Badge, Icon, Modal, btnOutline, btnPrimary } from '../components/ui'
import { addDays, fromTimeOnly, toDateOnly } from '../dateUtils'
import { ATTENDANCE_STATUS_LABEL, SESSION_STATUS_LABEL } from '../labels'

const SESSION_STATUS_TONE = { Scheduled: 'green', Completed: 'slate', Cancelled: 'red' }

function RosterModal({ item, onClose, onDone }) {
  const [roster, setRoster] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const path = item.type === 'PT' ? `/coach/sessions/pt/${item.referenceId}/roster` : `/coach/sessions/class/${item.referenceId}/roster`
      setRoster(await api(path))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [item])

  useEffect(() => {
    load()
  }, [load])

  const setStatus = (memberId, status) => setRoster((r) => r.map((x) => (x.memberId === memberId ? { ...x, status } : x)))

  const save = async () => {
    setBusy(true)
    setError('')
    try {
      const path = item.type === 'PT' ? `/pt/bookings/${item.referenceId}/attendance` : `/sessions/${item.referenceId}/attendance`
      const body = { items: roster.map((r) => ({ memberId: r.memberId, status: r.status })) }
      await api(path, { method: 'PUT', body })
      onDone()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title={`Điểm danh — ${item.title}`} onClose={onClose}>
      {error && <Alert>{error}</Alert>}
      <div className={`flex flex-col gap-2 ${loading ? 'opacity-50' : ''}`}>
        {roster.map((r) => (
          <div key={r.memberId} className="flex items-center justify-between gap-3 py-2 border-b border-surface-container last:border-b-0">
            <div>
              <div className="font-semibold">{r.fullName}</div>
              <div className="text-secondary text-body-sm">{r.email}</div>
            </div>
            <select className="h-9 px-2 rounded-lg border border-outline-variant bg-surface-container-lowest" value={r.status} onChange={(e) => setStatus(r.memberId, e.target.value)}>
              {Object.entries(ATTENDANCE_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        ))}
        {!loading && !roster.length && <p className="text-secondary text-center py-6">Không có hội viên trong danh sách.</p>}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className={btnOutline} onClick={onClose}>Đóng</button>
        <button type="button" disabled={busy || !roster.length} className={btnPrimary} onClick={save}>{busy ? 'Đang lưu…' : 'Lưu điểm danh'}</button>
      </div>
    </Modal>
  )
}

export default function CoachSessionsPage() {
  const today = toDateOnly(new Date())
  const [range, setRange] = useState({ from: addDays(today, -7), to: addDays(today, 14) })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rosterItem, setRosterItem] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await api(`/coach/sessions${query(range)}`))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [range])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Lịch dạy</h1>
        <p className="text-secondary">Các buổi lớp học và PT bạn phụ trách. Bấm vào một buổi để điểm danh.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input className="h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest" type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
        <input className="h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest" type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
      </div>

      {error && <Alert>{error}</Alert>}

      <div className={`flex flex-col gap-3 ${loading ? 'opacity-50' : ''}`}>
        {items.map((it) => (
          <div key={`${it.type}-${it.referenceId}`} className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">{it.type === 'PT' ? 'PT' : 'Lớp học'}</span>
                <span className="font-semibold">{it.title}</span>
                <Badge tone={SESSION_STATUS_TONE[it.status]}>{SESSION_STATUS_LABEL[it.status]}</Badge>
              </div>
              <div className="text-secondary text-body-sm">
                {it.date} • {fromTimeOnly(it.startTime)}-{fromTimeOnly(it.endTime)} • {it.room ?? '—'} • {it.participantCount} học viên
              </div>
            </div>
            <button className={btnOutline} onClick={() => setRosterItem(it)}>
              <Icon name="fact_check" className="text-lg" />
              Điểm danh
            </button>
          </div>
        ))}
        {!loading && !items.length && <p className="text-secondary text-center py-10">Không có buổi nào trong khoảng thời gian này.</p>}
      </div>

      {rosterItem && <RosterModal item={rosterItem} onClose={() => setRosterItem(null)} onDone={() => { setRosterItem(null); load() }} />}
    </div>
  )
}
