// UI exported from Stitch. Real-data sections (search, member card, check-in, today feed) are wired to
// the GymAccess API; the RFID/QR reader status row and locker/towel/parking blocks have no backend
// equivalent and stay as static decoration (same scope decision as ReceptionDesk.jsx).
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, query } from '../api'
import { formatTimestamp, toDateOnly } from '../dateUtils'
import { GYM_CARD_STATUS_LABEL } from '../labels'

const STATUS_TONE = {
  Active: { dot: 'bg-[#15803D]', chip: 'bg-emerald-100 text-emerald-800', ping: true },
  Expired: { dot: 'bg-error', chip: 'bg-red-100 text-error', ping: false },
  Blocked: { dot: 'bg-error', chip: 'bg-red-100 text-error', ping: false },
  NoEntitlement: { dot: 'bg-error', chip: 'bg-red-100 text-error', ping: false },
  PaymentPending: { dot: 'bg-amber-500', chip: 'bg-amber-100 text-amber-800', ping: false },
  PaymentFailed: { dot: 'bg-amber-500', chip: 'bg-amber-100 text-amber-800', ping: false },
  NotYetActive: { dot: 'bg-amber-500', chip: 'bg-amber-100 text-amber-800', ping: false },
  Inactive: { dot: 'bg-outline', chip: 'bg-surface-container text-on-surface-variant', ping: false },
}
const OK_STATUSES = new Set(['Active'])

const initials = (name) =>
  name.split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase()

const todayStr = () => toDateOnly()

