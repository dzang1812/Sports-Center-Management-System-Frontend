import { useEffect, useMemo, useState } from 'react'
import { api, query } from '../api'
import { toDateOnly } from '../dateUtils'
import { Alert } from './ui'

const number = new Intl.NumberFormat('vi-VN')
const shortMoney = value => value >= 1_000_000 ? `${number.format(Math.round(value / 1_000_000))}tr` : number.format(value)

export default function RevenueTrendChart() {
  const [months, setMonths] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    const today = toDateOnly()
    const [year, month] = today.split('-').map(Number)
    const ranges = Array.from({ length: 6 }, (_, index) => {
      const first = new Date(Date.UTC(year, month - 1 - (5 - index), 1))
      const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0))
      return { label: `T${first.getUTCMonth() + 1}`, from: first.toISOString().slice(0, 10),
        to: index === 5 ? today : last.toISOString().slice(0, 10), isCurrent: index === 5 }
    })
    Promise.all(ranges.map(range => api(`/reports/revenue${query({ from: range.from, to: range.to })}`, { signal: controller.signal })))
      .then(reports => { if (!controller.signal.aborted) setMonths(ranges.map((range, index) => ({ ...range, totalRevenue: reports[index].totalRevenue }))) })
      .catch(err => { if (!controller.signal.aborted) setError(err.message) })
    return () => controller.abort()
  }, [])
  const max = useMemo(() => Math.max(1, ...(months ?? []).map(month => month.totalRevenue)), [months])
  return <section className="rounded-2xl border border-outline-variant/50 bg-white p-5 space-y-4"><h2 className="font-headline-md text-headline-md">Doanh thu 6 tháng gần nhất</h2>
    {error && <Alert>{error}</Alert>}{!months && !error && <p role="status" className="text-secondary">Đang tải biểu đồ…</p>}
    {months && <div className="flex items-end gap-3 sm:gap-5 h-44">{months.map(month => <div key={month.from} className="flex-1 flex flex-col items-center h-full justify-end gap-1.5"><span className="text-body-sm text-secondary">{shortMoney(month.totalRevenue)}</span><div title={`${month.label}: ${number.format(month.totalRevenue)}đ`} className={`w-full max-w-[44px] rounded-t-md ${month.isCurrent ? 'bg-primary' : 'bg-primary-container/70'}`} style={{ height: `${Math.max(3, month.totalRevenue / max * 100)}%` }} /><span className={`text-body-sm ${month.isCurrent ? 'text-primary font-semibold' : 'text-secondary'}`}>{month.label}</span></div>)}</div>}
  </section>
}
