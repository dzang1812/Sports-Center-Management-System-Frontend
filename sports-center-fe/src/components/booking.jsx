import { useCallback, useEffect, useRef, useState } from 'react'
import { api, query } from '../api'
import { useFlow2TimeRules } from '../flow2TimeRules'
import { OpenCheckInCodeButton } from './classCheckIn'
import { addDays, fromTimeOnly, toDateOnly } from '../dateUtils'
import { LEVEL_LABEL } from '../labels'
import { Alert, Avatar, Field, Icon, btnOutline, btnPrimary, inputCls } from './ui'

// Search-as-you-type member picker (GET /members?q=, matches ID/tên/email/SĐT). Used wherever
// Reception books on behalf of a member — sets the numeric memberId via onSelect once chosen.
function MemberLookupField({ onSelect }) {
  const [text, setText] = useState('')
  const [selected, setSelected] = useState(null)
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const blurTimer = useRef(null)

  useEffect(() => {
    if (selected || !text.trim()) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      try {
        const { items } = await api(`/members${query({ q: text, pageSize: 6 })}`)
        setResults(items)
        setOpen(true)
      } catch {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(t)
  }, [text, selected])

  const pick = (m) => {
    setSelected(m)
    setText('')
    setOpen(false)
    onSelect(String(m.id))
  }

  const clear = () => {
    setSelected(null)
    setText('')
    onSelect('')
  }

  return (
    <Field label="Hội viên" hint="Tìm theo mã hội viên, tên, email hoặc số điện thoại">
      {selected ? (
        <div className="flex items-center gap-2 h-11 px-3.5 rounded-lg border border-outline-variant bg-surface-container-low">
          <span className="font-semibold truncate">{selected.fullName}</span>
          <span className="text-secondary text-body-sm shrink-0">#{selected.id} • {selected.email}</span>
          <button type="button" onClick={clear} className="ml-auto text-on-surface-variant hover:text-on-surface shrink-0">
            <Icon name="close" className="text-lg" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            className={inputCls}
            placeholder="Nhập để tìm hội viên…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => results.length && setOpen(true)}
            onBlur={() => {
              blurTimer.current = setTimeout(() => setOpen(false), 150)
            }}
          />
          {open && results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/40 max-h-60 overflow-y-auto">
              {results.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="w-full text-left px-3.5 py-2 hover:bg-surface-container-low flex flex-col"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    clearTimeout(blurTimer.current)
                    pick(m)
                  }}
                >
                  <span className="font-semibold">{m.fullName} <span className="text-secondary font-normal">#{m.id}</span></span>
                  <span className="text-body-sm text-secondary">{m.email}{m.phone ? ` • ${m.phone}` : ''}</span>
                </button>
              ))}
            </div>
          )}
          {open && text.trim() && !results.length && (
            <div className="absolute z-10 mt-1 w-full bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/40 px-3.5 py-2 text-secondary text-body-sm">
              Không tìm thấy hội viên phù hợp.
            </div>
          )}
        </div>
      )}
    </Field>
  )
}

// Shared by MemberSchedulePage ("Đặt lớp mới" tab) and ReceptionClassBookingPage.
// When requireMemberId is true (Receptionist acting on behalf of a member), a member-lookup
// field is shown and must be filled before booking.
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
      {requireMemberId && <MemberLookupField onSelect={setMemberId} />}

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
  const { enforceTimeRules } = useFlow2TimeRules()
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
  }, [loadSlots, enforceTimeRules])

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
      {requireMemberId && <MemberLookupField onSelect={setMemberId} />}

      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {coaches.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCoach(c)}
            className={`text-left bg-surface-container-lowest rounded-xl p-4 shadow-sm transition-all flex flex-col gap-2.5 ${
              coach?.id === c.id ? 'ring-2 ring-primary-container' : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3">
              <Avatar src={c.avatarUrl} className="w-14 h-14" />
              <div className="min-w-0">
                <div className="font-semibold truncate">{c.fullName}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {c.sports.map((s) => (
                    <span key={s.id} className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {c.certifications && (
              <div className="flex items-start gap-1.5 text-body-sm text-primary font-semibold">
                <Icon name="verified" className="text-base shrink-0 mt-0.5" />
                <span className="line-clamp-1">{c.certifications}</span>
              </div>
            )}
            {c.bio && <p className="text-body-sm text-on-surface-variant line-clamp-2">{c.bio}</p>}
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
