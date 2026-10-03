import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { ROLE_LABEL } from '../labels'
import { Alert, Icon } from './ui'

// Menu per role. Only pages that exist are listed.
const NAV = {
  Manager: [
    { to: '/manager', label: 'Tổng quan', icon: 'dashboard', end: true },
    { to: '/manager/users', label: 'Quản lý người dùng', icon: 'group' },
    { to: '/manager/catalog', label: 'Danh mục', icon: 'category' },
    { to: '/manager/classes', label: 'Lịch & lớp học', icon: 'calendar_month' },
    { to: '/manager/audit-logs', label: 'Nhật ký thao tác', icon: 'history' },
  ],
  Receptionist: [
    { to: '/reception', label: 'Quầy lễ tân', icon: 'support_agent', end: true },
    { to: '/reception/check-in', label: 'Check-in', icon: 'how_to_reg' },
    { to: '/reception/sell', label: 'Bán gói & thu phí', icon: 'point_of_sale' },
    { to: '/reception/classes', label: 'Đặt lớp cho hội viên', icon: 'event_available' },
    { to: '/reception/pt', label: 'Đặt PT cho hội viên', icon: 'fitness_center' },
  ],
  Coach: [
    { to: '/coach', label: 'Lịch dạy', icon: 'calendar_month', end: true },
    { to: '/coach/sessions', label: 'Điểm danh buổi học', icon: 'fact_check' },
    { to: '/coach/availability', label: 'Khung giờ nhận PT', icon: 'schedule' },
  ],
  Member: [
    { to: '/member/schedule', label: 'Lịch lớp học', icon: 'calendar_month' },
    { to: '/member/my-schedule', label: 'Lịch của tôi', icon: 'event_note' },
    { to: '/member/pt', label: 'Đặt PT', icon: 'fitness_center' },
  ],
}

function VerifyBanner() {
  const { auth } = useAuth()
  const [msg, setMsg] = useState('')
  if (auth.emailVerified) return null

  const resend = async () => {
    try {
      await api('/auth/resend-verification', { method: 'POST' })
      setMsg('Đã gửi lại email xác thực, vui lòng kiểm tra hộp thư.')
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <Alert type="warning" className="mb-4">
      {msg || 'Email của bạn chưa được xác thực.'}{' '}
      {!msg && (
        <button onClick={resend} className="underline font-semibold">
          Gửi lại email xác thực
        </button>
      )}
    </Alert>
  )
}

function UserChip() {
  const { auth, logout } = useAuth()
  return (
    <div className="flex items-center gap-space-sm">
      <Link to="/profile" className="flex items-center gap-space-sm p-1 rounded-lg hover:bg-surface-container-high" title="Hồ sơ cá nhân">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Icon name="person" className="text-on-primary text-[18px]" />
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="font-label-md text-label-md text-on-surface leading-tight">{auth.fullName}</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight">{ROLE_LABEL[auth.role]}</span>
        </div>
      </Link>
      <button onClick={logout} title="Đăng xuất" className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high">
        <Icon name="logout" className="text-[22px]" />
      </button>
    </div>
  )
}

// Dark sidebar layout for Manager / Receptionist / Coach (Stitch dashboard style).
function StaffLayout() {
  const { auth } = useAuth()
  const [open, setOpen] = useState(false)
  const link = ({ isActive }) =>
    `flex items-center gap-3 px-space-md py-2.5 rounded-lg font-label-md text-label-md transition-colors ${
      isActive ? 'bg-primary-container text-on-primary' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-surface">
      {open && <div className="fixed inset-0 z-40 bg-[#0F172A]/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#0F172A] text-slate-100 z-50 flex flex-col transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-space-md flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
              <Icon name="fitness_center" className="text-on-primary text-[18px]" />
            </div>
            <span className="font-headline-sm text-headline-sm font-bold text-white">FitZone</span>
          </div>
          <span className="px-space-xs py-0.5 rounded bg-tertiary-container text-on-tertiary font-label-sm text-label-sm uppercase">
            {ROLE_LABEL[auth.role]}
          </span>
        </div>
        <nav className="flex-1 px-space-md py-space-sm space-y-1 overflow-y-auto" onClick={() => setOpen(false)}>
          {NAV[auth.role].map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={link}>
              <Icon name={n.icon} className="text-[20px]" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-space-md">
          <NavLink to="/profile" className={link}>
            <Icon name="manage_accounts" className="text-[20px]" />
            Hồ sơ cá nhân
          </NavLink>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-30 flex items-center justify-between px-space-lg">
          <button className="lg:hidden p-2 rounded-lg hover:bg-surface-container-high" onClick={() => setOpen(true)} aria-label="Mở menu">
            <Icon name="menu" />
          </button>
          <div className="ml-auto">
            <UserChip />
          </div>
        </header>
        <main className="pt-16 px-space-lg py-space-lg min-h-screen">
          <div className="pt-space-lg">
            <VerifyBanner />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

// Top-nav layout for members (Stitch "Lịch lớp học" style).
function MemberLayout() {
  const link = ({ isActive }) =>
    `px-3.5 py-2 rounded-lg font-label-md text-label-md transition-all ${
      isActive ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
    }`

  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,23,42,0.06)]">
        <div className="h-16 w-full max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
              <Icon name="fitness_center" className="text-on-primary text-[18px]" />
            </div>
            <span className="font-headline-md text-headline-md font-bold text-on-surface">FitZone</span>
          </Link>
          <nav className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl">
            {NAV.Member.map((n) => (
              <NavLink key={n.to} to={n.to} className={link}>
                {n.label}
              </NavLink>
            ))}
            <NavLink to="/profile" className={link}>
              Hồ sơ
            </NavLink>
          </nav>
          <UserChip />
        </div>
      </header>
      <main className="pt-16 w-full max-w-7xl mx-auto px-6 lg:px-12">
        <div className="pt-space-lg">
          <VerifyBanner />
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default function AppLayout() {
  const { auth } = useAuth()
  return auth.role === 'Member' ? <MemberLayout /> : <StaffLayout />
}
