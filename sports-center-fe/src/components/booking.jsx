import { useCallback, useEffect, useRef, useState } from 'react'
import { api, query } from '../api'
import { CommerceConfirm } from './commerce'
import { Link } from 'react-router-dom'
import { useFlow2TimeRules } from '../flow2TimeRules'
import { useAuth } from '../auth'
import PtCounterCheckout from './PtCounterCheckout'
import { OpenCheckInCodeButton } from './classCheckIn'
import { addDays, fromTimeOnly, toDateOnly } from '../dateUtils'
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
      <Link className={btnOutline} to={requireMemberId ? '/reception/members' : '/member/wallet'}>Đăng ký nguyên khóa / số dư</Link>
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
export function PtBrowser({ requireMemberId = false }) {
  const [memberId, setMemberId] = useState('')
  return <div className="space-y-4">{requireMemberId && <MemberLookupField onSelect={setMemberId} />}{(!requireMemberId || memberId) && <PtBookingBrowser key={memberId || 'self'} memberId={memberId} requireMemberId={requireMemberId} />}</div>
}

function PtBookingBrowser({ requireMemberId, memberId }) {
  const { auth } = useAuth()
  const { enforceTimeRules } = useFlow2TimeRules()
  const today = toDateOnly()
  const [coaches, setCoaches] = useState([])
  const [coach, setCoach] = useState(null)
  const [sportId, setSportId] = useState('')
  const [range, setRange] = useState({ from: today, to: addDays(today, 7) })
  const [slots, setSlots] = useState([])
  const [fundingSource, setFundingSource] = useState(requireMemberId ? 'Cash' : 'PackageCredit')
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
    api('/pt/coaches', { signal: c.signal }).then(setCoaches).catch(err => { if (!c.signal.aborted) setError(err.message) })
    return () => c.abort()
  }, [])
  const loadSlots = useCallback(async () => {
    if (!coach || !sportId) return
    request.current?.abort(); const c = new AbortController(); request.current = c
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
      title: fundingSource === 'Wallet' ? 'Thanh toán PT buổi lẻ' : 'Đặt PT bằng gói',
      description: coach.fullName + ' • ' + slot.date + ' ' + fromTimeOnly(slot.startTime) + (requireMemberId ? ' cho hội viên #' + memberId : ''),
      price: fundingSource === 'Wallet' ? rate : null, balance: wallet?.balance,
      policy: fundingSource === 'Wallet' ? 'Trả buổi lẻ, không trừ PT credit. Hủy còn ít nhất 12 giờ: hoàn tiền; hủy muộn theo cấu hình: không hoàn. Đổi cùng Coach/dịch vụ/giá không thu lại tiền.' : 'Dùng 1 credit từ gói hợp lệ tại ngày tập; không trừ số dư. Hết credit không tự chuyển sang trả tiền. Hủy đúng hạn hoàn credit về đúng gói.',
      path: '/pt/bookings', body: { coachId: slot.coachId, sportId: slot.sportId, date: slot.date, startTime: slot.startTime,
        roomId: null, memberId: requireMemberId ? Number(memberId) : null, fundingSource, expectedPrice: fundingSource === 'Wallet' ? rate : null },
    })
  }
  return <div className="space-y-4">
    {error && <Alert>{error}</Alert>}{notice && <Alert type="success">{notice}</Alert>}
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{coaches.map(c => <button key={c.id} onClick={() => { setCoach(c); setSportId(c.sports[0]?.id ?? ''); setSlots([]); setIntent(null) }} className={'text-left rounded-xl p-4 bg-surface-container-lowest shadow-sm ' + (coach?.id === c.id ? 'ring-2 ring-primary-container' : '')}><div className="flex gap-3"><Avatar src={c.avatarUrl} className="w-14 h-14" /><div><h3 className="font-semibold">{c.fullName}</h3><p>{c.sports.map(s => s.name).join(' • ')}</p></div></div><p className="text-secondary">{c.certifications}</p><p>{c.bio}</p></button>)}</div>
    {!coaches.length && <p>Chưa có Coach nhận PT.</p>}
    <label className="flex flex-wrap gap-3 items-center">Phương thức đặt PT<select className={inputCls + ' !w-auto'} value={fundingSource} onChange={e => { setFundingSource(e.target.value); setIntent(null) }}>{requireMemberId && <><option value="Cash">Thu tiền mặt tại quầy</option><option value="BankTransfer">Chuyển khoản — khách quét mã QR</option></>}<option value="PackageCredit">Dùng gói PT — 1 credit, không trừ ví</option><option value="Wallet">Trả buổi lẻ — trừ số dư, không trừ credit</option></select></label>
    {requireMemberId && counterIntent && <div className="flex flex-wrap items-center gap-3 rounded-lg border border-outline-variant p-3"><span>Đang có yêu cầu PT tại quầy: {counterIntent.description}</span><button type="button" className={btnPrimary} onClick={() => setCounterOpen(true)}>Tiếp tục thanh toán{counterIntent.paymentId ? ` #${counterIntent.paymentId}` : ''}</button></div>}
    {wallet && <p>Số dư: <b>{wallet.balance.toLocaleString('vi-VN')}đ</b>. {subscriptions.filter(s => s.totalPtSessions > 0).map(s => s.planName + ': ' + s.remainingPtSessions + ' credit (' + s.startDate + ' → ' + s.endDate + ')').join(' • ')}</p>}
    <Link className={btnOutline} to={requireMemberId ? '/reception/members/' + memberId : '/member/wallet'}>Số dư / mua gói PT</Link>
    {coach && <section className="rounded-xl bg-surface-container p-4 space-y-3"><div className="flex flex-wrap gap-3"><select className={inputCls + ' !w-auto'} value={sportId} onChange={e => { setSportId(e.target.value); setIntent(null) }}>{coach.sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select><input className={inputCls + ' !w-auto'} type="date" value={range.from} onChange={e => setRange({ ...range, from: e.target.value })} /><input className={inputCls + ' !w-auto'} type="date" value={range.to} onChange={e => setRange({ ...range, to: e.target.value })} /><button className={btnOutline} disabled={loading} onClick={loadSlots}>Làm mới slot / số dư</button></div>
      {loading && <p>Đang tải…</p>}<div className="flex flex-wrap gap-2">{slots.map(s => <button key={s.date + s.startTime} className={btnOutline} disabled={loading} onClick={() => book(s)}>{s.date} • {fromTimeOnly(s.startTime)}</button>)}</div>{!loading && !slots.length && <p>Không có khung giờ trống.</p>}
    </section>}
    {intent && <CommerceConfirm intent={intent} onClose={() => setIntent(null)} onDone={() => { setIntent(null); setNotice('Backend đã xác nhận booking. Đang tải lại số dư, credit và slots.'); loadSlots() }} />}
    {counterOpen && counterIntent && <PtCounterCheckout intent={counterIntent}
      onClose={() => { if (!counterIntent.attempted && !counterIntent.paymentId) rememberCounter(null); setCounterOpen(false) }}
      onAttempt={attempted => rememberCounter({ ...counterIntent, attempted })}
      onPayment={paymentId => rememberCounter({ ...counterIntent, paymentId })}
      onRelease={() => { rememberCounter(null); setCounterOpen(false); setNotice('Đã đóng yêu cầu tại quầy. Tiền đã thanh toán vẫn thuộc ví hội viên nếu chưa dùng đặt lịch.'); loadSlots() }}
      onDone={booking => { rememberCounter(null); setCounterOpen(false); setNotice(`Đã thu tiền và xác nhận booking PT #${booking.id}.`); loadSlots() }} />}
  </div>
}
