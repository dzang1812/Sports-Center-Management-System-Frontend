import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import AiChatWidget from './components/AiChatWidget'
import AppLayout from './components/Layouts'
import AuditLogsPage from './pages/AuditLogsPage'
import CatalogPage from './pages/CatalogPage'
import ClassesPage from './pages/ClassesPage'
import CoachAvailabilityPage from './pages/CoachAvailabilityPage'
import CoachSessionsPage from './pages/CoachSessionsPage'
import { Forbidden, NotFound } from './pages/ErrorPages'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import LoginPage from './pages/LoginPage'
import ManagerClassesPage from './pages/ManagerClassesPage'
import ManagerDashboardPage from './pages/ManagerDashboardPage'
import ManagerPackagesPage from './pages/ManagerPackagesPage'
import ManagerReportsPage from './pages/ManagerReportsPage'
import ManagerPtBookingsPage from './pages/ManagerPtBookingsPage'
import MemberPtPage from './pages/MemberPtPage'
import MemberSubscriptionPage from './pages/MemberSubscriptionPage'
import MemberTrainingPage from './pages/MemberTrainingPage'
import MyMemberSchedulePage from './pages/MyMemberSchedulePage'
import NewsPage from './pages/NewsPage'
import PackagesPage from './pages/PackagesPage'
import PaymentResultPage from './pages/PaymentResultPage'
import ProfilePage from './pages/ProfilePage'
import ReceptionClassBookingPage from './pages/ReceptionClassBookingPage'
import ReceptionMemberPage from './pages/ReceptionMemberPage'
import ReceptionPaymentsPage from './pages/ReceptionPaymentsPage'
import ReceptionSchedulePage from './pages/ReceptionSchedulePage'
import ReceptionPtBookingPage from './pages/ReceptionPtBookingPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import TrainersPage from './pages/TrainersPage'
import UsersPage from './pages/UsersPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import VerifyRequiredPage from './pages/VerifyRequiredPage'
import HomePage from './pages/static/HomePage'
import MemberSchedule from './pages/static/MemberSchedule'
import ReceptionCheckIn from './pages/ReceptionCheckIn'
import ReceptionDesk from './pages/ReceptionDesk'

// Must be logged in. A temp password has to be changed before anything else (AUTH-03).
function RequireAuth() {
  const { auth } = useAuth()
  const location = useLocation()
  if (!auth) return <Navigate to="/login" state={{ from: location }} replace />
  if (auth.mustChangePassword && location.pathname !== '/profile') return <Navigate to="/profile" replace />
  if (!auth.emailVerified) return <VerifyRequiredPage />
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
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/trainers" element={<TrainersPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/403" element={<Forbidden />} />

          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<ProfilePage />} />
            {/* The two URLs PayOS actually redirects to (hardcoded backend-side), plus /checkout/result as an alias. */}
            <Route path="/payment/success" element={<PaymentResultPage />} />
            <Route path="/payment/cancel" element={<PaymentResultPage />} />
            <Route path="/checkout/result" element={<PaymentResultPage />} />

            <Route element={<RequireRole roles={['Manager']} />}>
              <Route path="/manager" element={<Navigate to="/manager/dashboard" replace />} />
              <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
              <Route path="/manager/users" element={<UsersPage />} />
              <Route path="/manager/audit-logs" element={<AuditLogsPage />} />
              <Route path="/manager/sports-rooms" element={<CatalogPage />} />
              <Route path="/manager/classes" element={<ManagerClassesPage />} />
              <Route path="/manager/pt-bookings" element={<ManagerPtBookingsPage />} />
              <Route path="/manager/packages" element={<ManagerPackagesPage />} />
              <Route path="/manager/reports" element={<ManagerReportsPage />} />
            </Route>

            <Route element={<RequireRole roles={['Receptionist']} />}>
              <Route path="/reception" element={<ReceptionDesk />} />
              <Route path="/reception/check-in" element={<ReceptionCheckIn />} />
              {/* Dedicated sell flow lives at /reception/members (plan picker + PayOS QR) — no need to duplicate it. */}
              <Route path="/reception/sell" element={<Navigate to="/reception/members" replace />} />
              <Route path="/reception/classes" element={<ReceptionClassBookingPage />} />
              <Route path="/reception/pt" element={<ReceptionPtBookingPage />} />
              <Route path="/reception/members" element={<ReceptionMemberPage />} />
              <Route path="/reception/members/:id" element={<ReceptionMemberPage />} />
              <Route path="/reception/schedule" element={<ReceptionSchedulePage />} />
              <Route path="/reception/payments" element={<ReceptionPaymentsPage />} />
            </Route>

            <Route element={<RequireRole roles={['Coach']} />}>
              <Route path="/coach" element={<Navigate to="/coach/schedule" replace />} />
              <Route path="/coach/schedule" element={<CoachSessionsPage />} />
              <Route path="/coach/availability" element={<CoachAvailabilityPage />} />
            </Route>

            <Route element={<RequireRole roles={['Member']} />}>
              <Route path="/member/classes" element={<MemberSchedule />} />
              <Route path="/member/schedule" element={<MyMemberSchedulePage />} />
              <Route path="/member/subscription" element={<MemberSubscriptionPage />} />
              <Route path="/member/pt" element={<MemberPtPage />} />
              <Route path="/member/training" element={<MemberTrainingPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <AiChatWidget />
      </AuthProvider>
    </BrowserRouter>
  )
}
