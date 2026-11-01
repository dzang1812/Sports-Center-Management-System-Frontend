import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, query } from '../api'
import { useFlow2TimeRules } from '../flow2TimeRules'
import { SelfCheckInButton } from '../components/classCheckIn'
import { Alert, Badge, Field, Icon, Pagination, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { CancelBookingModal, PtRescheduleModal } from '../components/scheduleActions'
import CourseScheduleCalendar from '../components/CourseScheduleCalendar'
import MemberScheduleOverview from '../components/MemberScheduleOverview'
import { MemberCommerce } from '../components/commerce'
import MemberSubscriptionPage from './MemberSubscriptionPage'
import { addDays, fromTimeOnly, hasScheduleStarted, isPastSchedule, toDateOnly } from '../dateUtils'
import { ATTENDANCE_STATUS_LABEL, BOOKING_STATUS_LABEL } from '../labels'

// item.date is "yyyy-MM-dd", item.endTime/startTime are "HH:mm:ss" — all local wall-clock values, safe to concatenate.
const isPastItem = isPastSchedule
const startOf = (item) => `${item.date}T${item.startTime}`

// Upcoming first (soonest at top), past items pushed to the end (most recently passed first).
const compareSchedule = (a, b) => {
  const aPast = isPastItem(a)
  const bPast = isPastItem(b)
  if (aPast !== bPast) return aPast ? 1 : -1
  return aPast ? startOf(b).localeCompare(startOf(a)) : startOf(a).localeCompare(startOf(b))
}

// Attendance labels come from the backend. A past date alone never creates an Absent result.
function effectiveStatus(item, enforceTimeRules = true) {
  if (item.status === 'Cancelled') return { label: BOOKING_STATUS_LABEL.Cancelled, tone: 'slate' }
  if (item.attendanceStatus === 'Present' || item.attendanceStatus === 'Late') return { label: ATTENDANCE_STATUS_LABEL[item.attendanceStatus], tone: 'green' }
  if (item.attendanceStatus) return { label: ATTENDANCE_STATUS_LABEL[item.attendanceStatus], tone: 'slate' }
  if (!isPastItem(item)) return { label: BOOKING_STATUS_LABEL[item.status], tone: 'indigo' }
  if (!enforceTimeRules) return { label: BOOKING_STATUS_LABEL[item.status], tone: 'indigo' }
  return { label: 'Đã qua — Chưa có điểm danh', tone: 'slate' }
}

export function BookingSchedule({ memberId = null, onChanged, presentation = 'list' }) {
  const { enforceTimeRules, refresh } = useFlow2TimeRules()
  const today = toDateOnly(new Date())
  const [range, setRange] = useState({ from: addDays(today, -7), to: addDays(today, 30) })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [cancelItem, setCancelItem] = useState(null)
  const [rescheduleItem, setRescheduleItem] = useState(null)
  const [includeCancelled, setIncludeCancelled] = useState(false)
  const [subscriptions, setSubscriptions] = useState([])
  const request = useRef(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const load = useCallback(async () => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    setError('')
    if (presentation === 'list') setItems([])
    try {
      if (!range.from || !range.to || range.from > range.to) { setItems([]); throw new Error('Chọn khoảng ngày hợp lệ: ngày kết thúc không được trước ngày bắt đầu.') }
      const path = memberId ? `/members/${memberId}/schedule` : '/me/schedule'
      const [schedule, subs] = await Promise.all([
        api(`${path}${query({ ...range, includeCancelled })}`, { signal: controller.signal }),
        memberId || presentation !== 'list' ? Promise.resolve(null) : api('/me/subscriptions', { signal: controller.signal }),
      ])
      if (!controller.signal.aborted) { setItems(schedule); setHasLoaded(true); if (subs) setSubscriptions(subs) }
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message)
    }
    if (!controller.signal.aborted) setLoading(false)
  }, [range, includeCancelled, memberId, presentation])
  const stop = useCallback(() => request.current?.abort(), [])

  useEffect(() => {
    load()
    return stop
  }, [load, stop])

  useEffect(() => {
    setPage(1)
  }, [range, typeFilter, timeFilter, includeCancelled])

  const sorted = useMemo(
    () =>
      items
        .filter((i) => typeFilter === 'all' || i.type === typeFilter)
        .filter((i) => timeFilter === 'all' || (timeFilter === 'past') === isPastItem(i))
        .sort(compareSchedule),
    [items, typeFilter, timeFilter],
  )
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize)

  const changed = (message) => { setCancelItem(null); setRescheduleItem(null); setNotice(message); load(); onChanged?.() }
  const showRange = useCallback(next => {
    setRange(current => current.from <= next.from && current.to >= next.to ? current : next)
  }, [])
  const renderActions = item => item.status === 'Confirmed' && (!enforceTimeRules || !isPastItem(item)) && <div className="flex flex-wrap gap-2">
    {item.type === 'PT' && (!enforceTimeRules || !hasScheduleStarted(item)) && <button className={btnOutline + ' !h-9'} disabled={loading} onClick={() => { refresh(); setRescheduleItem(item) }}>Đổi lịch</button>}
    {item.type === 'Class' && !memberId && <SelfCheckInButton sessionId={item.referenceId} className={btnOutline + ' !h-9'} onDone={load} />}
    {!item.enrollmentId && (!enforceTimeRules || !hasScheduleStarted(item)) && <button className={btnOutline + ' !h-9'} disabled={loading} onClick={() => setCancelItem(item)}>Huỷ</button>}
  </div>

  return (
    <div className="flex flex-col gap-4">
      {presentation !== 'member' && <div className={`bg-surface-container rounded-xl shadow-sm ${presentation === 'calendar' ? 'flex flex-wrap items-end gap-4 p-3' : 'p-4'}`}>
        <div className={presentation === 'calendar' ? 'contents' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'}>
          {presentation === 'list' && <><Field label="Từ ngày">
            <input className={inputCls} type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
          </Field>
          <Field label="Đến ngày">
            <input className={inputCls} type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
          </Field></>}
          <Field label="Loại lịch">
            <select className={inputCls} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">— Tất cả —</option>
              <option value="Class">Khóa / lớp học</option>
              <option value="PT">PT</option>
            </select>
          </Field>
          <Field label="Thời gian">
            <select className={inputCls} value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
              <option value="all">Sắp tới &amp; đã qua</option>
              <option value="upcoming">Chỉ sắp tới</option>
              <option value="past">Chỉ đã qua</option>
            </select>
          </Field>
        </div>
        {presentation === 'list' && <label className="flex items-center gap-2 pt-4"><input type="checkbox" checked={includeCancelled} onChange={(e) => setIncludeCancelled(e.target.checked)} /> Bao gồm lịch đã hủy</label>}
        <div className={`flex justify-end gap-2 ${presentation === 'calendar' ? 'ml-auto' : 'pt-4'}`}>
          <button
            type="button"
            className={btnOutline}
            onClick={() => {
              if (presentation === 'list') setRange({ from: addDays(today, -7), to: addDays(today, 30) })
              setTypeFilter('all')
              setTimeFilter('all')
            }}
          >
            Đặt lại
          </button>
          <button type="button" className={btnPrimary} onClick={load} disabled={loading}>{presentation === 'calendar' ? 'Làm mới lịch' : 'Tìm kiếm'}</button>
        </div>
      </div>}

      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}
      {!memberId && presentation === 'list' && subscriptions.filter((s) => s.totalPtSessions > 0).map((s) => <p key={s.id} className="text-secondary">{s.planName}: còn <b>{s.remainingPtSessions}</b>/{s.totalPtSessions} buổi PT ({s.status}).</p>)}
      {loading && presentation !== 'member' && <p role="status" className="text-secondary">Đang tải lịch…</p>}

      {presentation === 'member' && <MemberScheduleOverview items={sorted} loading={loading} range={range} onRangeChange={setRange}
        discoverTo={memberId ? `/reception/members/${memberId}?view=available` : '/member/classes'}
        typeFilter={typeFilter} onTypeChange={setTypeFilter} includeCancelled={includeCancelled} onIncludeCancelledChange={setIncludeCancelled}
        onRefresh={load} statusLabel={item => effectiveStatus(item, enforceTimeRules)} renderActions={renderActions}
        calendar={hasLoaded && <CourseScheduleCalendar personal compact title="Lịch của tôi" sessions={sorted}
          includeCancelled={includeCancelled} onIncludeCancelledChange={setIncludeCancelled} onVisibleRangeChange={showRange}
          statusLabel={item => effectiveStatus(item, enforceTimeRules).label} renderEventActions={renderActions} />} />}

      {presentation === 'calendar' && hasLoaded && <div className={loading ? 'opacity-60' : ''}>
        <CourseScheduleCalendar personal title="Lịch của tôi" sessions={sorted}
          includeCancelled={includeCancelled} onIncludeCancelledChange={setIncludeCancelled}
          onVisibleRangeChange={showRange}
          statusLabel={item => effectiveStatus(item, enforceTimeRules).label}
          renderEventActions={renderActions} />
      </div>}
      {presentation === 'list' && <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3 w-14">STT</th>
              <th className="px-4 py-3">Nội dung</th>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">HLV</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {paged.map((item, i) => {
              const past = isPastItem(item)
              const eff = effectiveStatus(item, enforceTimeRules)
              return (
                <tr key={`${item.type}-${item.bookingId}`} className={`border-t border-surface-container ${past ? 'opacity-70' : ''}`}>
                  <td className="px-4 py-3 text-secondary">{(page - 1) * pageSize + i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">{item.type === 'PT' ? 'PT' : 'Lớp học'}</span>
                      <span className="font-semibold">{item.title}</span>{item.enrollmentId && <span className="text-body-sm">Đã mua nguyên khóa</span>}{item.fundingSource && <span className="text-body-sm">{item.fundingSource === 'Wallet' ? 'Đã trả buổi lẻ' : 'Dùng gói PT'}</span>}
                    </div>
                    <span className="text-secondary text-body-sm">{item.room ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-secondary">{item.date} • {fromTimeOnly(item.startTime)}-{fromTimeOnly(item.endTime)}</td>
                  <td className="px-4 py-3 text-secondary">{item.coach}</td>
                  <td className="px-4 py-3"><Badge tone={eff.tone}>{eff.label}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end">{renderActions(item)}</div>
                  </td>
                </tr>
              )
            })}
            {!loading && !sorted.length && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-secondary">Không có lịch nào phù hợp bộ lọc.</td></tr>
            )}
          </tbody>
        </table>
        {!!sorted.length && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={sorted.length}
            onPage={setPage}
            onPageSize={(n) => {
              setPageSize(n)
              setPage(1)
            }}
          />
        )}
      </div>}

      {cancelItem && (
        <CancelBookingModal item={cancelItem} onClose={() => setCancelItem(null)} onDone={() => changed('Đã hủy thành công.')} />
      )}
      {rescheduleItem && (
        <PtRescheduleModal
          item={rescheduleItem}
          onClose={() => setRescheduleItem(null)}
          onDone={(_, refreshError) => changed(`Đã đổi lịch PT thành công.${refreshError ? ` Không tải lại được khung giờ: ${refreshError}` : ''} Vui lòng kiểm tra lại lịch tập.`)}
        />
      )}
    </div>
  )
}

