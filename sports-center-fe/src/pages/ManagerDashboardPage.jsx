import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, query } from '../api'
import { Alert, Icon } from '../components/ui'
import { toDateOnly } from '../dateUtils'

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

// Real KPI cards from GET /api/reports/revenue (month-to-date). The original Stitch mock had a 12-month
// revenue chart, a revenue-breakdown donut and a "classes about to fill up" table — none of those have a
// matching backend endpoint, so they were dropped rather than faked. See SCREEN_API_MAPPING.md.
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <QuickLink to="/manager/reports" icon="monitoring" label="Báo cáo chi tiết" />
        <QuickLink to="/manager/users" icon="group" label="Quản lý người dùng" />
        <QuickLink to="/manager/classes" icon="calendar_month" label="Lịch & lớp học" />
        <QuickLink to="/manager/packages" icon="sell" label="Gói tập" />
      </div>
    </div>
  )
}
