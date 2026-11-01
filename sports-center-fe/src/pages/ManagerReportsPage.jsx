import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, query } from '../api'
import { Alert, Field, Icon, btnPrimary, inputCls } from '../components/ui'
import { addDays, toDateOnly } from '../dateUtils'
import RevenueTrendChart from '../components/RevenueTrendChart'
import ManagerWalletReceipts from '../components/ManagerWalletReceipts'

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

export default function ManagerReportsPage() {
  const [params, setParams] = useSearchParams()
  const receipts = params.get('tab') === 'receipts'
  const [refresh, setRefresh] = useState(0)
  const today = toDateOnly(new Date())
  const [range, setRange] = useState({ from: addDays(today, -29), to: today })
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (receipts) return
    setLoading(true)
    setError('')
    try {
      setReport(await api(`/reports/revenue${query(range)}`))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [range, receipts])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Doanh thu & biên nhận</h1>
        <p className="text-secondary">Theo dõi doanh thu dịch vụ và đối chiếu tiền hội viên nạp vào ví.</p>
      </div>
      <nav aria-label="Báo cáo" className="flex gap-1 rounded-xl bg-surface-container-low p-1 w-fit">
        {[[false, 'Doanh thu dịch vụ'], [true, 'Biên nhận nạp ví']].map(([value, label]) => <button type="button" key={label} aria-pressed={receipts === value}
          className={`px-4 py-2 rounded-lg text-body-sm font-semibold ${receipts === value ? 'bg-primary-container text-white' : 'text-secondary'}`}
          onClick={() => { const next = new URLSearchParams(params); if (value) next.set('tab', 'receipts'); else next.delete('tab'); setParams(next) }}>{label}</button>)}
      </nav>

      <div className="bg-surface-container rounded-xl shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Từ ngày">
            <input className={inputCls} type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
          </Field>
          <Field label="Đến ngày">
            <input className={inputCls} type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
          </Field>
        </div>
        <div className="flex justify-end pt-4">
          <button type="button" className={btnPrimary} onClick={() => receipts ? setRefresh(value => value + 1) : load()}>Làm mới báo cáo</button>
        </div>
      </div>

      {receipts ? <ManagerWalletReceipts key={`${range.from}:${range.to}`} range={range} refresh={refresh} /> : <>
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
      <RevenueTrendChart />
      </>}
    </div>
  )
}
