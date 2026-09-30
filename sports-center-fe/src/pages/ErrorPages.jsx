import { Link } from 'react-router-dom'
import { ROLE_HOME, useAuth } from '../auth'
import { Icon, btnPrimary } from '../components/ui'

function ErrorPage({ code, title, text }) {
  const { auth } = useAuth()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-surface">
      <Icon name={code === 403 ? 'lock' : 'search_off'} className="text-6xl text-primary-container" />
      <h1 className="font-display-lg text-display-lg text-on-surface">{code}</h1>
      <p className="font-headline-sm text-headline-sm text-on-surface">{title}</p>
      <p className="text-secondary max-w-sm">{text}</p>
      <Link to={auth ? ROLE_HOME[auth.role] : '/'} className={btnPrimary}>
        {auth ? 'Về trang của tôi' : 'Về trang chủ'}
      </Link>
    </div>
  )
}

export const Forbidden = () => <ErrorPage code={403} title="Không có quyền truy cập" text="Tài khoản của bạn không được phép xem trang này." />
export const NotFound = () => <ErrorPage code={404} title="Không tìm thấy trang" text="Đường dẫn không tồn tại hoặc đã bị di chuyển." />
