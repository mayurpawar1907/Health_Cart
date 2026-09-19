import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api, { unwrap } from '@/services/api'
import { formatMoney, formatDate } from '@/lib/utils'
import { Loading } from '@/components/ui/Loading'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminQuickLink,
  AdminSection,
  AdminTHead,
  AdminTh,
  AdminTr,
  AdminTd,
  Badge,
  StatCard,
  AdminTable,
} from '@/components/admin/AdminUi'

type Dashboard = {
  stats: {
    totalUsers: number
    activeUsers: number
    totalTests: number
    activeTests: number
    totalAppointments: number
    todayAppointments: number
    pendingReports: number
    activeMemberships: number
    totalRevenue: number
  }
  recentAppointments: {
    id: string
    code: string
    status: string
    date: string
    patientName: string
    user: { fullName: string; email: string }
    test: { name: string }
  }[]
}

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => unwrap<Dashboard>((await api.get('/admin/dashboard')).data),
  })

  if (isLoading) return <Loading label="Loading dashboard" />
  const s = data!.stats

  return (
    <AdminPage>
      <AdminPageHeader title="Dashboard" subtitle="Platform overview and recent activity" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Customers" value={s.totalUsers} hint={`${s.activeUsers} active`} />
        <StatCard label="Active memberships" value={s.activeMemberships} />
        <StatCard label="Today's appointments" value={s.todayAppointments} hint={`${s.totalAppointments} total`} tone="accent" />
        <StatCard label="Revenue collected" value={formatMoney(s.totalRevenue)} />
        <StatCard label="Tests in catalog" value={s.activeTests} hint={`${s.totalTests} total`} />
        <StatCard label="Pending reports" value={s.pendingReports} tone={s.pendingReports > 0 ? 'warn' : 'default'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminSection
            title="Recent appointments"
            action={<Link to="/admin/appointments" className="text-sm font-semibold text-teal hover:underline">View all</Link>}
          >
            <AdminTable>
              <table className="w-full min-w-[600px] text-left text-sm">
                <AdminTHead>
                  <AdminTh>Code</AdminTh>
                  <AdminTh>Customer</AdminTh>
                  <AdminTh>Test</AdminTh>
                  <AdminTh>Date</AdminTh>
                  <AdminTh>Status</AdminTh>
                </AdminTHead>
                <tbody>
                  {data!.recentAppointments.map((a) => (
                    <AdminTr key={a.id}>
                      <AdminTd className="font-mono text-xs">{a.code}</AdminTd>
                      <AdminTd>
                        <p className="font-semibold">{a.user.fullName}</p>
                        <p className="text-xs text-ink-soft">{a.user.email}</p>
                      </AdminTd>
                      <AdminTd>{a.test.name}</AdminTd>
                      <AdminTd className="text-ink-soft">{formatDate(a.date)}</AdminTd>
                      <AdminTd>
                        <Badge tone={a.status === 'COMPLETED' ? 'success' : a.status === 'CANCELLED' ? 'danger' : 'teal'}>{a.status}</Badge>
                      </AdminTd>
                    </AdminTr>
                  ))}
                </tbody>
              </table>
            </AdminTable>
          </AdminSection>
        </div>

        <AdminPanel title="Quick actions" subtitle="Jump to common tasks">
          <div className="space-y-2">
            <AdminQuickLink to="/admin/customers" label="Manage customers" />
            <AdminQuickLink to="/admin/tests" label="Edit test rates" />
            <AdminQuickLink to="/admin/reports" label="Upload reports" />
            <AdminQuickLink to="/admin/memberships" label="Grant membership" />
            <AdminQuickLink to="/admin/payments" label="Payments ledger" />
            <AdminQuickLink to="/admin/settings/pricing" label="Payment promo settings" />
          </div>
        </AdminPanel>
      </div>
    </AdminPage>
  )
}
