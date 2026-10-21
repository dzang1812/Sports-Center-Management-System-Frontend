// Static UI exported from Stitch. Data is hardcoded until the real API is wired in.
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../auth'
import { api, query } from '../../api'
import { Avatar, Icon } from '../../components/ui'
import { addDays, fromTimeOnly, toDateOnly } from '../../dateUtils'
import { LEVEL_LABEL } from '../../labels'

const HOME_BANNERS = [
  '/images/banner-home-1.jpg',
  '/images/banner-home-2.jpg',
  '/images/banner-home-3.jpg',
  '/images/banner-home-4.jpg',
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

const SEAT_TONE = (remaining, capacity) =>
  remaining <= 0 ? 'bg-outline-variant/40 text-on-surface-variant' : remaining <= capacity * 0.3 ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-fixed'

// Real upcoming sessions (next 7 days), same public GET /sessions ClassesPage.jsx uses.
function ClassesSection() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = toDateOnly(new Date())
    api(`/sessions${query({ from: today, to: addDays(today, 7), pageSize: 6 })}`)
      .then(({ items }) => setSessions(items.filter((s) => s.status === 'Scheduled')))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-16 bg-surface" id="classes">
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

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${loading ? 'opacity-50' : ''}`}>
          {sessions.map((s) => (
            <div key={s.id} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border-l-4 border-l-primary flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant">{LEVEL_LABEL[s.level] ?? s.level}</span>
                  <span className={`font-label-sm text-label-sm px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${SEAT_TONE(s.remainingSeats, s.capacity)}`}>
                    {s.remainingSeats > 0 ? `Còn ${s.remainingSeats}/${s.capacity} chỗ` : 'Đã kín chỗ'}
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{s.className}</h3>
                <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm mb-4">
                  <Icon name="schedule" className="text-sm" />
                  <span>{s.date} • {fromTimeOnly(s.startTime)}-{fromTimeOnly(s.endTime)} • {s.room}</span>
                </div>
              </div>
              <Link to="/login" className="mt-2 w-full text-center py-2.5 px-4 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg hover:opacity-90 transition-opacity">
                Đăng nhập để đặt chỗ
              </Link>
            </div>
          ))}
          {!loading && !sessions.length && (
            <p className="text-secondary text-center py-10 col-span-full">Hiện chưa có buổi học nào mở trong 7 ngày tới.</p>
          )}
        </div>
      </div>
    </section>
  )
}

// Public coach directory, GET /pt/coaches (no auth required).
function TrainersSection() {
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/pt/coaches')
      .then((list) => setCoaches(list.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-16 bg-surface-container-low" id="trainers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="font-label-md text-label-md text-tertiary-container uppercase tracking-wider block mb-2">ĐỘI NGŨ CHUYÊN MÔN</span>
          <h2 className="font-headline-xl text-headline-xl text-on-surface">Huấn luyện viên giàu kinh nghiệm</h2>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${loading ? 'opacity-50' : ''}`}>
          {coaches.map((c) => (
            <div key={c.id} className="group bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col text-center overflow-hidden">
              <div className="h-20 bg-gradient-to-br from-primary-container to-tertiary-container relative">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  <Avatar src={c.avatarUrl} className="w-20 h-20 ring-4 ring-surface-container-lowest shadow-md" />
                </div>
              </div>

              <div className="pt-12 pb-6 px-5 flex flex-col items-center flex-1">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">{c.fullName}</h3>
                {c.certifications && (
                  <p className="font-label-sm text-label-sm text-primary-container mt-1 flex items-center gap-1">
                    <Icon name="verified" className="text-sm" />
                    {c.certifications}
                  </p>
                )}
                {c.bio && <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 line-clamp-3">{c.bio}</p>}
                {c.sports.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                    {c.sports.map((sp) => (
                      <span key={sp.id} className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-tertiary-container font-label-sm text-label-sm">{sp.name}</span>
                    ))}
                  </div>
                )}
                <Link
                  to="/login"
                  className="mt-5 w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-primary-container text-primary-container font-label-md text-label-md group-hover:bg-primary-container group-hover:text-on-primary transition-colors"
                >
                  <Icon name="event_available" className="text-base" />
                  Đặt lịch PT
                </Link>
              </div>
            </div>
          ))}
          {!loading && !coaches.length && (
            <p className="text-secondary text-center py-10 col-span-full">Chưa có huấn luyện viên nào được công khai.</p>
          )}
        </div>
      </div>
    </section>
  )
}

