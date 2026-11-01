import { useState } from 'react'
import { Link } from 'react-router-dom'
import { addDays, formatDate, fromTimeOnly, hasScheduleStarted, isPastSchedule, toDateOnly } from '../dateUtils'
import { Badge, Field, Icon, btnOutline, inputCls } from './ui'

const dateLabel = date => date ? formatDate(date, { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chọn ngày'

export default function MemberScheduleOverview({ items, loading, range, onRangeChange, typeFilter, onTypeChange,
  includeCancelled, onIncludeCancelledChange, onRefresh, statusLabel, renderActions, calendar, discoverTo = '/member/classes' }) {
  const [mode, setMode] = useState('upcoming')
  const [limit, setLimit] = useState(10)
  const today = toDateOnly()
  const agenda = items.filter(item => mode === 'past' ? isPastSchedule(item) : !isPastSchedule(item))
    .sort((a, b) => {
      const order = `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)
      return mode === 'past' ? -order : order
    })
  const next = mode === 'upcoming' ? agenda.find(item => item.status === 'Confirmed' && !['Present', 'Late'].includes(item.attendanceStatus)) : null
  const keyOf = item => `${item.type}:${item.bookingId}`
  const shown = agenda.slice(0, limit)
  const switchMode = value => {
    setMode(value); setLimit(10)
    if (value !== 'calendar') onRangeChange(value === 'past' ? { from: addDays(today, -30), to: today } : { from: addDays(today, -7), to: addDays(today, 30) })
  }

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Cách xem lịch" className="flex gap-1 rounded-xl bg-surface-container-low p-1">
        {[['upcoming', 'Sắp tới'], ['calendar', 'Tuần / tháng'], ['past', 'Đã qua']].map(([value, label]) => <button type="button" key={value} aria-pressed={mode === value} onClick={() => switchMode(value)} className={`px-3 sm:px-4 py-2 rounded-lg text-body-sm font-semibold ${mode === value ? 'bg-white text-primary shadow-sm' : 'text-secondary hover:bg-white/60'}`}>{label}</button>)}
      </nav>
      <div className="flex items-center gap-2">
        <select aria-label="Lọc loại lịch" className={inputCls + ' !w-auto !h-10'} value={typeFilter} onChange={event => { onTypeChange(event.target.value); setLimit(10) }}><option value="all">Tất cả buổi tập</option><option value="Class">Khóa / lớp học</option><option value="PT">PT riêng</option></select>
        <button type="button" className={btnOutline + ' !px-3'} disabled={loading} onClick={onRefresh} aria-label="Làm mới lịch" title="Làm mới lịch"><Icon name="refresh" className="text-xl" /></button>
      </div>
    </div>

    {mode !== 'calendar' && <div className="flex flex-wrap items-start justify-between gap-2 text-body-sm text-secondary">
      <p className="pt-1">{dateLabel(mode === 'upcoming' && range.from && range.from < today ? today : range.from)} – {dateLabel(range.to)} · {agenda.length} buổi · Giờ Việt Nam</p>
      <details className="rounded-lg border border-outline-variant/50 bg-white px-3 py-1.5">
        <summary className="cursor-pointer">Chọn khoảng ngày</summary>
        <div className="grid sm:grid-cols-2 gap-3 pt-3 pb-2">
          <Field label="Từ ngày"><input className={inputCls} type="date" value={range.from} onChange={event => { onRangeChange({ ...range, from: event.target.value }); setLimit(10) }} /></Field>
          <Field label="Đến ngày"><input className={inputCls} type="date" value={range.to} min={range.from} onChange={event => { onRangeChange({ ...range, to: event.target.value }); setLimit(10) }} /></Field>
          <label className="sm:col-span-2 flex items-center gap-2"><input type="checkbox" checked={includeCancelled} onChange={event => onIncludeCancelledChange(event.target.checked)} />Hiện cả buổi đã hủy</label>
        </div>
      </details>
    </div>}

    {loading && <p role="status" className="text-body-sm text-secondary">Đang cập nhật lịch…</p>}
    {mode === 'calendar' ? calendar : <>
      <div className={`space-y-3 ${loading ? 'opacity-60' : ''}`}>
        {shown.map(item => {
          const highlighted = next && keyOf(next) === keyOf(item)
          const status = statusLabel(item)
          return <article key={keyOf(item)} className={`rounded-2xl border bg-white p-4 sm:p-5 ${highlighted ? 'border-primary-container/50 shadow-sm' : 'border-outline-variant/50'}`}>
            {highlighted && <p className="text-primary text-xs font-semibold mb-3 flex items-center gap-1.5"><Icon name="schedule" className="text-base" />{hasScheduleStarted(item) ? 'ĐANG DIỄN RA' : 'BUỔI TẬP TIẾP THEO'}</p>}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className={`rounded-xl p-3 sm:w-24 shrink-0 text-center flex sm:flex-col items-center justify-center gap-2 sm:gap-0 ${item.type === 'PT' ? 'bg-sky-50 text-sky-800' : 'bg-indigo-50 text-primary'}`}>
                <span className="text-body-sm">{formatDate(item.date, { weekday: 'short' })}</span><span className="font-semibold text-xl">{formatDate(item.date, { day: '2-digit', month: '2-digit' })}</span>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2"><span className="text-body-sm text-secondary">{item.type === 'PT' ? 'PT riêng' : item.enrollmentId ? 'Khóa nhiều tuần' : 'Lớp theo buổi'}</span><Badge tone={status.tone}>{status.label}</Badge></div>
                <h2 className="font-semibold text-lg">{item.type === 'PT' ? `PT · ${item.sport ?? 'Tập riêng với HLV'}` : item.title}</h2>
                <p className="font-semibold">{fromTimeOnly(item.startTime)}–{fromTimeOnly(item.endTime)}</p>
                <p className="text-body-sm text-secondary">HLV: {item.coach ?? 'Đang cập nhật'}{item.room ? ` · ${item.room}` : ''}</p>
              </div>
              <div className="sm:ml-auto shrink-0">{renderActions(item)}</div>
            </div>
          </article>
        })}
      </div>
      {!loading && !agenda.length && <div className="rounded-2xl border border-dashed border-outline-variant bg-white p-8 text-center space-y-3"><Icon name="event_available" className="text-4xl text-outline" /><p className="font-semibold">{mode === 'past' ? 'Chưa có buổi tập đã qua trong khoảng này.' : 'Không có buổi sắp tới trong khoảng này.'}</p><p className="text-body-sm text-secondary">Bạn có thể chọn khoảng ngày khác hoặc đăng ký buổi tập mới.</p><Link className={btnOutline} to={discoverTo}>Xem khóa học</Link></div>}
      {agenda.length > limit && <div className="text-center"><button type="button" className={btnOutline} onClick={() => setLimit(value => value + 10)}>Xem thêm {Math.min(10, agenda.length - limit)} buổi</button></div>}
    </>}
  </div>
}
