import { useEffect, useMemo, useState } from 'react'
import { api, query } from '../api'
import { toDateOnly } from '../dateUtils'
import { Alert } from './ui'

const number = new Intl.NumberFormat('vi-VN')
const shortMoney = value => value >= 1_000_000 ? `${number.format(Math.round(value / 1_000_000))}tr` : number.format(value)
const WIDTH = 600, HEIGHT = 200, PAD_X = 36, TOP = 28, BOTTOM = 168

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
  // SVG in a fixed viewBox that scales with the card; y runs top (max) to bottom (0).
  const points = useMemo(() => {
    if (!months) return []
    const max = Math.max(1, ...months.map(month => month.totalRevenue))
    return months.map((month, index) => ({ ...month, x: PAD_X + index * (WIDTH - 2 * PAD_X) / (months.length - 1), y: TOP + (1 - month.totalRevenue / max) * (BOTTOM - TOP) }))
  }, [months])
  const line = points.map(point => `${point.x},${point.y}`).join(' ')
  return <section className="rounded-2xl border border-outline-variant/50 bg-white p-5 space-y-4"><h2 className="font-headline-md text-headline-md">Doanh thu 6 tháng gần nhất</h2>
    {error && <Alert>{error}</Alert>}{!months && !error && <p role="status" className="text-secondary">Đang tải biểu đồ…</p>}
    {months && <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto text-primary" role="img" aria-label={points.map(point => `${point.label}: ${number.format(point.totalRevenue)}đ`).join(', ')}>
      {[TOP, (TOP + BOTTOM) / 2, BOTTOM].map(y => <line key={y} x1={PAD_X} x2={WIDTH - PAD_X} y1={y} y2={y} className="stroke-outline-variant/50" strokeDasharray={y === BOTTOM ? undefined : '4 4'} />)}
      <polygon points={`${points[0].x},${BOTTOM} ${line} ${points.at(-1).x},${BOTTOM}`} fill="currentColor" fillOpacity="0.08" />
      <polyline points={line} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {points.map(point => <g key={point.from}><title>{`${point.label}: ${number.format(point.totalRevenue)}đ`}</title>
        <circle cx={point.x} cy={point.y} r={point.isCurrent ? 6 : 4.5} fill={point.isCurrent ? 'currentColor' : 'white'} stroke="currentColor" strokeWidth="2.5" />
        <text x={point.x} y={point.y - 12} textAnchor="middle" className="fill-secondary text-[13px]">{shortMoney(point.totalRevenue)}</text>
        <text x={point.x} y={HEIGHT - 6} textAnchor="middle" className={`text-[13px] ${point.isCurrent ? 'fill-primary font-semibold' : 'fill-secondary'}`}>{point.label}</text></g>)}
    </svg>}
  </section>
}
