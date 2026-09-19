import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminRoute, GuestRoute, ProtectedRoute } from '@/routes/Guards';
import { SplashPage } from '@/pages/SplashPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ForgotPasswordPage, ResetPasswordPage } from '@/pages/PasswordPages';
import { HomePage } from '@/pages/HomePage';
import { TestsPage } from '@/pages/TestsPage';
import { TestDetailsPage } from '@/pages/TestDetailsPage';
import { BookAppointmentPage } from '@/pages/BookAppointmentPage';
import { AppointmentDetailsPage, AppointmentsPage } from '@/pages/AppointmentsPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { SearchPage } from '@/pages/SearchPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { WalletPage } from '@/pages/WalletPage';
import { RemindersPage } from '@/pages/RemindersPage';
import { LandingPage } from '@/pages/LandingPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminCustomersPage } from '@/pages/admin/AdminCustomersPage';
import { AdminCustomerDetailPage } from '@/pages/admin/AdminCustomerDetailPage';
import { AdminTestsPage } from '@/pages/admin/AdminTestsPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminAppointmentsPage } from '@/pages/admin/AdminAppointmentsPage';
import { AdminMembershipsPage } from '@/pages/admin/AdminMembershipsPage';
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage';
import { AdminAuditPage } from '@/pages/admin/AdminAuditPage';
import { AdminWhatsAppPage } from '@/pages/admin/AdminWhatsAppPage';
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage';
import { AdminPaymentDetailPage } from '@/pages/admin/AdminPaymentDetailPage';
import { AdminPricingSettingsPage } from '@/pages/admin/AdminPricingSettingsPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { TransactionDetailPage } from '@/pages/TransactionDetailPage';
import { InvoicePage } from '@/pages/InvoicePage';
export default function App() {
    return (<Routes>
      <Route path="/" element={<LandingPage />}/>
      <Route path="/splash" element={<SplashPage />}/>
      <Route path="/onboarding" element={<OnboardingPage />}/>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/signup" element={<SignupPage />}/>
        <Route path="/forgot-password" element={<ForgotPasswordPage />}/>
        <Route path="/reset-password" element={<ResetPasswordPage />}/>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminRoute />}>
          <Route element={<AdminShell />}>
            <Route path="/admin" element={<AdminDashboardPage />}/>
            <Route path="/admin/customers" element={<AdminCustomersPage />}/>
            <Route path="/admin/customers/:id" element={<AdminCustomerDetailPage />}/>
            <Route path="/admin/tests" element={<AdminTestsPage />}/>
            <Route path="/admin/categories" element={<AdminCategoriesPage />}/>
            <Route path="/admin/appointments" element={<AdminAppointmentsPage />}/>
            <Route path="/admin/memberships" element={<AdminMembershipsPage />}/>
            <Route path="/admin/reports" element={<AdminReportsPage />}/>
            <Route path="/admin/audit" element={<AdminAuditPage />}/>
            <Route path="/admin/whatsapp" element={<AdminWhatsAppPage />}/>
            <Route path="/admin/payments" element={<AdminPaymentsPage />}/>
            <Route path="/admin/payments/:id/invoice" element={<InvoicePage mode="admin"/>}/>
            <Route path="/admin/payments/:id" element={<AdminPaymentDetailPage />}/>
            <Route path="/admin/settings/pricing" element={<AdminPricingSettingsPage />}/>
          </Route>
        </Route>
        <Route element={<AppShell />}>
          <Route path="/home" element={<HomePage />}/>
          <Route path="/dashboard" element={<Navigate to="/home" replace/>}/>
          <Route path="/tests" element={<TestsPage />}/>
          <Route path="/tests/:id" element={<TestDetailsPage />}/>
          <Route path="/appointments" element={<AppointmentsPage />}/>
          <Route path="/appointments/book" element={<BookAppointmentPage />}/>
          <Route path="/appointments/:id" element={<AppointmentDetailsPage />}/>
          <Route path="/membership" element={<Navigate to="/home?edit=card" replace/>}/>
          <Route path="/membership/card" element={<Navigate to="/home?edit=card" replace/>}/>
          <Route path="/history" element={<HistoryPage />}/>
          <Route path="/reminders" element={<RemindersPage />}/>
          <Route path="/notifications" element={<NotificationsPage />}/>
          <Route path="/search" element={<SearchPage />}/>
          <Route path="/profile" element={<ProfilePage />}/>
          <Route path="/wallet" element={<WalletPage />}/>
          <Route path="/transactions" element={<TransactionsPage />}/>
          <Route path="/transactions/:id/invoice" element={<InvoicePage mode="user"/>}/>
          <Route path="/transactions/:id" element={<TransactionDetailPage />}/>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>);
}