export default function ReceptionCheckIn() {
  const [cardCode, setCardCode] = useState('')
  const [card, setCard] = useState(null)
  const [lookupError, setLookupError] = useState('')
  const [looking, setLooking] = useState(false)
  const [recent, setRecent] = useState([])
  const [checkinBusy, setCheckinBusy] = useState(false)
  const [checkinMsg, setCheckinMsg] = useState(null)

  const [visits, setVisits] = useState([])
  const [visitsTotal, setVisitsTotal] = useState(0)

  const loadVisits = useCallback(async () => {
    try {
      const today = todayStr()
      const res = await api(`/gym-access/visits${query({ from: today, to: today, pageSize: 100 })}`)
      setVisits(res.items)
      setVisitsTotal(res.total)
    } catch {
      // Silent — the feed just retries on the next poll.
    }
  }, [])

  useEffect(() => {
    loadVisits()
    const t = setInterval(loadVisits, 15000)
    return () => clearInterval(t)
  }, [loadVisits])

  const inClub = useMemo(() => visits.filter((v) => !v.checkedOutAt).length, [visits])

  const runLookup = async (code) => {
    const trimmed = code.trim()
    if (!trimmed) return
    setLooking(true)
    setLookupError('')
    setCheckinMsg(null)
    try {
      const result = await api(`/gym-access/cards/${encodeURIComponent(trimmed)}`)
      setCard(result)
      setRecent((r) => [result, ...r.filter((x) => x.cardCode !== result.cardCode)].slice(0, 5))
    } catch (err) {
      setCard(null)
      setLookupError(err.message)
    }
    setLooking(false)
  }

  const onSearch = (e) => {
    e.preventDefault()
    runLookup(cardCode)
  }

  const onCheckIn = async () => {
    if (!card) return
    setCheckinBusy(true)
    setCheckinMsg(null)
    try {
      const result = await api('/gym-access/check-ins', { method: 'POST', body: { cardCode: card.cardCode } })
      setCheckinMsg({ ok: true, text: result.status === 'AlreadyCheckedIn' ? 'Hội viên đã check-in từ trước đó.' : 'Check-in thành công!' })
      loadVisits()
    } catch (err) {
      setCheckinMsg({ ok: false, text: err.message })
    }
    setCheckinBusy(false)
  }

  const tone = card ? STATUS_TONE[card.status] ?? STATUS_TONE.Inactive : null
  const remainingDays = card?.endDate ? Math.ceil((new Date(card.endDate) - new Date()) / 86400000) : null
  const totalDays = card?.startDate && card?.endDate ? Math.round((new Date(card.endDate) - new Date(card.startDate)) / 86400000) : null
  const pct = totalDays && remainingDays !== null ? Math.max(0, Math.min(100, Math.round((remainingDays / totalDays) * 100))) : 0

  return (
    <>
<div className="flex flex-col w-full gap-space-lg select-none">

<section className="flex flex-col gap-space-md">

<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
<form onSubmit={onSearch} className="flex items-center gap-space-sm">
<div className="relative flex-1 flex items-center">
<span className="material-symbols-outlined absolute left-4 text-primary text-[28px] pointer-events-none">search</span>
<input
  className="w-full h-14 pl-14 pr-24 rounded-lg bg-surface-container-low text-on-surface font-headline-md text-headline-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary shadow-sm transition-all"
  placeholder="Nhập mã thẻ hội viên (GYM-...)"
  type="text"
  value={cardCode}
  onChange={(e) => setCardCode(e.target.value)}
/>
{cardCode && (
<button type="button" onClick={() => setCardCode('')} className="absolute right-3 h-9 w-9 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors" title="Xóa trắng">
<span className="material-symbols-outlined text-[20px]">close</span>
</button>
)}
</div>
<button type="submit" disabled={looking} className="h-14 px-5 rounded-lg bg-primary-container text-on-primary hover:opacity-95 flex items-center gap-2 font-label-lg text-label-lg active:scale-95 transition-transform shadow-sm disabled:opacity-60">
<span className="material-symbols-outlined text-[26px]">qr_code_scanner</span>
<span>{looking ? 'Đang tìm…' : 'Tra cứu'}</span>
</button>
</form>

{lookupError && <p className="text-error font-body-sm text-body-sm">{lookupError}</p>}

{recent.length > 0 && (
<div className="flex items-center gap-space-sm overflow-x-auto pt-1">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">history</span> Gần đây:
</span>
{recent.map((r, i) => (
<button
  key={r.cardCode}
  onClick={() => runLookup(r.cardCode)}
  className={`px-3 py-1.5 rounded-full font-label-md text-label-md flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm ${
    i === 0 ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
  }`}
>
<span className={`w-1.5 h-1.5 rounded-full ${(STATUS_TONE[r.status] ?? STATUS_TONE.Inactive).dot}`}></span>
{r.memberName} (#{r.cardCode})
</button>
))}
</div>
)}
</div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
<div className="bg-surface-container-lowest p-3 rounded-lg shadow-sm flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">contactless</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-outline truncate">Đầu đọc RFID Cổng 1 &amp; 2</span>
<span className="font-label-md text-label-md text-on-surface flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
Online (Sẵn sàng)
</span>
</div>
</div>
<div className="bg-surface-container-lowest p-3 rounded-lg shadow-sm flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">fact_check</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-outline">Lượt check-in hôm nay</span>
<span className="font-headline-sm text-headline-sm font-bold text-on-surface">{visitsTotal} <span className="font-label-sm text-label-sm text-outline font-normal">lượt</span></span>
</div>
</div>
<div className="bg-surface-container-lowest p-3 rounded-lg shadow-sm flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary-container">
<span className="material-symbols-outlined text-[22px] text-tertiary-fixed-dim">groups</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-outline">Đang trong CLB</span>
<span className="font-headline-sm text-headline-sm font-bold text-on-surface">{inClub}</span>
</div>
</div>
<div className="bg-surface-container-lowest p-3 rounded-lg shadow-sm flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center text-error">
<span className="material-symbols-outlined text-[22px]">warning</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-error">Cảnh báo hạn thẻ</span>
<span className="font-headline-sm text-headline-sm font-bold text-error">— <span className="font-label-sm text-label-sm text-on-error-container font-normal">chưa có báo cáo</span></span>
</div>
</div>
</div>
</section>

<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">

<div className="xl:col-span-8 flex flex-col gap-space-lg">

{card && OK_STATUSES.has(card.status) && (
<div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg flex flex-col gap-space-md relative overflow-hidden">

<div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary"></div>

<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<div className="relative w-24 h-24 rounded-xl bg-surface-container-high flex items-center justify-center shadow-sm shrink-0">
<span className="font-headline-lg text-headline-lg text-primary font-bold">{initials(card.memberName)}</span>
<div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#15803D] flex items-center justify-center text-white text-[14px] shadow-sm" title="Hội viên Hợp Lệ">
<span className="material-symbols-outlined text-[16px]">verified</span>
</div>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-space-xs flex-wrap">
<h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">{card.memberName}</h1>
<span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm uppercase tracking-wide">
#{card.cardCode}
</span>
</div>
</div>
</div>

<div className="flex flex-col md:items-end bg-surface-container-low p-space-sm rounded-lg">
<div className="flex items-center gap-1.5">
<span className={`w-2.5 h-2.5 rounded-full ${tone.dot} ${tone.ping ? 'animate-ping' : ''}`}></span>
<span className={`font-label-md text-label-md font-bold uppercase ${OK_STATUSES.has(card.status) ? 'text-[#15803D]' : 'text-error'}`}>{GYM_CARD_STATUS_LABEL[card.status]}</span>
</div>
<span className="font-headline-sm text-headline-sm font-bold text-primary mt-1">{card.planName ?? 'Không có gói Gym'}</span>
<span className="font-label-sm text-label-sm text-outline">Hạn dùng: {card.endDate ?? '—'}</span>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
<div className="bg-surface-container rounded-lg p-space-md flex flex-col justify-center">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Thời hạn thẻ</span>
<div className="flex items-baseline gap-1 mt-1">
<span className="font-display-lg text-display-lg font-bold text-on-surface">{remainingDays ?? '—'}</span>
<span className="font-label-md text-label-md text-on-surface-variant font-semibold">ngày còn lại</span>
</div>
<div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
<div className="bg-primary h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
</div>
</div>
<div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-center">
<span className="font-label-sm text-label-sm text-outline uppercase">Mã số hội viên</span>
<span className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">#{card.memberId}</span>
</div>
</div>

{checkinMsg && (
<p className={`font-label-md text-label-md ${checkinMsg.ok ? 'text-[#15803D]' : 'text-error'}`}>{checkinMsg.text}</p>
)}

<div className="flex flex-col md:flex-row items-stretch gap-space-sm pt-2">
<button onClick={onCheckIn} disabled={checkinBusy} className="flex-1 h-[62px] px-8 rounded-xl bg-[#15803D] hover:bg-[#166534] active:scale-[0.99] text-white flex items-center justify-center gap-3 font-headline-md text-headline-md font-bold shadow-md transition-all cursor-pointer disabled:opacity-60">
<span className="material-symbols-outlined text-[32px]">how_to_reg</span>
<span>{checkinBusy ? 'Đang xử lý…' : 'Check-in Vào Cổng'}</span>
</button>
<Link to={`/reception/members/${card.memberId}`} className="h-[62px] px-4 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high flex flex-col items-center justify-center gap-1 font-label-md text-label-md active:scale-95 transition-all shadow-sm">
<span className="material-symbols-outlined text-[22px]">badge</span>
<span>Hồ sơ</span>
</Link>
</div>
</div>
)}

{card && !OK_STATUSES.has(card.status) && (
<div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm relative overflow-hidden">
<div className="absolute left-0 top-0 bottom-0 w-2 bg-error"></div>

<div className="flex items-start gap-space-sm bg-error-container/40 p-space-sm rounded-lg">
<span className="material-symbols-outlined text-error text-[26px] mt-0.5">error</span>
<div className="flex-1">
<h2 className="font-headline-sm text-headline-sm text-error font-bold leading-tight">
Hội viên chưa thể vào Gym — {GYM_CARD_STATUS_LABEL[card.status]}
</h2>
<p className="font-body-md text-body-md text-on-surface mt-0.5">
Vui lòng tư vấn hội viên gia hạn hoặc xử lý thanh toán trước khi cho vào.
</p>
</div>
</div>

<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md pl-2 pt-1">
<div className="flex items-center gap-space-sm">
<div className="w-14 h-14 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
<span className="font-label-lg text-label-lg text-on-surface-variant font-bold">{initials(card.memberName)}</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-2">
<span className="font-headline-sm text-headline-sm font-bold text-on-surface">{card.memberName}</span>
<span className="px-2 py-0.5 rounded-full bg-error-container text-error font-label-sm text-label-sm font-bold">
{GYM_CARD_STATUS_LABEL[card.status]}
</span>
</div>
<span className="font-body-md text-body-md text-on-surface-variant">
Mã: <span className="font-semibold text-on-surface">#{card.cardCode}</span>
{card.planName && <> • Gói: {card.planName}</>}
</span>
</div>
</div>

<Link to={`/reception/members/${card.memberId}`} className="h-12 px-6 rounded-lg bg-tertiary-container hover:bg-tertiary text-on-tertiary font-label-lg text-label-lg font-bold active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm">
<span className="material-symbols-outlined text-[20px]">credit_card</span>
<span>Gia hạn ngay</span>
</Link>
</div>
</div>
)}

{!card && (
<div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col items-center justify-center gap-2 text-center py-space-xl">
<span className="material-symbols-outlined text-outline text-[48px]">badge</span>
<p className="text-secondary">Nhập hoặc quét mã thẻ hội viên để xem thông tin check-in.</p>
</div>
)}
</div>

<div className="xl:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md">

<div className="flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-[#15803D] animate-pulse"></span>
<h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Lượt Check-in Hôm Nay</h2>
</div>
<span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">
{visitsTotal} lượt
</span>
</div>
</div>

<div className="flex flex-col gap-space-xs max-h-[540px] overflow-y-auto pr-1">
{visits.map((v) => (
<div key={v.id} className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between">
<div className="flex items-center gap-space-sm min-w-0">
<span className="font-label-md text-label-md font-bold text-primary font-mono whitespace-nowrap">
{formatTimestamp(v.checkedInAt, { hour: '2-digit', minute: '2-digit' })}
</span>
<div className="flex flex-col min-w-0">
<span className="font-label-lg text-label-lg font-bold text-on-surface truncate">{v.memberName}</span>
<span className="font-body-sm text-body-sm text-outline truncate">{v.planName ?? 'Gym tự do'}</span>
</div>
</div>
<div className="flex flex-col items-end whitespace-nowrap">
<span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${v.checkedOutAt ? 'bg-surface-container text-on-surface-variant' : 'bg-[#DCFCE7] text-[#15803D]'}`}>
{v.checkedOutAt ? 'Đã check-out' : 'Đang trong CLB'}
</span>
</div>
</div>
))}
{!visits.length && <p className="text-secondary text-center py-10 font-body-sm text-body-sm">Chưa có lượt check-in nào hôm nay.</p>}
</div>

<div className="pt-space-sm flex items-center justify-between bg-surface-container-lowest">
<div className="flex items-center gap-1.5 font-label-sm text-label-sm text-outline">
<span className="material-symbols-outlined text-[16px] text-[#15803D]">sync</span>
<span>Tự động cập nhật 15s</span>
</div>
</div>
</div>
</div>
</div>

    </>
  )
}
