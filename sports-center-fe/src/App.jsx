import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import AiChatWidget from './components/AiChatWidget'
import AppLayout from './components/Layouts'
import { MemberCommerce } from './components/commerce'
import { InvoicePage } from './components/frontDesk'
import { MemberSupportPage, SupportDeskPage } from './components/support'
import ClassesPage from './pages/ClassesPage'
import CoachAvailabilityPage from './pages/CoachAvailabilityPage'
import CoachSessionsPage from './pages/CoachSessionsPage'
import { Forbidden, NotFound } from './pages/ErrorPages'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import LoginPage from './pages/LoginPage'
import ManagerCoursesPage from './pages/ManagerCoursesPage'
import CourseCreationPage from './pages/CourseCreationPage'
import ManagerDashboardPage from './pages/ManagerDashboardPage'
import ManagerSettingsPage from './pages/ManagerSettingsPage'
import ManagerReportsPage from './pages/ManagerReportsPage'
import ManagerPtPage from './pages/ManagerPtPage'
import MemberExplorePage from './pages/MemberExplorePage'
import MemberSubscriptionPage from './pages/MemberSubscriptionPage'
import MemberTrainingPage from './pages/MemberTrainingPage'
import MemberCoachReviewsPage from './pages/MemberCoachReviewsPage'
import StaffCoachReviewsPage from './pages/StaffCoachReviewsPage'
import ManagerVouchersPage from './pages/ManagerVouchersPage'
import MemberVouchersPage from './pages/MemberVouchersPage'
import MyMemberSchedulePage from './pages/MyMemberSchedulePage'
import NewsPage from './pages/NewsPage'
import PackagesPage from './pages/PackagesPage'
import PaymentResultPage from './pages/PaymentResultPage'
import ProfilePage from './pages/ProfilePage'
import ReceptionMemberPage from './pages/ReceptionMemberPage'
import ReceptionPaymentsPage from './pages/ReceptionPaymentsPage'
import ReceptionCoursesPage from './pages/ReceptionCoursesPage'
import ReceptionPtBookingPage from './pages/ReceptionPtBookingPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import TrainersPage from './pages/TrainersPage'
import UsersPage from './pages/UsersPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import VerifyRequiredPage from './pages/VerifyRequiredPage'
import HomePage from './pages/static/HomePage'
import ReceptionHomePage from './pages/ReceptionHomePage'

function ReceptionRedirect({ to, tab }) {
  const location = useLocation()
  const search = new URLSearchParams(location.search)
  if (tab) search.set('tab', tab)
  return <Navigate to={`${to}${search.size ? `?${search}` : ''}`} replace />
}

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
          <Route path="/invoice/:id" element={<InvoicePage />} />

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
              <Route path="/manager/audit-logs" element={<Navigate to="/manager/settings?tab=audit" replace />} />
              <Route path="/manager/sports-rooms" element={<Navigate to="/manager/settings" replace />} />
              <Route path="/manager/classes" element={<Navigate to="/manager/courses?tab=sessions" replace />} />
              <Route path="/manager/courses" element={<ManagerCoursesPage />} />
              <Route path="/manager/courses/new" element={<CourseCreationPage />} />
              <Route path="/manager/pt-bookings" element={<ManagerPtPage />} />
              <Route path="/manager/packages" element={<Navigate to="/manager/settings?tab=packages" replace />} />
              <Route path="/manager/settings" element={<ManagerSettingsPage />} />
              <Route path="/manager/reports" element={<ManagerReportsPage />} />
              <Route path="/manager/support" element={<SupportDeskPage />} />
              <Route path="/manager/coach-reviews" element={<StaffCoachReviewsPage />} />
              <Route path="/manager/vouchers" element={<ManagerVouchersPage />} />
            </Route>

            <Route element={<RequireRole roles={['Receptionist']} />}>
              <Route path="/reception" element={<ReceptionHomePage />} />
              <Route path="/reception/check-in" element={<ReceptionRedirect to="/reception" tab="checkin" />} />
              {/* Keep old cashier links while preserving the selected member and course. */}
              <Route path="/reception/sell" element={<ReceptionRedirect to="/reception/schedule" tab="register" />} />
              <Route path="/reception/classes" element={<ReceptionRedirect to="/reception/schedule" tab="register" />} />
              <Route path="/reception/pt" element={<ReceptionPtBookingPage />} />
              <Route path="/reception/members" element={<ReceptionMemberPage />} />
              <Route path="/reception/members/:id" element={<ReceptionMemberPage />} />
              <Route path="/reception/schedule" element={<ReceptionCoursesPage />} />
              <Route path="/reception/payments" element={<ReceptionPaymentsPage />} />
              <Route path="/reception/support" element={<SupportDeskPage />} />
              <Route path="/reception/coach-reviews" element={<StaffCoachReviewsPage />} />
            </Route>

            <Route element={<RequireRole roles={['Coach']} />}>
              <Route path="/coach" element={<Navigate to="/coach/schedule" replace />} />
              <Route path="/coach/schedule" element={<CoachSessionsPage />} />
              <Route path="/coach/availability" element={<CoachAvailabilityPage />} />
            </Route>

            <Route element={<RequireRole roles={['Member']} />}>
              <Route path="/member" element={<Navigate to="/member/schedule" replace />} />
              <Route path="/member/classes" element={<MemberExplorePage />} />
              <Route path="/member/schedule" element={<MyMemberSchedulePage />} />
              <Route path="/member/subscription" element={<MemberSubscriptionPage />} />
              <Route path="/member/wallet" element={<MemberCommerce viewMode="wallet" />} />
              <Route path="/member/pt" element={<Navigate to="/member/classes?type=pt" replace />} />
              <Route path="/member/training" element={<MemberTrainingPage />} />
              <Route path="/member/reviews" element={<MemberCoachReviewsPage />} />
              <Route path="/member/vouchers" element={<MemberVouchersPage />} />
              <Route path="/member/support" element={<MemberSupportPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <AiChatWidget />
      </AuthProvider>
    </BrowserRouter>
  )
}
