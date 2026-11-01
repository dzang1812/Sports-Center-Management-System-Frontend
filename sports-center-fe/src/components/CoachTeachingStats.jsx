import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, query } from '../api'
import { formatDate, formatTimestamp, fromTimeOnly, toDateOnly } from '../dateUtils'
import { Alert, Avatar, Badge, Icon, Modal, btnOutline, inputCls } from './ui'

const RESULTS = { Taught: ['Đã dạy', 'green'], NotEnded: ['Chưa kết thúc', 'indigo'], Unverified: ['Chưa xác nhận', 'amber'], NotTaught: ['Vắng / không dạy', 'slate'], Cancelled: ['Đã hủy', 'red'] }
const currentPeriod = () => {
  const [year, month] = toDateOnly().split('-').map(Number)
  return { year, quarter: Math.ceil(month / 3) }
}
const shortDate = date => formatDate(date, { day: '2-digit', month: '2-digit', year: 'numeric' })

function Stat({ label, value, icon, tone }) {
  return <div className={`flex items-center gap-3 rounded-xl border p-3 sm:p-4 ${tone}`}><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80"><Icon name={icon} className="text-xl" /></span><div><p className="text-body-sm font-medium">{label}</p><p className="mt-1 text-2xl font-bold leading-none">{value.toLocaleString('vi-VN')}</p></div></div>
}

function TeachingItems({ report }) {
  const [result, setResult] = useState('all')
  const items = report.items.filter(item => result === 'all' || item.result === result)
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-body-sm text-secondary">{items.length} buổi · {shortDate(report.from)} – {shortDate(report.to)}</p>
      <select aria-label="Lọc kết quả giảng dạy" className={inputCls + ' !w-auto !h-9'} value={result} onChange={event => setResult(event.target.value)}><option value="all">Tất cả buổi</option>{Object.entries(RESULTS).map(([key, [label]]) => <option key={key} value={key}>{label}</option>)}</select>
    </div>
    <div className="max-h-96 overflow-auto rounded-xl border border-slate-200"><table className="w-full min-w-[580px] text-left text-body-sm"><thead className="sticky top-0 bg-slate-50 text-slate-500"><tr><th className="p-3">Buổi dạy</th><th className="p-3">Ngày & giờ</th><th className="p-3">Kết quả</th></tr></thead>
      <tbody>{items.map(item => <tr key={`${item.type}:${item.referenceId}`} className="border-t border-slate-100"><td className="p-3"><p className="font-semibold text-slate-900">{item.title}</p><p className="mt-1 text-slate-500">{item.type === 'PT' ? 'PT cá nhân' : item.courseId ? 'Khóa nhiều tuần' : 'Lớp học'} · {item.sport}{item.room ? ` · ${item.room}` : ''}</p></td><td className="p-3 whitespace-nowrap">{shortDate(item.date)}<p className="mt-1 text-slate-500">{fromTimeOnly(item.startTime)}–{fromTimeOnly(item.endTime)}</p></td><td className="p-3"><Badge tone={RESULTS[item.result]?.[1] ?? 'slate'}>{RESULTS[item.result]?.[0] ?? item.result}</Badge></td></tr>)}
        {!items.length && <tr><td colSpan={3} className="p-6 text-center text-slate-500">Không có buổi phù hợp trong quý này.</td></tr>}
      </tbody></table></div>
    <p className="text-xs leading-relaxed text-slate-500">{report.countingRule}</p>
  </div>
}

function CoachDetail({ coach, period, onClose }) {
  const [report, setReport] = useState(null), [error, setError] = useState('')
  const { year, quarter } = period
  useEffect(() => {
    const controller = new AbortController()
    api(`/reports/coach-teaching/${coach.coachId}${query({ year, quarter })}`, { signal: controller.signal }).then(value => { if (!controller.signal.aborted) setReport(value) })
      .catch(err => { if (!controller.signal.aborted) setError(err.message) })
    return () => controller.abort()
  }, [coach.coachId, year, quarter])
  return <Modal title={`${coach.fullName} · Quý ${period.quarter}/${period.year}`} onClose={onClose} size="wide" footer={<><Link className={btnOutline} to="/manager/pt-bookings">Quản lý lịch PT</Link><Link className={btnOutline} to="/manager/courses?tab=sessions">Quản lý khóa & buổi học</Link><button type="button" className={btnOutline} onClick={onClose}>Đóng</button></>}>
    {error && <Alert>{error}</Alert>}{!report && !error && <p role="status" className="text-secondary">Đang tải chi tiết…</p>}{report && <TeachingItems report={report} />}
  </Modal>
}

