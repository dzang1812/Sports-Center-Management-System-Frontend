import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'
import { Flow2TimeRulesProvider, Flow2TimeRulesSwitch } from '../flow2TimeRules'
import { ROLE_LABEL } from '../labels'
import { Avatar, Icon } from './ui'
import Notifications from './Notifications'

// Menu per role. Only pages that exist are listed.
const NAV = {
  Manager: [
    { to: '/manager/dashboard', label: 'Tổng quan', icon: 'dashboard', group: 'Vận hành' },
    { to: '/manager/courses', label: 'Khóa học & lịch', icon: 'school', group: 'Vận hành' },
    { to: '/manager/pt-bookings', label: 'Lịch PT & giá buổi', icon: 'fitness_center', group: 'Vận hành' },
    { to: '/manager/users', label: 'Hội viên & nhân sự', icon: 'group', group: 'Quản trị' },
    { to: '/manager/reports', label: 'Báo cáo doanh thu', icon: 'monitoring', group: 'Quản trị' },
    { to: '/manager/settings', label: 'Danh mục & nhật ký', icon: 'tune', group: 'Quản trị' },
  ],
  Receptionist: [
    { to: '/reception', label: 'Quầy lễ tân', icon: 'support_agent', end: true, group: 'Tiếp đón' },
    { to: '/reception/members', label: 'Hội viên', icon: 'group', group: 'Tiếp đón' },
    { to: '/reception/schedule', label: 'Khóa học & lịch', icon: 'school', group: 'Dịch vụ' },
    { to: '/reception/pt', label: 'Đặt PT', icon: 'fitness_center', group: 'Dịch vụ' },
    { to: '/reception/payments', label: 'Thanh toán', icon: 'payments', group: 'Thu ngân' },
  ],
  Coach: [
    { to: '/coach/schedule', label: 'Lịch dạy', icon: 'calendar_month' },
    { to: '/coach/availability', label: 'Khung giờ nhận PT', icon: 'schedule' },
  ],
  Member: [
    { to: '/member/classes', label: 'Khám phá', icon: 'explore' },
    { to: '/member/schedule', label: 'Lịch của tôi', icon: 'event_note' },
    { to: '/member/wallet', label: 'Số dư', icon: 'account_balance_wallet' },
    { to: '/profile', label: 'Hồ sơ', icon: 'person' },
  ],
}

