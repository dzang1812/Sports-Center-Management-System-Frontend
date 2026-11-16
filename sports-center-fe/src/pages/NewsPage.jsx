import PublicShell from '../components/PublicShell'
import { NEWS_ITEMS } from '../newsItems'

export default function NewsPage() {
  return (
    <PublicShell banner="/images/banner-news.jpg" bannerRatio="2560 / 720" eyebrow="Cập nhật mới nhất" title="Tin tức & Khuyến mãi" subtitle="Ưu đãi, sự kiện và tin tức mới nhất từ FitZone Sports Center.">
      <div className="flex flex-col gap-8">
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
    </PublicShell>
  )
}
