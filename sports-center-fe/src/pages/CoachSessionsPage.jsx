import { useCallback, useEffect, useState } from 'react'
import { api, query } from '../api'
import { useFlow2TimeRules } from '../flow2TimeRules'
import { CancelBookingModal } from '../components/scheduleActions'
import { OpenCheckInCodeButton, SelfCheckInButton } from '../components/classCheckIn'
import { Alert, Badge, Field, Icon, Modal, btnOutline, btnPrimary, inputCls } from '../components/ui'
import WeekTimetable from '../components/WeekTimetable'
import { CoachMessageModal } from '../components/frontDesk'
import { addDays, formatTimestamp, fromTimeOnly, hasScheduleStarted, toDateOnly, weekRange } from '../dateUtils'
import { ATTENDANCE_STATUS_LABEL, CHECK_IN_STATE_LABEL, PT_ATTENDANCE_STATUSES, SESSION_STATUS_LABEL } from '../labels'

const SESSION_STATUS_TONE = { Scheduled: 'green', Completed: 'slate', Cancelled: 'red' }
const CHECK_IN_STATE_TONE = { NotCheckedIn: 'slate', Present: 'green', Late: 'amber', Absent: 'red' }

// Class roster is read-only (self check-in is the only way to mark it — see FE-01 in the handoff doc);
// PT roster is still manually graded by the Coach, Present/Absent/Late only (no Excused).
function RosterModal({ item, onClose, onDone, onCancel, onMessage }) {
  const { enforceTimeRules } = useFlow2TimeRules()
  const isClass = item.type !== 'PT'
  const [roster, setRoster] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const path = isClass ? `/coach/sessions/class/${item.referenceId}/roster` : `/coach/sessions/pt/${item.referenceId}/roster`
      setRoster(await api(path))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [item, isClass])

  useEffect(() => {
    load()
  }, [load])

  const setStatus = (memberId, status) => setRoster((r) => r.map((x) => (x.memberId === memberId ? { ...x, status } : x)))

  const save = async () => {
    setBusy(true)
    setError('')
    try {
      const body = { items: roster.map((r) => ({ memberId: r.memberId, status: r.status })) }
      await api(`/pt/bookings/${item.referenceId}/attendance`, { method: 'PUT', body })
      onDone()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title={`${isClass ? 'Danh sách điểm danh' : 'Điểm danh'} — ${item.title}`} onClose={onClose}>
      {error && <Alert>{error}</Alert>}
      <div className={`flex flex-col gap-2 ${loading ? 'opacity-50' : ''}`}>
        {roster.map((r) => (
          <div key={r.memberId} className="flex items-center justify-between gap-3 py-2 border-b border-surface-container last:border-b-0">
            <div>
              <div className="font-semibold">{r.fullName} <span className="text-secondary font-normal">#{r.memberId}</span></div>
              <div className="text-secondary text-body-sm">{r.email}</div>
            </div>
            {isClass ? (
              <div className="text-right">
                <Badge tone={CHECK_IN_STATE_TONE[r.checkInState]}>{CHECK_IN_STATE_LABEL[r.checkInState] ?? r.checkInState}</Badge>
                {r.checkedInAt && <div className="text-body-sm text-secondary mt-0.5">{formatTimestamp(r.checkedInAt, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>}
              </div>
            ) : (
              <select className="h-9 px-2 rounded-lg border border-outline-variant bg-surface-container-lowest" value={r.status} onChange={(e) => setStatus(r.memberId, e.target.value)}>
                {PT_ATTENDANCE_STATUSES.map((v) => <option key={v} value={v}>{ATTENDANCE_STATUS_LABEL[v]}</option>)}
              </select>
            )}
          </div>
        ))}
        {!loading && !roster.length && <p className="text-secondary text-center py-6">Không có hội viên trong danh sách.</p>}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        {!isClass && item.status === 'Scheduled' && (!enforceTimeRules || !hasScheduleStarted(item)) && !roster.some((r) => r.attendanceRecorded || r.attendanceFinalized) && (
          <button type="button" disabled={busy || loading || !!error} className={btnOutline + ' !text-error'} onClick={() => onCancel(item)}>Hủy buổi PT</button>
        )}
        {isClass && (
          <button type="button" disabled={loading} className={btnOutline} onClick={() => onMessage(item)}>
            <Icon name="campaign" className="text-base" />
            Gửi thông báo / BTVN
          </button>
        )}
        <button type="button" className={btnOutline} onClick={onClose}>Đóng</button>
        {!isClass && (
          <button type="button" disabled={busy || !roster.length} className={btnPrimary} onClick={save}>{busy ? 'Đang lưu…' : 'Lưu điểm danh'}</button>
        )}
      </div>
    </Modal>
  )
}

function ListView({ setRosterItem }) {
  const today = toDateOnly(new Date())
  const [range, setRange] = useState({ from: addDays(today, -7), to: addDays(today, 14) })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    <>
      <div className="bg-surface-container rounded-xl shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Từ ngày">
            <input className={inputCls} type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
          </Field>
          <Field label="Đến ngày">
            <input className={inputCls} type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" className={btnOutline} onClick={() => setRange({ from: addDays(today, -7), to: addDays(today, 14) })}>Đặt lại</button>
          <button type="button" className={btnPrimary} onClick={load}>Tìm kiếm</button>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3 w-14">STT</th>
              <th className="px-4 py-3">Nội dung</th>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Phòng</th>
              <th className="px-4 py-3">Học viên</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {items.map((it, i) => (
              <tr key={`${it.type}-${it.referenceId}`} className="border-t border-surface-container">
                <td className="px-4 py-3 text-secondary">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">{it.type === 'PT' ? 'PT' : 'Lớp học'}</span>
                    <span className="font-semibold">{it.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-secondary">{it.date} • {fromTimeOnly(it.startTime)}-{fromTimeOnly(it.endTime)}</td>
                <td className="px-4 py-3 text-secondary">{it.room ?? '—'}</td>
                <td className="px-4 py-3 text-secondary">{it.participantCount}</td>
                <td className="px-4 py-3"><Badge tone={SESSION_STATUS_TONE[it.status]}>{SESSION_STATUS_LABEL[it.status]}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <button className={btnOutline + ' !h-9'} onClick={() => setRosterItem(it)}>
                      <Icon name="fact_check" className="text-base" />
                      {it.type === 'PT' ? 'Điểm danh' : 'Danh sách'}
                    </button>
                    {it.type !== 'PT' && it.status === 'Scheduled' && (
                      <>
                        <OpenCheckInCodeButton sessionId={it.referenceId} className={btnOutline + ' !h-9 !px-2'} />
                        <SelfCheckInButton sessionId={it.referenceId} as="coach" className={btnOutline + ' !h-9 !px-2'} onDone={load} />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !items.length && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-secondary">Không có buổi nào trong khoảng thời gian này.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

function WeekView({ setRosterItem }) {
  const [weekStart, setWeekStart] = useState(weekRange()[0])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await api(`/coach/sessions${query({ from: weekStart, to: addDays(weekStart, 6) })}`))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [weekStart])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      {error && <Alert>{error}</Alert>}
      <div className={loading ? 'opacity-50' : ''}>
        <WeekTimetable
          weekStart={weekStart}
          onWeekChange={setWeekStart}
          items={items}
          onItemClick={setRosterItem}
          statusLabel={(it) => SESSION_STATUS_LABEL[it.status]}
          renderMeta={(it) => (
            <>
              <Icon name="group" className="text-sm" />
              {it.type === 'PT' ? 'PT' : `${it.participantCount} học viên`}
            </>
          )}
        />
      </div>
    </>
  )
}

export default function CoachSessionsPage() {
  const [view, setView] = useState('week')
  const [rosterItem, setRosterItem] = useState(null)
  const [cancelItem, setCancelItem] = useState(null)
  const [messageItem, setMessageItem] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-headline-xl text-headline-xl">Lịch dạy</h1>
          <p className="text-secondary">Các buổi lớp học và PT bạn phụ trách. Bấm vào một buổi để điểm danh.</p>
        </div>
        <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl w-fit">
          {[['week', 'Thời khóa biểu'], ['list', 'Danh sách']].map(([v, l]) => (
            <button
              key={v}
              className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${view === v ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              onClick={() => setView(v)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {view === 'week' ? <WeekView key={reloadKey} setRosterItem={setRosterItem} /> : <ListView key={reloadKey} setRosterItem={setRosterItem} />}

      {rosterItem && <RosterModal item={rosterItem} onClose={() => setRosterItem(null)} onDone={() => { setRosterItem(null); setReloadKey((k) => k + 1) }} onCancel={(item) => { setRosterItem(null); setCancelItem({ ...item, bookingId: item.referenceId }) }} onMessage={(item) => { setRosterItem(null); setMessageItem(item) }} />}
      {messageItem && <CoachMessageModal item={messageItem} onClose={() => setMessageItem(null)} />}
      {cancelItem && <CancelBookingModal item={cancelItem} kind="coach" onClose={() => setCancelItem(null)} onDone={() => { setCancelItem(null); setReloadKey((k) => k + 1) }} />}
    </div>
  )
}
