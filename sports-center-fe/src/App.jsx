import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import AppLayout from './components/Layouts'
import AuditLogsPage from './pages/AuditLogsPage'
import { Forbidden, NotFound } from './pages/ErrorPages'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import UsersPage from './pages/UsersPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import CoachSchedule from './pages/static/CoachSchedule'
import HomePage from './pages/static/HomePage'
import ManagerDashboard from './pages/static/ManagerDashboard'
import MemberSchedule from './pages/static/MemberSchedule'
import ReceptionCheckIn from './pages/static/ReceptionCheckIn'
import ReceptionDesk from './pages/static/ReceptionDesk'
import SellPackages from './pages/static/SellPackages'

// Must be logged in. A temp password has to be changed before anything else (AUTH-03).
function RequireAuth() {
  const { auth } = useAuth()
  const location = useLocation()
  if (!auth) return <Navigate to="/login" state={{ from: location }} replace />
  if (auth.mustChangePassword && location.pathname !== '/profile') return <Navigate to="/profile" replace />
  return <AppLayout />
}

// SYS-01: wrong role -> 403 page (the API enforces the same rule with 403).
function RequireRole({ roles }) {
  const { auth } = useAuth()
  return roles.includes(auth.role) ? <Outlet /> : <Navigate to="/403" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/403" element={<Forbidden />} />

          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<ProfilePage />} />

            <Route element={<RequireRole roles={['Manager']} />}>
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/users" element={<UsersPage />} />
              <Route path="/manager/audit-logs" element={<AuditLogsPage />} />
            </Route>

            <Route element={<RequireRole roles={['Receptionist']} />}>
              <Route path="/reception" element={<ReceptionDesk />} />
              <Route path="/reception/check-in" element={<ReceptionCheckIn />} />
              <Route path="/reception/sell" element={<SellPackages />} />
            </Route>

            <Route element={<RequireRole roles={['Coach']} />}>
              <Route path="/coach" element={<CoachSchedule />} />
            </Route>

            <Route element={<RequireRole roles={['Member']} />}>
              <Route path="/member/schedule" element={<MemberSchedule />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
