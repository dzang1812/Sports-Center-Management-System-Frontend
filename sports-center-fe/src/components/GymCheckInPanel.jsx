import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, query } from '../api'
import { formatDate, formatTimestamp, toDateOnly } from '../dateUtils'
import { GYM_CARD_STATUS_LABEL } from '../labels'
import { Alert, Badge, Icon, btnOutline, btnPrimary, inputCls } from './ui'

export default function GymCheckInPanel() {
  const [code, setCode] = useState('')
  const [card, setCard] = useState(null)
  const [looking, setLooking] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [visits, setVisits] = useState(null)
  const [visitError, setVisitError] = useState('')
  const lookup = useRef(null)
  const visitRequest = useRef(null)
  const pending = useRef(false)
  const active = useRef(true)
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
  const find = async event => {
    event.preventDefault()
    if (!code.trim() || pending.current) return
    lookup.current?.abort(); const controller = new AbortController(); lookup.current = controller
    setLooking(true); setError(''); setNotice(null); setCard(null)
    try { const result = await api(`/gym-access/cards/${encodeURIComponent(code.trim())}`, { signal: controller.signal }); if (!controller.signal.aborted) setCard(result) }
    catch (err) { if (!controller.signal.aborted) setError(err.message) }
    finally { if (!controller.signal.aborted) setLooking(false) }
  }
  const checkIn = async () => {
    if (pending.current || !card || card.status !== 'Active' || looking) return
    pending.current = true; setBusy(true); setNotice(null)
    try {
      const result = await api('/gym-access/check-ins', { method: 'POST', body: { cardCode: card.cardCode } })
      if (active.current) { setNotice({ type: 'success', text: result.status === 'AlreadyCheckedIn' ? 'Hội viên đã check-in từ trước đó.' : 'Check-in thành công.' }); loadVisits() }
    } catch (err) { if (active.current) setNotice({ type: 'error', text: err.message }) }
    finally { pending.current = false; if (active.current) setBusy(false) }
  }
  return <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
    <section className="rounded-2xl border border-outline-variant/50 bg-white p-4 sm:p-5 space-y-4">
      <div><h2 className="font-semibold text-lg">Tra cứu thẻ & check-in Gym</h2><p className="text-body-sm text-secondary mt-1">Nhập hoặc quét mã thẻ, kiểm tra hội viên rồi xác nhận vào Gym.</p></div>
      <form onSubmit={find} className="flex flex-col sm:flex-row gap-2"><input aria-label="Mã thẻ hội viên" className={inputCls} placeholder="Mã thẻ GYM-…" value={code} disabled={busy} onChange={event => { lookup.current?.abort(); setCode(event.target.value); setCard(null); setLooking(false); setError(''); setNotice(null) }} /><button className={btnPrimary + ' shrink-0'} disabled={busy || looking || !code.trim()}>{looking ? 'Đang tra cứu…' : 'Tra cứu thẻ'}</button></form>
      {error && <Alert>{error}</Alert>}{notice && <Alert type={notice.type}>{notice.text}</Alert>}
      {card ? <div className="rounded-xl border border-outline-variant/50 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold text-lg">{card.memberName}</h3><p className="text-body-sm text-secondary">Hội viên #{card.memberId} · {card.cardCode}</p></div><Badge tone={card.status === 'Active' ? 'green' : 'amber'}>{GYM_CARD_STATUS_LABEL[card.status] ?? card.status}</Badge></div>
        {card.planName && <p className="text-body-sm text-secondary">Quyền vào Gym: {card.planName}{card.endDate ? ` · Đến ${formatDate(card.endDate, { day: '2-digit', month: '2-digit', year: 'numeric' })}` : ''}</p>}
        {card.status !== 'Active' && <p className="text-body-sm text-error">Hội viên chưa đủ điều kiện vào Gym. Mở hồ sơ để kiểm tra quyền lợi hoặc thanh toán.</p>}
        <div className="flex flex-wrap gap-2"><button type="button" className={btnPrimary} disabled={busy || looking || card.status !== 'Active'} onClick={checkIn}><Icon name="how_to_reg" className="text-lg" />{busy ? 'Đang check-in…' : 'Xác nhận check-in'}</button><Link className={btnOutline} to={`/reception/members/${card.memberId}`}>Mở hồ sơ hội viên</Link></div>
      </div> : !looking && <p className="rounded-xl bg-surface-container-low p-6 text-body-sm text-secondary text-center">Thông tin và nút check-in sẽ hiện sau khi tra cứu thẻ.</p>}
    </section>
    <section className="rounded-2xl border border-outline-variant/50 bg-white p-5 space-y-4"><div className="flex items-center justify-between gap-2"><h2 className="font-semibold">Check-in hôm nay</h2><Badge tone="indigo">{visits?.total ?? '—'} lượt</Badge></div>
      {visitError && <Alert>{visitError}</Alert>}{!visits && !visitError && <p role="status" className="text-body-sm text-secondary">Đang tải…</p>}
      <div className="space-y-3">{visits?.items.slice(0, 8).map(visit => <Link key={visit.id} to={`/reception/members/${visit.memberId}`} className="block rounded-xl bg-surface-container-low p-3 hover:bg-surface-container"><p className="font-semibold text-body-sm">{visit.memberName}</p><p className="text-body-sm text-secondary mt-1">{formatTimestamp(visit.checkedInAt, { hour: '2-digit', minute: '2-digit' })} · {visit.checkedOutAt ? 'Đã check-out' : 'Chưa check-out'}</p></Link>)}</div>
      {visits && !visits.items.length && <p className="text-body-sm text-secondary">Chưa có lượt check-in hôm nay.</p>}<p className="text-xs text-secondary">Các lượt gần nhất · Tự cập nhật mỗi 15 giây</p>
    </section>
  </div>
}
