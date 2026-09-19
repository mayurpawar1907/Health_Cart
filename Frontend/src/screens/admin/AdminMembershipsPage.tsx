import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api, { unwrap } from '@/services/api'
import { formatDate } from '@/lib/utils'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminSelect,
  AdminTHead,
  AdminTh,
  AdminTr,
  AdminTd,
  AdminTable,
  Badge,
} from '@/components/admin/AdminUi'

type Membership = {
  id: string
  number: string
  isActive: boolean
  startsAt: string
  expiresAt: string
  user: { id: string; fullName: string; email: string }
  plan: { id: string; name: string }
  members: { name: string; relation: string }[]
}

type Plan = { id: string; name: string; isFree: boolean; durationDays: number }
type UserOption = { id: string; fullName: string; email: string }

export function AdminMembershipsPage() {
  const qc = useQueryClient()
  const [userId, setUserId] = useState('')
  const [planId, setPlanId] = useState('')

  const memberships = useQuery({
    queryKey: ['admin-memberships'],
    queryFn: async () => unwrap<Membership[]>((await api.get('/admin/memberships')).data),
  })
  const plans = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => unwrap<Plan[]>((await api.get('/admin/membership-plans')).data),
  })
  const users = useQuery({
    queryKey: ['admin-users-options'],
    queryFn: async () => unwrap<{ items: UserOption[] }>((await api.get('/admin/users', { params: { role: 'USER', limit: 100 } })).data),
  })

  const grant = useMutation({
    mutationFn: () => api.post('/admin/memberships/grant', { userId, planId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-memberships'] })
      setUserId('')
    },
  })

  if (memberships.isLoading) return <Loading label="Loading memberships" />

  return (
    <AdminPage>
      <AdminPageHeader title="Memberships" subtitle="HealthID Card activations and family coverage" />

      <AdminPanel title="Grant membership" subtitle="Activate a HealthID Card for a customer">
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminSelect label="Customer" value={userId} onChange={setUserId}>
            <option value="">Select customer…</option>
            {(users.data?.items ?? []).map((u) => (
              <option key={u.id} value={u.id}>{u.fullName} · {u.email}</option>
            ))}
          </AdminSelect>
          <AdminSelect label="Plan" value={planId} onChange={setPlanId}>
            <option value="">Select plan…</option>
            {(plans.data ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.durationDays} days)</option>
            ))}
          </AdminSelect>
        </div>
        <Button size="sm" className="mt-4 rounded-xl" disabled={!userId || !planId} onClick={() => grant.mutate()}>Grant card</Button>
      </AdminPanel>

      <AdminTable>
        <table className="w-full min-w-[800px] text-left text-sm">
          <AdminTHead>
            <AdminTh>Card #</AdminTh>
            <AdminTh>Customer</AdminTh>
            <AdminTh>Plan</AdminTh>
            <AdminTh>Family</AdminTh>
            <AdminTh>Valid until</AdminTh>
            <AdminTh>Status</AdminTh>
          </AdminTHead>
          <tbody>
            {(memberships.data ?? []).map((m) => (
              <AdminTr key={m.id}>
                <AdminTd className="font-mono text-xs">{m.number}</AdminTd>
                <AdminTd>
                  <p className="font-semibold">{m.user.fullName}</p>
                  <p className="text-xs text-ink-soft">{m.user.email}</p>
                </AdminTd>
                <AdminTd>{m.plan.name}</AdminTd>
                <AdminTd className="text-xs">{m.members.map((x) => x.name).join(', ')}</AdminTd>
                <AdminTd>{formatDate(m.expiresAt)}</AdminTd>
                <AdminTd>
                  <Badge tone={m.isActive && new Date(m.expiresAt) > new Date() ? 'success' : 'default'}>
                    {m.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </table>
      </AdminTable>
    </AdminPage>
  )
}
