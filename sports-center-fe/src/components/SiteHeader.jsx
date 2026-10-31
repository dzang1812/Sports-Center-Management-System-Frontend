import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth'
import { Logo } from './AuthShell'
import { Icon } from './ui'

const navLinkCls = ({ isActive }) =>
  `transition-colors ${isActive ? 'text-primary font-bold' : 'hover:text-primary'}`

// Shared by every public page (/, /classes, /packages, /trainers, /news) so the header never
// re-renders differently between them — only the active nav item changes.
export default function SiteHeader() {
  const { auth } = useAuth()
  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-primary-container/15 via-surface-container-lowest/95 to-tertiary-container/15 backdrop-blur-md shadow-sm border-b-2 border-primary-container/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-6 font-label-lg text-body-md text-on-surface-variant">
          <NavLink to="/" end className={navLinkCls}>Trang chủ</NavLink>
          <NavLink to="/classes" className={navLinkCls}>Lớp học</NavLink>
          <NavLink to="/packages" className={navLinkCls}>Gói tập</NavLink>
          <NavLink to="/trainers" className={navLinkCls}>Huấn luyện viên</NavLink>
          <NavLink to="/news" className={navLinkCls}>Tin tức &amp; Khuyến mãi</NavLink>
        </nav>
        <div className="flex items-center gap-3">
          {auth ? (
            <Link to="/profile" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg hover:opacity-90 transition-all">
              <Icon name="person" className="text-lg" />
              Vào hệ thống
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-primary hover:bg-surface-container-low font-label-lg text-label-lg transition-colors">
                Đăng nhập
              </Link>
              <Link to="/register" className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm hover:opacity-90 transition-all">
                Đăng ký ngay
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
