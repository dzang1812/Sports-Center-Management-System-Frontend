import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { Logo } from './AuthShell'
import { Icon } from './ui'

// Lightweight header/content wrapper for public pages (/, /classes, /packages) — not gated by RequireAuth,
// so it can't reuse AppLayout. Shows a "Vào hệ thống" link when already logged in instead of Đăng nhập/Đăng ký.
export default function PublicShell({ children }) {
  const { auth } = useAuth()
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-6 font-label-lg text-body-md text-on-surface-variant">
            <Link to="/classes" className="hover:text-primary transition-colors">Lớp học</Link>
            <Link to="/packages" className="hover:text-primary transition-colors">Gói tập</Link>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">{children}</main>
    </div>
  )
}
