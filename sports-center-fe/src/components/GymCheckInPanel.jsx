import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, query } from '../api'
import { formatDate, formatTimestamp, toDateOnly } from '../dateUtils'
import { GYM_CARD_STATUS_LABEL } from '../labels'
import { MemberSuggestions, useMemberSuggestions } from './memberSearch'
import GymQrCamera from './GymQrCamera'
import { Alert, Badge, Icon, btnOutline, btnPrimary, inputCls } from './ui'

const EXPIRY_DAYS = 7
const daysLeftLabel = endDate => {
  const days = Math.round((new Date(endDate) - new Date(toDateOnly())) / 86400000)
  return days === 0 ? 'hết hạn hôm nay' : `còn ${days} ngày`
}

export default function GymCheckInPanel() {
  const [code, setCode] = useState('')
  const [card, setCard] = useState(null)
  const [looking, setLooking] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [visits, setVisits] = useState(null)
  const [visitError, setVisitError] = useState('')
  const [alreadyInId, setAlreadyInId] = useState(null)
  const [expiring, setExpiring] = useState(null)
  const [scanning, setScanning] = useState(false)
  const lookup = useRef(null)
  const visitRequest = useRef(null)
  const pending = useRef(false)
  const active = useRef(true)
  const suggestions = useMemberSuggestions(code)
  const loadVisits = useCallback(async () => {
    visitRequest.current?.abort(); const controller = new AbortController(); visitRequest.current = controller
    try {
      const today = toDateOnly()
      const result = await api(`/gym-access/visits${query({ from: today, to: today, pageSize: 20 })}`, { signal: controller.signal })
      if (!controller.signal.aborted) { setVisits(result); setVisitError('') }
    } catch (err) { if (!controller.signal.aborted) setVisitError(err.message) }
  }, [])
  useEffect(() => {
    active.current = true
    let mounted = true
    void Promise.resolve().then(() => { if (mounted) loadVisits() })
    const timer = setInterval(loadVisits, 15000)
    return () => { mounted = false; active.current = false; clearInterval(timer); lookup.current?.abort(); visitRequest.current?.abort() }
  }, [loadVisits])
  useEffect(() => {
    const controller = new AbortController()
    api(`/subscriptions/expiring${query({ days: EXPIRY_DAYS })}`, { signal: controller.signal })
      .then(result => setExpiring(result)).catch(() => { if (!controller.signal.aborted) setExpiring([]) })
    return () => controller.abort()
  }, [])
  const loadCard = async url => {
    lookup.current?.abort(); const controller = new AbortController(); lookup.current = controller
    setLooking(true); setError(''); setNotice(null); setCard(null)
    try { const result = await api(url, { signal: controller.signal }); if (!controller.signal.aborted) { setCard(result); setCode(result.cardCode) } }
    catch (err) { if (!controller.signal.aborted) setError(err.message) }
    finally { if (!controller.signal.aborted) setLooking(false) }
  }
  // Picking a member issues their card on first use, so members who never opened theirs can still be checked in.
  const pick = member => loadCard(`/gym-access/members/${member.memberId}/card`)
  const find = event => {
    event.preventDefault()
    if (!code.trim() || pending.current) return
    if (suggestions) { if (suggestions.items.length) pick(suggestions.items[0]) }
    else loadCard(`/gym-access/cards/${encodeURIComponent(code.trim())}`)
  }
  const checkIn = async () => {
    if (pending.current || !card || card.status !== 'Active' || looking) return
    pending.current = true; setBusy(true); setNotice(null)
    try {
      const result = await api('/gym-access/check-ins', { method: 'POST', body: { cardCode: card.cardCode } })
      if (active.current) {
        if (result.status === 'AlreadyCheckedIn') setAlreadyInId(card.memberId)
        setNotice({ type: 'success', text: result.status === 'AlreadyCheckedIn' ? 'Hội viên đã check-in từ trước đó.' : 'Check-in thành công.' }); loadVisits()
      }
    } catch (err) { if (active.current) setNotice({ type: 'error', text: err.message }) }
    finally { pending.current = false; if (active.current) setBusy(false) }
  }
  const checkOut = async () => {
    if (pending.current || !card || looking) return
    pending.current = true; setBusy(true); setNotice(null)
    try {
      await api('/gym-access/check-outs', { method: 'POST', body: { cardCode: card.cardCode } })
      if (active.current) { setAlreadyInId(null); setNotice({ type: 'success', text: 'Check-out thành công.' }); loadVisits() }
    } catch (err) { if (active.current) setNotice({ type: 'error', text: err.message }) }
    finally { pending.current = false; if (active.current) setBusy(false) }
  }
  // Today's feed misses a visit left open since yesterday; the AlreadyCheckedIn reply covers that case.
  const inClub = !!card && (alreadyInId === card.memberId || !!visits?.items.some(visit => visit.memberId === card.memberId && !visit.checkedOutAt))
  return <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
    <section className="rounded-2xl border border-outline-variant/50 bg-white p-4 sm:p-5 space-y-4">
      <div><h2 className="font-semibold text-lg">Tra cứu hội viên & check-in Gym</h2><p className="text-body-sm text-secondary mt-1">Tìm theo mã hội viên, tên, SĐT, email hoặc quét mã thẻ, kiểm tra hội viên rồi xác nhận vào/ra Gym.</p></div>
      <form onSubmit={find} className="flex flex-col xl:flex-row gap-2"><div className="relative min-w-0 flex-1"><input aria-label="Tìm hội viên hoặc mã thẻ" className={inputCls} placeholder="Mã hội viên, tên, SĐT, email hoặc mã thẻ GYM-…" value={code} disabled={busy} onChange={event => { lookup.current?.abort(); setCode(event.target.value); setCard(null); setLooking(false); setError(''); setNotice(null) }} /><MemberSuggestions state={suggestions} onPick={pick} /></div><div className="flex flex-wrap gap-2"><button type="button" className={btnOutline + ' shrink-0'} disabled={busy || looking} onClick={() => setScanning(true)}><Icon name="qr_code_scanner" className="text-lg" />Quét QR bằng camera</button><button className={btnPrimary + ' shrink-0'} disabled={busy || looking || !code.trim()}>{looking ? 'Đang tra cứu…' : 'Tra cứu'}</button></div></form>
      {scanning && <GymQrCamera onClose={() => setScanning(false)} onScan={value => { setScanning(false); setCode(value); void loadCard(`/gym-access/cards/${encodeURIComponent(value)}`) }} />}
      {error && <Alert>{error}</Alert>}{notice && <Alert type={notice.type}>{notice.text}</Alert>}
      {card ? <div className="rounded-xl border border-outline-variant/50 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold text-lg">{card.memberName}</h3><p className="text-body-sm text-secondary">Hội viên #{card.memberId} · {card.cardCode}</p></div><Badge tone={card.status === 'Active' ? 'green' : 'amber'}>{GYM_CARD_STATUS_LABEL[card.status] ?? card.status}</Badge></div>
        {card.planName && <p className="text-body-sm text-secondary">Quyền vào Gym: {card.planName}{card.endDate ? ` · Đến ${formatDate(card.endDate, { day: '2-digit', month: '2-digit', year: 'numeric' })}` : ''}</p>}
        {card.status !== 'Active' && !inClub && <p className="text-body-sm text-error">Hội viên chưa đủ điều kiện vào Gym. Mở hồ sơ để kiểm tra quyền lợi hoặc thanh toán.</p>}
        <div className="flex flex-wrap gap-2">
          {inClub ? <button type="button" className={btnPrimary} disabled={busy || looking} onClick={checkOut}><Icon name="logout" className="text-lg" />{busy ? 'Đang check-out…' : 'Xác nhận check-out'}</button>
            : <button type="button" className={btnPrimary} disabled={busy || looking || card.status !== 'Active'} onClick={checkIn}><Icon name="how_to_reg" className="text-lg" />{busy ? 'Đang check-in…' : 'Xác nhận check-in'}</button>}
          <Link className={btnOutline} to={`/reception/members/${card.memberId}`}>Mở hồ sơ hội viên</Link>
        </div>
      </div> : !looking && <p className="rounded-xl bg-surface-container-low p-6 text-body-sm text-secondary text-center">Thông tin và nút check-in sẽ hiện sau khi chọn hội viên hoặc tra cứu thẻ.</p>}
    </section>
    <div className="space-y-5">
      <section className="rounded-2xl border border-outline-variant/50 bg-white p-5 space-y-4"><div className="flex items-center justify-between gap-2"><h2 className="font-semibold">Check-in hôm nay</h2><Badge tone="indigo">{visits?.total ?? '—'} lượt</Badge></div>
        {visitError && <Alert>{visitError}</Alert>}{!visits && !visitError && <p role="status" className="text-body-sm text-secondary">Đang tải…</p>}
        <div className="space-y-3">{visits?.items.slice(0, 8).map(visit => <Link key={visit.id} to={`/reception/members/${visit.memberId}`} className="block rounded-xl bg-surface-container-low p-3 hover:bg-surface-container"><p className="font-semibold text-body-sm">{visit.memberName}</p><p className="text-body-sm text-secondary mt-1">{formatTimestamp(visit.checkedInAt, { hour: '2-digit', minute: '2-digit' })} · {visit.checkedOutAt ? 'Đã check-out' : 'Chưa check-out'}</p></Link>)}</div>
        {visits && !visits.items.length && <p className="text-body-sm text-secondary">Chưa có lượt check-in hôm nay.</p>}<p className="text-xs text-secondary">Các lượt gần nhất · Tự cập nhật mỗi 15 giây</p>
      </section>
      <section className="rounded-2xl border border-outline-variant/50 bg-white p-5 space-y-3"><div className="flex items-center justify-between gap-2"><h2 className="font-semibold">Gói sắp hết hạn</h2><Badge tone={expiring?.length ? 'red' : 'indigo'}>{expiring?.length ?? '—'}</Badge></div>
        {!expiring && <p role="status" className="text-body-sm text-secondary">Đang tải…</p>}
        {expiring?.map(sub => <Link key={sub.subscriptionId} to={`/reception/members/${sub.memberId}`} className="block rounded-xl bg-surface-container-low p-3 hover:bg-surface-container"><p className="font-semibold text-body-sm">{sub.memberName}</p><p className="text-body-sm text-secondary mt-1">{sub.planName} · {daysLeftLabel(sub.endDate)}</p></Link>)}
        {expiring && !expiring.length && <p className="text-body-sm text-secondary">Không có gói nào hết hạn trong {EXPIRY_DAYS} ngày tới.</p>}
      </section>
    </div>
  </div>
}
