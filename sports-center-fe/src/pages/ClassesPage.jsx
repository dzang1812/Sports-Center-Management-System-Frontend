import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, query } from '../api'
import ImageCarousel from '../components/ImageCarousel'
import PublicShell from '../components/PublicShell'
import { LEVEL_LABEL } from '../labels'
import { Alert, Field, Icon, btnOutline, btnPrimary, inputCls } from '../components/ui'

const DEFAULT_FILTERS = { sportId: '', level: '' }
const CARD_BANNERS = ['/images/sport-gym.jpg', '/images/sport-yoga.jpg', '/images/sport-pilates.jpg', '/images/sport-hiit.jpg']

// Public, read-only showcase of open classes — no booking here (that needs a logged-in
// member), just browsing + a CTA to log in. GET /classes/public and GET /sports are AllowAnonymous.
export default function ClassesPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sports, setSports] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/sports').then((list) => setSports(list.filter((s) => s.hasClasses))).catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setClasses(await api(`/classes/public${query(filters)}`))
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" className={btnOutline} onClick={() => setFilters(DEFAULT_FILTERS)}>
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
          {classes.map((c, i) => (
            <div key={c.id} className="relative rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden aspect-[3/4] group">
              <ImageCarousel
                images={c.imageUrls.length ? c.imageUrls : [CARD_BANNERS[i % CARD_BANNERS.length]]}
                alt={c.name}
                className="group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/70 to-inverse-surface/15" />
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm">{c.sport}</span>
                <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm">
                  {LEVEL_LABEL[c.level] ?? c.level}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h3 className="font-headline-md text-headline-md mb-1.5">{c.name}</h3>
                {c.description && <p className="font-body-sm text-body-sm text-white/85 mb-3 line-clamp-2">{c.description}</p>}
                <div className="flex items-center gap-2 text-white/85 font-body-sm text-body-sm mb-4">
                  <Icon name="calendar_today" className="text-sm" />
                  <span>{c.startDate} → {c.endDate}</span>
                </div>
                <Link to="/login" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-surface-container-lowest text-on-surface font-label-lg text-label-lg hover:opacity-90 transition-opacity">
                  <Icon name="login" className="text-lg" />
                  Đăng nhập để đặt chỗ
                </Link>
              </div>
            </div>
          ))}
          {!loading && !classes.length && (
            <p className="text-secondary text-center py-10 col-span-full">Không có lớp học nào đang mở phù hợp.</p>
          )}
        </div>
      </div>
    </PublicShell>
  )
}
