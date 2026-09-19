import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { MessageCircle, ShieldCheck, Truck, Users } from 'lucide-react'
import api, { unwrap } from '@/services/api'
import type { FamilyMember, Membership, MembershipPlan } from '@/types'
import { cn, formatDate, formatMoney } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { Badge } from '@/components/ui/Badge'
import { UserPage, UserPageHeader, UserPanel } from '@/components/user/UserUi'
import { HealthIdCard, type HealthIdCardData } from '@/components/brand/HealthIdCard'

import { PLATFORM } from '@/data/platform-content'

const perks = [
  { icon: ShieldCheck, title: 'Special rates on 63+ tests', body: 'Official partner pricing from the HealthID Card rate list — up to 77% off MRP.' },
  { icon: Truck, title: '29 diagnostic packages', body: 'Full Body, Diabetic, Cardiac, PCOD, Cancer panels & more at official brochure rates.' },
  { icon: Users, title: 'Family on one card', body: `Add spouse, parents, and children — up to ${PLATFORM.familyMembers} members.` },
  { icon: MessageCircle, title: 'WhatsApp updates', body: 'Bookings, reminders, and reports on WhatsApp.' },
]

export function MembershipPage() {
  const qc = useQueryClient()
  const current = useQuery({
    queryKey: ['membership'],
    queryFn: async () => unwrap<Membership | null>((await api.get('/membership')).data),
  })
  const plans = useQuery({
    queryKey: ['plans'],
    queryFn: async () => unwrap<MembershipPlan[]>((await api.get('/membership/plans')).data),
  })
  const family = useQuery({
    queryKey: ['family'],
    queryFn: async () => unwrap<FamilyMember[]>((await api.get('/family')).data),
  })

  const subscribe = useMutation({
    mutationFn: async (planId: string) => api.post('/membership', { planId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['membership'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const addFamily = useMutation({
    mutationFn: async (payload: { name: string; relation: string; age?: number }) => api.post('/family', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['family'] })
      qc.invalidateQueries({ queryKey: ['membership'] })
    },
  })

  const [name, setName] = useState('')
  const [relation, setRelation] = useState('SPOUSE')
  const [age, setAge] = useState('')

  if (current.isLoading || plans.isLoading) return <Loading />

  const m = current.data
  const plan = plans.data?.[0]

  return (
    <UserPage>
      <UserPageHeader title="HealthID Card" subtitle="One-year family membership — free to start" />

      {!m && (
        <UserPanel title="Get your free card" subtitle={plan?.description}>
          <Badge tone="success">Free for 1 year</Badge>
          <p className="mt-4 font-display text-3xl text-teal">FREE</p>
          <p className="text-sm text-ink-soft line-through">{formatMoney(999)} launch value</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {perks.map((p) => (
              <div key={p.title} className="rounded-2xl border border-line/60 bg-white/60 p-4">
                <p.icon className="mb-2 h-5 w-5 text-teal" />
                <p className="font-semibold">{p.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{p.body}</p>
              </div>
            ))}
          </div>
          {plan ? (
            <Button className="mt-6 rounded-xl" disabled={subscribe.isPending} onClick={() => subscribe.mutate(plan.id)}>
              Activate free HealthID Card
            </Button>
          ) : null}
        </UserPanel>
      )}

      {m ? (
        <>
          <UserPanel title="Active membership">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Badge tone="success">Active · 1 year</Badge>
                <p className="mt-2 font-display text-2xl">{m.plan.name}</p>
                <p className="text-sm text-ink-soft">{m.number}</p>
              </div>
              <Link to="/membership/card"><Button className="rounded-xl">View digital card</Button></Link>
            </div>
            <p className="mt-4 text-sm text-ink-soft">Started {formatDate(m.startsAt)} · Valid until {formatDate(m.expiresAt)}</p>
            <p className="mt-2 text-sm font-medium text-teal">Flat {Number(m.plan.flatDiscountPercent ?? 30)}% off applied on all bookings</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {m.plan.benefits.map((b) => <li key={b.id} className="text-sm">✓ {b.title}</li>)}
            </ul>
          </UserPanel>

          <UserPanel title="Family on your card" subtitle={`Up to ${m.plan.maxFamilyMembers ?? 5} members on one card`}>
            <div className="mt-4 space-y-2">
              {(m.members ?? []).map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-2xl border border-line px-4 py-3">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-ink-soft">{member.relation}{member.isPrimary ? ' · Primary' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <label className="block text-sm">
                Relation
                <select className="mt-1 w-full rounded-2xl border border-line px-4 py-3" value={relation} onChange={(e) => setRelation(e.target.value)}>
                  <option value="SPOUSE">Spouse</option>
                  <option value="PARENT">Parent</option>
                  <option value="CHILD">Child</option>
                  <option value="SIBLING">Sibling</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
              <Input label="Age" value={age} onChange={(e) => setAge(e.target.value)} />
              <div className="flex items-end">
                <Button
                  className="w-full"
                  disabled={!name || addFamily.isPending}
                  onClick={() => addFamily.mutate({ name, relation, age: age ? Number(age) : undefined })}
                >
                  Add member
                </Button>
              </div>
            </div>
            {(family.data ?? []).length > (m.members?.length ?? 0) ? (
              <p className="mt-3 text-xs text-ink-soft">Saved family members are automatically linked to your card.</p>
            ) : null}
          </UserPanel>
        </>
      ) : null}
    </UserPage>
  )
}

export function MembershipCardPage() {
  const q = useQuery({
    queryKey: ['card'],
    queryFn: async () => unwrap<HealthIdCardData>((await api.get('/membership/card')).data),
  })

  if (q.isLoading || !q.data) return <Loading />
  const c = q.data

  return (
    <UserPage className="max-w-lg">
      <div data-print-hide>
        <UserPageHeader title="Your HealthID Card" subtitle="Tap to flip · Show QR at home collection" />
      </div>

      <div id="health-id-card-print" className="print:flex print:justify-center">
        <HealthIdCard data={c} />
      </div>

      <UserPanel title="Card details" className="print:hidden">
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <DetailItem label="Card holder" value={c.memberName} />
          <DetailItem label="Date of birth" value={c.dateOfBirth ? formatDate(c.dateOfBirth) : '—'} />
          <DetailItem label="Valid from" value={formatDate(c.validFrom)} />
          <DetailItem label="Valid until" value={formatDate(c.validUntil)} highlight />
          <DetailItem label="Card number" value={c.membershipId} className="col-span-2 font-mono tracking-wide" />
        </dl>
        <div className="mt-5 border-t border-line pt-5">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">Covered members</p>
          <ul className="mt-3 space-y-2">
            {c.familyMembers.map((m) => (
              <li key={m.name} className="flex items-center justify-between text-sm">
                <span className="font-medium">{m.name}</span>
                <span className="text-ink-soft">{m.relation}{m.isPrimary ? ' · Primary' : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      </UserPanel>

      <div data-print-hide className="flex flex-wrap gap-3">
        <Button className="rounded-xl" onClick={() => navigator.share?.({ title: 'HealthID Card', text: `${c.memberName} · ${c.membershipId}` }).catch(() => navigator.clipboard.writeText(c.membershipId))}>
          Share card
        </Button>
        <Button variant="secondary" className="rounded-xl" onClick={() => window.print()}>Save / Print</Button>
      </div>
    </UserPage>
  )
}

function DetailItem({ label, value, highlight, className }: { label: string; value: string; highlight?: boolean; className?: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs uppercase tracking-wider text-ink-soft">{label}</dt>
      <dd className={cn('font-medium', highlight && 'text-brand-red', className)}>{value}</dd>
    </div>
  )
}
