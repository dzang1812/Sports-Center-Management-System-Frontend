import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, query } from '../api'
import { Alert, Badge, Icon, btnOutline, btnPrimary } from '../components/ui'
import RevenueTrendChart from '../components/RevenueTrendChart'
import { addDays, fromTimeOnly, toDateOnly } from '../dateUtils'

const Stat = ({ icon, label, value }) => (
  <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex items-start justify-between">
    <div className="flex flex-col">
      <span className="text-body-sm text-on-surface-variant">{label}</span>
      <span className="font-headline-lg text-headline-lg text-on-surface mt-1">{value}</span>
    </div>
    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
      <Icon name={icon} className="text-xl" />
    </div>
  </div>
)

const QuickLink = ({ to, icon, label, description }) => (
  <Link to={to} className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
      <Icon name={icon} className="text-xl" />
    </div>
    <span><span className="block font-semibold text-on-surface">{label}</span><span className="block text-body-sm text-secondary mt-1">{description}</span></span>
    <Icon name="chevron_right" className="ml-auto text-on-surface-variant" />
  </Link>
)

const FILL_STATUS = (ratio) => (ratio >= 1 ? { label: 'Hết chỗ', tone: 'red', bar: 'bg-error' } : { label: 'Sắp đầy', tone: 'amber', bar: 'bg-amber-500' })

