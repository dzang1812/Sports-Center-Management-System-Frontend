import { useCallback, useEffect, useState } from 'react'
import { api, query } from '../api'
import { Alert, Icon, inputCls } from '../components/ui'
import { addDays, toDateOnly } from '../dateUtils'

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

// Only the "Doanh thu" tab has a backend endpoint (GET /api/reports/revenue). "Thành viên" and
// "Đăng ký lớp" tabs from the spec have no matching API yet — not built here, see SCREEN_API_MAPPING.md.
export default function ManagerReportsPage() {
  const today = toDateOnly(new Date())
  const [range, setRange] = useState({ from: addDays(today, -29), to: today })
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setReport(await api(`/reports/revenue${query(range)}`))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [range])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Báo cáo doanh thu</h1>
        <p className="text-secondary">Tổng hợp doanh thu, hội viên mới và đăng ký trong khoảng thời gian chọn.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input className={`${inputCls} !h-10 !w-auto`} type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
        <span className="text-secondary">đến</span>
        <input className={`${inputCls} !h-10 !w-auto`} type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
      </div>

      {error && <Alert>{error}</Alert>}

      {report && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 ${loading ? 'opacity-50' : ''}`}>
          <Stat icon="payments" label="Tổng doanh thu" value={`${report.totalRevenue.toLocaleString('vi-VN')}đ`} />
          <Stat icon="receipt_long" label="Số giao dịch" value={report.paymentCount} />
          <Stat icon="person_add" label="Hội viên mới" value={report.newMembers} />
          <Stat icon="card_membership" label="Gói đăng ký mới" value={report.newSubscriptions} />
          <Stat icon="verified" label="Gói đang hoạt động" value={report.activeSubscriptions} />
          <Stat icon="event_busy" label="Gói đã hết hạn" value={report.expiredSubscriptions} />
          <Stat icon="event_available" label="Lượt đặt lớp mới" value={report.newClassBookings} />
        </div>
      )}
    </div>
  )
}
