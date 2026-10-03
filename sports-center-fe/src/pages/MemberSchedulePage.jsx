import { useCallback, useEffect, useState } from 'react'
import { api, query } from '../api'
import { ClassBrowser } from '../components/booking'
import { Alert, btnOutline, inputCls } from '../components/ui'
import { addDays, fromTimeOnly, toDateOnly } from '../dateUtils'
import { ATTENDANCE_STATUS_LABEL, BOOKING_STATUS_LABEL } from '../labels'

function MySchedule() {
  const today = toDateOnly(new Date())
  const [range, setRange] = useState({ from: addDays(today, -7), to: addDays(today, 30) })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)

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

  const cancel = async (item) => {
    if (!window.confirm(`Huỷ ${item.type === 'PT' ? 'lịch PT' : 'lớp'} "${item.title}" ngày ${item.date}?`)) return
    setBusyId(item.bookingId)
    setError('')
    setNotice('')
    try {
      if (item.type === 'PT') await api(`/pt/bookings/${item.bookingId}`, { method: 'DELETE' })
      else await api(`/bookings/${item.bookingId}`, { method: 'DELETE' })
      setNotice('Đã huỷ thành công.')
      load()
    } catch (err) {
      setError(err.message)
    }
    setBusyId(null)
  }

  const reschedule = async (item) => {
    const date = window.prompt('Ngày mới (yyyy-mm-dd):', item.date)
    if (!date) return
    const time = window.prompt('Giờ bắt đầu mới (HH:mm):', fromTimeOnly(item.startTime))
    if (!time) return
    setBusyId(item.bookingId)
    setError('')
    try {
      await api(`/pt/bookings/${item.bookingId}/reschedule`, { method: 'PUT', body: { date, startTime: `${time}:00`, roomId: item.roomId ?? null } })
      setNotice('Đã đổi lịch PT thành công.')
      load()
    } catch (err) {
      setError(err.message)
    }
    setBusyId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <input className={`${inputCls} !h-10 !w-auto`} type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
        <input className={`${inputCls} !h-10 !w-auto`} type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
      </div>

      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      <div className={`flex flex-col gap-3 ${loading ? 'opacity-50' : ''}`}>
        {items.map((item) => (
          <div key={`${item.type}-${item.bookingId}`} className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">{item.type === 'PT' ? 'PT' : 'Lớp học'}</span>
                <span className="font-semibold">{item.title}</span>
              </div>
              <div className="text-secondary text-body-sm">
                {item.date} • {fromTimeOnly(item.startTime)}-{fromTimeOnly(item.endTime)} • {item.room ?? '—'} • HLV {item.coach}
              </div>
              <div className="text-body-sm text-secondary">{BOOKING_STATUS_LABEL[item.status]}</div>
            </div>
            {item.status === 'Confirmed' && (
              <div className="flex gap-2 shrink-0">
                {item.type === 'PT' && (
                  <button className={btnOutline} disabled={busyId === item.bookingId} onClick={() => reschedule(item)}>Đổi lịch</button>
                )}
                <button className={btnOutline} disabled={busyId === item.bookingId} onClick={() => cancel(item)}>Huỷ</button>
              </div>
            )}
          </div>
        ))}
        {!loading && !items.length && <p className="text-secondary text-center py-10">Chưa có lịch nào trong khoảng thời gian này.</p>}
      </div>
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

export default function MemberSchedulePage() {
  const [tab, setTab] = useState('book')

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Lịch lớp học</h1>
        <p className="text-secondary">Đặt lớp mới, xem lịch của bạn và lịch sử điểm danh.</p>
      </div>

      <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl w-fit">
        {[['book', 'Đặt lớp mới'], ['mine', 'Lịch của tôi'], ['attendance', 'Điểm danh']].map(([v, l]) => (
          <button
            key={v}
            className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${tab === v ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            onClick={() => setTab(v)}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'book' && <ClassBrowser />}
      {tab === 'mine' && <MySchedule />}
      {tab === 'attendance' && <AttendanceHistory />}
    </div>
  )
}
