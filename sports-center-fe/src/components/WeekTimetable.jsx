import { addDays, formatDate, fromTimeOnly, toDateOnly, toIsoWeek, fromIsoWeek, weekRange } from '../dateUtils'
import { Badge, Icon, btnOutline, btnPrimary } from './ui'

const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']

const TYPE_TONE = { PT: 'amber', Class: 'indigo' }
// Color-code the item card itself by type, so a glance at the grid tells Lớp học apart from PT.
const TYPE_CARD = {
  PT: 'bg-amber-50 border-l-4 border-amber-400',
  Class: 'bg-indigo-50 border-l-4 border-indigo-400',
}
const TYPE_TITLE = { PT: 'text-amber-700', Class: 'text-indigo-700' }

// Table-based weekly timetable (rows = time slots found in the week's data, columns = Mon-Sun),
// styled like a university-style "thời khóa biểu". `items` need
// { date: "yyyy-MM-dd", startTime/endTime: "HH:mm:ss", title, type, room?, status?, statusLabel? }.
export default function WeekTimetable({ weekStart, onWeekChange, items, statusLabel, statusTone, renderMeta, onItemClick }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = toDateOnly(new Date())

  const slots = [...new Map(items.map((it) => [`${it.startTime}-${it.endTime}`, { start: it.startTime, end: it.endTime }])).values()].sort((a, b) =>
    a.start.localeCompare(b.start),
  )
  const cellOf = (date, slot) => items.filter((it) => it.date === date && it.startTime === slot.start && it.endTime === slot.end)

  const goWeek = (delta) => onWeekChange(addDays(weekStart, delta * 7))
  const goToday = () => onWeekChange(weekRange()[0])

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gradient-to-r from-primary-container/10 via-surface-container-lowest to-tertiary-container/10 rounded-xl shadow-sm border border-outline-variant/40 p-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="font-label-md text-label-md text-primary font-semibold">Chọn tuần</span>
          <input
            type="week"
            className="h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest"
            value={toIsoWeek(weekStart)}
            onChange={(e) => e.target.value && onWeekChange(fromIsoWeek(e.target.value))}
          />
        </label>
        <button className={btnOutline + ' !h-10'} onClick={() => goWeek(-1)}>
          <Icon name="arrow_back" className="text-lg" /> Tuần trước
        </button>
        <button className={btnPrimary + ' !h-10'} onClick={goToday}>
          <Icon name="event" className="text-lg" /> Tuần hiện tại
        </button>
        <button className={btnOutline + ' !h-10'} onClick={() => goWeek(1)}>
          Tuần sau <Icon name="arrow_forward" className="text-lg" />
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/40 overflow-hidden">
        <div className="px-4 pt-4 pb-3 bg-gradient-to-r from-primary-container/15 to-tertiary-container/15 border-b border-outline-variant/40">
          <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
            <Icon name="calendar_month" className="text-xl" />
            Thời khóa biểu tuần
          </h3>
          <p className="text-secondary text-body-sm">
            Tuần ({formatDate(weekStart, { day: '2-digit', month: '2-digit' })} - {formatDate(days[6], { day: '2-digit', month: '2-digit' })})
          </p>
          <div className="flex items-center gap-4 pt-2 font-body-sm text-body-sm">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-indigo-400 inline-block" /> Lớp học</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> PT</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 min-w-[920px]">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
                <th className="px-3 py-3 border-2 border-surface-container-low text-left w-16">Slot</th>
                {days.map((d, i) => (
                  <th key={d} className={`px-3 py-3 border-2 border-surface-container-low border-l border-l-outline-variant/40 text-left ${d === today ? 'bg-primary-container text-on-primary' : ''}`}>
                    {DAY_LABELS[i]}
                    <div className={`font-body-sm normal-case font-normal ${d === today ? 'text-on-primary/80' : 'text-secondary'}`}>
                      {formatDate(d, { day: '2-digit', month: '2-digit' })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot, idx) => (
                <tr key={`${slot.start}-${slot.end}`} className={idx % 2 ? 'bg-surface-container-low/40' : ''}>
                  <td className="px-3 py-3 border-2 border-surface-container-low text-center align-top">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-container text-on-primary font-semibold text-label-sm">{idx + 1}</span>
                  </td>
                  {days.map((d) => {
                    const cell = cellOf(d, slot)
                    return (
                      <td key={d} className={`px-2 py-2 border-2 border-surface-container-low border-l border-l-outline-variant/40 align-top ${d === today ? 'bg-primary-container/5' : ''}`}>
                        {cell.length ? cell.map((it) => (
                          <div
                            key={`${it.type}-${it.bookingId ?? it.referenceId}`}
                            role={onItemClick ? 'button' : undefined}
                            onClick={onItemClick ? () => onItemClick(it) : undefined}
                            className={`rounded-lg p-2 mb-2 shadow-sm ${TYPE_CARD[it.type] ?? TYPE_CARD.Class} ${onItemClick ? 'cursor-pointer hover:shadow-md hover:brightness-95' : ''} ${it.status === 'Cancelled' ? 'opacity-60' : ''} transition-all`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className={`font-label-md text-label-md font-bold flex items-center gap-1 ${TYPE_TITLE[it.type] ?? TYPE_TITLE.Class}`}>
                                <Icon name="menu_book" className="text-base" />
                                {it.title}
                              </span>
                              {statusLabel && (
                                <Badge tone={statusTone ? statusTone(it) : it.type === 'PT' ? TYPE_TONE.PT : TYPE_TONE.Class}>{statusLabel(it)}</Badge>
                              )}
                            </div>
                            <div className="text-body-sm text-orange-600 font-semibold mt-1 flex items-center gap-1">
                              <Icon name="schedule" className="text-sm" />
                              {fromTimeOnly(it.startTime)}-{fromTimeOnly(it.endTime)}
                            </div>
                            {it.room && (
                              <div className="text-body-sm text-emerald-700 flex items-center gap-1">
                                <Icon name="place" className="text-sm" />
                                {it.room}
                              </div>
                            )}
                            {renderMeta && <div className="text-body-sm text-sky-700 flex items-center gap-1">{renderMeta(it)}</div>}
                          </div>
                        )) : (
                          <span className="text-outline">-</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {!slots.length && (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-secondary">
                    Không có buổi nào trong tuần này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
