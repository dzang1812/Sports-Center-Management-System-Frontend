// Static UI exported from Stitch. Data is hardcoded until the real API is wired in.
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { api } from '../../api'
import FloatingContactWidget from '../../components/FloatingContactWidget'
import ImageCarousel from '../../components/ImageCarousel'
import SiteHeader from '../../components/SiteHeader'
import { Icon } from '../../components/ui'
import CoachCard from '../../components/CoachCard'
import { LEVEL_LABEL, PLAN_TYPE_LABEL } from '../../labels'
import { NEWS_ITEMS } from '../../newsItems'

const formatVnd = (n) => `${n.toLocaleString('vi-VN')}đ`

const HOME_BANNERS = [
  '/images/banner-home-1.jpg',
  '/images/banner-home-2.jpg',
  '/images/banner-home-3.jpg',
  '/images/banner-home-4.jpg',
]

const SPORT_CARDS = [
  {
    key: 'gym', tag: 'Gym', title: 'Gym & Thể hình', href: '#gym', banner: '/images/sport-gym.jpg',
    desc: 'Hệ thống máy tập tạ tự do, cardio hiện đại nhập khẩu trực tiếp cùng lộ trình PT 1:1 cá nhân hóa chuyên sâu.',
    features: ['Dàn máy cơ sinh học Technogym', 'Huấn luyện viên chuẩn quốc tế'],
  },
  {
    key: 'yoga', tag: 'Yoga', title: 'Yoga & Thiền định', href: '#yoga', banner: '/images/sport-yoga.jpg',
    desc: 'Vinyasa, Hatha, Aerial Yoga cùng Master Ấn Độ. Cân bằng năng lượng, xoa dịu tâm trí và dẻo dai cơ thể.',
    features: ['Studio lọc khí ion âm tĩnh lặng', 'Giảng viên chuẩn Yoga Alliance'],
  },
  {
    key: 'pilates', tag: 'Pilates', title: 'Pilates Reformer', href: '#pilates', banner: '/images/sport-pilates.jpg',
    desc: 'Máy tập Reformer chuyên dụng tăng cơ lõi vững chắc, nắn chỉnh cột sống và định hình đường cong chuẩn xác.',
    features: ['Máy móc chuyển động êm mượt', 'Sĩ số lớp giới hạn dưới 8 học viên'],
  },
  {
    key: 'hiit', tag: 'HIIT', title: 'HIIT & Functional', href: '#hiit', banner: '/images/sport-hiit.jpg',
    desc: 'Tập luyện cường độ cao ngắt quãng giúp đốt mỡ tối đa, tăng sức bền tim mạch với âm nhạc bùng nổ nhiệt huyết.',
    features: ['Đo nhịp tim thời gian thực', 'Tiêu hao lên tới 800 kcal/giờ'],
  },
]

function HeroBannerSlider() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % HOME_BANNERS.length), 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      {HOME_BANNERS.map((src, i) => (
        <img
          key={src}
          alt="Không gian phòng tập cao cấp FitZone Sports Center với trang thiết bị hiện đại"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
          src={src}
        />
      ))}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
        {HOME_BANNERS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ảnh ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-surface-container-lowest' : 'w-1.5 bg-surface-container-lowest/50'}`}
          />
        ))}
      </div>
    </>
  )
}

const FEATURED_CLASS_FALLBACKS = ['/images/sport-gym.jpg', '/images/sport-yoga.jpg', '/images/sport-pilates.jpg', '/images/sport-hiit.jpg']

