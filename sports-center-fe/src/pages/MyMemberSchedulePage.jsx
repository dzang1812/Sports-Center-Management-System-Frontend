import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, query } from '../api'
import { SelfCheckInButton } from '../components/classCheckIn'
import { Alert, Field, Modal, Pagination, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { addDays, fromTimeOnly, toDateOnly } from '../dateUtils'
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
          <input className={inputCls} type="date" required min={toDateOnly(new Date())} value={date} onChange={(e) => setDate(e.target.value)} />
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
      <div className="flex flex-wrap gap-3">
        <input className={`${inputCls} !h-10 !w-auto`} type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
        <input className={`${inputCls} !h-10 !w-auto`} type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
        <select className={`${inputCls} !h-10 !w-auto`} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">Tất cả loại</option>
          <option value="Class">Lớp học</option>
          <option value="PT">PT</option>
        </select>
        <select className={`${inputCls} !h-10 !w-auto`} value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
          <option value="all">Sắp tới &amp; đã qua</option>
          <option value="upcoming">Chỉ sắp tới</option>
          <option value="past">Chỉ đã qua</option>
        </select>
      </div>

      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      <div className={`flex flex-col gap-3 ${loading ? 'opacity-50' : ''}`}>
        {paged.map((item) => {
          const past = isPastItem(item)
          return (
            <div
              key={`${item.type}-${item.bookingId}`}
              className={`rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                past ? 'bg-surface-container-low opacity-70' : 'bg-surface-container-lowest'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">{item.type === 'PT' ? 'PT' : 'Lớp học'}</span>
                  <span className="font-semibold">{item.title}</span>
                  {past && (
                    <span className="px-2 py-0.5 rounded-full bg-outline-variant/40 text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">history</span>
                      Đã qua
                    </span>
                  )}
                </div>
                <div className="text-secondary text-body-sm">
                  {item.date} • {fromTimeOnly(item.startTime)}-{fromTimeOnly(item.endTime)} • {item.room ?? '—'} • HLV {item.coach}
                </div>
                <div className="text-body-sm text-secondary">{BOOKING_STATUS_LABEL[item.status]}</div>
              </div>
              {item.status === 'Confirmed' && !past && (
                <div className="flex gap-2 shrink-0">
                  {item.type === 'PT' ? (
                    <button className={btnOutline} disabled={busyId === item.bookingId} onClick={() => setRescheduleItem(item)}>Đổi lịch</button>
                  ) : (
                    <SelfCheckInButton sessionId={item.referenceId} className={btnOutline} onDone={load} />
                  )}
                  <button className={btnOutline} disabled={busyId === item.bookingId} onClick={() => setCancelItem(item)}>Huỷ</button>
                </div>
              )}
            </div>
          )
        })}
        {!loading && !sorted.length && <p className="text-secondary text-center py-10">Không có lịch nào phù hợp bộ lọc.</p>}
      </div>

      {!!sorted.length && (
        <div className="bg-surface-container-lowest rounded-xl">
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
        </div>
      )}

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

function AttendanceHistory() {
  const now = new Date()
  const [period, setPeriod] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 })
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <input className={`${inputCls} !h-10 !w-24`} type="number" min={2000} value={period.year} onChange={(e) => setPeriod({ ...period, year: Number(e.target.value) })} />
        <select className={`${inputCls} !h-10 !w-auto`} value={period.month} onChange={(e) => setPeriod({ ...period, month: Number(e.target.value) })}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>Tháng {m}</option>)}
        </select>
      </div>

      {error && <Alert>{error}</Alert>}

      {data && (
        <>
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <span className="font-headline-md text-headline-md">{Number(data.attendanceRate).toFixed(0)}%</span>
            <span className="text-secondary ml-2">
              ({data.attendedSessions}/{data.countedSessions} buổi — {data.formula})
            </span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase">
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Nội dung</th>
                  <th className="px-4 py-3">Điểm danh</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((i, idx) => (
                  <tr key={idx} className="border-t border-surface-container">
                    <td className="px-4 py-3">{i.date}</td>
                    <td className="px-4 py-3">{i.title}</td>
                    <td className="px-4 py-3">{ATTENDANCE_STATUS_LABEL[i.status]}</td>
                  </tr>
                ))}
                {!data.items.length && <tr><td colSpan={3} className="px-4 py-10 text-center text-secondary">Chưa có dữ liệu điểm danh.</td></tr>}
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
        {[['mine', 'Lịch của tôi'], ['attendance', 'Điểm danh']].map(([v, l]) => (
          <button
            key={v}
            className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${tab === v ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            onClick={() => setTab(v)}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'mine' && <MySchedule />}
      {tab === 'attendance' && <AttendanceHistory />}
    </div>
  )
}