export default function CoachTeachingStats({ manager = false, refresh: externalRefresh = 0 }) {
  const [period, setPeriod] = useState(currentPeriod)
  const [data, setData] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(0), [selected, setSelected] = useState(null), [search, setSearch] = useState('')
  const { year, quarter } = period
  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      if (controller.signal.aborted) return
      setLoading(true); setError(''); setData(null)
      try {
        const report = await api(`${manager ? '/reports/coach-teaching' : '/coach/teaching-summary'}${query({ year, quarter })}`, { signal: controller.signal })
        if (!controller.signal.aborted) setData(report)
      } catch (err) { if (!controller.signal.aborted) setError(err.status === 404 ? 'Backend chưa có thống kê giảng dạy. Cần cập nhật Backend để xem dữ liệu.' : err.message) }
      finally { if (!controller.signal.aborted) setLoading(false) }
    }
    void Promise.resolve().then(load)
    return () => controller.abort()
  }, [manager, year, quarter, refresh, externalRefresh])
  useEffect(() => {
    const reload = () => setRefresh(value => value + 1)
    window.addEventListener('sc:api-mutated', reload)
    return () => window.removeEventListener('sc:api-mutated', reload)
  }, [])
  const changePeriod = next => { setSelected(null); setPeriod(next) }
  const coaches = data?.coaches ?? []
  const shown = coaches.filter(coach => `${coach.fullName} ${coach.coachId}`.toLocaleLowerCase('vi-VN').includes(search.trim().toLocaleLowerCase('vi-VN')))
  const totals = manager ? { ptTaught: coaches.reduce((sum, coach) => sum + coach.ptTaught, 0), classSessionsTaught: coaches.reduce((sum, coach) => sum + coach.classSessionsTaught, 0), teachingCoaches: coaches.filter(coach => coach.ptTaught + coach.classSessionsTaught > 0).length } : data?.coach
  return <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-label="Thống kê giảng dạy theo quý">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-base font-bold text-slate-900">{manager ? 'Thống kê giảng dạy HLV' : 'Giảng dạy của tôi'} <span className="text-primary">· Quý {period.quarter}/{period.year}</span></h2><p className="mt-1 text-body-sm text-slate-500">{data ? `${shortDate(data.from)} – ${shortDate(data.to)} · Cập nhật ${formatTimestamp(data.asOfUtc)}` : 'Số liệu của toàn quý, độc lập với tuần đang xem.'}</p></div>
      <div className="flex flex-wrap items-center gap-2"><select aria-label="Chọn quý thống kê" className={inputCls + ' !w-auto !h-9'} value={period.quarter} onChange={event => changePeriod({ ...period, quarter: Number(event.target.value) })}>{[1, 2, 3, 4].map(quarter => <option key={quarter} value={quarter}>Quý {quarter}</option>)}</select>
        <select aria-label="Chọn năm thống kê" className={inputCls + ' !w-auto !h-9'} value={period.year} onChange={event => changePeriod({ ...period, year: Number(event.target.value) })}>{Array.from({ length: 201 }, (_, index) => 2200 - index).map(year => <option key={year}>{year}</option>)}</select>
        <button type="button" aria-label="Làm mới thống kê giảng dạy" className={btnOutline + ' !h-9 !px-2'} disabled={loading} onClick={() => setRefresh(value => value + 1)}><Icon name="refresh" className="text-lg" /></button>
      </div>
    </div>
    {error && <Alert>{error}</Alert>}{loading && <p role="status" className="py-3 text-body-sm text-slate-500">Đang tính số buổi và khóa đã dạy…</p>}
    {data && totals && <><div className="grid sm:grid-cols-3 gap-3">
      <Stat label="Buổi PT đã dạy" value={totals.ptTaught} icon="fitness_center" tone="border-amber-100 bg-amber-50 text-amber-900" />
      <Stat label={manager ? 'HLV có giảng dạy' : 'Khóa đã dạy'} value={manager ? totals.teachingCoaches : totals.coursesTaught} icon="school" tone="border-indigo-100 bg-indigo-50 text-indigo-900" />
      <Stat label="Buổi lớp đã dạy" value={totals.classSessionsTaught} icon="event_available" tone="border-emerald-100 bg-emerald-50 text-emerald-900" />
    </div>
    {manager ? <>
      <input aria-label="Tìm HLV trong báo cáo" className={inputCls + ' sm:!max-w-sm'} placeholder="Tìm tên hoặc mã HLV…" value={search} onChange={event => setSearch(event.target.value)} />
      <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[700px] text-left text-body-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Huấn luyện viên</th><th className="p-3 text-right">PT đã dạy</th><th className="p-3 text-right">Khóa đã dạy</th><th className="p-3 text-right">Buổi lớp</th><th className="p-3 text-right">Chưa xác nhận</th><th className="p-3" /></tr></thead><tbody>
        {shown.map(coach => <tr key={coach.coachId} className="border-t border-slate-100"><td className="p-3"><div className="flex items-center gap-2"><Avatar src={coach.avatarUrl} /><div><p className="font-semibold text-slate-900">{coach.fullName}</p><p className="mt-1 text-xs text-slate-500">#{coach.coachId}{!coach.isActive ? ' · Đã khóa tài khoản' : ''}</p></div></div></td><td className="p-3 text-right font-bold text-amber-800">{coach.ptTaught}</td><td className="p-3 text-right font-bold text-primary">{coach.coursesTaught}</td><td className="p-3 text-right">{coach.classSessionsTaught}</td><td className="p-3 text-right">{coach.unverified}</td><td className="p-3 text-right"><button type="button" className={btnOutline + ' !h-8 !text-xs'} onClick={() => setSelected(coach)}>Chi tiết</button></td></tr>)}
        {!shown.length && <tr><td colSpan={6} className="p-6 text-center text-slate-500">Không có HLV phù hợp.</td></tr>}
      </tbody></table></div><p className="text-xs leading-relaxed text-slate-500">{data.countingRule}</p>
    </> : <><p className="text-body-sm text-slate-500">{data.coach.notEnded} buổi chưa kết thúc · {data.coach.unverified} buổi chưa xác nhận · {data.coach.cancelled} buổi đã hủy</p>
      <details className="border-t border-slate-100 pt-3"><summary className="w-fit cursor-pointer text-body-sm font-semibold text-primary">Xem chi tiết & cách tính</summary><div className="pt-3"><TeachingItems key={`${period.year}:${period.quarter}`} report={data} /></div></details>
    </>}
    </>}
    {selected && <CoachDetail key={`${selected.coachId}:${period.year}:${period.quarter}`} coach={selected} period={period} onClose={() => setSelected(null)} />}
  </section>
}
