import { useEffect, useMemo, useRef, useState } from 'react'
import { addDays, BUSINESS_TIME_ZONE, formatDate, fromTimeOnly, toDateOnly, weekRange } from '../dateUtils'
import { SESSION_STATUS_LABEL } from '../labels'
import { Icon, btnOutline, inputCls } from './ui'
import { layoutDayEvents, minutesOf, monthDates, shiftMonth } from './courseCalendarUtils'

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
const HOUR_HEIGHT = 72
const clockFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: BUSINESS_TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const statusClass = event => event.status === 'Cancelled' ? 'bg-slate-100 text-slate-500 border-slate-300'
  : event.status === 'Completed' || ['Present', 'Late'].includes(event.attendanceStatus) ? 'bg-emerald-50 text-emerald-900 border-emerald-400'
    : event.replacesSessionId ? 'bg-amber-50 text-amber-950 border-amber-400'
      : event.type === 'PT' ? 'bg-sky-100 text-sky-950 border-sky-400' : 'bg-indigo-100 text-indigo-950 border-indigo-400'

export default function CourseScheduleCalendar({ sessions = [], title = 'Khóa học', personal = false,
  statusLabel, renderEventActions, onVisibleRangeChange, includeCancelled, onIncludeCancelledChange }) {
  const events = useMemo(() => sessions.map((s, i) => ({ ...s, status: s.status ?? 'Scheduled', key: `${s.type ?? 'Course'}:${s.bookingId ?? s.id ?? `${s.date}-${s.startTime}-${i}`}` }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)), [sessions])
  const [now, setNow] = useState(() => new Date())
  const today = toDateOnly(now)
  const [anchor, setAnchor] = useState(() => events.find(e => e.date >= toDateOnly() && e.status !== 'Cancelled')?.date ?? events[0]?.date ?? toDateOnly())
  const [view, setView] = useState('week')
  const [localShowCancelled, setLocalShowCancelled] = useState(true)
  const showCancelled = includeCancelled ?? localShowCancelled
  const [selected, setSelected] = useState(null)
  const scroll = useRef(null)
  const detail = useRef(null)
  const weekStart = weekRange(anchor)[0]
  const weekEnd = addDays(weekStart, 6)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const month = monthDates(anchor)
  const monthStart = month[0]
  const monthEnd = month[41]
  const shown = events.filter(e => showCancelled || e.status !== 'Cancelled')
  const weekEvents = shown.filter(e => e.date >= weekStart && e.date <= weekEnd)
  const selectedEvent = events.find(e => e.key === selected)
  const firstMinute = weekEvents.length ? Math.min(...weekEvents.map(e => minutesOf(e.startTime))) : 8 * 60
  const clockMinutes = minutesOf(clockFormatter.format(now))
  const shortDate = date => formatDate(date, { day: '2-digit', month: '2-digit', year: 'numeric' })

  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer) }, [])
  useEffect(() => {
    if (view === 'week' && scroll.current) scroll.current.scrollTop = Math.max(0, (firstMinute - 30) / 60 * HOUR_HEIGHT)
  }, [weekStart, view, firstMinute])
  useEffect(() => { if (selected) detail.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [selected])
  useEffect(() => {
    if (view !== 'list') onVisibleRangeChange?.(view === 'month' ? { from: monthStart, to: monthEnd } : { from: weekStart, to: weekEnd })
  }, [view, weekStart, weekEnd, monthStart, monthEnd, onVisibleRangeChange])

  const navigate = delta => setAnchor(view === 'month' ? shiftMonth(anchor, delta) : addDays(weekStart, delta * 7))
  const selectDay = date => { setAnchor(date); setView('week') }
  const titleOf = event => personal && event.type === 'PT' ? `PT · ${event.sport ?? event.title ?? 'Huấn luyện cá nhân'}` : event.title ?? title
  const labelOf = event => statusLabel?.(event) ?? SESSION_STATUS_LABEL[event.status] ?? event.status
  const eventTitle = event => `${titleOf(event)}, ${shortDate(event.date)}, ${fromTimeOnly(event.startTime)}–${fromTimeOnly(event.endTime)}, ${event.room ?? ''}, ${event.coach ?? ''}, ${labelOf(event)}`

  return <div className="rounded-2xl border border-outline-variant/60 bg-white overflow-hidden text-on-surface">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-white"><Icon name="calendar_month" /></span>
        <button type="button" className={btnOutline} onClick={() => { setAnchor(toDateOnly()); if (view === 'list') setView('week') }}>Hôm nay</button>
        {view !== 'list' && <><button type="button" className="p-2 rounded-full hover:bg-surface-container" aria-label={view === 'month' ? 'Tháng trước' : 'Tuần trước'} onClick={() => navigate(-1)}><Icon name="chevron_left" /></button>
          <button type="button" className="p-2 rounded-full hover:bg-surface-container" aria-label={view === 'month' ? 'Tháng sau' : 'Tuần sau'} onClick={() => navigate(1)}><Icon name="chevron_right" /></button></>}
        <h3 className="font-semibold text-base">{view === 'month' ? formatDate(anchor, { month: 'long', year: 'numeric' }) : view === 'list' ? personal ? 'Danh sách lịch đã tải' : 'Toàn bộ lịch khóa' : `${shortDate(weekStart)} – ${shortDate(weekEnd)}`}</h3>
      </div>
      <div className="flex items-center gap-2">
        {view !== 'list' && <input aria-label="Chuyển đến ngày" className={inputCls + ' !w-auto !h-10'} type="date" value={anchor} onChange={e => { if (e.target.value) setAnchor(e.target.value) }} />}
        <select aria-label="Kiểu xem lịch" className={inputCls + ' !w-auto !h-10'} value={view} onChange={e => setView(e.target.value)}><option value="week">Tuần</option><option value="month">Tháng</option><option value="list">Danh sách</option></select>
      </div>
    </div>

    <div className="flex flex-col lg:flex-row">
      <aside className="hidden lg:block w-56 shrink-0 border-r border-outline-variant/50 p-4 space-y-4 bg-surface/40">
        <div className="flex items-center justify-between font-semibold text-sm"><span>{formatDate(anchor, { month: 'long', year: 'numeric' })}</span>
          <div className="flex"><button type="button" className="p-1 rounded hover:bg-surface-container" aria-label="Lịch nhỏ: tháng trước" onClick={() => setAnchor(shiftMonth(anchor, -1))}><Icon name="chevron_left" className="text-base" /></button><button type="button" className="p-1 rounded hover:bg-surface-container" aria-label="Lịch nhỏ: tháng sau" onClick={() => setAnchor(shiftMonth(anchor, 1))}><Icon name="chevron_right" className="text-base" /></button></div>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
          {DAYS.map((d, i) => <span key={d} className="text-secondary pb-1">{i === 6 ? 'CN' : `T${i + 2}`}</span>)}
          {month.map(date => <button key={date} type="button" aria-label={`Xem tuần chứa ngày ${shortDate(date)}`} aria-current={date === today ? 'date' : undefined} onClick={() => selectDay(date)}
            className={`relative h-7 w-7 rounded-full mx-auto ${date === anchor ? 'bg-primary-container text-white' : date === today ? 'bg-indigo-100 text-primary font-bold' : date.slice(0, 7) !== anchor.slice(0, 7) ? 'text-slate-400 hover:bg-surface-container' : 'hover:bg-surface-container'}`}>
            {Number(date.slice(8))}{shown.some(e => e.date === date) && <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${date === anchor ? 'bg-white' : 'bg-primary-container'}`} />}
          </button>)}
        </div>
        <div className="border-t border-outline-variant/50 pt-4 space-y-2"><p className="font-semibold text-sm">{title}</p><p className="text-secondary text-xs">{events.filter(e => e.status !== 'Cancelled').length} {personal ? 'lịch đang hiển thị' : 'buổi trong toàn khóa'}</p><p className="text-secondary text-xs">Giờ Việt Nam · GMT+7</p>
          {events[0] && <button type="button" className="text-primary underline text-xs" onClick={() => selectDay(events[0].date)}>{personal ? 'Tới lịch đầu tiên' : 'Về buổi đầu tiên'}</button>}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {selectedEvent && <div ref={detail} role="region" aria-label="Chi tiết buổi học" className="m-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <div className="flex justify-between gap-3"><div><h4 className="font-semibold">{titleOf(selectedEvent)}{selectedEvent.type === 'PT' ? ' · PT' : ''}{selectedEvent.replacesSessionId ? ' · Buổi bù' : ''}</h4>
            <p>{formatDate(selectedEvent.date, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} · {fromTimeOnly(selectedEvent.startTime)}–{fromTimeOnly(selectedEvent.endTime)}</p>
            <p className="text-sm text-secondary mt-1">Phòng: {selectedEvent.room ?? 'Chưa gán'} · HLV: {selectedEvent.coach ?? 'Chưa gán'} · {labelOf(selectedEvent)}</p>
            {selectedEvent.enrollmentId && <p className="text-xs text-secondary mt-1">Đã đăng ký nguyên khóa</p>}
            {selectedEvent.fundingSource && <p className="text-xs text-secondary mt-1">{selectedEvent.fundingSource === 'Wallet' ? 'Đã thanh toán PT buổi lẻ' : 'Sử dụng gói PT'}</p>}</div>
            <button type="button" aria-label="Đóng chi tiết buổi học" className="self-start p-1 rounded hover:bg-white" onClick={() => setSelected(null)}><Icon name="close" className="text-lg" /></button>
          </div>
          {renderEventActions && <div className="mt-3">{renderEventActions(selectedEvent)}</div>}
        </div>}

        {view === 'week' && <>
          <p className="lg:hidden px-3 py-2 text-xs text-secondary">Vuốt ngang để xem đủ 7 ngày. Giờ Việt Nam (GMT+7).</p>
          <div ref={scroll} className="overflow-auto overscroll-contain" style={{ height: personal ? 'max(380px, calc(100dvh - 360px))' : 'min(54vh, 580px)' }}>
            <div className="min-w-[820px]">
              <div className="sticky top-0 z-20 grid bg-white border-b border-outline-variant/60" style={{ gridTemplateColumns: '60px repeat(7, minmax(0, 1fr))' }}>
                <div className="sticky left-0 z-30 bg-white flex items-end justify-center pb-3 text-[10px] text-secondary">GMT+7</div>
                {days.map((date, i) => <button key={date} type="button" onClick={() => setAnchor(date)} aria-label={`Chọn ngày ${shortDate(date)}`} className={`py-3 text-center border-l border-outline-variant/40 ${date === today ? 'text-primary' : 'text-secondary'}`}>
                  <span className="text-xs block">{DAYS[i]}</span><span className={`inline-flex h-9 w-9 mt-1 items-center justify-center rounded-full text-xl ${date === today ? 'bg-primary-container text-white' : ''}`}>{Number(date.slice(8))}</span>
                </button>)}
              </div>
              <div className="grid" style={{ gridTemplateColumns: '60px repeat(7, minmax(0, 1fr))', height: 24 * HOUR_HEIGHT }}>
                <div className="sticky left-0 z-10 bg-white">
                  {Array.from({ length: 24 }, (_, hour) => <span key={hour} className="absolute right-2 text-[11px] text-secondary" style={{ top: hour * HOUR_HEIGHT + 2 }}>{String(hour).padStart(2, '0')}:00</span>)}
                </div>
                {days.map(date => <div key={date} className={`relative border-l border-outline-variant/40 ${date === today ? 'bg-indigo-50/30' : ''}`} style={{ backgroundImage: 'repeating-linear-gradient(to bottom, #e2e8f0 0px, #e2e8f0 1px, transparent 1px, transparent 36px, #f1f5f9 36px, #f1f5f9 37px, transparent 37px, transparent 72px)' }}>
                  {layoutDayEvents(weekEvents.filter(e => e.date === date)).map(({ event, lane, lanes }) => {
                    const height = (minutesOf(event.endTime) - minutesOf(event.startTime)) / 60 * HOUR_HEIGHT
                    return <button type="button" key={event.key} title={eventTitle(event)} aria-label={eventTitle(event)} onClick={() => setSelected(event.key)}
                      className={`absolute border-l-[3px] border rounded-md px-2 py-1 text-left overflow-hidden hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary shadow-sm ${statusClass(event)} ${event.status === 'Cancelled' ? 'opacity-70' : ''}`}
                      style={{ top: minutesOf(event.startTime) / 60 * HOUR_HEIGHT + 1, height: Math.max(20, height - 2), left: `calc(${lane / lanes * 100}% + 3px)`, width: `calc(${100 / lanes}% - 6px)` }}>
                      <span className={`block text-xs font-semibold truncate ${event.status === 'Cancelled' ? 'line-through' : ''}`}>{titleOf(event)}</span>
                      {height >= 40 && <span className="block text-[11px] truncate">{fromTimeOnly(event.startTime)}–{fromTimeOnly(event.endTime)}</span>}
                      {height >= 62 && <span className="block text-[11px] truncate">{event.room ?? ''}{event.replacesSessionId ? ' · Buổi bù' : ''}</span>}
                    </button>
                  })}
                  {date === today && <div aria-label="Giờ hiện tại" className="absolute inset-x-0 z-10 border-t-2 border-red-500 pointer-events-none" style={{ top: clockMinutes / 60 * HOUR_HEIGHT }}><span className="absolute -left-1 -top-1.5 h-2.5 w-2.5 rounded-full bg-red-500" /></div>}
                </div>)}
              </div>
            </div>
          </div>
          {!weekEvents.length && <p className="px-4 py-2 text-sm text-secondary border-t">Tuần này không có buổi học. Dùng nút chuyển tuần hoặc chọn ngày trên lịch nhỏ.</p>}
        </>}

        {view === 'month' && <div className="overflow-auto" style={{ maxHeight: personal ? '68vh' : '58vh' }}><div className="min-w-[700px]">
          <div className="grid grid-cols-7 bg-surface/70 border-b">{DAYS.map(day => <div key={day} className="text-xs text-secondary text-center py-3">{day}</div>)}</div>
          <div className="grid grid-cols-7">{month.map(date => <div key={date} className={`min-h-24 p-1.5 border-b border-r border-slate-100 ${date.slice(0, 7) !== anchor.slice(0, 7) ? 'bg-slate-50' : ''}`}>
            <button type="button" aria-label={`Xem tuần chứa ngày ${shortDate(date)}`} onClick={() => selectDay(date)} className={`h-7 w-7 rounded-full text-sm mb-1 ${date === today ? 'bg-primary-container text-white' : 'hover:bg-surface-container'}`}>{Number(date.slice(8))}</button>
            {shown.filter(e => e.date === date).map(event => <button type="button" key={event.key} title={eventTitle(event)} onClick={() => setSelected(event.key)} className={`block w-full rounded border-l-2 text-left px-1.5 py-1 mb-1 text-[11px] ${statusClass(event)}`}><span className="block truncate font-semibold">{fromTimeOnly(event.startTime)} · {titleOf(event)}</span><span className="block truncate">{event.room}</span></button>)}
          </div>)}</div>
        </div></div>}

        {view === 'list' && <div className="max-h-[54vh] overflow-auto divide-y divide-slate-100">
          {shown.map(event => <button key={event.key} type="button" onClick={() => setSelected(event.key)} className="w-full text-left p-4 flex gap-4 hover:bg-surface/80">
            <span className="text-secondary text-sm w-28 shrink-0">{shortDate(event.date)}</span><span className={`w-1 rounded ${event.status === 'Cancelled' ? 'bg-slate-300' : event.status === 'Completed' ? 'bg-emerald-400' : event.type === 'PT' ? 'bg-sky-400' : 'bg-indigo-400'}`} />
            <span><b className={event.status === 'Cancelled' ? 'line-through' : ''}>{titleOf(event)}</b><span className="block text-sm">{fromTimeOnly(event.startTime)}–{fromTimeOnly(event.endTime)} · {event.room} · {event.coach}</span><span className="block text-xs text-secondary">{labelOf(event)}{event.replacesSessionId ? ' · Buổi bù' : ''}</span></span>
          </button>)}
          {!shown.length && <p className="p-5 text-secondary">Chưa có lịch buổi học.</p>}
        </div>}
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 border-t border-outline-variant/50 text-xs text-secondary">
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-400" />{personal ? 'Khóa / lớp học' : 'Đã lên lịch'}</span>{personal && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400" />PT</span>}<span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Hoàn tất</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Buổi bù</span>
      <label className="flex items-center gap-1.5"><input type="checkbox" checked={showCancelled} onChange={e => { if (onIncludeCancelledChange) onIncludeCancelledChange(e.target.checked); else setLocalShowCancelled(e.target.checked) }} />Hiện buổi đã hủy</label><span className="ml-auto">{view === 'week' ? `${weekEvents.length} buổi trong tuần` : personal ? `${shown.length} lịch đã tải` : `${shown.length} buổi toàn khóa`} · Giờ Việt Nam</span>
    </div>
  </div>
}
