import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import PublicShell from '../components/PublicShell'
import { Avatar, Icon } from '../components/ui'

// Public coach directory, GET /pt/coaches (no auth required).
export default function TrainersPage() {
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/pt/coaches')
      .then(setCoaches)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <PublicShell
      hero={
        <div className="relative w-full h-64 sm:h-80 overflow-hidden">
          <img src="/images/banner-home-1.jpg" alt="Đội ngũ huấn luyện viên FitZone" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/60 to-inverse-surface/20" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-6 text-white">
            <span className="font-label-md text-label-md uppercase tracking-wider text-tertiary-fixed mb-2">Đội ngũ chuyên môn</span>
            <h1 className="font-display-md text-display-md">Huấn luyện viên giàu kinh nghiệm</h1>
            <p className="text-white/85 mt-2 max-w-xl">Đội ngũ PT được chứng nhận chuyên môn, sẵn sàng đồng hành cùng mục tiêu tập luyện của bạn.</p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-8">
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
    </PublicShell>
  )
}