const ATTENDANCE_STATUS_TONE = { Present: 'green', Late: 'amber', Absent: 'red', Excused: 'slate' }
const ATTENDANCE_STATUS_ICON = { Present: 'check_circle', Late: 'schedule', Absent: 'cancel', Excused: 'event_busy' }
const NOT_MARKED = { label: 'Chưa điểm danh', tone: 'amber', icon: 'hourglass_top' }

// Each Class groups multiple sessions under one classId; PT has no shared "class" identity, so it's
// offered as a single bucket instead of per-booking.
const classKey = (i) => (i.type === 'PT' ? 'pt' : `class-${i.classId}`)

function AttendanceHistory() {
  const [year, month] = toDateOnly().split('-').map(Number)
  const [period, setPeriod] = useState({ year, month })
  const [classFilter, setClassFilter] = useState('all')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const request = useRef(null)

  const load = useCallback(async () => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setError('')
    setLoading(true)
    setData(null)
    try {
      const result = await api(`/me/attendance${query(period)}`, { signal: controller.signal })
      if (!controller.signal.aborted) setData(result)
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message)
    }
    if (!controller.signal.aborted) setLoading(false)
  }, [period])
  const stop = useCallback(() => request.current?.abort(), [])

  useEffect(() => {
    load()
    return stop
  }, [load, stop])

  const classOptions = useMemo(() => {
    const seen = new Map()
    for (const i of data?.items ?? []) {
      const key = classKey(i)
      if (!seen.has(key)) seen.set(key, i.type === 'PT' ? 'Personal Training' : i.title)
    }
    return [...seen.entries()]
  }, [data])

  const items = (data?.items ?? []).filter((i) => classFilter === 'all' || classKey(i) === classFilter)
  // Scoped to the class currently selected — not the whole-month totals from the API.
  const ended = items.filter((i) => i.status != null)
  const attended = ended.filter((i) => i.status === 'Present' || i.status === 'Late').length
  const absences = ended.filter((i) => i.status === 'Absent').length
  const upcoming = items.length - ended.length
  const hasData = classFilter === 'all' ? data?.hasData === true && data.countedSessions > 0 : ended.length > 0
  const rate = classFilter === 'all' ? data?.attendanceRate : ended.length ? Math.round((attended / ended.length) * 10000) / 100 : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface-container rounded-xl shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Năm">
            <input className={inputCls} type="number" min={2000} value={period.year} onChange={(e) => setPeriod({ ...period, year: Number(e.target.value) })} />
          </Field>
          <Field label="Tháng">
            <select className={inputCls} value={period.month} onChange={(e) => setPeriod({ ...period, month: Number(e.target.value) })}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>Tháng {m}</option>)}
            </select>
          </Field>
          <Field label="Lớp học">
            <select className={inputCls} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="all">— Tất cả —</option>
              {classOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}
      {loading && <p role="status" className="text-secondary">Đang tải dữ liệu điểm danh…</p>}

      {data && (
        <>
          <div className="flex items-center gap-3 bg-primary-container/10 border border-primary-container/30 rounded-xl px-4 py-3">
            <span className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">info</span>
            </span>
            <span className="text-on-surface">
              {hasData ? <>Tỷ lệ tham gia <b>{rate}%</b> ({attended}/{ended.length} buổi)</> : <b>Chưa có dữ liệu</b>}
              {absences > 0 && <> — <b className="text-error">Vắng {absences} buổi</b></>}
              {upcoming > 0 && <> — còn <b>{upcoming}</b> buổi chưa điểm danh</>}
            </span>
          </div>

          <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
                  <th className="px-4 py-3 w-14">#</th>
                  <th className="px-4 py-3">Ngày học</th>
                  <th className="px-4 py-3">Slot học</th>
                  <th className="px-4 py-3">Phòng</th>
                  <th className="px-4 py-3">Giảng viên</th>
                  <th className="px-4 py-3">Lớp học</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i, idx) => {
                  const st = i.status ? { label: ATTENDANCE_STATUS_LABEL[i.status], tone: ATTENDANCE_STATUS_TONE[i.status], icon: ATTENDANCE_STATUS_ICON[i.status] } : NOT_MARKED
                  return (
                  <tr key={`${i.type}-${i.referenceId}-${i.date}`} className="border-t border-surface-container">
                    <td className="px-4 py-3 text-secondary">{idx + 1}</td>
                    <td className="px-4 py-3">{i.date}</td>
                    <td className="px-4 py-3 text-secondary">{fromTimeOnly(i.startTime)} - {fromTimeOnly(i.endTime)}</td>
                    <td className="px-4 py-3 text-secondary">{i.room ?? '—'}</td>
                    <td className="px-4 py-3 text-secondary">{i.coach}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">{i.type === 'PT' ? 'PT' : 'Lớp học'}</span>
                        <span className="font-semibold">{i.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={st.tone}>
                        <span className="material-symbols-outlined text-sm align-middle mr-1">{st.icon}</span>
                        {st.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-secondary">—</td>
                  </tr>
                  )
                })}
                {!items.length && <tr><td colSpan={8} className="px-4 py-10 text-center text-secondary">Chưa có dữ liệu điểm danh.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default function MyMemberSchedulePage() {
  const [params, setParams] = useSearchParams()
  const requestedTab = params.get('tab')
  const tab = ['courses', 'attendance', 'mine', 'packages'].includes(requestedTab) ? requestedTab : 'calendar'

  return (
    <div className="flex flex-col gap-5 max-w-[1440px] mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="font-headline-xl text-headline-xl">Lịch của tôi</h1>
        <p className="text-secondary mt-2">Xem buổi sắp tới, check-in hoặc quản lý lịch tập.</p></div>
        <Link className={btnPrimary} to="/member/classes"><Icon name="add" className="text-lg" />Đặt buổi tập mới</Link>
      </div>

      <nav aria-label="Quản lý lịch tập" className="flex flex-wrap gap-1 p-1 bg-surface-container-low rounded-xl w-fit">
        {[['calendar', 'Lịch tập'], ['courses', 'Khóa đã đăng ký'], ['attendance', 'Điểm danh']].map(([v, l]) => (
          <button
            type="button"
            key={v}
            aria-pressed={tab === v}
            className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${tab === v ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            onClick={() => setParams(v === 'calendar' ? {} : { tab: v })}
          >
            {l}
          </button>
        ))}
      </nav>

      {tab === 'calendar' && <BookingSchedule presentation="member" />}
      {tab === 'courses' && <MemberCommerce viewMode="enrollments" embedded />}
      {tab === 'mine' && <BookingSchedule />}
      {tab === 'attendance' && <AttendanceHistory />}
      {tab === 'packages' && <MemberSubscriptionPage embedded />}
      <details className="border-t border-outline-variant/40 pt-4 text-body-sm text-secondary"><summary className="cursor-pointer w-fit">Xem thêm</summary><div className="flex flex-wrap gap-x-6 gap-y-3 pt-3">
        <Link className="text-primary hover:underline" to="/member/schedule?tab=mine">Lịch dạng danh sách</Link>
        <Link className="text-primary hover:underline" to="/member/training">Kế hoạch tập cá nhân</Link>
        <Link className="text-primary hover:underline" to="/member/support">Yêu cầu hỗ trợ</Link>
        <Link className="text-primary hover:underline" to="/member/schedule?tab=packages">Gói tập đã mua trước đây</Link>
        <Link className="text-primary hover:underline" to="/member/classes?type=single">Lớp theo buổi</Link>
      </div></details>
    </div>
  )
}
