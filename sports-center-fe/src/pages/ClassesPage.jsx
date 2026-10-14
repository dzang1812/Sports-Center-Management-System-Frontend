import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, query } from '../api'
import PublicShell from '../components/PublicShell'
import { addDays, fromTimeOnly, toDateOnly } from '../dateUtils'
import { LEVEL_LABEL } from '../labels'
import { Alert, Icon, btnPrimary, inputCls } from '../components/ui'

// Public, read-only version of the class schedule — no booking here (that needs a logged-in member),
// just browsing + a CTA to log in. GET /sessions and GET /sports are both AllowAnonymous on the backend.
export default function ClassesPage() {
  const today = toDateOnly(new Date())
  const [filters, setFilters] = useState({ sportId: '', level: '', from: today, to: addDays(today, 14) })
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
      const { items } = await api(`/sessions${query({ ...filters, pageSize: 50 })}`)
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
    <PublicShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Lịch lớp học</h1>
          <p className="text-secondary mt-1">Xem các buổi học sắp mở. Đăng nhập hoặc đăng ký tài khoản hội viên để đặt chỗ.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select className={`${inputCls} !h-10 !w-auto`} value={filters.sportId} onChange={setFilter('sportId')}>
            <option value="">Tất cả bộ môn</option>
            {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className={`${inputCls} !h-10 !w-auto`} value={filters.level} onChange={setFilter('level')}>
            <option value="">Mọi cấp độ</option>
            {Object.entries(LEVEL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input className={`${inputCls} !h-10 !w-auto`} type="date" value={filters.from} onChange={setFilter('from')} />
          <input className={`${inputCls} !h-10 !w-auto`} type="date" value={filters.to} onChange={setFilter('to')} />
        </div>

        {error && <Alert>{error}</Alert>}

        <div className={`grid grid-cols-1 gap-3 ${loading ? 'opacity-50' : ''}`}>
          {sessions.map((s) => (
            <div key={s.id} className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{s.className}</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">{LEVEL_LABEL[s.level]}</span>
                </div>
                <div className="text-secondary text-body-sm">
                  {s.date} • {fromTimeOnly(s.startTime)}-{fromTimeOnly(s.endTime)} • {s.room} • HLV {s.coach ?? '—'}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-body-sm text-secondary">Còn {s.remainingSeats}/{s.capacity} chỗ</span>
                <Link to="/login" className={btnPrimary}>
                  <Icon name="login" className="text-lg" />
                  Đăng nhập để đặt chỗ
                </Link>
              </div>
            </div>
          ))}
          {!loading && !sessions.length && <p className="text-secondary text-center py-10">Không có buổi học phù hợp trong khoảng thời gian này.</p>}
        </div>
      </div>
    </PublicShell>
  )
}