function UserChip() {
  const { auth, logout } = useAuth()
  return (
    <div className="flex items-center gap-space-sm">
      <Link to="/profile" className="flex items-center gap-space-sm p-1 rounded-lg hover:bg-surface-container-high" title="Hồ sơ cá nhân">
        <Avatar src={auth.avatarUrl} />
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
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  // Desktop collapse (icon-only rail), remembered across reloads. Separate from the mobile overlay toggle above.
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sc_sidebar_collapsed') === '1')
  useEffect(() => localStorage.setItem('sc_sidebar_collapsed', collapsed ? '1' : '0'), [collapsed])

  const link = ({ isActive }) =>
    `flex items-center gap-3 px-space-md py-2.5 rounded-lg font-label-md text-label-md transition-colors ${
      isActive ? 'bg-primary-container text-on-primary' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`
  const asideWidth = collapsed ? 'lg:w-20' : 'lg:w-64'
  const mainOffset = collapsed ? 'lg:pl-20' : 'lg:pl-64'

  return (
    <div className="min-h-screen bg-surface">
      {open && <div className="fixed inset-0 z-40 bg-[#0F172A]/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={`fixed left-0 top-0 h-full w-64 ${asideWidth} bg-[#0F172A] text-slate-100 z-50 flex flex-col transition-all lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className={`px-space-md pt-5 pb-4 flex flex-col gap-2.5 ${collapsed ? 'lg:items-center lg:px-2' : ''}`}>
          <div className={`flex items-center gap-space-sm ${collapsed ? 'lg:justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-space-sm">
              <img src="/logo.png" alt="FitZone" className="w-8 h-8 rounded-lg object-contain shrink-0" />
              <span className={`font-headline-sm text-headline-sm font-bold text-white ${collapsed ? 'lg:hidden' : ''}`}>FitZone</span>
            </div>
            <button
              className="hidden lg:flex p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white shrink-0"
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            >
              <Icon name={collapsed ? 'chevron_right' : 'chevron_left'} className="text-[20px]" />
            </button>
          </div>
          <span className={`self-start inline-flex items-center px-2.5 py-1 rounded-full bg-tertiary-container text-on-tertiary font-label-sm text-label-sm whitespace-nowrap ${collapsed ? 'lg:hidden' : ''}`}>
            {ROLE_LABEL[auth.role]}
          </span>
        </div>
        <nav className="flex-1 px-space-md py-space-sm space-y-1 overflow-y-auto overflow-x-hidden" onClick={() => setOpen(false)}>
          {NAV[auth.role].map((n, index) => (
            <div key={n.to}>
            {n.group && (index === 0 || NAV[auth.role][index - 1].group !== n.group) && <p className={`px-3 pt-4 pb-2 text-[10px] font-semibold tracking-wider uppercase text-slate-500 ${collapsed ? 'lg:hidden' : ''}`}>{n.group}</p>}
            <NavLink to={n.to} end={n.end} className={link} title={collapsed ? n.label : undefined}>
              <Icon name={n.icon} className="text-[20px] shrink-0" />
              <span className={collapsed ? 'lg:hidden' : ''}>{n.label}</span>
              {n.badge && <n.badge />}
            </NavLink>
            </div>
          ))}
        </nav>
        <div className="p-space-md">
          <NavLink to="/profile" className={link} title={collapsed ? 'Hồ sơ cá nhân' : undefined}>
            <Icon name="manage_accounts" className="text-[20px] shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>Hồ sơ cá nhân</span>
          </NavLink>
        </div>
      </aside>

      <div className={mainOffset}>
        <header className={`fixed top-0 left-0 ${collapsed ? 'lg:left-20' : 'lg:left-64'} right-0 h-16 bg-gradient-to-r from-primary-container/15 via-surface/90 to-tertiary-container/15 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b-2 border-primary-container/40 z-30 flex items-center justify-between px-space-lg transition-all`}>
          <button className="lg:hidden p-2 rounded-lg hover:bg-surface-container-high" onClick={() => setOpen(true)} aria-label="Mở menu">
            <Icon name="menu" />
          </button>
          {auth.role !== 'Coach' && <span className="hidden md:block text-body-sm text-secondary truncate mr-3">{ROLE_LABEL[auth.role]}<span className="mx-2 text-outline">/</span><b className="text-on-surface">{NAV[auth.role].find(item => item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + '/'))?.label ?? 'Hồ sơ'}</b></span>}
          <div className="ml-auto flex items-center gap-2">
            <Flow2TimeRulesSwitch />
            <Notifications />
            <UserChip />
          </div>
        </header>
        <main className="pt-16 px-space-lg py-space-lg min-h-screen">
          <div className={`pt-space-lg ${auth.role !== 'Coach' ? 'max-w-[1600px] mx-auto pb-8' : ''}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

// Top-nav layout for members (Stitch "Lịch lớp học" style).
function MemberLayout() {
  const { pathname } = useLocation()
  const link = ({ isActive }) =>
    `min-w-0 flex items-center justify-center gap-2 px-1.5 sm:px-4 py-2 rounded-lg font-label-md text-xs sm:text-label-md whitespace-nowrap transition-all ${
      isActive ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
    }`

  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-primary-container/15 via-surface/90 to-tertiary-container/15 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,23,42,0.06)] border-b-2 border-primary-container/40">
        <div className="h-28 lg:h-16 w-full max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 lg:py-0">
          <Link to="/member/classes" className="flex items-center gap-2 lg:order-1" aria-label="FitZone — Khám phá">
            <img src="/logo.png" alt="FitZone" className="w-8 h-8 rounded-lg object-contain" />
            <span className="font-headline-md text-headline-md font-bold text-on-surface">FitZone</span>
          </Link>
          <nav aria-label="Điều hướng hội viên" className="order-3 lg:order-2 w-full lg:w-auto grid grid-cols-4 gap-1 p-1 bg-surface-container-low rounded-xl">
            {NAV.Member.map((n) => (
              <NavLink key={n.to} to={n.to} className={link}>
                <Icon name={n.icon} className="hidden sm:inline text-[20px]" />{n.label}
              </NavLink>
            ))}
          </nav>
          <div className="lg:order-3 flex items-center gap-1"><Notifications /><UserChip /></div>
        </div>
      </header>
      <main className={`pt-28 lg:pt-16 pb-10 w-full mx-auto ${pathname === '/member/schedule' ? 'max-w-[1800px] px-4 lg:px-6' : 'max-w-7xl px-4 sm:px-6 lg:px-10'}`}>
        <div className={pathname === '/member/classes' ? 'pt-4' : 'pt-6 sm:pt-8'}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default function AppLayout() {
  const { auth } = useAuth()
  return <Flow2TimeRulesProvider key={auth.token}>{auth.role === 'Member' ? <MemberLayout /> : <StaffLayout />}</Flow2TimeRulesProvider>
}