// Static promo content — no news/promotions API exists yet; same convention as the rest of this
// Stitch-exported page (hardcoded until a real backend feed is wired in).
const NEWS_ITEMS = [
  {
    banner: '/images/banner-news-1.jpg',
    tag: 'Khuyến mãi',
    title: 'Giảm 20% gói năm khi đăng ký theo nhóm từ 3 người',
    desc: 'Áp dụng cho mọi gói Combo và PT trọn gói, đăng ký trước cuối tháng để nhận ưu đãi.',
  },
  {
    banner: '/images/banner-news-2.jpg',
    tag: 'Tin tức',
    title: 'Khai trương chi nhánh FitZone thứ 5 tại Hà Nội',
    desc: 'Không gian tập luyện 2.000m² với hồ bơi vô cực và phòng xông hơi đá muối Himalaya.',
  },
  {
    banner: '/images/banner-news-3.jpg',
    tag: 'Sự kiện',
    title: 'Giải chạy FitZone Run 10K — mở đăng ký miễn phí',
    desc: 'Dành cho hội viên đang có gói hoạt động, nhận áo và huy chương hoàn thành miễn phí.',
  },
]

function NewsSection() {
  return (
    <section className="py-16 bg-surface" id="news">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="font-label-md text-label-md text-tertiary-container uppercase tracking-wider block mb-2">CẬP NHẬT MỚI NHẤT</span>
          <h2 className="font-headline-xl text-headline-xl text-on-surface">Tin tức &amp; Khuyến mãi</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {NEWS_ITEMS.map((n) => (
            <div key={n.title} className="relative rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden aspect-[3/4] group">
              <img src={n.banner} alt={n.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/40 to-transparent" />
              <span className="absolute top-3 left-3 font-label-sm text-label-sm text-on-tertiary-container bg-tertiary-fixed/90 backdrop-blur-sm uppercase tracking-wide px-2.5 py-1 rounded-full">
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

export default function HomePage() {
  const { auth } = useAuth()
  return (
    <>
<header className="sticky top-0 z-50 w-full bg-gradient-to-r from-primary-container/15 via-surface-container-lowest/95 to-tertiary-container/15 backdrop-blur-md shadow-sm border-b-2 border-primary-container/40 transition-all duration-300">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

<a className="flex items-center gap-3 group" href="#">
<img alt="FitZone Sports Center" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" src="/logo.png" />
<span className="font-headline-sm text-headline-sm font-extrabold uppercase text-on-surface tracking-wider">Fit<span className="text-primary-container">Zone</span></span>
</a>

<nav className="hidden md:flex items-center gap-8 font-label-lg text-body-md text-on-surface-variant">
<a className="text-primary font-headline-sm transition-colors" href="#home">Trang chủ</a>
<a className="hover:text-primary transition-colors" href="#classes">Lớp học</a>
<a className="hover:text-primary transition-colors" href="#pricing">Gói tập</a>
<a className="hover:text-primary transition-colors" href="#trainers">Huấn luyện viên</a>
<a className="hover:text-primary transition-colors" href="#news">Tin tức &amp; Khuyến mãi</a>
</nav>

<div className="flex items-center gap-3">
{auth ? (
<Link className="inline-flex items-center gap-2 justify-center font-label-lg text-label-lg px-5 py-2.5 rounded-lg bg-primary-container text-on-primary hover:opacity-90 shadow-sm transition-all" to="/profile">
<Icon name="person" className="text-lg" />
          Vào hệ thống
        </Link>
) : (
<>
<Link className="hidden sm:inline-flex items-center justify-center font-label-lg text-label-lg px-4 py-2 rounded-lg text-primary hover:bg-surface-container-low transition-colors" to="/login">
          Đăng nhập
        </Link>
<Link className="inline-flex items-center justify-center font-label-lg text-label-lg px-5 py-2.5 rounded-lg bg-primary-container text-on-primary hover:opacity-90 shadow-sm transition-all" to="/register">
          Đăng ký ngay
        </Link>
</>
)}
</div>
</div>
</header>
<main className="w-full min-h-screen bg-[#F8FAFC] flex items-center justify-center p-margin-mobile md:p-margin"><div className="flex flex-col w-full">

<section className="relative overflow-hidden py-12 lg:py-20 bg-surface" id="home">
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
<a className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-lg text-label-lg transition-all" href="#classes">
<span className="material-symbols-outlined text-base">calendar_today</span>
<span>Xem lịch lớp hôm nay</span>
</a>
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

<section className="py-16 bg-surface-container-low">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="text-center max-w-3xl mx-auto mb-12">
<span className="font-label-md text-label-md text-tertiary-container uppercase tracking-wider block mb-2">BỘ MÔN TẬP LUYỆN ĐA DẠNG</span>
<h2 className="font-headline-xl text-headline-xl text-on-surface">
          Khám phá thế giới rèn luyện chuẩn 5 sao tại FitZone
        </h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container mb-4">
<span className="material-symbols-outlined text-2xl">fitness_center</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-2">Gym &amp; Thể hình</h3>
<p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Hệ thống máy tập tạ tự do, cardio hiện đại nhập khẩu trực tiếp cùng lộ trình PT 1:1 cá nhân hóa chuyên sâu.
            </p>
<ul className="space-y-2 font-body-sm text-body-sm text-secondary mb-6">
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                Dàn máy cơ sinh học Technogym
              </li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                Huấn luyện viên chuẩn quốc tế
              </li>
</ul>
</div>
<a className="inline-flex items-center gap-1 font-label-md text-label-md text-primary-container hover:gap-2 transition-all" href="#gym">
<span>Tìm hiểu thêm</span>
<span className="material-symbols-outlined text-sm">arrow_forward</span>
</a>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container mb-4">
<span className="material-symbols-outlined text-2xl">self_improvement</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-2">Yoga &amp; Thiền định</h3>
<p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Vinyasa, Hatha, Aerial Yoga cùng Master Ấn Độ. Cân bằng năng lượng, xoa dịu tâm trí và dẻo dai cơ thể.
            </p>
<ul className="space-y-2 font-body-sm text-body-sm text-secondary mb-6">
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                Studio lọc khí ion âm tĩnh lặng
              </li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                Giảng viên chuẩn Yoga Alliance
              </li>
</ul>
</div>
<a className="inline-flex items-center gap-1 font-label-md text-label-md text-primary-container hover:gap-2 transition-all" href="#yoga">
<span>Tìm hiểu thêm</span>
<span className="material-symbols-outlined text-sm">arrow_forward</span>
</a>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container mb-4">
<span className="material-symbols-outlined text-2xl">accessibility_new</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-2">Pilates Reformer</h3>
<p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Máy tập Reformer chuyên dụng tăng cơ lõi vững chắc, nắn chỉnh cột sống và định hình đường cong chuẩn xác.
            </p>
<ul className="space-y-2 font-body-sm text-body-sm text-secondary mb-6">
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                Máy móc chuyển động êm mượt
              </li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                Sĩ số lớp giới hạn dưới 8 học viên
              </li>
</ul>
</div>
<a className="inline-flex items-center gap-1 font-label-md text-label-md text-primary-container hover:gap-2 transition-all" href="#pilates">
<span>Tìm hiểu thêm</span>
<span className="material-symbols-outlined text-sm">arrow_forward</span>
</a>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container mb-4">
<span className="material-symbols-outlined text-2xl">timer</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-2">HIIT &amp; Functional</h3>
<p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Tập luyện cường độ cao ngắt quãng giúp đốt mỡ tối đa, tăng sức bền tim mạch với âm nhạc bùng nổ nhiệt huyết.
            </p>
<ul className="space-y-2 font-body-sm text-body-sm text-secondary mb-6">
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                Đo nhịp tim thời gian thực
              </li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                Tiêu hao lên tới 800 kcal/giờ
              </li>
</ul>
</div>
<a className="inline-flex items-center gap-1 font-label-md text-label-md text-primary-container hover:gap-2 transition-all" href="#hiit">
<span>Tìm hiểu thêm</span>
<span className="material-symbols-outlined text-sm">arrow_forward</span>
</a>
</div>
</div>
</div>
</section>

<ClassesSection />
<TrainersSection />
<NewsSection />
<section className="py-16 bg-surface-container-low" id="pricing">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="text-center max-w-3xl mx-auto mb-16">
<span className="font-label-md text-label-md text-tertiary-container uppercase tracking-wider block mb-2">BẢNG GIÁ DỊCH VỤ LINH HOẠT</span>
<h2 className="font-headline-xl text-headline-xl text-on-surface">Chọn gói tập phù hợp với mục tiêu của bạn</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">Cam kết chi phí minh bạch, không phụ phí ẩn, bảo lưu linh hoạt</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">

<div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between">
<div>
<h3 className="font-headline-md text-headline-md text-on-surface">Gym 1 tháng</h3>
<p className="font-body-sm text-body-sm text-secondary mt-1">Trải nghiệm tiện ích gym căn bản</p>
<div className="my-6">
<span className="font-display-lg text-display-lg text-on-surface">450.000đ</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">/ tháng</span>
</div>
<ul className="space-y-3 font-body-sm text-body-sm text-on-surface-variant mb-6">
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-sm text-primary mt-0.5">check</span>
<span>Không giới hạn giờ tập tại chi nhánh</span>
</li>
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-sm text-primary mt-0.5">check</span>
<span>Tủ locker thông minh &amp; phòng tắm nóng lạnh</span>
</li>
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-sm text-primary mt-0.5">check</span>
<span>Đo chỉ số InBody miễn phí hàng tháng</span>
</li>
</ul>
</div>
<button className="w-full py-2.5 px-4 rounded-lg bg-surface-container text-primary font-label-lg text-label-lg hover:bg-surface-container-high transition-colors">
            Chọn gói này
          </button>
</div>

<div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between">
<h3 className="font-headline-md text-headline-md text-on-surface">Gym 3 tháng</h3>
<span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-secondary-container text-on-secondary-fixed">Tiết kiệm 150K</span>
</div>
<p className="font-body-sm text-body-sm text-secondary mt-1">Bắt đầu thói quen bền vững</p>
<div className="my-6">
<span className="font-display-lg text-display-lg text-on-surface">1.200.000đ</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">/ 3 tháng</span>
</div>
<ul className="space-y-3 font-body-sm text-body-sm text-on-surface-variant mb-6">
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-sm text-primary mt-0.5">check</span>
<span>Tất cả quyền lợi của gói 1 tháng</span>
</li>
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-sm text-primary mt-0.5">check</span>
<span>Tặng 01 buổi tập định hướng cùng PT riêng</span>
</li>
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-sm text-primary mt-0.5">check</span>
<span>Giảm 10% đồ uống dinh dưỡng tại Healthy Bar</span>
</li>
</ul>
</div>
<button className="w-full py-2.5 px-4 rounded-lg bg-surface-container text-primary font-label-lg text-label-lg hover:bg-surface-container-high transition-colors">
            Chọn gói này
          </button>
</div>

<div className="bg-surface-container-lowest rounded-xl p-6 shadow-xl relative lg:-translate-y-3 flex flex-col justify-between border-2 border-primary-container">
<div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-tertiary-container text-on-tertiary font-label-sm text-label-sm px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
<span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
<span>Gói được chọn nhiều nhất</span>
</div>
<div>
<h3 className="font-headline-md text-headline-md text-primary-container mt-2">All-Access VIP</h3>
<p className="font-body-sm text-body-sm text-secondary mt-1">Trọn quyền trải nghiệm cao cấp nhất</p>
<div className="my-6">
<span className="font-display-lg text-display-lg text-on-surface">990.000đ</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">/ tháng</span>
</div>
<ul className="space-y-3 font-body-sm text-body-sm text-on-surface-variant mb-6">
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-sm text-primary-container mt-0.5">check_circle</span>
<span className="font-semibold text-on-surface">Không giới hạn Gym, Yoga, Pilates &amp; HIIT</span>
</li>
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-sm text-primary-container mt-0.5">check_circle</span>
<span>Tặng 03 buổi hướng dẫn PT riêng</span>
</li>
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-sm text-primary-container mt-0.5">check_circle</span>
<span>Miễn phí khăn tập cao cấp &amp; nước bù khoáng</span>
</li>
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-sm text-primary-container mt-0.5">check_circle</span>
<span>Khu xông hơi khô &amp; đá muối Himalaya</span>
</li>
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-sm text-primary-container mt-0.5">check_circle</span>
<span>Ưu tiên đặt chỗ sớm mọi khung giờ</span>
</li>
</ul>
</div>
<Link to="/register" className="w-full py-3 px-4 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:opacity-90 transition-opacity">
            Đăng ký ngay gói VIP
          </Link>
</div>

<div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between">
<div>
<h3 className="font-headline-md text-headline-md text-on-surface">Yoga &amp; Class</h3>
<p className="font-body-sm text-body-sm text-secondary mt-1">Chuyên sâu cho các lớp nhóm</p>
<div className="my-6">
<span className="font-display-lg text-display-lg text-on-surface">700.000đ</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">/ tháng</span>
</div>
<ul className="space-y-3 font-body-sm text-body-sm text-on-surface-variant mb-6">
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-sm text-primary mt-0.5">check</span>
<span>Tham gia mọi lớp Yoga, Dance &amp; GroupX</span>
</li>
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-sm text-primary mt-0.5">check</span>
<span>Thảm tập và dụng cụ khử khuẩn chuẩn y tế</span>
</li>
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-sm text-primary mt-0.5">check</span>
<span>Huấn luyện viên quốc tế trực tiếp giảng dạy</span>
</li>
<li className="flex items-start gap-2">
<span className="material-symbols-outlined text-sm text-primary mt-0.5">check</span>
<span>Tham gia workshop trị liệu phục hồi cơ thể</span>
</li>
</ul>
</div>
<button className="w-full py-2.5 px-4 rounded-lg bg-surface-container text-primary font-label-lg text-label-lg hover:bg-surface-container-high transition-colors">
            Chọn gói này
          </button>
</div>
</div>
</div>
</section>
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
    </>
  )
}
