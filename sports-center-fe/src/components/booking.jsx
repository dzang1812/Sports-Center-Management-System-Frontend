import { useCallback, useEffect, useState } from 'react'
import { api, query } from '../api'
import { OpenCheckInCodeButton } from './classCheckIn'
import { addDays, fromTimeOnly, toDateOnly } from '../dateUtils'
import { LEVEL_LABEL } from '../labels'
import { Alert, Field, Icon, btnOutline, btnPrimary, inputCls } from './ui'

// Shared by MemberSchedulePage ("Đặt lớp mới" tab) and ReceptionClassBookingPage.
// When requireMemberId is true (Receptionist acting on behalf of a member), a numeric
// Member ID field is shown and must be filled before booking — the backend has no
// member-lookup API, so the receptionist has to already know the member's ID.
export function ClassBrowser({ requireMemberId = false }) {
  const today = toDateOnly(new Date())
  const [filters, setFilters] = useState({ sportId: '', coachId: '', level: '', from: today, to: addDays(today, 14) })
  const [sports, setSports] = useState([])
  const [sessions, setSessions] = useState([])
  const [bookedIds, setBookedIds] = useState(new Set())
  const [memberId, setMemberId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    api('/sports').then((list) => setSports(list.filter((s) => s.hasClasses))).catch(() => {})
  }, [])

  // Reset what we know about this actor's own bookings when switching who we're booking for (Reception).
  useEffect(() => {
    setBookedIds(new Set())
  }, [requireMemberId, memberId])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { items } = await api(`/sessions${query({ ...filters, pageSize: 50 })}`)
      setSessions(items.filter((s) => s.status === 'Scheduled'))
      // GET /me/schedule is Member-only — skip it when acting on behalf of someone else (Receptionist).
      if (!requireMemberId) {
        const mine = await api(`/me/schedule${query({ ...filters, includeCancelled: false })}`)
        setBookedIds(new Set(mine.filter((m) => m.type === 'Class' && m.status === 'Confirmed').map((m) => m.referenceId)))
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [filters, requireMemberId])

  useEffect(() => {
    load()
  }, [load])

  const setFilter = (k) => (e) => setFilters({ ...filters, [k]: e.target.value })

  const book = async (session) => {
    if (requireMemberId && !memberId) {
      setError('Vui lòng nhập mã hội viên trước khi đặt lớp.')
      return
    }
    setBusyId(session.id)
    setError('')
    setNotice('')
    try {
      await api(`/sessions/${session.id}/bookings`, { method: 'POST', body: { memberId: requireMemberId ? Number(memberId) : null } })
      setNotice(`Đã đặt chỗ lớp "${session.className}" ngày ${session.date}.`)
      setBookedIds((prev) => new Set(prev).add(session.id))
      load()
    } catch (err) {
      setError(err.message)
    }
    setBusyId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {requireMemberId && (
        <Field label="Mã hội viên (Member ID)" hint="Chưa có tra cứu hội viên — cần biết sẵn mã số.">
          <input className={inputCls} type="number" min={1} value={memberId} onChange={(e) => setMemberId(e.target.value)} />
        </Field>
      )}

      <div className="flex flex-wrap gap-3">
        <select className={`${inputCls} !h-10 !w-auto`} value={filters.sportId} onChange={setFilter('sportId')}>
          <option value="">Tất cả bộ môn</option>
          {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className={`${inputCls} !h-10 !w-auto`} value={filters.level} onChange={setFilter('level')}>
          <option value="">Mọi cấp độ</option>
          {Object.entries(LEVEL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input className={`${inputCls} !h-10 !w-auto`} type="date" value={filters.from} onChange={setFilter('from')} />
        <input className={`${inputCls} !h-10 !w-auto`} type="date" value={filters.to} onChange={setFilter('to')} />
      </div>

      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      <div className={`grid grid-cols-1 gap-3 ${loading ? 'opacity-50' : ''}`}>
        {sessions.map((s) => (
          <div key={s.id} className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{s.className}</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">{LEVEL_LABEL[s.level]}</span>
              </div>
              <div className="text-secondary text-body-sm">
                {s.date} • {fromTimeOnly(s.startTime)}-{fromTimeOnly(s.endTime)} • {s.room} • HLV {s.coach ?? '—'}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-body-sm text-secondary">Còn {s.remainingSeats}/{s.capacity} chỗ</span>
              {requireMemberId && <OpenCheckInCodeButton sessionId={s.id} />}
              <button
                className={bookedIds.has(s.id) ? btnOutline : btnPrimary}
                disabled={busyId === s.id || bookedIds.has(s.id) || s.remainingSeats <= 0}
                onClick={() => book(s)}
              >
                <Icon name={bookedIds.has(s.id) ? 'check_circle' : 'event_available'} className="text-lg" />
                {bookedIds.has(s.id) ? 'Đã đăng ký' : s.remainingSeats <= 0 ? 'Hết chỗ' : busyId === s.id ? 'Đang đặt…' : 'Đăng ký'}
              </button>
            </div>
          </div>
        ))}
        {!loading && !sessions.length && <p className="text-secondary text-center py-10">Không có buổi học phù hợp trong khoảng thời gian này.</p>}
      </div>
    </div>
  )
}

// Shared by MemberPtPage and ReceptionPtBookingPage.
export function PtBrowser({ requireMemberId = false }) {
  const today = toDateOnly(new Date())
  const [coaches, setCoaches] = useState([])
  const [coach, setCoach] = useState(null)
  const [sportId, setSportId] = useState('')
  const [range, setRange] = useState({ from: today, to: addDays(today, 7) })
  const [slots, setSlots] = useState([])
  const [memberId, setMemberId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [busyKey, setBusyKey] = useState(null)

  useEffect(() => {
    api('/pt/coaches').then(setCoaches).catch((err) => setError(err.message))
  }, [])

  const loadSlots = useCallback(async () => {
    if (!coach || !sportId) return
    setLoading(true)
    setError('')
    try {
      setSlots(await api(`/pt/coaches/${coach.id}/slots${query({ sportId, ...range })}`))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [coach, sportId, range])

  useEffect(() => {
    loadSlots()
  }, [loadSlots])

  const selectCoach = (c) => {
    setCoach(c)
    setSportId(c.sports[0]?.id ?? '')
    setSlots([])
  }

  const book = async (slot) => {
    if (requireMemberId && !memberId) {
      setError('Vui lòng nhập mã hội viên trước khi đặt lịch PT.')
      return
    }
    const key = `${slot.date}-${slot.startTime}`
    setBusyKey(key)
    setError('')
    setNotice('')
    try {
      await api('/pt/bookings', {
        method: 'POST',
        body: {
          coachId: slot.coachId,
          sportId: slot.sportId,
          date: slot.date,
          startTime: slot.startTime,
          roomId: null,
          memberId: requireMemberId ? Number(memberId) : null,
        },
      })
      setNotice(`Đã đặt lịch PT với ${coach.fullName} ngày ${slot.date} lúc ${fromTimeOnly(slot.startTime)}.`)
      loadSlots()
    } catch (err) {
      setError(err.message)
    }
    setBusyKey(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {requireMemberId && (
        <Field label="Mã hội viên (Member ID)" hint="Chưa có tra cứu hội viên — cần biết sẵn mã số.">
          <input className={inputCls} type="number" min={1} value={memberId} onChange={(e) => setMemberId(e.target.value)} />
        </Field>
      )}

      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {coaches.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCoach(c)}
            className={`text-left bg-surface-container-lowest rounded-xl p-4 shadow-sm transition-all ${coach?.id === c.id ? 'ring-2 ring-primary-container' : 'hover:shadow-md'}`}
          >
            <div className="font-semibold">{c.fullName}</div>
            <div className="text-secondary text-body-sm">{c.sports.map((s) => s.name).join(', ')}</div>
            {c.bio && <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-2">{c.bio}</p>}
          </button>
        ))}
        {!coaches.length && <p className="text-secondary">Chưa có HLV nhận PT.</p>}
      </div>

      {coach && (
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            <select className={`${inputCls} !h-10 !w-auto`} value={sportId} onChange={(e) => setSportId(e.target.value)}>
              {coach.sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input className={`${inputCls} !h-10 !w-auto`} type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
            <input className={`${inputCls} !h-10 !w-auto`} type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
          </div>

          <div className={`flex flex-wrap gap-2 ${loading ? 'opacity-50' : ''}`}>
            {slots.map((slot) => {
              const key = `${slot.date}-${slot.startTime}`
              return (
                <button key={key} disabled={busyKey === key} className={btnOutline} onClick={() => book(slot)}>
                  {slot.date} • {fromTimeOnly(slot.startTime)}
                </button>
              )
            })}
            {!loading && !slots.length && <p className="text-secondary">Không có khung giờ trống trong khoảng thời gian này.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
