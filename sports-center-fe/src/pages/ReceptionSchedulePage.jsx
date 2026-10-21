import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, query } from '../api'
import { Alert, Badge, Field, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { addDays, fromTimeOnly, toDateOnly } from '../dateUtils'
import { LEVEL_LABEL } from '../labels'

// Center-wide, read-only class schedule for the front desk — for "hôm nay có lớp gì" questions from
// walk-ins, without having to start from a specific member like /reception/classes does.
const DEFAULT_FILTERS = (today) => ({ sportId: '', level: '', from: today, to: addDays(today, 7) })

export default function ReceptionSchedulePage() {
  const today = toDateOnly(new Date())
  const [filters, setFilters] = useState(DEFAULT_FILTERS(today))
  const [sports, setSports] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/sports').then((list) => setSports(list.filter((s) => s.hasClasses))).catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { items } = await api(`/sessions${query({ ...filters, pageSize: 100 })}`)
      setSessions(items.filter((s) => s.status === 'Scheduled'))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  const setFilter = (k) => (e) => setFilters({ ...filters, [k]: e.target.value })

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Lịch tập trung tâm</h1>
        <p className="text-secondary">Xem toàn bộ buổi học sắp tới để tư vấn khách, không cần chọn hội viên trước.</p>
      </div>

      <div className="bg-surface-container rounded-xl shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Bộ môn">
            <select className={inputCls} value={filters.sportId} onChange={setFilter('sportId')}>
              <option value="">— Tất cả —</option>
              {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Cấp độ">
            <select className={inputCls} value={filters.level} onChange={setFilter('level')}>
              <option value="">— Tất cả —</option>
              {Object.entries(LEVEL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Từ ngày">
            <input className={inputCls} type="date" value={filters.from} onChange={setFilter('from')} />
          </Field>
          <Field label="Đến ngày">
            <input className={inputCls} type="date" value={filters.to} onChange={setFilter('to')} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" className={btnOutline} onClick={() => setFilters(DEFAULT_FILTERS(today))}>Đặt lại</button>
          <button type="button" className={btnPrimary} onClick={load}>Tìm kiếm</button>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3 w-14">STT</th>
              <th className="px-4 py-3">Lớp học</th>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Phòng</th>
              <th className="px-4 py-3">HLV</th>
              <th className="px-4 py-3">Chỗ trống</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {sessions.map((s, i) => (
              <tr key={s.id} className="border-t border-surface-container">
                <td className="px-4 py-3 text-secondary">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold">{s.className}</div>
                  <Badge tone="indigo">{LEVEL_LABEL[s.level]}</Badge>
                </td>
                <td className="px-4 py-3 text-secondary">{s.date} • {fromTimeOnly(s.startTime)}-{fromTimeOnly(s.endTime)}</td>
                <td className="px-4 py-3 text-secondary">{s.room}</td>
                <td className="px-4 py-3 text-secondary">{s.coach ?? '—'}</td>
                <td className="px-4 py-3 text-secondary">{s.remainingSeats}/{s.capacity}</td>
                <td className="px-4 py-3 text-right">
                  <Link to="/reception/classes" className={btnOutline + ' !h-9'}>Đặt lớp này</Link>
                </td>
              </tr>
            ))}
            {!loading && !sessions.length && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-secondary">Không có buổi học nào trong khoảng thời gian này.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
