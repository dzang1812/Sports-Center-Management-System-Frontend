import { Link } from 'react-router-dom'
import { Icon } from './ui'
import { CoachPortrait } from './MemberPtBookingPanel'
import { FeaturedBadge, RatingBadge } from './CoachRating'

// Public coach card shared by the homepage "HLV tiêu biểu" carousel and /trainers grid.
export default function CoachCard({ coach: c, className = '' }) {
  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-shadow ${className}`}>
      <div className="relative w-full">
        <CoachPortrait key={`${c.id}:${c.avatarUrl ?? ''}`} coach={c} />
        {c.isFeatured && <FeaturedBadge className="absolute top-3 left-3" />}
        <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-md bg-white/95 px-2 py-1 text-[11px] font-bold text-primary shadow-sm">{c.sports.map((sp) => sp.name).join(' · ') || 'Huấn luyện cá nhân'}</span>
      </div>
      <div className="flex-1 p-3 space-y-1.5">
        <h3 className="truncate text-lg font-bold text-slate-900" title={c.fullName}>{c.fullName}</h3>
        <RatingBadge coach={c} />
        {c.certifications && <p className="flex items-center gap-1 truncate text-[12px] font-semibold text-primary-container"><Icon name="verified" className="text-sm" />{c.certifications}</p>}
        <p className="min-h-8 line-clamp-2 text-body-sm leading-4 text-slate-500">{c.bio || 'Đăng nhập để xem hồ sơ và ảnh học viên của huấn luyện viên.'}</p>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2.5">
        <Link to="/login" className="inline-flex items-center gap-1 text-body-sm font-semibold text-primary hover:underline">
          <Icon name="event_available" className="text-base" />Đặt lịch PT
        </Link>
        <Icon name="arrow_outward" className="text-xl text-slate-300 group-hover:text-primary" />
      </div>
    </article>
  )
}
