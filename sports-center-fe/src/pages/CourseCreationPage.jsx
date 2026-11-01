import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { addDays, businessDateTimeToUtc, formatDate, formatTimestamp, fromTimeOnly, toDateOnly, toTimeOnly, weekRange } from '../dateUtils'
import { DAYS_OF_WEEK, DAY_OF_WEEK_LABEL, LEVEL_LABEL } from '../labels'
import { Alert, Field, btnOutline, btnPrimary, inputCls } from '../components/ui'
import CourseScheduleCalendar from '../components/CourseScheduleCalendar'

const money = n => `${Number(n).toLocaleString('vi-VN')}đ`
const initialStart = () => weekRange(addDays(toDateOnly(), 7))[0]

export default function CourseCreationPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(() => ({ name: '', description: '', sportId: '', coachId: '', roomId: '', capacity: 10,
    level: 'Beginner', startDate: initialStart(), weeks: 4, daysOfWeek: ['Monday', 'Wednesday'],
    startTime: '18:00', endTime: '19:00', sessionPrice: 100000, cutoff: `${initialStart()}T12:00` }))
  const [catalog, setCatalog] = useState({ sports: [], rooms: [], coaches: [] })
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [fields, setFields] = useState({})
  const [busy, setBusy] = useState(false)
  const request = useRef(null)
  const generation = useRef(0)
  const pending = useRef(false)
  const replay = useRef(null)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    const c = new AbortController()
    Promise.all([api('/sports', { signal: c.signal }), api('/rooms', { signal: c.signal }), api('/users?role=Coach&status=Active&pageSize=50', { signal: c.signal })])
      .then(([sports, rooms, coaches]) => { if (!c.signal.aborted) setCatalog({ sports, rooms, coaches: coaches.items }) })
      .catch(err => { if (!c.signal.aborted) setError(err.message) })
    return () => { alive.current = false; c.abort(); request.current?.abort() }
  }, [])

  const change = (field, value) => {
    generation.current++; request.current?.abort(); setPreview(null); replay.current = null; setError(''); setFields({})
    setForm(f => ({ ...f, [field]: value, ...(field === 'sportId' ? { coachId: '' } : {}) }))
  }
  const set = field => e => change(field, e.target.value)
  const payload = () => ({ name: form.name.trim(), description: form.description.trim() || null, sportId: Number(form.sportId),
    coachId: Number(form.coachId), roomId: Number(form.roomId), capacity: Number(form.capacity), level: form.level,
    startDate: form.startDate, weeks: Number(form.weeks), daysOfWeek: form.daysOfWeek, startTime: toTimeOnly(form.startTime),
    endTime: toTimeOnly(form.endTime), sessionPrice: Number(form.sessionPrice), enrollmentClosesAt: businessDateTimeToUtc(form.cutoff) })
  const failure = err => {
    setError(err.message)
    const field = err.details?.field
    setFields(field ? { [field]: err.message } : Object.fromEntries(Object.entries(err.errors ?? {}).map(([k, v]) => [k[0].toLowerCase() + k.slice(1), v[0]])))
    if (err.details?.conflicts) setPreview(p => p ? { ...p, result: { ...p.result, conflicts: err.details.conflicts } } : p)
    if (['COURSE_ENROLLMENT_CLOSED', 'COURSE_ALREADY_STARTED'].includes(err.errorCode)) setPreview(p => p ? { ...p, result: { ...p.result, canOpen: false } } : p)
  }
  const showPreview = async e => {
    e.preventDefault()
    if (pending.current) return
    pending.current = true; setBusy(true); setError(''); setFields({}); setPreview(null)
    const version = ++generation.current
    const c = new AbortController(); request.current?.abort(); request.current = c
    try {
      const body = payload()
      const result = await api('/courses/preview', { method: 'POST', body, signal: c.signal })
      if (alive.current && !c.signal.aborted && version === generation.current) setPreview({ result, body })
    } catch (err) { if (alive.current && !c.signal.aborted) failure(err) }
    finally { pending.current = false; if (alive.current) setBusy(false) }
  }
  const save = async openRegistration => {
    if (pending.current || !preview || preview.result.conflicts.length) return
    const body = { ...preview.body, openRegistration }
    const signature = JSON.stringify(body)
    if (replay.current?.signature !== signature) replay.current = { signature, key: crypto.randomUUID() }
    pending.current = true; setBusy(true); setError(''); setFields({})
    try {
      const result = await api('/courses', { method: 'POST', body, idempotencyKey: replay.current.key })
      if (alive.current) navigate(`/manager/courses?courseId=${result.classId}`)
    } catch (err) { if (alive.current) failure(err) }
    finally { pending.current = false; if (alive.current) setBusy(false) }
  }
  const sport = catalog.sports.find(s => String(s.id) === String(form.sportId))
  const room = catalog.rooms.find(r => String(r.id) === String(form.roomId))
  const p = preview?.result
  const input = (field, label, type = 'text', props = {}) => <Field label={label} error={fields[field]}><input name={field} className={inputCls} type={type} required value={form[field]} onChange={set(field)} {...props} /></Field>

  return <div className="space-y-5">
    <div><h1 className="font-headline-xl text-headline-xl">Tạo khóa học</h1><p>Lưu một lần: thông tin, lịch lặp, học phí và mở đăng ký nguyên khóa. Ngày giờ theo Việt Nam.</p></div>
    <Link className={btnOutline} to="/manager/courses">Về quản lý khóa học</Link>
    <div className="sticky top-16 z-20 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button className={btnOutline} type="submit" form="course-creation-form" disabled={busy || !form.daysOfWeek.length}>{busy ? 'Đang xử lý…' : 'Xem trước lịch và học phí'}</button>
        <button className={btnOutline} type="button" disabled={busy || !p || !!p.conflicts.length} aria-describedby="course-save-hint" onClick={() => save(false)}>Lưu nháp</button>
        <button className={btnPrimary} type="button" disabled={busy || !p || !!p.conflicts.length || !p.canOpen} aria-describedby="course-save-hint" onClick={() => save(true)}>Tạo khóa học và mở đăng ký</button>
      </div>
      <p id="course-save-hint" className="text-secondary" role="status">
        {!p ? 'Điền thông tin rồi bấm “Xem trước lịch và học phí” để kiểm tra lịch và bật nút tạo khóa học.'
          : p.conflicts.length ? 'Lịch đang bị trùng. Hãy sửa thông tin và xem trước lại trước khi tạo khóa học.'
            : <>{p.sessionCount} buổi • Tổng học phí: <b>{money(p.totalFee)}</b>. {p.canOpen ? 'Bạn có thể lưu nháp hoặc tạo và mở đăng ký.' : 'Chỉ có thể lưu nháp vì hạn đăng ký hoặc buổi đầu đã qua.'} <a className="text-primary underline" href="#course-preview">Xem chi tiết lịch</a></>}
      </p>
    </div>
    {error && <Alert>{error}</Alert>}
    <form id="course-creation-form" className="space-y-5" onSubmit={showPreview}>
      <fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
        <section className="rounded-xl bg-surface-container-lowest p-5 space-y-4">
          <h2 className="font-headline-md text-headline-md">Thông tin chung</h2>
          {input('name', 'Tên khóa', 'text', { minLength: 2, maxLength: 150 })}
          <Field label="Mô tả" error={fields.description}><textarea className={inputCls} maxLength={1000} value={form.description} onChange={set('description')} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Bộ môn" error={fields.sportId}><select className={inputCls} required value={form.sportId} onChange={set('sportId')}><option value="">Chọn bộ môn</option>{catalog.sports.filter(s => s.hasClasses && s.status === 'Active').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
            <Field label="Trình độ" error={fields.level}><select className={inputCls} value={form.level} onChange={set('level')}>{Object.entries(LEVEL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
            <Field label="Huấn luyện viên" error={fields.coachId}><select className={inputCls} required value={form.coachId} onChange={set('coachId')}><option value="">Chọn HLV đúng chuyên môn</option>{catalog.coaches.filter(c => c.specialties?.includes(sport?.name)).map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}</select></Field>
            <Field label="Phòng" error={fields.roomId}><select className={inputCls} required value={form.roomId} onChange={set('roomId')}><option value="">Chọn phòng</option>{catalog.rooms.filter(r => r.status === 'Active').map(r => <option key={r.id} value={r.id}>{r.name} — {r.capacity} chỗ</option>)}</select></Field>
            {input('capacity', 'Sức chứa', 'number', { min: 1, max: room?.capacity ?? 10000, step: 1 })}
          </div>
        </section>
        <section className="rounded-xl bg-surface-container-lowest p-5 space-y-4">
          <h2 className="font-headline-md text-headline-md">Lịch lặp hàng tuần</h2>
          <div className="grid sm:grid-cols-2 gap-4">{input('startDate', 'Ngày bắt đầu khoảng lịch', 'date')}{input('weeks', 'Số tuần', 'number', { min: 1, max: 52, step: 1 })}</div>
          <p className="text-secondary">N tuần là khoảng từ ngày bắt đầu đến trước ngày bắt đầu + 7×N. Không bỏ ngày; K thứ mỗi tuần sẽ có N×K buổi.</p>
          <div><span className="font-semibold">Các thứ trong tuần</span><div className="flex flex-wrap gap-4 mt-2">{DAYS_OF_WEEK.map(day => <label key={day} className="flex gap-2 items-center"><input type="checkbox" checked={form.daysOfWeek.includes(day)} onChange={() => change('daysOfWeek', DAYS_OF_WEEK.filter(d => d === day ? !form.daysOfWeek.includes(d) : form.daysOfWeek.includes(d)))} />{DAY_OF_WEEK_LABEL[day]}</label>)}</div>{fields.daysOfWeek && <p className="text-error">{fields.daysOfWeek}</p>}</div>
          <div className="grid sm:grid-cols-2 gap-4">{input('startTime', 'Giờ bắt đầu', 'time')}{input('endTime', 'Giờ kết thúc', 'time')}</div>
        </section>
        <section className="rounded-xl bg-surface-container-lowest p-5 space-y-4"><h2 className="font-headline-md text-headline-md">Học phí và đăng ký</h2><div className="grid sm:grid-cols-2 gap-4">{input('sessionPrice', 'Giá một buổi (VND)', 'number', { min: 1, max: 1000000000, step: 1 })}<Field label="Hạn chót đăng ký (giờ Việt Nam)" error={fields.enrollmentClosesAt}><input className={inputCls} type="datetime-local" required value={form.cutoff} onChange={set('cutoff')} /></Field></div></section>
        <button className={btnOutline} type="submit" disabled={!form.daysOfWeek.length}>{busy ? 'Đang kiểm tra…' : 'Xem trước lịch và học phí'}</button>
      </fieldset>
    </form>
    {p && <section id="course-preview" className="scroll-mt-64 rounded-xl border border-outline-variant p-5 space-y-3">
      <h2 className="font-headline-md text-headline-md">Xem trước — {p.weeks} tuần / {p.sessionCount} buổi</h2>
      <p>{money(p.sessionPrice)}/buổi • Tổng học phí: <b>{money(p.totalFee)}</b></p>
      <p>Buổi đầu: {formatDate(p.firstSession.date)} {fromTimeOnly(p.firstSession.startTime)} • Buổi cuối: {formatDate(p.lastSession.date)} {fromTimeOnly(p.lastSession.startTime)}</p>
      <p>Hạn đăng ký: {formatTimestamp(p.enrollmentClosesAt)}. Xem trước không giữ chỗ; khi lưu hệ thống kiểm tra lại toàn bộ lịch.</p>
      {!p.canOpen && <Alert>Hạn đăng ký hoặc buổi đầu đã qua. Hãy sửa ngày lịch và hạn trên form trước khi lưu. Nháp có hạn đã qua sẽ không được mở đăng ký theo quy định hiện tại.</Alert>}
      {p.conflicts.length > 0 && <Alert><p>Trùng tài nguyên, chưa thể lưu:</p>{p.conflicts.map((c, i) => <p key={i}>{formatDate(c.date)} {fromTimeOnly(c.startTime)}–{fromTimeOnly(c.endTime)}: {c.resource === 'Room' ? 'Phòng' : 'HLV'} #{c.resourceId}</p>)}</Alert>}
      <CourseScheduleCalendar title={form.name.trim() || 'Xem trước khóa học'} sessions={p.sessions} />
    </section>}
  </div>
}
