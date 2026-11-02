import { useCallback, useEffect, useRef, useState } from 'react'
import { api, query } from '../api'
import { CommerceConfirm } from './commerce'
import { Link } from 'react-router-dom'
import { useFlow2TimeRules } from '../flow2TimeRules'
import { useAuth } from '../auth'
import PtCounterCheckout from './PtCounterCheckout'
import MemberPtBookingPanel from './MemberPtBookingPanel'
import { OpenCheckInCodeButton } from './classCheckIn'
import { addDays, formatDate, fromTimeOnly, toDateOnly } from '../dateUtils'
import { LEVEL_LABEL } from '../labels'
import { Alert, Avatar, Field, Icon, btnOutline, btnPrimary, inputCls } from './ui'

// Search-as-you-type member picker (GET /members?q=, matches ID/tên/email/SĐT). Used wherever
// Reception books on behalf of a member — sets the numeric memberId via onSelect once chosen.
export function MemberLookupField({ onSelect }) {
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
    const controller = new AbortController()
    const t = setTimeout(async () => {
      try {
        const { items } = await api(`/members${query({ q: text, pageSize: 6 })}`, { signal: controller.signal })
        if (!controller.signal.aborted) { setResults(items); setOpen(true) }
      } catch {
        if (!controller.signal.aborted) setResults([])
      }
    }, 300)
    return () => { clearTimeout(t); controller.abort() }
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
                  onClick={() => pick(m)}
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
      setSessions(items.filter((s) => s.status === 'Scheduled' && s.bookingMode !== 'CourseEnrollment'))
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
      <Link className={btnOutline} to={requireMemberId ? '/reception/members' : '/member/classes'}>{requireMemberId ? 'Đăng ký nguyên khóa / số dư' : 'Khám phá khóa học nhiều tuần'}</Link>
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

// Shared PT browser; choosing a staff target remounts all booking/payment state.
export function PtBrowser({ requireMemberId = false, targetMemberId = null }) {
  const [pickedMemberId, setMemberId] = useState('')
  const memberId = targetMemberId ?? pickedMemberId
  return <div className="space-y-4">{requireMemberId && targetMemberId == null && <MemberLookupField onSelect={setMemberId} />}{(!requireMemberId || memberId) && <PtBookingBrowser key={memberId || 'self'} memberId={memberId} requireMemberId={requireMemberId} />}</div>
}

function PtBookingBrowser({ requireMemberId, memberId }) {
  const { auth } = useAuth()
  const { enforceTimeRules } = useFlow2TimeRules()
  const today = toDateOnly()
  const [coaches, setCoaches] = useState([])
  const [coachesLoading, setCoachesLoading] = useState(true)
  const [coach, setCoach] = useState(null)
  const [sportId, setSportId] = useState('')
  const [range, setRange] = useState({ from: today, to: addDays(today, 7) })
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [fundingSource, setFundingSource] = useState(requireMemberId ? 'Cash' : 'Wallet')
  const counterStorage = `sc_pt_counter:${auth.userId}:${memberId}`
  const [counterIntent, setCounterIntent] = useState(() => {
    if (!requireMemberId) return null
    try { const saved = JSON.parse(sessionStorage.getItem(counterStorage)); return saved?.key && saved?.body?.memberId === Number(memberId) ? saved : null } catch { return null }
  })
  const [counterOpen, setCounterOpen] = useState(false)
  const rememberCounter = value => {
    setCounterIntent(value)
    try { if (value) sessionStorage.setItem(counterStorage, JSON.stringify(value)); else sessionStorage.removeItem(counterStorage) } catch { /* Replay protection still works for this open page. */ }
  }
  const [intent, setIntent] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [prices, setPrices] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const request = useRef(null)
  useEffect(() => {
    const c = new AbortController()
    api('/pt/coaches', { signal: c.signal }).then(result => { if (!c.signal.aborted) setCoaches(result) })
      .catch(err => { if (!c.signal.aborted) setError(err.message) })
      .finally(() => { if (!c.signal.aborted) setCoachesLoading(false) })
    return () => c.abort()
  }, [])
  const loadSlots = useCallback(async () => {
    if (!coach || !sportId) return
    request.current?.abort(); const c = new AbortController(); request.current = c
    setSelectedSlot(null)
    if (!range.from || !range.to || range.from > range.to) { setSlots([]); setLoading(false); setError('Chọn khoảng ngày hợp lệ: ngày kết thúc không được trước ngày bắt đầu.'); return }
    setLoading(true); setError(''); setSlots([])
    try {
      const [available, balance, rates, subs] = await Promise.all([
        api('/pt/coaches/' + coach.id + '/slots' + query({ sportId, ...range }), { signal: c.signal }),
        api('/wallet' + query({ memberId: requireMemberId ? memberId : null }), { signal: c.signal }),
        api('/pt/prices', { signal: c.signal }),
        api(requireMemberId ? '/members/' + memberId + '/subscriptions' : '/me/subscriptions', { signal: c.signal }),
      ])
      if (!c.signal.aborted) { setSlots(available); setWallet(balance); setPrices(rates); setSubscriptions(subs) }
    } catch (err) { if (!c.signal.aborted) setError(err.message) }
    finally { if (!c.signal.aborted) setLoading(false) }
  }, [coach, sportId, range, requireMemberId, memberId])
  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => { if (active) loadSlots() })
    return () => { active = false; request.current?.abort() }
  }, [loadSlots, enforceTimeRules])
  const book = (slot) => {
    if (requireMemberId && counterIntent) { setCounterOpen(true); return }
    const rate = prices.find(p => p.id === slot.sportId)?.ptSinglePrice
    if (['Cash', 'BankTransfer', 'Wallet'].includes(fundingSource) && rate == null) { setError('Trung tâm chưa cấu hình giá PT lẻ.'); return }
    if (requireMemberId && ['Cash', 'BankTransfer'].includes(fundingSource)) {
      rememberCounter({ key: crypto.randomUUID(), description: `${coach.fullName} • ${slot.date} ${fromTimeOnly(slot.startTime)} • hội viên #${memberId}`,
        body: { memberId: Number(memberId), coachId: slot.coachId, sportId: slot.sportId, date: slot.date,
          startTime: slot.startTime, roomId: null, method: fundingSource, expectedPrice: rate } })
      setCounterOpen(true)
      return
    }
    setIntent({
      title: fundingSource === 'Wallet' ? 'Đặt và thanh toán PT buổi lẻ' : 'Đặt PT bằng gói',
      confirmLabel: fundingSource === 'Wallet' ? 'Thanh toán và đặt lịch' : 'Dùng 1 buổi trong gói',
      description: requireMemberId ? coach.fullName + ' • ' + slot.date + ' ' + fromTimeOnly(slot.startTime) + ' cho hội viên #' + memberId
        : `${coach.fullName} • ${formatDate(slot.date, { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })} • ${fromTimeOnly(slot.startTime)}–${fromTimeOnly(slot.endTime)}`,
      price: fundingSource === 'Wallet' ? rate : null, balance: wallet?.balance,
      policy: fundingSource === 'Wallet' ? 'Trừ số dư và xác nhận lịch ngay trong một lần. Không cần mua gói PT. Nếu đặt không thành công, không trừ tiền. Hủy trước ít nhất 12 giờ được hoàn vào ví; hủy muộn theo cấu hình không hoàn.' : 'Dùng 1 buổi từ gói hợp lệ tại ngày tập; không trừ số dư. Hết buổi không tự chuyển sang trả tiền. Hủy đúng hạn hoàn buổi về đúng gói.',
      path: '/pt/bookings', body: { coachId: slot.coachId, sportId: slot.sportId, date: slot.date, startTime: slot.startTime,
        roomId: null, memberId: requireMemberId ? Number(memberId) : null, fundingSource, expectedPrice: fundingSource === 'Wallet' ? rate : null },
    })
  }
  const confirmation = intent && <CommerceConfirm intent={intent} onClose={() => setIntent(null)} onDone={booking => { setNotice(intent.body.fundingSource === 'Wallet' ? `Đã thanh toán ${Number(intent.price).toLocaleString('vi-VN')}đ và xác nhận lịch PT #${booking.id}.` : `Đã dùng 1 buổi trong gói và xác nhận lịch PT #${booking.id}.`); setIntent(null); loadSlots() }} />
  return <div className="space-y-4">
    {error && <Alert>{error}</Alert>}{notice && <Alert type="success">{notice}<Link className="block underline mt-2 font-semibold" to={requireMemberId ? `/reception/members/${memberId}?tab=schedule` : '/member/schedule'}>{requireMemberId ? 'Xem lịch của hội viên' : 'Xem lịch của tôi'}</Link></Alert>}
    {requireMemberId && counterIntent && <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary-container/30 bg-white p-4"><p className="flex-1 text-body-sm">Yêu cầu đang chờ: {counterIntent.description}</p><button type="button" className={btnPrimary} onClick={() => setCounterOpen(true)}>Tiếp tục thanh toán{counterIntent.paymentId ? ` #${counterIntent.paymentId}` : ''}</button></div>}
    <MemberPtBookingPanel staff={requireMemberId} memberId={memberId} counterPending={Boolean(counterIntent)} coaches={coaches} coachesLoading={coachesLoading} coach={coach} sportId={sportId}
      onCoachChange={value => { if (value.id === coach?.id) return; setCoach(value); setSportId(value.sports[0]?.id ?? ''); setSelectedSlot(null); setSlots([]); setIntent(null); setError('') }}
      onSportChange={value => { setSportId(value); setSelectedSlot(null); setSlots([]); setIntent(null) }}
      range={range} onRangeChange={value => { setRange(value); setSelectedSlot(null); setSlots([]); setIntent(null) }}
      slots={slots} loading={loading} onRefresh={loadSlots} selectedSlot={selectedSlot} onSlotChange={value => { setSelectedSlot(value); setError('') }}
      wallet={wallet} prices={prices} fundingSource={fundingSource}
      onFundingChange={value => { setFundingSource(value); setIntent(null); setError('') }} onContinue={book} />
    {confirmation}
    {counterOpen && counterIntent && <PtCounterCheckout intent={counterIntent}
      onClose={() => { if (!counterIntent.attempted && !counterIntent.paymentId) rememberCounter(null); setCounterOpen(false) }}
      onAttempt={attempted => rememberCounter({ ...counterIntent, attempted })}
      onPayment={paymentId => rememberCounter({ ...counterIntent, paymentId })}
      onRelease={() => { rememberCounter(null); setCounterOpen(false); setNotice('Đã đóng yêu cầu tại quầy. Tiền đã thanh toán vẫn thuộc ví hội viên nếu chưa dùng đặt lịch.'); loadSlots() }}
      onDone={booking => { rememberCounter(null); setCounterOpen(false); setNotice(`Đã thu tiền và xác nhận booking PT #${booking.id}.`); loadSlots() }} />}
  </div>
}
