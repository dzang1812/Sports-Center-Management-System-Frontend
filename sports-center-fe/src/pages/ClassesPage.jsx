import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, query } from '../api'
import PublicShell from '../components/PublicShell'
import { addDays, fromTimeOnly, toDateOnly } from '../dateUtils'
import { LEVEL_LABEL } from '../labels'
import { Alert, Badge, Field, Icon, btnOutline, btnPrimary, inputCls } from '../components/ui'

const DEFAULT_FILTERS = (today) => ({ sportId: '', level: '', from: today, to: addDays(today, 14) })
const CARD_BANNERS = ['/images/banner-home-1.jpg', '/images/banner-home-2.jpg', '/images/banner-home-3.jpg', '/images/banner-home-4.jpg']
const SOON_HOURS = 48

// Public, read-only showcase of upcoming classes — no booking here (that needs a logged-in
// member), just browsing + a CTA to log in. GET /sessions and GET /sports are both AllowAnonymous.
export default function ClassesPage() {
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
      const { items } = await api(`/sessions${query({ ...filters, pageSize: 50 })}`)
      setSessions(
        items
          .filter((s) => s.status === 'Scheduled')
          .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)),
      )
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  const setFilter = (k) => (e) => setFilters({ ...filters, [k]: e.target.value })
  const isSoon = (s) => new Date(`${s.date}T${s.startTime}`) - new Date() <= SOON_HOURS * 3600000

  return (
    <PublicShell
      hero={
        <div className="relative w-full h-64 sm:h-80 overflow-hidden">
          <img src="/images/banner-home-2.jpg" alt="Lịch lớp học FitZone" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/60 to-inverse-surface/20" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-6 text-white">
            <span className="font-label-md text-label-md uppercase tracking-wider text-tertiary-fixed mb-2">Lịch lớp học</span>
            <h1 className="font-display-md text-display-md">Lớp học mới nhất, sắp diễn ra</h1>
            <p className="text-white/85 mt-2 max-w-xl">Đăng nhập hoặc đăng ký tài khoản hội viên để giữ chỗ trước khi hết chỗ.</p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
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
            <button type="button" className={btnOutline} onClick={() => setFilters(DEFAULT_FILTERS(today))}>
              <Icon name="restart_alt" className="text-lg" />
              Đặt lại
            </button>
            <button type="button" className={btnPrimary} onClick={load}>
              <Icon name="search" className="text-lg" />
              Tìm kiếm
            </button>
          </div>
        </div>

        {error && <Alert>{error}</Alert>}

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${loading ? 'opacity-50' : ''}`}>
          {sessions.map((s, i) => (
            <div key={s.id} className="bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-lg transition-shadow flex flex-col justify-between overflow-hidden">
              <div>
                <div className="relative h-40">
                  <img src={CARD_BANNERS[i % CARD_BANNERS.length]} alt={s.className} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/15 to-transparent" />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <Badge tone="indigo">{LEVEL_LABEL[s.level]}</Badge>
                    {isSoon(s) && (
                      <span className="px-2.5 py-1 rounded-full bg-error text-white font-label-sm text-label-sm flex items-center gap-1">
                        <Icon name="bolt" className="text-sm" />
                        Sắp diễn ra
                      </span>
                    )}
                  </div>
                  <h3 className="absolute bottom-3 left-4 right-4 font-headline-md text-headline-md text-white">{s.className}</h3>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-secondary text-body-sm mb-1">
                    <Icon name="schedule" className="text-base" />
                    <span>{s.date} • {fromTimeOnly(s.startTime)}-{fromTimeOnly(s.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary text-body-sm mb-1">
                    <Icon name="place" className="text-base" />
                    <span>{s.room}</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary text-body-sm mb-4">
                    <Icon name="person" className="text-base" />
                    <span>HLV {s.coach ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`font-label-md text-label-md font-semibold ${s.remainingSeats <= 0 ? 'text-error' : s.remainingSeats <= s.capacity * 0.3 ? 'text-error' : 'text-primary'}`}>
                      {s.remainingSeats > 0 ? `Còn ${s.remainingSeats}/${s.capacity} chỗ` : 'Đã kín chỗ'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5">
                <Link to="/login" className={btnPrimary + ' w-full justify-center'}>
                  <Icon name="login" className="text-lg" />
                  Đăng nhập để đặt chỗ
                </Link>
              </div>
            </div>
          ))}
          {!loading && !sessions.length && (
            <p className="text-secondary text-center py-10 col-span-full">Không có buổi học phù hợp trong khoảng thời gian này.</p>
          )}
        </div>
      </div>
    </PublicShell>
  )
}
