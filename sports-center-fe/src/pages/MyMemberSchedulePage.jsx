import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, query } from '../api'
import { useFlow2TimeRules } from '../flow2TimeRules'
import { SelfCheckInButton } from '../components/classCheckIn'
import { Alert, Badge, Field, Modal, Pagination, btnOutline, btnPrimary, inputCls } from '../components/ui'
import WeekTimetable from '../components/WeekTimetable'
import { addDays, fromTimeOnly, toDateOnly, weekRange } from '../dateUtils'
import { ATTENDANCE_STATUS_LABEL, BOOKING_STATUS_LABEL } from '../labels'

// item.date is "yyyy-MM-dd", item.endTime/startTime are "HH:mm:ss" — all local wall-clock values, safe to concatenate.
const isPastItem = (item) => new Date(`${item.date}T${item.endTime}`) < new Date()
const startOf = (item) => new Date(`${item.date}T${item.startTime}`).getTime()

// Upcoming first (soonest at top), past items pushed to the end (most recently passed first).
const compareSchedule = (a, b) => {
  const aPast = isPastItem(a)
  const bPast = isPastItem(b)
  if (aPast !== bPast) return aPast ? 1 : -1
  return aPast ? startOf(b) - startOf(a) : startOf(a) - startOf(b)
}

// Reflects what actually happened, not just the booking record: once a session has ended, Present/Late
// (real check-in/coach-marked attendance) beats the stale "Confirmed" booking status; no attendance means missed.
function effectiveStatus(item, enforceTimeRules = true) {
  if (item.status === 'Cancelled') return { label: BOOKING_STATUS_LABEL.Cancelled, tone: 'slate' }
  if (!isPastItem(item)) return { label: BOOKING_STATUS_LABEL[item.status], tone: 'indigo' }
  if (item.attendanceStatus === 'Present' || item.attendanceStatus === 'Late') return { label: ATTENDANCE_STATUS_LABEL[item.attendanceStatus], tone: 'green' }
  if (!enforceTimeRules) return { label: BOOKING_STATUS_LABEL[item.status], tone: 'indigo' }
  return { label: 'Đã qua — Vắng mặt', tone: 'red' }
}

function CancelConfirmModal({ item, onClose, onConfirm, busy }) {
  return (
    <Modal title="Xác nhận huỷ" onClose={onClose}>
      <p className="text-on-surface">
        Huỷ {item.type === 'PT' ? 'lịch PT' : 'lớp'} <b>"{item.title}"</b> ngày {item.date} lúc {fromTimeOnly(item.startTime)}?
      </p>
      <div className="flex justify-end gap-2 pt-5">
        <button type="button" className={btnOutline} onClick={onClose}>Giữ lại</button>
        <button type="button" disabled={busy} className={btnPrimary + ' !bg-error !text-white hover:!opacity-90'} onClick={onConfirm}>
          {busy ? 'Đang huỷ…' : 'Huỷ lịch'}
        </button>
      </div>
    </Modal>
  )
}

function RescheduleModal({ item, onClose, onConfirm, busy, error }) {
  const { enforceTimeRules, refresh } = useFlow2TimeRules()
  const [date, setDate] = useState(item.date)
  const [time, setTime] = useState(fromTimeOnly(item.startTime))

  const submit = (e) => {
    e.preventDefault()
    onConfirm(date, time)
  }

  return (
    <Modal title="Đổi lịch PT" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Ngày mới">
          <input className={inputCls} type="date" required min={enforceTimeRules ? toDateOnly(new Date()) : undefined} onFocus={refresh} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Giờ bắt đầu mới">
          <input className={inputCls} type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnOutline} onClick={onClose}>Huỷ</button>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Đang lưu…' : 'Lưu lịch mới'}</button>
        </div>
      </form>
    </Modal>
  )
}

