import { useEffect, useRef, useState } from 'react'
import { api, query } from '../api'
import { Alert, Field, Icon, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { addDays, formatDate, fromIsoWeek, fromTimeOnly, toIsoWeek, toTimeOnly, weekRange } from '../dateUtils'
import { DAYS_OF_WEEK } from '../labels'

const fullDate = date => formatDate(date, { day: '2-digit', month: '2-digit', year: 'numeric' })
const makeRow = (item, date = item.date) => ({ key: crypto.randomUUID(), sportId: String(item.sportId), date, startTime: fromTimeOnly(item.startTime), endTime: fromTimeOnly(item.endTime) })

function WeekEditor({ weekStart, onDirty, onSaving }) {
  const [data, setData] = useState(null), [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false)
  const [error, setError] = useState(''), [notice, setNotice] = useState('')
  const [conflicts, setConflicts] = useState([]), [reload, setReload] = useState(0)
  const active = useRef(true), pending = useRef(false)
  const weekEnd = addDays(weekStart, 6)
  const dates = Array.from({ length: 7 }, (_, day) => addDays(weekStart, day))
  useEffect(() => {
    active.current = true
    const controller = new AbortController()
    const load = async () => {
      if (controller.signal.aborted) return
      setLoading(true); setError('')
      try {
        const result = await api('/coach/availability/week' + query({ weekStart }), { signal: controller.signal })
        if (result?.weekStart !== weekStart || result.weekEnd !== weekEnd || !Array.isArray(result.items) || !Array.isArray(result.sports)) throw new Error('Dữ liệu lịch tuần chưa hợp lệ. Vui lòng thử lại hoặc liên hệ quản lý.')
        if (!controller.signal.aborted) { setData(result); setRows(result.items.map(item => makeRow(item))); onDirty(false) }
      } catch (err) { if (!controller.signal.aborted) setError(err.status === 404 ? 'Lịch rảnh theo tuần cần Backend mới. Chưa thể lưu cho đến khi hệ thống được cập nhật.' : err.message) }
      finally { if (!controller.signal.aborted) setLoading(false) }
    }
    void Promise.resolve().then(load)
    return () => { active.current = false; controller.abort() }
  }, [weekStart, weekEnd, onDirty, reload])
  const change = next => { setRows(next); onDirty(true); setNotice(''); setConflicts([]) }
  const add = date => change([...rows, { key: crypto.randomUUID(), date, sportId: String(data.sports[0]?.id ?? ''), startTime: '06:00', endTime: '07:00' }])
  const update = (key, patch) => change(rows.map(row => row.key === key ? { ...row, ...patch } : row))
  const append = items => {
    if (rows.length + items.length > 50) { setError('Tối đa 50 khung giờ trong tuần.'); return }
    change([...rows, ...items]); setError('')
  }
  const importLegacy = () => {
    const imported = (data.legacyTemplates ?? []).map(item => makeRow(item, dates[DAYS_OF_WEEK.indexOf(item.dayOfWeek)]))
    append(imported.filter(item => !rows.some(row => row.date === item.date && row.sportId === item.sportId && row.startTime === item.startTime && row.endTime === item.endTime)))
  }
  const keepBookings = () => append((data.bookings ?? []).filter(b => !rows.some(a => Number(a.sportId) === b.sportId && a.date === b.date && toTimeOnly(a.startTime) <= b.startTime && toTimeOnly(a.endTime) >= b.endTime)).map(item => makeRow(item)))
  const save = async () => {
    if (pending.current || loading || !data) return
    setError(''); setNotice(''); setConflicts([])
    const items = rows.map(row => ({ sportId: Number(row.sportId), date: row.date, startTime: toTimeOnly(row.startTime), endTime: toTimeOnly(row.endTime) }))
    if (items.some(item => !data.sports.some(s => s.id === item.sportId) || item.date < weekStart || item.date > weekEnd || !/^\d{2}:00:00$/.test(item.startTime) || !/^\d{2}:00:00$/.test(item.endTime) || item.startTime >= item.endTime)) { setError('Chọn đúng bộ môn và giờ bắt đầu/kết thúc tròn giờ, kết thúc sau bắt đầu trong cùng ngày.'); return }
    if (items.some((item, i) => items.slice(i + 1).some(other => item.date === other.date && item.startTime < other.endTime && other.startTime < item.endTime))) { setError('Các khung giờ trong cùng ngày không được trùng nhau, kể cả khác bộ môn.'); return }
    pending.current = true; setBusy(true); onSaving(true)
    try {
      const result = await api('/coach/availability/week', { method: 'PUT', body: { weekStart, items } })
      if (result?.weekStart !== weekStart || !Array.isArray(result.items)) throw new Error('Chưa xác minh được kết quả lưu tuần này. Vui lòng thử lại.')
      if (active.current) { setData(result); setRows(result.items.map(item => makeRow(item))); onDirty(false); setNotice('Đã lưu lịch rảnh từ ' + fullDate(weekStart) + ' đến ' + fullDate(weekEnd) + '. Không lặp sang tuần khác.') }
    } catch (err) { if (active.current) { setError(err.message); if (Array.isArray(err.details)) setConflicts(err.details) } }
    finally { pending.current = false; if (active.current) { setBusy(false); onSaving(false) } }
  }
  return <div className="space-y-4">
    {error && <Alert>{error}</Alert>}{notice && <Alert type="success">{notice}</Alert>}
    {conflicts.length > 0 && <ul className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{conflicts.map(item => <li key={item.bookingId}>Booking #{item.bookingId} · {fullDate(item.date)} · {fromTimeOnly(item.startTime)}–{fromTimeOnly(item.endTime)}</li>)}</ul>}
    {loading && <p role="status" className="py-6 text-center text-secondary">Đang tải giờ rảnh trong tuần…</p>}
    {!data && !loading && <button type="button" className={btnOutline} onClick={() => setReload(value => value + 1)}>Thử lại</button>}
    {data && <>
      {!!data.legacyTemplates?.length && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50 p-3 text-sm"><p className="text-sky-900">Giờ lặp cũ chỉ dùng làm mẫu; không tự mở lịch cho tuần này.</p><button type="button" className={btnOutline + ' !text-xs bg-white'} disabled={busy || loading} onClick={importLegacy}>Nhập giờ cũ vào tuần này</button></div>}
      {!!data.bookings?.length && <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><p className="text-secondary">Có <b className="text-slate-900">{data.bookings.length} booking PT</b> trong tuần. Các buổi đã đặt vẫn được giữ nguyên.</p><button type="button" className="text-primary font-semibold hover:underline" disabled={busy || loading} onClick={keepBookings}>Thêm khung bao phủ buổi đã đặt</button></div>}
      <fieldset disabled={busy || loading} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {dates.map(date => { const dayRows = rows.filter(row => row.date === date), booked = (data.bookings ?? []).filter(b => b.date === date)
          return <section key={date} className="rounded-xl border border-outline-variant/50 bg-white overflow-hidden">
            <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2"><div><h2 className="font-semibold text-slate-900">{formatDate(date, { weekday: 'long' })}</h2><p className="text-xs text-secondary">{fullDate(date)}</p></div><button type="button" className="rounded-lg p-2 text-primary hover:bg-white disabled:opacity-40" aria-label={'Thêm giờ ' + date} disabled={rows.length >= 50 || !data.sports.length} onClick={() => add(date)}><Icon name="add" className="text-xl" /></button></header>
            <div className="p-3 space-y-3">
              {!dayRows.length && <p className="text-body-sm text-slate-400 py-2">Chưa mở giờ rảnh.</p>}
              {dayRows.map(row => <div key={row.key} className="space-y-2 rounded-lg border border-slate-200 p-2">
                <div className="flex items-center gap-2"><select aria-label={'Bộ môn ' + date} className={inputCls + ' !h-9 !text-xs'} value={row.sportId} onChange={event => update(row.key, { sportId: event.target.value })}>
                  {!data.sports.some(s => String(s.id) === row.sportId) && <option value={row.sportId}>Bộ môn không còn khả dụng</option>}{data.sports.map(sport => <option key={sport.id} value={sport.id}>{sport.name}</option>)}
                </select><button type="button" className="shrink-0 p-1 text-slate-400 hover:text-error" aria-label={'Xóa khung ' + date + ' ' + row.startTime} onClick={() => change(rows.filter(item => item.key !== row.key))}><Icon name="delete" className="text-lg" /></button></div>
                <div className="grid grid-cols-2 gap-2"><Field label="Từ giờ"><input aria-label={'Từ giờ ' + date} type="time" step="3600" className={inputCls + ' !h-9 !px-2 !text-xs'} value={row.startTime} onChange={event => update(row.key, { startTime: event.target.value })} /></Field><Field label="Đến giờ"><input aria-label={'Đến giờ ' + date} type="time" step="3600" className={inputCls + ' !h-9 !px-2 !text-xs'} value={row.endTime} onChange={event => update(row.key, { endTime: event.target.value })} /></Field></div>
              </div>)}
              {booked.length > 0 && <div className="border-t border-slate-100 pt-2 text-xs text-amber-900 space-y-1"><p className="font-semibold">Đã có lịch PT</p>{booked.map(b => <p key={b.bookingId}>{fromTimeOnly(b.startTime)}–{fromTimeOnly(b.endTime)}</p>)}</div>}
            </div>
          </section>
        })}
      </fieldset>
      {!data.sports.length && <Alert type="info">Bạn chưa có bộ môn PT đang hoạt động. Vui lòng liên hệ quản lý.</Alert>}
      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant/50 bg-white/95 p-3 shadow-sm backdrop-blur"><span className="text-sm text-secondary"><b className="text-slate-900">{rows.length}/50</b> khung trong tuần · Mỗi buổi PT 60 phút</span><button type="button" className={btnPrimary} disabled={busy || loading || !data.sports.length} onClick={save}>{busy ? 'Đang lưu…' : 'Lưu tuần này'}</button></div>
    </>}
  </div>
}

export default function CoachAvailabilityPage() {
  const [weekStart, setWeekStart] = useState(() => weekRange()[0])
  const [dirty, setDirty] = useState(false), [saving, setSaving] = useState(false)
  const changeWeek = next => {
    if (saving || next === weekStart) return
    if (dirty && !window.confirm('Tuần này có thay đổi chưa lưu. Bỏ thay đổi để chuyển tuần?')) return
    setDirty(false); setWeekStart(next)
  }
  return <div className="space-y-4">
    <div><h1 className="font-headline-xl text-headline-xl">Giờ rảnh PT theo tuần</h1><p className="text-secondary mt-1">Chọn tuần rồi thêm giờ rảnh vào từng ngày. Chỉ áp dụng tuần đã chọn, không tự lặp. Giờ Việt Nam.</p></div>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant/50 bg-white p-3">
      <div className="flex items-center gap-2"><button type="button" className={btnOutline + ' !px-2'} aria-label="Tuần trước" disabled={saving} onClick={() => changeWeek(addDays(weekStart, -7))}><Icon name="chevron_left" /></button><p className="font-semibold text-sm">{fullDate(weekStart)} – {fullDate(addDays(weekStart, 6))}</p><button type="button" className={btnOutline + ' !px-2'} aria-label="Tuần sau" disabled={saving} onClick={() => changeWeek(addDays(weekStart, 7))}><Icon name="chevron_right" /></button></div>
      <div className="flex flex-wrap items-center gap-2"><input aria-label="Chọn tuần" type="week" className={inputCls + ' !w-auto !h-10'} value={toIsoWeek(weekStart)} disabled={saving} onChange={event => { const value = event.target.value; if (value && /^\d{4}-W\d{2}$/.test(value)) { const next = fromIsoWeek(value); if (toIsoWeek(next) === value) changeWeek(next) } }} /><button type="button" className={btnOutline} disabled={saving} onClick={() => changeWeek(weekRange()[0])}>Tuần này</button>{dirty && <span className="text-xs font-semibold text-amber-700">Chưa lưu</span>}</div>
    </div>
    <WeekEditor key={weekStart} weekStart={weekStart} onDirty={setDirty} onSaving={setSaving} />
  </div>
}
