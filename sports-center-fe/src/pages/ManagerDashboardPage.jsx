import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, query } from '../api'
import { Alert, Badge, Icon } from '../components/ui'
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

const QuickLink = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
      <Icon name={icon} className="text-xl" />
    </div>
    <span className="font-label-lg text-label-lg text-on-surface">{label}</span>
    <Icon name="chevron_right" className="ml-auto text-on-surface-variant" />
  </Link>
)

const MONTH_FMT = new Intl.NumberFormat('vi-VN')
const shortMoney = (n) => (n >= 1_000_000 ? `${MONTH_FMT.format(Math.round(n / 1_000_000))}tr` : MONTH_FMT.format(n))

// 6 real GET /reports/revenue calls (one per calendar month) — the backend has no time-series endpoint,
// so this is the honest way to get a trend without inventing numbers.
function RevenueTrendChart() {
  const [months, setMonths] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const now = new Date()
    const ranges = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const from = toDateOnly(d)
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      const isCurrent = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      const to = toDateOnly(isCurrent ? now : monthEnd)
      return { label: `T${d.getMonth() + 1}`, from, to, isCurrent }
    })
    Promise.all(ranges.map((r) => api(`/reports/revenue${query({ from: r.from, to: r.to })}`)))
      .then((reports) => setMonths(ranges.map((r, i) => ({ ...r, totalRevenue: reports[i].totalRevenue }))))
      .catch((err) => setError(err.message))
  }, [])

  const max = useMemo(() => Math.max(1, ...(months ?? []).map((m) => m.totalRevenue)), [months])

  return (
    <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Doanh thu 6 tháng gần nhất</h2>
      {error && <Alert>{error}</Alert>}
      {!months && !error && <p className="text-secondary">Đang tải…</p>}
      {months && (
        <div className="flex items-end gap-3 sm:gap-5 h-40">
          {months.map((m) => (
            <div key={m.from} className="flex-1 flex flex-col items-center h-full justify-end gap-1.5 group">
              <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-primary transition-colors">
                {shortMoney(m.totalRevenue)}
              </span>
              <div
                title={`${m.label}: ${m.totalRevenue.toLocaleString('vi-VN')}đ`}
                className={`w-full max-w-[44px] rounded-t-md transition-all ${m.isCurrent ? 'bg-primary' : 'bg-primary-container'}`}
                style={{ height: `${Math.max(4, (m.totalRevenue / max) * 100)}%` }}
              />
              <span className={`font-label-md text-label-md ${m.isCurrent ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{m.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const FILL_STATUS = (ratio) => (ratio >= 1 ? { label: 'Hết chỗ', tone: 'red', bar: 'bg-error' } : { label: 'Sắp đầy', tone: 'amber', bar: 'bg-amber-500' })

// Real data from GET /sessions (remainingSeats/capacity already in the DTO) — just filters client-side
// for the next 48h instead of a dedicated "near-capacity" backend endpoint.
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
      <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Lớp sắp đầy chỗ (48 giờ tới)</h2>
      <p className="text-body-sm text-secondary mb-4">Buổi học đã đặt từ 70% chỗ trở lên.</p>
      {error && <Alert>{error}</Alert>}
      {rows && !rows.length && <p className="text-secondary text-center py-6">Không có lớp nào sắp đầy chỗ trong 48 giờ tới.</p>}
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
  const [error, setError] = useState('')

  useEffect(() => {
    const now = new Date()
    const from = toDateOnly(new Date(now.getFullYear(), now.getMonth(), 1))
    const to = toDateOnly(now)
    api(`/reports/revenue${query({ from, to })}`).then(setReport).catch((err) => setError(err.message))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Tổng quan</h1>
        <p className="text-secondary">Số liệu doanh thu tháng này. Xem báo cáo chi tiết theo khoảng thời gian tuỳ chọn ở trang Báo cáo.</p>
      </div>

      {error && <Alert>{error}</Alert>}

      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Stat icon="payments" label="Doanh thu tháng này" value={`${report.totalRevenue.toLocaleString('vi-VN')}đ`} />
          <Stat icon="person_add" label="Hội viên mới" value={report.newMembers} />
          <Stat icon="card_membership" label="Gói đăng ký mới" value={report.newSubscriptions} />
          <Stat icon="verified" label="Gói đang hoạt động" value={report.activeSubscriptions} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueTrendChart />
        <FillingClassesTable />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <QuickLink to="/manager/reports" icon="monitoring" label="Báo cáo chi tiết" />
        <QuickLink to="/manager/users" icon="group" label="Quản lý người dùng" />
        <QuickLink to="/manager/classes" icon="calendar_month" label="Lịch & lớp học" />
        <QuickLink to="/manager/packages" icon="sell" label="Gói tập" />
      </div>
    </div>
  )
}