// The newest open classes (not individual sessions), GET /classes/featured is AllowAnonymous.
function ClassesSection() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/classes/featured?count=4')
      .then(setFeatured)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-16 bg-surface scroll-mt-24" id="classes">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="font-label-md text-label-md text-primary-container uppercase tracking-wider block mb-1">LỊCH TẬP SẮP TỚI</span>
            <h2 className="font-headline-xl text-headline-xl text-on-surface">Lớp học sắp mở trong tuần</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Đăng ký giữ chỗ nhanh chóng trước khi kín lớp</p>
          </div>
          <Link className="inline-flex items-center gap-2 font-label-lg text-label-lg text-primary hover:text-primary-container transition-colors" to="/classes">
            <span>Xem tất cả lịch học</span>
            <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>

        <div className={`flex flex-col gap-12 ${loading ? 'opacity-50' : ''}`}>
          {featured.map((c, i) => (
            <div key={c.id} className={`flex flex-col md:flex-row ${i % 2 === 1 ? 'md:flex-row-reverse' : ''} items-center gap-8`}>
              <div className="w-full md:w-1/2 relative h-64 sm:h-80 rounded-2xl shadow-md overflow-hidden">
                <ImageCarousel
                  images={c.imageUrls.length ? c.imageUrls : [FEATURED_CLASS_FALLBACKS[i % FEATURED_CLASS_FALLBACKS.length]]}
                  alt={c.name}
                />
              </div>
              <div className="w-full md:w-1/2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-primary-container text-on-primary">{c.sport}</span>
                  <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant">{LEVEL_LABEL[c.level] ?? c.level}</span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-on-surface mb-2">{c.name}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4">{c.description || 'Lớp học chất lượng cao cùng huấn luyện viên giàu kinh nghiệm tại FitZone.'}</p>
                <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm mb-5">
                  <Icon name="calendar_today" className="text-sm" />
                  <span>{c.startDate} → {c.endDate}</span>
                </div>
                <Link to="/classes" className="inline-flex items-center gap-1.5 font-label-lg text-label-lg text-primary hover:gap-2.5 transition-all">
                  <span>Tìm hiểu thêm</span>
                  <Icon name="arrow_forward" className="text-base" />
                </Link>
              </div>
            </div>
          ))}
          {!loading && !featured.length && (
            <p className="text-secondary text-center py-10">Hiện chưa có lớp học nào đang mở.</p>
          )}
        </div>
      </div>
    </section>
  )
}