function MySchedule() {
  const { enforceTimeRules, refresh } = useFlow2TimeRules()
  const today = toDateOnly(new Date())
  const [range, setRange] = useState({ from: addDays(today, -7), to: addDays(today, 30) })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [cancelItem, setCancelItem] = useState(null)
  const [rescheduleItem, setRescheduleItem] = useState(null)
  const [rescheduleError, setRescheduleError] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await api(`/me/schedule${query({ ...range, includeCancelled: false })}`))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [range])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [range, typeFilter, timeFilter])

  const sorted = useMemo(
    () =>
      items
        .filter((i) => typeFilter === 'all' || i.type === typeFilter)
        .filter((i) => timeFilter === 'all' || (timeFilter === 'past') === isPastItem(i))
        .sort(compareSchedule),
    [items, typeFilter, timeFilter],
  )
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize)

  const confirmCancel = async () => {
    const item = cancelItem
    setBusyId(item.bookingId)
    setError('')
    setNotice('')
    try {
      if (item.type === 'PT') await api(`/pt/bookings/${item.bookingId}`, { method: 'DELETE' })
      else await api(`/bookings/${item.bookingId}`, { method: 'DELETE' })
      setCancelItem(null)
      setNotice('Đã huỷ thành công.')
      load()
    } catch (err) {
      setError(err.message)
    }
    setBusyId(null)
  }

  const confirmReschedule = async (date, time) => {
    const item = rescheduleItem
    setBusyId(item.bookingId)
    setRescheduleError('')
    try {
      await api(`/pt/bookings/${item.bookingId}/reschedule`, { method: 'PUT', body: { date, startTime: `${time}:00`, roomId: item.roomId ?? null } })
      setRescheduleItem(null)
      setNotice('Đã đổi lịch PT thành công.')
      load()
    } catch (err) {
      setRescheduleError(err.message)
    }
    setBusyId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface-container rounded-xl shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Từ ngày">
            <input className={inputCls} type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
          </Field>
          <Field label="Đến ngày">
            <input className={inputCls} type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
          </Field>
          <Field label="Loại">
            <select className={inputCls} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">— Tất cả —</option>
              <option value="Class">Lớp học</option>
              <option value="PT">PT</option>
            </select>
          </Field>
          <Field label="Thời gian">
            <select className={inputCls} value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
              <option value="all">Sắp tới &amp; đã qua</option>
              <option value="upcoming">Chỉ sắp tới</option>
              <option value="past">Chỉ đã qua</option>
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            className={btnOutline}
            onClick={() => {
              setRange({ from: addDays(today, -7), to: addDays(today, 30) })
              setTypeFilter('all')
              setTimeFilter('all')
            }}
          >
            Đặt lại
          </button>
          <button type="button" className={btnPrimary} onClick={load}>Tìm kiếm</button>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3 w-14">STT</th>
              <th className="px-4 py-3">Nội dung</th>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">HLV</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {paged.map((item, i) => {
              const past = isPastItem(item)
              const eff = effectiveStatus(item, enforceTimeRules)
              return (
                <tr key={`${item.type}-${item.bookingId}`} className={`border-t border-surface-container ${past ? 'opacity-70' : ''}`}>
                  <td className="px-4 py-3 text-secondary">{(page - 1) * pageSize + i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">{item.type === 'PT' ? 'PT' : 'Lớp học'}</span>
                      <span className="font-semibold">{item.title}</span>
                    </div>
                    <span className="text-secondary text-body-sm">{item.room ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-secondary">{item.date} • {fromTimeOnly(item.startTime)}-{fromTimeOnly(item.endTime)}</td>
                  <td className="px-4 py-3 text-secondary">{item.coach}</td>
                  <td className="px-4 py-3"><Badge tone={eff.tone}>{eff.label}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    {item.status === 'Confirmed' && (!enforceTimeRules || !past) && (
                      <div className="flex gap-2 justify-end">
                        {item.type === 'PT' ? (
                          <button className={btnOutline + ' !h-9'} disabled={busyId === item.bookingId} onClick={() => { refresh(); setRescheduleItem(item) }}>Đổi lịch</button>
                        ) : (
                          <SelfCheckInButton sessionId={item.referenceId} className={btnOutline + ' !h-9'} onDone={load} />
                        )}
                        <button className={btnOutline + ' !h-9'} disabled={busyId === item.bookingId} onClick={() => setCancelItem(item)}>Huỷ</button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            {!loading && !sorted.length && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-secondary">Không có lịch nào phù hợp bộ lọc.</td></tr>
            )}
          </tbody>
        </table>
        {!!sorted.length && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={sorted.length}
            onPage={setPage}
            onPageSize={(n) => {
              setPageSize(n)
              setPage(1)
            }}
          />
        )}
      </div>

      {cancelItem && (
        <CancelConfirmModal item={cancelItem} busy={busyId === cancelItem.bookingId} onClose={() => setCancelItem(null)} onConfirm={confirmCancel} />
      )}
      {rescheduleItem && (
        <RescheduleModal
          item={rescheduleItem}
          busy={busyId === rescheduleItem.bookingId}
          error={rescheduleError}
          onClose={() => {
            setRescheduleItem(null)
            setRescheduleError('')
          }}
          onConfirm={confirmReschedule}
        />
      )}
    </div>
  )
}

function WeekView() {
  const { enforceTimeRules } = useFlow2TimeRules()
  const [weekStart, setWeekStart] = useState(weekRange()[0])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await api(`/me/schedule${query({ from: weekStart, to: addDays(weekStart, 6), includeCancelled: false })}`))
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
          statusLabel={(it) => effectiveStatus(it, enforceTimeRules).label}
          statusTone={(it) => effectiveStatus(it, enforceTimeRules).tone}
          renderMeta={(it) => (
            <>
              <span className="material-symbols-outlined text-sm">person</span>
              HLV {it.coach}
            </>
          )}
        />
      </div>
    </>
  )
}

