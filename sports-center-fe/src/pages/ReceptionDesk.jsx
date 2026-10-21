// UI exported from Stitch. Real-data sections (search, member card, check-in, today feed) are wired to
// the GymAccess API; the RFID/locker/parking/capacity blocks below have no backend equivalent and stay
// as static decoration (see conversation — kept intentionally, not fake data to be "finished" later).
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, query } from '../api'
import { GYM_CARD_STATUS_LABEL } from '../labels'

const STATUS_TONE = {
  Active: { dot: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500' },
  Expired: { dot: 'bg-error', chip: 'bg-red-100 text-error', bar: 'bg-error' },
  Blocked: { dot: 'bg-error', chip: 'bg-red-100 text-error', bar: 'bg-error' },
  NoEntitlement: { dot: 'bg-error', chip: 'bg-red-100 text-error', bar: 'bg-error' },
  PaymentPending: { dot: 'bg-amber-500', chip: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' },
  PaymentFailed: { dot: 'bg-amber-500', chip: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' },
  NotYetActive: { dot: 'bg-amber-500', chip: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' },
  Inactive: { dot: 'bg-outline', chip: 'bg-surface-container text-on-surface-variant', bar: 'bg-outline' },
}
const OK_STATUSES = new Set(['Active'])

const initials = (name) =>
  name.split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase()

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function ReceptionDesk() {
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
      // Keep the feed silent on transient errors — it auto-retries on the next poll.
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

  return (
    <>
<div className="flex flex-col w-full pb-10">

<div className="grid grid-cols-12 gap-space-lg mb-space-lg">

<div className="col-span-12 xl:col-span-6 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined text-[26px]">terminal</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-space-xs">
<span className="font-headline-sm text-headline-sm text-on-surface">Quầy Tiếp Đón</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant">Quét thẻ hoặc nhập mã thẻ hội viên để check-in</span>
</div>
</div>
</div>

<div className="grid grid-cols-3 gap-space-sm mt-space-md pt-space-sm">
<div className="bg-surface-container-low px-space-md py-space-xs rounded-lg flex items-center gap-space-sm">
<span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-on-surface-variant">RFID Reader</span>
<span className="font-body-sm text-body-sm text-on-surface font-semibold truncate">Cổng 01: Sẵn Sàng</span>
</div>
</div>
<div className="bg-surface-container-low px-space-md py-space-xs rounded-lg flex items-center gap-space-sm">
<span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-on-surface-variant">QR Scanner</span>
<span className="font-body-sm text-body-sm text-on-surface font-semibold truncate">Cổng Tự Động On</span>
</div>
</div>
<div className="bg-surface-container-low px-space-md py-space-xs rounded-lg flex items-center gap-space-sm">
<span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed"></span>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-on-surface-variant">Tủ Locker POS</span>
<span className="font-body-sm text-body-sm text-on-surface font-semibold truncate">Kết nối 100%</span>
</div>
</div>
</div>
</div>

<div className="col-span-12 xl:col-span-6 grid grid-cols-3 gap-space-md">

<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-on-surface-variant">Lượt Check-in</span>
<div className="w-9 h-9 rounded-lg bg-surface-container-low text-primary-container flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">how_to_reg</span>
</div>
</div>
<div className="my-space-xs">
<span className="font-headline-xl text-headline-xl text-on-surface font-bold">{visitsTotal}</span>
<span className="font-body-sm text-body-sm text-secondary ml-1">lượt hôm nay</span>
</div>
</div>

<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-on-surface-variant">Đang trong CLB</span>
<div className="w-9 h-9 rounded-lg bg-surface-container-low text-primary-container flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">directions_run</span>
</div>
</div>
<div className="my-space-xs">
<span className="font-headline-xl text-headline-xl text-primary font-bold">{inClub}</span>
<span className="font-body-sm text-body-sm text-secondary ml-1">hội viên chưa check-out</span>
</div>
</div>

<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-on-surface-variant">Cảnh báo hạn</span>
<div className="w-9 h-9 rounded-lg bg-error-container text-error flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">warning</span>
</div>
</div>
<div className="my-space-xs">
<span className="font-headline-xl text-headline-xl text-on-surface-variant font-bold">—</span>
</div>
<span className="font-label-sm text-label-sm text-secondary">Chưa có báo cáo tổng hợp</span>
</div>
</div>
</div>

<div className="grid grid-cols-12 gap-space-lg">

<div className="col-span-12 xl:col-span-8 flex flex-col gap-space-lg">

<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
<form onSubmit={onSearch} className="flex flex-col sm:flex-row items-center gap-space-sm">

<div className="relative w-full">
<div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-on-surface-variant">
<span className="material-symbols-outlined text-[26px]">search</span>
</div>
<input
  className="w-full h-14 pl-12 pr-12 rounded-xl bg-surface-container-low text-on-surface font-body-lg text-body-lg focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary shadow-inner"
  placeholder="Nhập mã thẻ hội viên (GYM-...)"
  type="text"
  value={cardCode}
  onChange={(e) => setCardCode(e.target.value)}
/>
{cardCode && (
<button type="button" onClick={() => setCardCode('')} className="absolute inset-y-0 right-0 pr-space-md flex items-center text-on-surface-variant hover:text-on-surface" title="Xóa tìm kiếm">
<span className="material-symbols-outlined text-[20px]">cancel</span>
</button>
)}
</div>

<div className="flex items-center gap-space-xs w-full sm:w-auto shrink-0">
<button type="submit" disabled={looking} className="flex-1 sm:flex-initial h-14 px-space-lg rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-sm hover:opacity-95 transition-opacity active:scale-95 disabled:opacity-60">
<span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
<span>{looking ? 'Đang tìm…' : 'Tra cứu thẻ'}</span>
</button>
</div>
</form>

{lookupError && <p className="text-error font-body-sm text-body-sm">{lookupError}</p>}

{recent.length > 0 && (
<div className="flex items-center flex-wrap gap-space-sm pt-space-xs">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Hội viên vừa tìm:</span>
{recent.map((r, i) => (
<button
  key={r.cardCode}
  onClick={() => runLookup(r.cardCode)}
  className={`flex items-center gap-1.5 px-space-md py-1.5 rounded-full font-label-md text-label-md transition-all ${
    i === 0 ? 'bg-primary text-on-primary' : 'bg-surface-container text-secondary hover:bg-surface-container-high'
  }`}
>
<span className="material-symbols-outlined text-[16px]">{i === 0 ? 'person' : 'history'}</span>
<span>{r.memberName} (#{r.cardCode})</span>
</button>
))}
</div>
)}
</div>

{card && OK_STATUSES.has(card.status) && (
<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden relative">
<div className={`h-2 w-full ${tone.bar}`}></div>
<div className="p-space-lg flex flex-col gap-space-lg">

<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md pb-space-md">
<div className="flex items-center gap-space-md">
<div className="relative w-24 h-24 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-md shrink-0">
<span className="font-headline-lg text-headline-lg text-primary font-bold">{initials(card.memberName)}</span>
<span className={`absolute -bottom-1 -right-1 ${tone.dot} text-white rounded-full p-1 shadow-sm flex items-center justify-center`}>
<span className="material-symbols-outlined text-[14px]">check</span>
</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-space-sm flex-wrap">
<h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">{card.memberName}</h2>
<span className={`px-space-sm py-0.5 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1 ${tone.chip}`}>
<span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`}></span>
{GYM_CARD_STATUS_LABEL[card.status]}
</span>
</div>
<div className="flex items-center gap-space-md font-body-sm text-body-sm text-on-surface-variant mt-1">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">badge</span>
Mã thẻ: <strong className="text-on-surface font-semibold">#{card.cardCode}</strong>
</span>
</div>
</div>
</div>

<div className="flex items-center md:flex-col items-end bg-surface-container-low px-space-lg py-space-sm rounded-xl">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Thời hạn gói còn lại</span>
<div className="flex items-baseline gap-1 my-0.5">
<span className="font-display-lg text-display-lg text-emerald-600 font-bold leading-none">{remainingDays ?? '—'}</span>
<span className="font-label-lg text-label-lg text-emerald-700 font-semibold">ngày</span>
</div>
<span className="font-body-sm text-body-sm text-secondary">Hạn đến: {card.endDate ?? '—'}</span>
</div>
</div>

<div className="bg-surface-container-low p-space-md rounded-xl flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 shadow-sm">
<span className="material-symbols-outlined text-[22px]">fitness_center</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-on-surface-variant">Gói hội viên</span>
<span className="font-label-lg text-label-lg text-on-surface truncate">{card.planName ?? 'Không có gói Gym'}</span>
</div>
</div>

{checkinMsg && (
<p className={`font-label-md text-label-md ${checkinMsg.ok ? 'text-emerald-700' : 'text-error'}`}>{checkinMsg.text}</p>
)}

<div className="flex flex-col sm:flex-row items-stretch gap-space-md pt-space-xs">
<button onClick={onCheckIn} disabled={checkinBusy} className="flex-1 h-16 rounded-xl bg-emerald-600 text-white font-headline-sm text-headline-sm flex items-center justify-center gap-space-sm shadow-md hover:bg-emerald-700 active:scale-[0.99] transition-all disabled:opacity-60">
<span className="material-symbols-outlined text-[28px]">sensor_door</span>
<span>{checkinBusy ? 'Đang xử lý…' : 'CHECK-IN VÀO CỔNG'}</span>
</button>
<Link to={`/reception/members/${card.memberId}`} className="h-16 px-space-lg rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-space-xs hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined text-[20px]">assignment_ind</span>
<span>Hồ Sơ Chi Tiết</span>
</Link>
</div>
</div>
</div>
)}

{card && !OK_STATUSES.has(card.status) && (
<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden relative">
<div className={`h-2 w-full ${tone.bar}`}></div>
<div className="p-space-lg flex flex-col gap-space-md">

<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<div className="relative w-16 h-16 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
<span className="font-headline-sm text-headline-sm text-on-surface-variant font-bold">{initials(card.memberName)}</span>
<span className={`absolute -bottom-1 -right-1 ${tone.dot} text-white rounded-full p-0.5 shadow-sm flex items-center justify-center`}>
<span className="material-symbols-outlined text-[12px]">close</span>
</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-space-sm">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{card.memberName}</h3>
<span className={`px-space-sm py-0.5 rounded-full font-label-sm text-label-sm font-bold ${tone.chip}`}>{GYM_CARD_STATUS_LABEL[card.status]}</span>
</div>
<div className="flex items-center gap-space-md font-body-sm text-body-sm text-on-surface-variant mt-0.5">
<span>Mã: <strong>#{card.cardCode}</strong></span>
{card.planName && <><span>•</span><span>Gói: {card.planName}</span></>}
</div>
</div>
</div>
</div>

<div className="bg-error-container text-on-error-container p-space-md rounded-xl flex items-start gap-space-sm">
<span className="material-symbols-outlined text-error text-[24px] shrink-0 mt-0.5">error</span>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg font-bold">Hội viên chưa thể vào Gym — {GYM_CARD_STATUS_LABEL[card.status]}</span>
<p className="font-body-md text-body-md mt-0.5 opacity-90">
Vui lòng tư vấn hội viên gia hạn gói hoặc xử lý thanh toán trước khi cho vào.
</p>
</div>
</div>

<div className="flex flex-col sm:flex-row items-center justify-end gap-space-sm pt-space-xs">
<Link to={`/reception/members/${card.memberId}`} className="w-full sm:w-auto h-12 px-space-lg rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-sm transition-colors">
<span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
<span>Gia Hạn Gói Ngay</span>
</Link>
</div>
</div>
</div>
)}
</div>

<div className="col-span-12 xl:col-span-4 flex flex-col gap-space-lg">

<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
<span className="font-label-lg text-label-lg text-on-surface">Công Suất Sàn Hiện Tại</span>
</div>
</div>
<p className="font-body-sm text-body-sm text-secondary">Chưa có hệ thống đo công suất sàn theo thời gian thực.</p>
</div>

<div className="bg-surface-container-lowest rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden">

<div className="p-space-md flex flex-col gap-space-sm bg-surface-container-low">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[22px]">history</span>
<span className="font-headline-sm text-headline-sm text-on-surface">Lượt Check-in Hôm Nay</span>
</div>
<span className="font-label-sm text-label-sm bg-primary text-on-primary px-2 py-0.5 rounded-full font-bold">{visitsTotal}</span>
</div>
</div>

<div className="divide-y divide-surface-container overflow-y-auto max-h-[580px] p-space-sm flex flex-col gap-1">

{visits.map((v) => (
<div key={v.id} className={`p-space-sm rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-between ${!v.checkedOutAt ? 'bg-primary-fixed/20' : ''}`}>
<div className="flex items-center gap-space-sm min-w-0">
<span className="font-label-md text-label-md text-primary font-bold bg-surface-container px-2 py-1 rounded">
{new Date(v.checkedInAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
</span>
<div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary shrink-0">
{initials(v.memberName)}
</div>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-on-surface font-semibold truncate">{v.memberName}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant truncate">{v.planName ?? 'Gym tự do'}</span>
</div>
</div>
<span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 ${v.checkedOutAt ? 'bg-surface-container text-on-surface-variant' : 'bg-emerald-100 text-emerald-800'}`}>
{v.checkedOutAt ? 'Đã check-out' : 'Đang trong CLB'}
</span>
</div>
))}
{!visits.length && <p className="text-secondary text-center py-10 font-body-sm text-body-sm">Chưa có lượt check-in nào hôm nay.</p>}
</div>

<div className="p-space-sm bg-surface-container-low flex items-center justify-between">
<span className="font-body-sm text-body-sm text-secondary">Tự động cập nhật mỗi 15s</span>
</div>
</div>
</div>
</div>
</div>

    </>
  )
}