// Public coach directory, GET /pt/coaches (no auth required). Same card/carousel look as the member PT picker.
function TrainersSection() {
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(true)
  const gallery = useRef(null)

  useEffect(() => {
    api('/pt/coaches')
      .then((list) => setCoaches(list.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const move = (direction) => gallery.current?.scrollBy({ left: direction * gallery.current.clientWidth * 0.8, behavior: 'smooth' })

  return (
    <section className="py-16 bg-surface-container-low scroll-mt-24" id="trainers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-outline-variant/50 bg-white overflow-hidden shadow-sm">
          <div className="relative overflow-hidden bg-slate-900 px-5 py-6 sm:px-8">
            <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">ĐỘI NGŨ CHUYÊN MÔN</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Huấn luyện viên tiêu biểu</h2>
                <p className="mt-1.5 text-body-sm text-slate-300">Tập riêng cùng coach được chứng nhận, lịch linh hoạt theo mục tiêu của bạn.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link to="/trainers" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-body-sm font-semibold text-white hover:bg-white/20 transition-colors">
                  <Icon name="groups" className="text-lg text-indigo-300" />Xem tất cả HLV<Icon name="arrow_forward" className="text-base" />
                </Link>
                <button type="button" aria-label="Xem HLV phía trước" onClick={() => move(-1)} disabled={loading || !coaches.length} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/20 disabled:opacity-40"><Icon name="chevron_left" /></button>
                <button type="button" aria-label="Xem HLV tiếp theo" onClick={() => move(1)} disabled={loading || !coaches.length} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/20 disabled:opacity-40"><Icon name="chevron_right" /></button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div ref={gallery} tabIndex={0} role="region" aria-label="Danh sách huấn luyện viên tiêu biểu" aria-busy={loading} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 pt-1 px-1 -mx-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded-xl">
              {loading && <p role="status" className="py-10 text-secondary">Đang tải HLV…</p>}
              {coaches.map((c) => (
                <CoachCard key={c.id} coach={c} className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]" />
              ))}
              {!loading && !coaches.length && <p className="w-full rounded-xl bg-slate-50 py-8 text-center text-body-sm text-secondary">Chưa có huấn luyện viên nào được công khai.</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function NewsSection() {
  return (
    <section className="py-16 bg-surface scroll-mt-24" id="news">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="font-label-md text-label-md text-tertiary-container uppercase tracking-wider block mb-2">CẬP NHẬT MỚI NHẤT</span>
          <h2 className="font-headline-xl text-headline-xl text-on-surface">Tin tức &amp; Khuyến mãi</h2>
          <Link to="/news" className="inline-flex items-center gap-1.5 mt-3 font-label-lg text-label-lg text-primary hover:text-primary-container transition-colors">
            <span>Xem tất cả tin tức</span>
            <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {NEWS_ITEMS.map((n) => (
            <div key={n.title} className="relative rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden aspect-[3/4] group">
              <img src={n.banner} alt={n.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/55 to-transparent" />
              <span className="absolute top-3 left-3 font-label-sm text-label-sm text-on-tertiary-container bg-tertiary-container/90 backdrop-blur-sm uppercase tracking-wide px-2.5 py-1 rounded-full">
                {n.tag}
              </span>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-headline-md text-headline-md mb-1.5">{n.title}</h3>
                <p className="font-body-sm text-body-sm text-white/85">{n.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const PRICING_PREVIEW_COUNT = 3
const PRICING_CARD_BANNERS = ['/images/banner-home-4.jpg', '/images/banner-home-2.jpg', '/images/banner-home-1.jpg']

// Public, real plan list — GET /membership-plans is AllowAnonymous. CTAs go to /packages,
// which already has the full subscribe + PayOS QR flow (no need to duplicate it here). Only a
// preview is shown — "Xem thêm gói tập" links to the full list instead of dumping everything here.
function PricingSection() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/membership-plans')
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const preview = plans.slice(0, PRICING_PREVIEW_COUNT)

  return (
    <section className="py-16 bg-surface-container-low scroll-mt-24" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden shadow-lg h-56 sm:h-64 mb-16">
          <img src="/images/banner-home-3.jpg" alt="Bảng giá gói tập FitZone" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/55 to-inverse-surface/20" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-6 text-white">
            <span className="font-label-md text-label-md uppercase tracking-wider text-tertiary-fixed mb-2">Bảng giá dịch vụ linh hoạt</span>
            <h2 className="font-headline-xl text-headline-xl">Chọn gói tập phù hợp với mục tiêu của bạn</h2>
            <p className="text-white/85 mt-1">Cam kết chi phí minh bạch, không phụ phí ẩn</p>
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch ${loading ? 'opacity-50' : ''}`}>
          {preview.map((p, i) => (
            <div key={p.id} className="relative rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden aspect-[3/4] group">
              <img src={p.imageUrl || PRICING_CARD_BANNERS[i % PRICING_CARD_BANNERS.length]} alt={p.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/75 to-inverse-surface/20" />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm">
                {PLAN_TYPE_LABEL[p.planType] ?? p.planType}
              </span>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-headline-md text-headline-md mb-1">{p.name}</h3>
                <p className="font-body-sm text-body-sm text-white/80 mb-3">{p.sportName ?? 'Áp dụng mọi bộ môn'}</p>
                <div className="mb-3">
                  <span className="font-display-lg text-display-lg">{formatVnd(p.price)}</span>
                  <span className="font-body-sm text-body-sm text-white/80"> / {p.durationDays} ngày</span>
                </div>
                <ul className="space-y-1.5 font-body-sm text-body-sm text-white/90 mb-4">
                  {p.includesClasses && (
                    <li className="flex items-center gap-2">
                      <Icon name="check_circle" className="text-sm text-tertiary-fixed" />
                      <span>Tham gia lớp học nhóm</span>
                    </li>
                  )}
                  {p.ptSessionCredits > 0 && (
                    <li className="flex items-center gap-2">
                      <Icon name="check_circle" className="text-sm text-tertiary-fixed" />
                      <span>{p.ptSessionCredits} buổi PT 1:1</span>
                    </li>
                  )}
                  {p.includesGymAccess && (
                    <li className="flex items-center gap-2">
                      <Icon name="check_circle" className="text-sm text-tertiary-fixed" />
                      <span>Sử dụng tự do tiện ích phòng Gym</span>
                    </li>
                  )}
                </ul>
                <Link to="/packages" className="w-full block text-center py-2.5 px-4 rounded-lg bg-surface-container-lowest text-on-surface font-label-lg text-label-lg hover:opacity-90 transition-opacity">
                  Chọn gói này
                </Link>
              </div>
            </div>
          ))}
          {!loading && !plans.length && (
            <p className="text-secondary text-center py-10 col-span-full">Hiện chưa có gói tập nào đang mở bán.</p>
          )}
        </div>

        {plans.length > PRICING_PREVIEW_COUNT && (
          <div className="flex justify-center mt-10">
            <Link to="/packages" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm hover:opacity-90 transition-opacity">
              <span>Xem thêm gói tập ({plans.length - PRICING_PREVIEW_COUNT}+)</span>
              <Icon name="arrow_forward" className="text-lg" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

const STATS = [
  { icon: 'groups', value: 5000, suffix: '+', label: 'Hội viên năng động' },
  { icon: 'apartment', value: 4, suffix: '', label: 'Chi nhánh trung tâm' },
  { icon: 'calendar_month', value: 50, suffix: '+', label: 'Lớp học mỗi tuần' },
  { icon: 'sports_gymnastics', value: 8, suffix: '', label: 'Bộ môn đào tạo' },
  { icon: 'military_tech', value: 15, suffix: '+', label: 'Huấn luyện viên chuyên nghiệp' },
  { icon: 'favorite', value: 98, suffix: '%', label: 'Hài lòng dịch vụ' },
  { icon: 'emoji_events', value: 10, suffix: '+', label: 'Năm kinh nghiệm' },
  { icon: 'schedule', value: 16, suffix: 'h', label: 'Hoạt động mỗi ngày' },
]

// Fades + slides a section in once it scrolls into view (runs once, via IntersectionObserver).
function Reveal({ children, className = '' }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setVisible(true)
      obs.disconnect()
    }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}>
      {children}
    </div>
  )
}

// Counts from 0 up to `value` once the number scrolls into view (runs once, via IntersectionObserver).
function CountUpNumber({ value, suffix = '', duration = 1600 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return
      started.current = true
      const start = performance.now()
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - (1 - progress) ** 3
        setDisplay(Math.round(value * eased))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      obs.disconnect()
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [value, duration])

  return <span ref={ref}>{display.toLocaleString('vi-VN')}{suffix}</span>
}

function StatsBannerSection() {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen py-20 overflow-hidden">
      <img src="/images/banner-stats.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-inverse-surface/70 backdrop-blur-[1px]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-12 gap-x-6 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-3">
              <Icon name={s.icon} className="text-6xl text-tertiary-fixed" />
              <span className="font-display-lg text-display-lg text-white font-bold">
                <CountUpNumber value={s.value} suffix={s.suffix} />
              </span>
              <span className="text-white/85 text-body-lg font-semibold max-w-[160px]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
<SiteHeader />
<main className="w-full min-h-screen bg-[#F8FAFC] flex items-center justify-center p-margin-mobile md:p-margin"><div className="flex flex-col w-full">

<section className="relative overflow-hidden py-12 lg:py-20 bg-surface scroll-mt-24" id="home">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

<div className="lg:col-span-7 flex flex-col items-start space-y-6">
<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tertiary-fixed text-tertiary-container font-label-md text-label-sm">
<span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
<span>ĐÓN NĂM MỚI BỨT PHÁ PHONG ĐỘ</span>
</div>
<h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
            Tập luyện cùng <br className="hidden sm:inline" />
<span className="text-primary-container">huấn luyện viên</span> chuyên nghiệp
          </h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Hệ thống phòng tập cao cấp chuẩn quốc tế kết hợp Gym, Yoga, Pilates và HIIT. Không gian tập luyện truyền cảm hứng cùng lộ trình cá nhân hóa toàn diện cho sức khỏe và vóc dáng của bạn.
          </p>
<div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
<Link className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary-container hover:opacity-90 text-on-primary font-label-lg text-label-lg shadow-md transition-all" to="/register">
<span>Nhận tư vấn &amp; Tập thử miễn phí</span>
<span className="material-symbols-outlined text-base">arrow_forward</span>
</Link>
<Link className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-lg text-label-lg transition-all" to="/classes">
<span className="material-symbols-outlined text-base">calendar_today</span>
<span>Xem lịch lớp hôm nay</span>
</Link>
</div>

<div className="grid grid-cols-3 gap-6 pt-6 w-full border-t border-surface-container-high/60">
<div>
<p className="font-headline-lg text-headline-lg text-on-surface">5.000+</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">Hội viên năng động</p>
</div>
<div>
<p className="font-headline-lg text-headline-lg text-on-surface">98%</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">Hài lòng dịch vụ</p>
</div>
<div>
<p className="font-headline-lg text-headline-lg text-on-surface">04</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">Chi nhánh trung tâm</p>
</div>
</div>
</div>

<div className="lg:col-span-5 relative">
<div className="relative rounded-2xl overflow-hidden shadow-xl bg-surface-container-low aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]">
<HeroBannerSlider />
<div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/60 via-transparent to-transparent"></div>
</div>
</div>
</div>
</div>
</section>

<Reveal>
<section className="py-16 bg-surface-container-low">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="text-center max-w-3xl mx-auto mb-12">
<span className="font-label-md text-label-md text-tertiary-container uppercase tracking-wider block mb-2">BỘ MÔN TẬP LUYỆN ĐA DẠNG</span>
<h2 className="font-headline-xl text-headline-xl text-on-surface">
          Khám phá thế giới rèn luyện chuẩn 5 sao tại FitZone
        </h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

{SPORT_CARDS.map((s) => (
<div key={s.key} className="relative rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden aspect-[3/4] group">
<img src={s.banner} alt={s.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
<div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/65 to-transparent" />
<span className="absolute top-3 left-3 font-label-sm text-label-sm text-on-tertiary-container bg-tertiary-container/90 backdrop-blur-sm uppercase tracking-wide px-2.5 py-1 rounded-full">
{s.tag}
</span>
<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
<h3 className="font-headline-md text-headline-md mb-1.5">{s.title}</h3>
<p className="font-body-sm text-body-sm text-white/85 mb-3">{s.desc}</p>
<ul className="space-y-1.5 font-body-sm text-body-sm text-white/90 mb-4">
{s.features.map((f) => (
<li key={f} className="flex items-center gap-2">
<span className="material-symbols-outlined text-sm text-tertiary-fixed">check_circle</span>
{f}
</li>
))}
</ul>
<a className="inline-flex items-center gap-1 font-label-md text-label-md text-white hover:gap-2 transition-all" href={s.href}>
<span>Tìm hiểu thêm</span>
<span className="material-symbols-outlined text-sm">arrow_forward</span>
</a>
</div>
</div>
))}
</div>
</div>
</section>
</Reveal>

<Reveal><ClassesSection /></Reveal>
<Reveal><TrainersSection /></Reveal>
<Reveal><NewsSection /></Reveal>
<Reveal><PricingSection /></Reveal>
<Reveal><StatsBannerSection /></Reveal>
</div></main>

<footer className="w-full bg-inverse-surface text-inverse-on-surface pt-16 pb-8">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-surface-variant/20">

<div className="lg:col-span-4 space-y-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-3xl text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
<span className="font-headline-lg text-headline-lg font-bold tracking-tight text-surface-lowest">FITZONE</span>
</div>
<p className="font-body-sm text-body-sm text-surface-variant max-w-sm">
            Hệ thống tổ hợp thể thao cao cấp kiến tạo phong cách sống khỏe, giàu năng lượng và kỷ luật cho cộng đồng hiện đại.
          </p>
<div className="space-y-2 pt-2 font-body-sm text-body-sm text-surface-variant">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-base text-primary-fixed">call</span>
<span>Hotline: 1900 8888</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-base text-primary-fixed">mail</span>
<span>Email: cskh@fitzone.vn</span>
</div>
<div className="flex items-start gap-2">
<span className="material-symbols-outlined text-base text-primary-fixed mt-0.5">location_on</span>
<span>Tầng 3, Tòa nhà Thể thao Apex, 280 Bà Triệu, Hai Bà Trưng, Hà Nội</span>
</div>
</div>
</div>

<div className="lg:col-span-3 space-y-3">
<h4 className="font-headline-sm text-headline-sm text-surface-lowest">Dịch vụ &amp; Bộ môn</h4>
<ul className="space-y-2 font-body-sm text-body-sm text-surface-variant">
<li><a className="hover:text-surface-lowest transition-colors" href="#gym">Gym &amp; Cardio chuyên sâu</a></li>
<li><a className="hover:text-surface-lowest transition-colors" href="#yoga">Yoga Chuyên sâu &amp; Trị liệu</a></li>
<li><a className="hover:text-surface-lowest transition-colors" href="#pilates">Pilates Reformer</a></li>
<li><a className="hover:text-surface-lowest transition-colors" href="#hiit">Lớp HIIT Đốt mỡ bùng nổ</a></li>
<li><a className="hover:text-surface-lowest transition-colors" href="#pt">Huấn luyện viên cá nhân 1:1</a></li>
</ul>
</div>

<div className="lg:col-span-2 space-y-3">
<h4 className="font-headline-sm text-headline-sm text-surface-lowest">Hội viên</h4>
<ul className="space-y-2 font-body-sm text-body-sm text-surface-variant">
<li><a className="hover:text-surface-lowest transition-colors" href="#policy">Chính sách thành viên</a></li>
<li><a className="hover:text-surface-lowest transition-colors" href="#terms">Điều khoản sử dụng</a></li>
<li><a className="hover:text-surface-lowest transition-colors" href="#booking">Đặt lịch lớp học</a></li>
<li><a className="hover:text-surface-lowest transition-colors" href="#contract">Tra cứu hợp đồng</a></li>
</ul>
</div>

<div className="lg:col-span-3 space-y-4">
<h4 className="font-headline-sm text-headline-sm text-surface-lowest">Giờ mở cửa</h4>
<div className="font-body-sm text-body-sm text-surface-variant space-y-1">
<p><span className="text-surface-lowest">Thứ 2 - Thứ 6:</span> 05:30 - 22:00</p>
<p><span className="text-surface-lowest">Thứ 7 - Chủ Nhật:</span> 06:00 - 21:00</p>
</div>
<div className="pt-2">
<p className="font-label-md text-label-md text-surface-lowest mb-2">Đăng ký nhận lịch ưu đãi</p>
<div className="flex gap-2">
<input className="w-full px-3 py-2 text-body-sm rounded-lg bg-surface-variant/20 text-surface-lowest placeholder-surface-variant focus:outline-none focus:ring-1 focus:ring-primary-fixed" placeholder="Email của bạn..." type="email" />
<button className="px-3 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity">
                Gửi
              </button>
</div>
</div>
</div>
</div>
<div className="pt-8 text-center font-body-sm text-body-sm text-surface-variant">
<p>© 2025 FitZone Sports Center. Bản quyền thuộc về FitZone Vietnam. Tất cả quyền được bảo lưu.</p>
</div>
</div>
</footer>
<FloatingContactWidget />
    </>
  )
}
