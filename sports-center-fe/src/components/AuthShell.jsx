import { Link } from 'react-router-dom'
import { Icon } from './ui'

const HERO = '/images/banner-auth.jpg'

export const Logo = () => (
  <Link to="/" className="flex items-center gap-3 bg-surface-container-lowest/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg">
    <img src="/logo.png" alt="FitZone" className="w-10 h-10 rounded-lg object-contain" />
    <div className="flex flex-col leading-tight">
      <span className="font-headline-sm text-headline-sm text-on-surface tracking-wider font-extrabold uppercase">
        Fit<span className="text-primary-container">Zone</span>
      </span>
      <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase">Sports Center</span>
    </div>
  </Link>
)

// Split-screen layout shared by login / register / forgot / reset (Stitch "Đăng nhập" design).
export default function AuthShell({ title, subtitle, icon = 'lock_open', children, footer }) {
  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-[#F8FAFC]">
      <div className="relative hidden lg:flex lg:w-1/2 bg-inverse-surface overflow-hidden flex-col justify-between p-14">
        <img src={HERO} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/95 via-primary-container/60 to-[#0F172A]/85 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-transparent to-transparent" />
        <div className="relative z-10">
          <Logo />
        </div>
        <div className="relative z-10 text-white">
          <h1 className="font-display-lg text-display-lg max-w-md">Nâng tầm phong độ, bứt phá giới hạn mỗi ngày.</h1>
          <p className="font-body-lg text-body-lg text-inverse-on-surface/90 mt-3 max-w-md">
            Quản lý lịch tập, đặt lớp và theo dõi tiến độ sức khoẻ chỉ với một chạm.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl p-8 sm:p-10 border border-surface-container-high/60">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">{title}</h2>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-container text-primary-container">
                <Icon name={icon} className="text-lg" />
              </span>
            </div>
            {subtitle && <p className="font-body-md text-body-md text-secondary">{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="text-center mt-6 font-body-sm text-body-sm text-secondary">{footer}</div>}
        </div>
      </div>
    </div>
  )
}

export const linkCls = 'font-label-md text-label-md text-primary-container font-semibold hover:text-primary hover:underline'
