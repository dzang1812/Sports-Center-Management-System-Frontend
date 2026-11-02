import { addDays, formatDate, fromTimeOnly, toDateOnly, toIsoWeek, fromIsoWeek, weekRange } from '../dateUtils'
import { Badge, Icon, btnOutline } from './ui'

const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
const TYPE_CARD = {
  PT: 'border-l-amber-400 bg-amber-50/70 hover:bg-amber-100/70',
  Class: 'border-l-indigo-400 bg-indigo-50/70 hover:bg-indigo-100/70',
}

// A compact weekly agenda: equally sized days, with sessions in time order inside each day.
export default function WeekTimetable({ weekStart, onWeekChange, items, statusLabel, statusTone, renderMeta, onItemClick }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = toDateOnly()
  const weekItems = items.filter(item => item.date >= weekStart && item.date <= days[6])
  const ptCount = weekItems.filter(item => item.type === 'PT').length

  return <section className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-white shadow-sm" aria-label="Lịch dạy theo tuần">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3 sm:px-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Tuần trước" className={btnOutline + ' !h-9 !w-9 !p-0'} onClick={() => onWeekChange(addDays(weekStart, -7))}><Icon name="chevron_left" className="text-xl" /></button>
          <button type="button" className={btnOutline + ' !h-9 !px-3'} onClick={() => onWeekChange(weekRange()[0])}>Hôm nay</button>
          <button type="button" aria-label="Tuần sau" className={btnOutline + ' !h-9 !w-9 !p-0'} onClick={() => onWeekChange(addDays(weekStart, 7))}><Icon name="chevron_right" className="text-xl" /></button>
        </div>
        <h2 className="text-sm sm:text-base font-bold text-slate-900">{formatDate(weekStart, { day: '2-digit', month: '2-digit' })} – {formatDate(days[6], { day: '2-digit', month: '2-digit', year: 'numeric' })}</h2>
      </div>
      <label className="flex items-center gap-2 text-body-sm font-medium text-slate-500">Chọn tuần
        <input type="week" aria-label="Chọn tuần dạy" className="h-9 min-w-0 max-w-[190px] rounded-lg border border-outline-variant bg-white px-2.5 text-sm text-slate-900" value={toIsoWeek(weekStart)} onChange={event => event.target.value && onWeekChange(fromIsoWeek(event.target.value))} />
      </label>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-4 py-2.5 text-body-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1"><span className="font-bold text-slate-800">{weekItems.length} buổi trong tuần</span>
        <span className="inline-flex items-center gap-1.5 text-slate-600"><span className="h-2 w-2 rounded-full bg-indigo-500" />{weekItems.length - ptCount} lớp học</span>
        <span className="inline-flex items-center gap-1.5 text-slate-600"><span className="h-2 w-2 rounded-full bg-amber-500" />{ptCount} PT</span>
      </div>
      <span className="text-slate-500">Giờ Việt Nam · GMT+7</span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-7 border-t border-slate-200">
      {days.map((date, index) => {
        const sessions = weekItems.filter(item => item.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime) || a.endTime.localeCompare(b.endTime))
        const isToday = date === today
        return <section key={date} aria-label={`${DAY_LABELS[index]}, ${formatDate(date)}`} className={`min-w-0 border-b border-r border-slate-200 last:border-b-0 sm:last:col-span-2 xl:last:col-span-1 xl:border-b-0 xl:last:border-r-0 ${isToday ? 'bg-indigo-50/30' : 'bg-white'}`}>
          <div className={`flex items-center justify-between gap-1 border-b px-2 py-3 ${isToday ? 'border-indigo-200 bg-indigo-50' : 'border-slate-100'}`}>
            <div className="flex min-w-0 items-center gap-1.5"><span aria-current={isToday ? 'date' : undefined} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-bold ${isToday ? 'bg-primary-container text-white' : 'text-slate-800'}`}>{Number(date.slice(8))}</span>
              <div><h3 className={`text-body-sm font-bold ${isToday ? 'text-primary' : 'text-slate-700'}`}>{DAY_LABELS[index]}</h3><p className="text-[10px] text-slate-500">{isToday ? 'Hôm nay' : formatDate(date, { day: '2-digit', month: '2-digit' })}</p></div>
            </div>
            <span aria-label={`${sessions.length} buổi`} className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${sessions.length ? 'bg-slate-100 text-slate-600' : 'text-slate-400'}`}>{sessions.length || '—'}</span>
          </div>
          {sessions.length ? <div className="space-y-2 p-2">
            {sessions.map((item, itemIndex) => {
              const pt = item.type === 'PT'
              const Container = onItemClick ? 'button' : 'div'
              const tone = statusTone ? statusTone(item) : item.status === 'Cancelled' ? 'red' : item.status === 'Completed' ? 'slate' : pt ? 'amber' : 'indigo'
              return <Container key={`${item.type}-${item.bookingId ?? item.referenceId ?? itemIndex}`} {...(onItemClick ? { type: 'button', onClick: () => onItemClick(item) } : {})}
                className={`block w-full min-w-0 space-y-2 rounded-lg border border-slate-200/70 border-l-[3px] p-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${TYPE_CARD[item.type] ?? TYPE_CARD.Class} ${item.status === 'Cancelled' ? 'opacity-60' : ''}`}>
                <div className="flex flex-wrap items-center justify-between gap-1"><span className={`text-[10px] font-bold uppercase tracking-wide ${pt ? 'text-amber-700' : 'text-indigo-700'}`}>{pt ? 'PT cá nhân' : 'Lớp học'}</span><Icon name={pt ? 'fitness_center' : 'school'} className={`text-base ${pt ? 'text-amber-600' : 'text-indigo-500'}`} /></div>
                <p className="text-sm font-bold leading-5 text-slate-900">{fromTimeOnly(item.startTime)}–{fromTimeOnly(item.endTime)}</p>
                <p className="break-words text-body-sm font-semibold leading-5 text-slate-800">{item.title}</p>
                {item.room && <p className="flex items-start gap-1 text-[11px] text-slate-600"><Icon name="location_on" className="text-sm shrink-0" /><span className="break-words">{item.room}</span></p>}
                {renderMeta && <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600">{renderMeta(item)}</div>}
                {statusLabel && <div><Badge tone={tone}>{statusLabel(item)}</Badge></div>}
              </Container>
            })}
          </div> : <div className="hidden xl:flex min-h-40 items-center justify-center px-2 text-center text-[11px] text-slate-400">Chưa có lịch</div>}
        </section>
      })}
    </div>
    <p className="border-t border-slate-100 px-4 py-2.5 text-body-sm text-slate-500">{weekItems.length ? 'Chọn một buổi để xem học viên và điểm danh.' : 'Tuần này chưa có buổi dạy. Bạn có thể chuyển sang tuần khác để xem lịch.'}</p>
  </section>
}