// Real data from GET /sessions (remainingSeats/capacity already in the DTO) — just filters client-side
// across today and the next two calendar days.
function FillingClassesTable() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const today = toDateOnly(new Date())
    api(`/sessions${query({ from: today, to: addDays(today, 2), pageSize: 50 })}`)
      .then(({ items }) => {
        const filling = items
          .filter((s) => s.status === 'Scheduled' && s.capacity > 0 && (s.capacity - s.remainingSeats) / s.capacity >= 0.7)
          .sort((a, b) => (b.capacity - b.remainingSeats) / b.capacity - (a.capacity - a.remainingSeats) / a.capacity)
          .slice(0, 5)
        setRows(filling)
      })
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Buổi sắp đầy chỗ</h2>
      <p className="text-body-sm text-secondary mb-4">Đã đặt từ 70% chỗ, trong hôm nay và 2 ngày tiếp theo.</p>
      {error && <Alert>{error}</Alert>}
      {rows && !rows.length && <p className="text-secondary text-body-sm py-4">Chưa có buổi nào gần đầy chỗ trong khoảng này.</p>}
      {rows && rows.length > 0 && (
        <div className="flex flex-col gap-3">
          {rows.map((s) => {
            const ratio = (s.capacity - s.remainingSeats) / s.capacity
            const status = FILL_STATUS(ratio)
            return (
              <div key={s.id} className="flex items-center justify-between gap-4 py-2 border-b border-surface-container last:border-0">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{s.className}</div>
                  <div className="text-body-sm text-secondary">
                    {s.date} • {fromTimeOnly(s.startTime)} • {s.room} • HLV {s.coach ?? '—'}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 w-40">
                  <div className="flex-1 h-2 rounded-full bg-surface-container overflow-hidden">
                    <div className={`h-2 rounded-full ${status.bar}`} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
                  </div>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Real KPI cards from GET /api/reports/revenue (month-to-date), plus a real 6-month trend and a
// near-capacity classes table built from GET /sessions — no invented numbers anywhere on this page.
export default function ManagerDashboardPage() {
  const [report, setReport] = useState(null)
  const [courses, setCourses] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [trendOpen, setTrendOpen] = useState(false)
  const [revision, setRevision] = useState(0)
  const request = useRef(null)
  const load = useCallback(async () => {
    request.current?.abort(); const controller = new AbortController(); request.current = controller
    setLoading(true); setError('')
    const today = toDateOnly()
    const results = await Promise.allSettled([api(`/reports/revenue${query({ from: today.slice(0, 7) + '-01', to: today })}`, { signal: controller.signal }), api('/courses', { signal: controller.signal })])
    if (!controller.signal.aborted) {
      setReport(results[0].status === 'fulfilled' ? results[0].value : null)
      setCourses(results[1].status === 'fulfilled' ? results[1].value : null)
      setError(results.filter(result => result.status === 'rejected').map(result => result.reason.message).join(' · '))
      setLoading(false)
    }
  }, [])
  useEffect(() => { let active = true; void Promise.resolve().then(() => { if (active) load() }); return () => { active = false; request.current?.abort() } }, [load])
  const drafts = (courses ?? []).filter(item => item.course.status === 'Draft')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="font-headline-xl text-headline-xl">Tổng quan trung tâm</h1><p className="text-secondary mt-2">Theo dõi tình hình tháng này và mở nhanh công việc cần làm.</p></div><div className="flex gap-2"><button type="button" className={btnOutline} disabled={loading} onClick={() => { setRevision(value => value + 1); load() }} aria-label="Làm mới tổng quan"><Icon name="refresh" className="text-lg" /></button><Link className={btnPrimary} to="/manager/courses/new"><Icon name="add" className="text-lg" />Tạo khóa học</Link></div></div>

      {error && <Alert>{error}</Alert>}

      <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 ${loading ? 'opacity-60' : ''}`}>
        <Stat icon="payments" label="Doanh thu tháng này" value={report ? `${report.totalRevenue.toLocaleString('vi-VN')}đ` : '—'} />
        <Stat icon="person_add" label="Hội viên mới trong tháng" value={report?.newMembers ?? '—'} />
        <Stat icon="school" label="Khóa đang mở đăng ký" value={courses ? courses.filter(item => item.course.status === 'Open').length : '—'} />
        <Stat icon="edit_note" label="Khóa bản nháp" value={courses ? drafts.length : '—'} />
      </div>

      <section className="space-y-3"><h2 className="font-semibold text-lg">Thao tác thường dùng</h2><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <QuickLink to="/manager/courses" icon="school" label="Quản lý khóa học" description="Lịch học, học phí và học viên" />
        <QuickLink to="/manager/pt-bookings" icon="fitness_center" label="Xem lịch PT" description="Lịch hẹn và giá theo bộ môn" />
        <QuickLink to="/manager/users" icon="group" label="Hội viên & nhân sự" description="Tìm kiếm và quản lý tài khoản" />
        <QuickLink to="/manager/settings" icon="category" label="Bộ môn & phòng" description="Cấu hình dịch vụ và không gian" />
      </div></section>
      <div className="grid lg:grid-cols-2 gap-4">
        <section className="rounded-xl bg-white shadow-sm p-5 space-y-4"><div className="flex items-center justify-between gap-3"><h2 className="font-headline-md text-headline-md">Khóa cần hoàn thiện</h2><Link className="text-primary text-body-sm" to="/manager/courses">Xem tất cả</Link></div><p className="text-body-sm text-secondary">Các khóa đang ở trạng thái bản nháp, chưa mở đăng ký.</p>
          {drafts.slice(0, 4).map(({ course }) => <Link key={course.id} className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant/50 p-3 hover:bg-surface-container-low" to={`/manager/courses?courseId=${course.id}`}><span><b>{course.name}</b><span className="block text-secondary text-body-sm">{course.expectedSessions} buổi · {course.sport}</span></span><Icon name="arrow_forward" className="text-primary text-lg" /></Link>)}
          {courses && !drafts.length && <p className="text-body-sm text-secondary">Không có khóa bản nháp cần hoàn thiện.</p>}
        </section>
        <FillingClassesTable key={revision} />
      </div>
      <details className="rounded-xl border border-outline-variant/50 bg-white p-4" onToggle={event => setTrendOpen(event.currentTarget.open)}><summary className="cursor-pointer font-semibold">Xem xu hướng doanh thu 6 tháng</summary>{trendOpen && <div className="mt-4"><RevenueTrendChart key={revision} /><Link className="inline-block mt-3 text-primary text-body-sm font-semibold" to="/manager/reports">Mở báo cáo chi tiết →</Link></div>}</details>
    </div>
  )
}