const ATTENDANCE_STATUS_TONE = { Present: 'green', Late: 'amber', Absent: 'red', Excused: 'slate' }
const ATTENDANCE_STATUS_ICON = { Present: 'check_circle', Late: 'schedule', Absent: 'cancel', Excused: 'event_busy' }
const NOT_MARKED = { label: 'Chưa điểm danh', tone: 'amber', icon: 'hourglass_top' }

// Each Class groups multiple sessions under one classId; PT has no shared "class" identity, so it's
// offered as a single bucket instead of per-booking.
const classKey = (i) => (i.type === 'PT' ? 'pt' : `class-${i.classId}`)

function AttendanceHistory() {
  const now = new Date()
  const [period, setPeriod] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 })
  const [classFilter, setClassFilter] = useState('all')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      setData(await api(`/me/attendance${query(period)}`))
    } catch (err) {
      setError(err.message)
    }
  }, [period])

  useEffect(() => {
    load()
  }, [load])

  const classOptions = useMemo(() => {
    const seen = new Map()
    for (const i of data?.items ?? []) {
      const key = classKey(i)
      if (!seen.has(key)) seen.set(key, i.type === 'PT' ? 'Personal Training' : i.title)
    }
    return [...seen.entries()]
  }, [data])

  const items = (data?.items ?? []).filter((i) => classFilter === 'all' || classKey(i) === classFilter)
  // Scoped to the class currently selected — not the whole-month totals from the API.
  const ended = items.filter((i) => i.status !== null)
  const attended = ended.filter((i) => i.status === 'Present' || i.status === 'Late').length
  const absences = ended.filter((i) => i.status === 'Absent').length
  const upcoming = items.length - ended.length
  const rate = ended.length ? Math.round((attended / ended.length) * 100) : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface-container rounded-xl shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Năm">
            <input className={inputCls} type="number" min={2000} value={period.year} onChange={(e) => setPeriod({ ...period, year: Number(e.target.value) })} />
          </Field>
          <Field label="Tháng">
            <select className={inputCls} value={period.month} onChange={(e) => setPeriod({ ...period, month: Number(e.target.value) })}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>Tháng {m}</option>)}
            </select>
          </Field>
          <Field label="Lớp học">
            <select className={inputCls} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="all">— Tất cả —</option>
              {classOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      {data && (
        <>
          <div className="flex items-center gap-3 bg-primary-container/10 border border-primary-container/30 rounded-xl px-4 py-3">
            <span className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">info</span>
            </span>
            <span className="text-on-surface">
              Tỷ lệ tham gia <b>{rate}%</b> ({attended}/{ended.length} buổi)
              {absences > 0 && <> — <b className="text-error">Vắng {absences} buổi</b></>}
              {upcoming > 0 && <> — còn <b>{upcoming}</b> buổi chưa điểm danh</>}
            </span>
          </div>

          <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
                  <th className="px-4 py-3 w-14">#</th>
                  <th className="px-4 py-3">Ngày học</th>
                  <th className="px-4 py-3">Slot học</th>
                  <th className="px-4 py-3">Phòng</th>
                  <th className="px-4 py-3">Giảng viên</th>
                  <th className="px-4 py-3">Lớp học</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i, idx) => {
                  const st = i.status ? { label: ATTENDANCE_STATUS_LABEL[i.status], tone: ATTENDANCE_STATUS_TONE[i.status], icon: ATTENDANCE_STATUS_ICON[i.status] } : NOT_MARKED
                  return (
                  <tr key={`${i.type}-${i.referenceId}-${i.date}`} className="border-t border-surface-container">
                    <td className="px-4 py-3 text-secondary">{idx + 1}</td>
                    <td className="px-4 py-3">{i.date}</td>
                    <td className="px-4 py-3 text-secondary">{fromTimeOnly(i.startTime)} - {fromTimeOnly(i.endTime)}</td>
                    <td className="px-4 py-3 text-secondary">{i.room ?? '—'}</td>
                    <td className="px-4 py-3 text-secondary">{i.coach}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">{i.type === 'PT' ? 'PT' : 'Lớp học'}</span>
                        <span className="font-semibold">{i.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={st.tone}>
                        <span className="material-symbols-outlined text-sm align-middle mr-1">{st.icon}</span>
                        {st.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-secondary">—</td>
                  </tr>
                  )
                })}
                {!items.length && <tr><td colSpan={8} className="px-4 py-10 text-center text-secondary">Chưa có dữ liệu điểm danh.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default function MyMemberSchedulePage() {
  const [tab, setTab] = useState('mine')

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Lịch của tôi</h1>
        <p className="text-secondary">Các lớp và buổi PT đã đặt, cùng lịch sử điểm danh.</p>
      </div>

      <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl w-fit">
        {[['week', 'Thời khóa biểu'], ['mine', 'Lịch của tôi'], ['attendance', 'Điểm danh']].map(([v, l]) => (
          <button
            key={v}
            className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${tab === v ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            onClick={() => setTab(v)}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'week' && <WeekView />}
      {tab === 'mine' && <MySchedule />}
      {tab === 'attendance' && <AttendanceHistory />}
    </div>
  )
}
