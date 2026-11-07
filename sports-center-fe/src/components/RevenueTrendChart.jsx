import { useEffect, useMemo, useState } from 'react'
import { api, query } from '../api'
import { toDateOnly } from '../dateUtils'
import { Alert } from './ui'

const number = new Intl.NumberFormat('vi-VN')
const shortMoney = value => value >= 1_000_000 ? `${number.format(Math.round(value / 1_000_000))}tr` : number.format(value)
const WIDTH = 480, HEIGHT = 220, PAD_X = 30, TOP = 30, BOTTOM = 184
// Categorical order (validated for colour-blind separation); smaller items fold into a grey "Khác" line.
const COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4']
const OTHER_COLOR = '#9ca3af'
const KIND_LABEL = { Membership: 'Gói tập', Course: 'Khóa học', PtPackage: 'Gói PT', PtSingle: 'PT lẻ' }

// One SVG line chart in a fixed viewBox that scales with its box; all series share one y-scale (top = max, bottom = 0).
function LineChart({ months, series, valueLabels }) {
  const max = Math.max(1, ...series.flatMap(s => s.values))
  const x = index => PAD_X + index * (WIDTH - 2 * PAD_X) / (months.length - 1)
  const y = value => TOP + (1 - value / max) * (BOTTOM - TOP)
  return <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto max-h-64" role="img"
    aria-label={series.map(s => `${s.name}: ${months.map((m, i) => `${m.label} ${number.format(s.values[i])}đ`).join(', ')}`).join('; ')}>
    {[TOP, (TOP + BOTTOM) / 2, BOTTOM].map(v => <line key={v} x1={PAD_X} x2={WIDTH - PAD_X} y1={v} y2={v} className="stroke-outline-variant/50" strokeDasharray={v === BOTTOM ? undefined : '4 4'} />)}
    {months.map((m, i) => <text key={m.from} x={x(i)} y={HEIGHT - 8} textAnchor="middle" className={`text-[15px] ${m.isCurrent ? 'fill-primary font-semibold' : 'fill-secondary'}`}>{m.label}</text>)}
    {series.map(s => {
      const line = s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
      return <g key={s.key} style={{ color: s.color }}>
        {s.area && <polygon points={`${x(0)},${BOTTOM} ${line} ${x(months.length - 1)},${BOTTOM}`} fill="currentColor" fillOpacity="0.08" />}
        <polyline points={line} fill="none" stroke="currentColor" strokeWidth={s.area ? 3 : 2} strokeLinejoin="round" strokeLinecap="round" />
        {s.values.map((v, i) => <g key={months[i].from}><title>{`${s.name} · ${months[i].label}: ${number.format(v)}đ`}</title>
          <circle cx={x(i)} cy={y(v)} r={months[i].isCurrent ? 5.5 : 4} fill={months[i].isCurrent ? 'currentColor' : 'white'} stroke="currentColor" strokeWidth="2" />
          {valueLabels && <text x={x(i)} y={y(v) - 12} textAnchor="middle" className="fill-secondary text-[15px]">{shortMoney(v)}</text>}</g>)}
      </g>
    })}
  </svg>
}

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
    Promise.all(ranges.map(range => api(`/reports/revenue-by-item${query({ from: range.from, to: range.to })}`, { signal: controller.signal })))
      .then(reports => { if (!controller.signal.aborted) setMonths(ranges.map((range, index) => ({ ...range, totalRevenue: reports[index].totalRevenue, items: reports[index].items }))) })
      .catch(err => { if (!controller.signal.aborted) setError(err.message) })
    return () => controller.abort()
  }, [])

  // Top 5 items by 6-month revenue get their own line (colour fixed by that rank); the rest sum into "Khác".
  const itemSeries = useMemo(() => {
    if (!months) return []
    const byKey = new Map()
    months.forEach((m, i) => m.items.forEach(item => {
      const key = `${item.kind}:${item.itemId}`
      const entry = byKey.get(key) ?? { key, name: item.name, kind: item.kind, values: Array(months.length).fill(0), total: 0 }
      entry.values[i] += item.revenue; entry.total += item.revenue
      byKey.set(key, entry)
    }))
    const ranked = [...byKey.values()].sort((a, b) => b.total - a.total)
    const top = ranked.slice(0, COLORS.length).map((s, i) => ({ ...s, color: COLORS[i] }))
    const rest = ranked.slice(COLORS.length)
    if (rest.length) top.push({ key: 'other', name: `Khác (${rest.length})`, color: OTHER_COLOR,
      values: months.map((_, i) => rest.reduce((sum, s) => sum + s.values[i], 0)) })
    return top
  }, [months])

  return <section className="rounded-2xl border border-outline-variant/50 bg-white p-5 space-y-4"><h2 className="font-headline-md text-headline-md">Doanh thu 6 tháng gần nhất</h2>
    {error && <Alert>{error}</Alert>}{!months && !error && <p role="status" className="text-secondary">Đang tải biểu đồ…</p>}
    {months && <div className="grid gap-6 xl:grid-cols-[2fr_3fr]">
      <div className="space-y-2"><h3 className="text-body-sm font-semibold text-secondary">Tổng doanh thu</h3>
        <div className="text-primary"><LineChart months={months} valueLabels series={[{ key: 'total', name: 'Tổng doanh thu', color: 'currentColor', area: true, values: months.map(m => m.totalRevenue) }]} /></div>
      </div>
      <div className="space-y-2"><h3 className="text-body-sm font-semibold text-secondary">Theo gói & khóa học</h3>
        {!itemSeries.length ? <p className="text-body-sm text-secondary py-8">Chưa có doanh thu trong 6 tháng này.</p> :
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 min-w-0"><LineChart months={months} series={itemSeries} /></div>
            <ul className="sm:w-40 shrink-0 space-y-2 text-body-sm" aria-label="Chú thích">
              {itemSeries.map(s => <li key={s.key} className="flex items-start gap-2">
                <span className="mt-1.5 h-0.5 w-4 shrink-0 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
                <span className="min-w-0"><span className="block text-on-surface leading-snug break-words">{s.name}</span>
                  {s.kind && <span className="block text-secondary text-[12px]">{KIND_LABEL[s.kind] ?? s.kind}</span>}</span>
              </li>)}
            </ul>
          </div>}
      </div>
    </div>}
  </section>
}
