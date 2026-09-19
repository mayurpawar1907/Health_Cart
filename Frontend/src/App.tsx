import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AdminShell } from '@/components/admin/AdminShell'
import { AdminRoute, GuestRoute, ProtectedRoute } from '@/components/layout/Guards'
import { SplashPage } from '@/screens/SplashPage'
import { OnboardingPage } from '@/screens/OnboardingPage'
import { LoginPage } from '@/screens/LoginPage'
import { SignupPage } from '@/screens/SignupPage'
import { ForgotPasswordPage, ResetPasswordPage } from '@/screens/PasswordPages'
import { HomePage } from '@/screens/HomePage'
import { TestsPage } from '@/screens/TestsPage'
import { TestDetailsPage } from '@/screens/TestDetailsPage'
import { BookAppointmentPage } from '@/screens/BookAppointmentPage'
import { AppointmentDetailsPage, AppointmentsPage } from '@/screens/AppointmentsPage'
import { HistoryPage } from '@/screens/HistoryPage'
import { NotificationsPage } from '@/screens/NotificationsPage'
import { SearchPage } from '@/screens/SearchPage'
import { ProfilePage } from '@/screens/ProfilePage'
import { WalletPage } from '@/screens/WalletPage'
import { RemindersPage } from '@/screens/RemindersPage'
import { LandingPage } from '@/screens/LandingPage'
import { AdminDashboardPage } from '@/screens/admin/AdminDashboardPage'
import { AdminCustomersPage } from '@/screens/admin/AdminCustomersPage'
import { AdminCustomerDetailPage } from '@/screens/admin/AdminCustomerDetailPage'
import { AdminTestsPage } from '@/screens/admin/AdminTestsPage'
import { AdminCategoriesPage } from '@/screens/admin/AdminCategoriesPage'
import { AdminAppointmentsPage } from '@/screens/admin/AdminAppointmentsPage'
import { AdminMembershipsPage } from '@/screens/admin/AdminMembershipsPage'
import { AdminReportsPage } from '@/screens/admin/AdminReportsPage'
import { AdminAuditPage } from '@/screens/admin/AdminAuditPage'
import { AdminWhatsAppPage } from '@/screens/admin/AdminWhatsAppPage'
import { AdminPaymentsPage } from '@/screens/admin/AdminPaymentsPage'
import { AdminPaymentDetailPage } from '@/screens/admin/AdminPaymentDetailPage'
import { AdminPricingSettingsPage } from '@/screens/admin/AdminPricingSettingsPage'
import { TransactionsPage } from '@/screens/TransactionsPage'
import { TransactionDetailPage } from '@/screens/TransactionDetailPage'
import { InvoicePage } from '@/screens/InvoicePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/splash" element={<SplashPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminRoute />}>
          <Route element={<AdminShell />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/customers" element={<AdminCustomersPage />} />
            <Route path="/admin/customers/:id" element={<AdminCustomerDetailPage />} />
            <Route path="/admin/tests" element={<AdminTestsPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
            <Route path="/admin/memberships" element={<AdminMembershipsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/audit" element={<AdminAuditPage />} />
            <Route path="/admin/whatsapp" element={<AdminWhatsAppPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/payments/:id/invoice" element={<InvoicePage mode="admin" />} />
            <Route path="/admin/payments/:id" element={<AdminPaymentDetailPage />} />
            <Route path="/admin/settings/pricing" element={<AdminPricingSettingsPage />} />
          </Route>
        </Route>
        <Route element={<AppShell />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />
          <Route path="/tests" element={<TestsPage />} />
          <Route path="/tests/:id" element={<TestDetailsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/appointments/book" element={<BookAppointmentPage />} />
          <Route path="/appointments/:id" element={<AppointmentDetailsPage />} />
          <Route path="/membership" element={<Navigate to="/home?edit=card" replace />} />
          <Route path="/membership/card" element={<Navigate to="/home?edit=card" replace />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transactions/:id/invoice" element={<InvoicePage mode="user" />} />
          <Route path="/transactions/:id" element={<TransactionDetailPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
