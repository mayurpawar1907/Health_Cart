import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import api, { unwrap } from '@/services/api'
import { formatDate, formatMoney } from '@/lib/utils'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
  AdminTHead,
  AdminTh,
  AdminTr,
  AdminTd,
  AdminTable,
  Badge,
} from '@/components/admin/AdminUi'
import { useState } from 'react'

type CustomerDetail = {
  id: string
  fullName: string
  email: string
  mobile: string
  role: string
  isActive: boolean
  gender?: string
  dateOfBirth?: string
  createdAt: string
  addresses: { id: string; line1: string; city: string; state: string; pincode: string; label?: string }[]
  familyMembers: { id: string; name: string; relation: string; age?: number }[]
  memberships: { id: string; number: string; isActive: boolean; expiresAt: string; plan: { name: string } }[]
  appointments: {
    id: string
    code: string
    status: string
    date: string
    finalPrice?: number
    test: { name: string }
    reports: { status: string }[]
  }[]
}

export function AdminCustomerDetailPage() {
  const { id } = useParams()
  const qc = useQueryClient()
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user', id],
    enabled: !!id,
    queryFn: async () => {
      const u = unwrap<CustomerDetail>((await api.get(`/admin/users/${id}`)).data)
      setForm({ fullName: u.fullName, email: u.email, mobile: u.mobile })
      return u
    },
  })

  const save = useMutation({
    mutationFn: () => api.patch(`/admin/users/${id}`, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-user', id] })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setEdit(false)
    },
  })

  if (isLoading || !data) return <Loading label="Loading customer" />

  return (
    <AdminPage>
      <AdminPageHeader
        title={data.fullName}
        subtitle={data.email}
        actions={
          <Link to="/admin/customers">
            <Button variant="secondary" size="sm" className="rounded-xl">← Back</Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminPanel title="Profile">
          <div className="mb-4 flex items-center justify-between">
            <Badge tone={data.isActive ? 'success' : 'danger'}>{data.isActive ? 'Active' : 'Inactive'}</Badge>
            <Badge tone="teal">{data.role.replace('_', ' ')}</Badge>
          </div>
          {edit ? (
            <div className="space-y-3">
              <Input label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
              <div className="flex gap-2">
                <Button size="sm" className="rounded-xl" onClick={() => save.mutate()}>Save</Button>
                <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => setEdit(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <dl className="space-y-3 text-sm">
              <div><dt className="text-xs font-bold uppercase tracking-wider text-ink-soft">Mobile</dt><dd className="mt-0.5 font-semibold">{data.mobile}</dd></div>
              <div><dt className="text-xs font-bold uppercase tracking-wider text-ink-soft">Joined</dt><dd className="mt-0.5">{formatDate(data.createdAt)}</dd></div>
              <Button size="sm" variant="secondary" className="mt-2 rounded-xl" onClick={() => setEdit(true)}>Edit profile</Button>
            </dl>
          )}

          <div className="mt-6 border-t border-line/60 pt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Addresses</p>
            <ul className="mt-3 space-y-2 text-sm">
              {data.addresses.map((a) => (
                <li key={a.id} className="rounded-xl bg-teal-light/40 p-3">
                  {a.label ? <p className="text-xs font-bold text-teal">{a.label}</p> : null}
                  {a.line1}, {a.city}, {a.state} – {a.pincode}
                </li>
              ))}
              {!data.addresses.length ? <p className="text-ink-soft">No addresses</p> : null}
            </ul>
          </div>

          <div className="mt-6 border-t border-line/60 pt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Family members</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {data.familyMembers.map((f) => (
                <li key={f.id} className="rounded-lg bg-white/60 px-3 py-2">{f.name} · {f.relation}{f.age ? ` · ${f.age}y` : ''}</li>
              ))}
              {!data.familyMembers.length ? <p className="text-ink-soft">None added</p> : null}
            </ul>
          </div>
        </AdminPanel>

        <div className="space-y-6 lg:col-span-2">
          <AdminSection title="Memberships">
            <AdminTable>
              <table className="w-full text-left text-sm">
                <AdminTHead>
                  <AdminTh>Card</AdminTh>
                  <AdminTh>Plan</AdminTh>
                  <AdminTh>Expires</AdminTh>
                  <AdminTh>Status</AdminTh>
                </AdminTHead>
                <tbody>
                  {data.memberships.map((m) => (
                    <AdminTr key={m.id}>
                      <AdminTd className="font-mono text-xs">{m.number}</AdminTd>
                      <AdminTd>{m.plan.name}</AdminTd>
                      <AdminTd>{formatDate(m.expiresAt)}</AdminTd>
                      <AdminTd><Badge tone={m.isActive ? 'success' : 'default'}>{m.isActive ? 'Active' : 'Expired'}</Badge></AdminTd>
                    </AdminTr>
                  ))}
                  {!data.memberships.length ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-ink-soft">No memberships</td></tr>
                  ) : null}
                </tbody>
              </table>
            </AdminTable>
          </AdminSection>

          <AdminSection title="Appointments">
            <AdminTable>
              <table className="w-full text-left text-sm">
                <AdminTHead>
                  <AdminTh>Code</AdminTh>
                  <AdminTh>Test</AdminTh>
                  <AdminTh>Date</AdminTh>
                  <AdminTh>Amount</AdminTh>
                  <AdminTh>Status</AdminTh>
                </AdminTHead>
                <tbody>
                  {data.appointments.map((a) => (
                    <AdminTr key={a.id}>
                      <AdminTd className="font-mono text-xs">{a.code}</AdminTd>
                      <AdminTd>{a.test.name}</AdminTd>
                      <AdminTd>{formatDate(a.date)}</AdminTd>
                      <AdminTd>{a.finalPrice != null ? formatMoney(Number(a.finalPrice)) : '—'}</AdminTd>
                      <AdminTd><Badge tone="teal">{a.status}</Badge></AdminTd>
                    </AdminTr>
                  ))}
                  {!data.appointments.length ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-ink-soft">No appointments</td></tr>
                  ) : null}
                </tbody>
              </table>
            </AdminTable>
          </AdminSection>
        </div>
      </div>
    </AdminPage>
  )
}
