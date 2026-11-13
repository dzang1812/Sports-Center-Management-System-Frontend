import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, query } from '../api'
import { Alert, Field, Icon, btnPrimary, inputCls } from '../components/ui'
import { addDays, toDateOnly } from '../dateUtils'
import RevenueTrendChart from '../components/RevenueTrendChart'
import ManagerWalletReceipts from '../components/ManagerWalletReceipts'
import ManagerMoneyLog from '../components/ManagerMoneyLog'
import CoachTeachingStats from '../components/CoachTeachingStats'

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

const KIND_LABEL = { Membership: 'Gói tập', Course: 'Khóa học', PtPackage: 'Gói PT', PtSingle: 'PT lẻ' }

// GET /reports/revenue-by-item: same revenue as the cards above, split per plan / course / PT package.
const RevenueByItem = ({ data }) => (
  <section className="rounded-2xl border border-outline-variant/50 bg-white p-5 space-y-4">
    <h2 className="font-headline-md text-headline-md">Doanh thu theo gói & khóa học</h2>
    {!data.items.length ? <p className="text-secondary text-body-sm">Chưa có doanh thu trong khoảng này.</p> : (
      <div className="overflow-x-auto">
        <table className="w-full text-body-sm">
          <thead><tr className="text-left text-secondary border-b border-surface-container">
            <th className="py-2 pr-3 font-medium">Loại</th><th className="py-2 pr-3 font-medium">Tên</th>
            <th className="py-2 pr-3 font-medium text-right">Lượt mua</th><th className="py-2 pr-3 font-medium text-right">Doanh thu</th>
            <th className="py-2 font-medium w-40">Tỷ trọng</th>
          </tr></thead>
          <tbody>{data.items.map(item => {
            const share = data.totalRevenue > 0 ? item.revenue / data.totalRevenue * 100 : 0
            return <tr key={`${item.kind}:${item.itemId}`} className="border-b border-surface-container last:border-0">
              <td className="py-2 pr-3 text-secondary whitespace-nowrap">{KIND_LABEL[item.kind] ?? item.kind}</td>
              <td className="py-2 pr-3 font-semibold">{item.name}</td>
              <td className="py-2 pr-3 text-right">{item.orders}</td>
              <td className="py-2 pr-3 text-right whitespace-nowrap">{item.revenue.toLocaleString('vi-VN')}đ</td>
              <td className="py-2"><div className="flex items-center gap-2"><div className="flex-1 h-2 rounded-full bg-surface-container overflow-hidden"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(0, share)}%` }} /></div><span className="text-secondary w-10 text-right">{Math.round(share)}%</span></div></td>
            </tr>
          })}</tbody>
        </table>
      </div>
    )}
  </section>
)

export default function ManagerReportsPage() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? ''
  const receipts = tab === 'receipts'
  const teaching = tab === 'coaches'
  const moneyLog = tab === 'money'
  const [refresh, setRefresh] = useState(0)
  const today = toDateOnly(new Date())
  const [range, setRange] = useState({ from: addDays(today, -29), to: today })
  const [report, setReport] = useState(null)
  const [byItem, setByItem] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (receipts || teaching || moneyLog) return
    setLoading(true)
    setError('')
    try {
      const [summary, items] = await Promise.all([api(`/reports/revenue${query(range)}`), api(`/reports/revenue-by-item${query(range)}`)])
      setReport(summary)
      setByItem(items)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [range, receipts, teaching, moneyLog])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Báo cáo & thống kê</h1>
        <p className="text-secondary">Theo dõi doanh thu, biên nhận, dòng tiền ví và số buổi giảng dạy của HLV.</p>
      </div>
      <nav aria-label="Báo cáo" className="flex flex-wrap gap-1 rounded-xl bg-surface-container-low p-1 w-fit">
        {[['', 'Doanh thu dịch vụ'], ['receipts', 'Biên nhận nạp ví'], ['money', 'Nhật ký dòng tiền'], ['coaches', 'Giảng dạy HLV']].map(([value, label]) => <button type="button" key={label} aria-pressed={tab === value}
          className={`px-4 py-2 rounded-lg text-body-sm font-semibold ${tab === value ? 'bg-primary-container text-white' : 'text-secondary'}`}
          onClick={() => { const next = new URLSearchParams(params); if (value) next.set('tab', value); else next.delete('tab'); setParams(next) }}>{label}</button>)}
      </nav>

      {teaching ? <CoachTeachingStats manager /> : <>
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
          <button type="button" className={btnPrimary} onClick={() => receipts || moneyLog ? setRefresh(value => value + 1) : load()}>Làm mới báo cáo</button>
        </div>
      </div>

      {moneyLog ? <ManagerMoneyLog key={`${range.from}:${range.to}`} range={range} refresh={refresh} />
        : receipts ? <ManagerWalletReceipts key={`${range.from}:${range.to}`} range={range} refresh={refresh} /> : <>
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
      {byItem && <div className={loading ? 'opacity-50' : ''}><RevenueByItem data={byItem} /></div>}
      <RevenueTrendChart />
      </>}
      </>}
    </div>
  )
}
