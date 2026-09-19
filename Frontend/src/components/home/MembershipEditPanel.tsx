import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api, { unwrap } from '@/services/api'
import type { FamilyMember, Membership, MembershipPlan } from '@/types'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { Badge } from '@/components/ui/Badge'
import { UserPanel } from '@/components/user/UserUi'

export function MembershipEditPanel({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [relation, setRelation] = useState('SPOUSE')
  const [age, setAge] = useState('')

  const membership = useQuery({
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
      qc.invalidateQueries({ queryKey: ['card'] })
    },
  })

  const addFamily = useMutation({
    mutationFn: async (payload: { name: string; relation: string; age?: number }) => api.post('/family', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['family'] })
      qc.invalidateQueries({ queryKey: ['membership'] })
      qc.invalidateQueries({ queryKey: ['card'] })
      setName('')
      setAge('')
    },
  })

  if (membership.isLoading || plans.isLoading) return <Loading label="Loading card settings" />

  const m = membership.data
  const plan = plans.data?.[0]

  if (!m) {
    return (
      <UserPanel title="Activate HealthID Card" subtitle="Free 1-year membership">
        <p className="text-sm text-ink-soft">{plan?.description}</p>
        {plan ? (
          <Button className="mt-4 rounded-xl" disabled={subscribe.isPending} onClick={() => subscribe.mutate(plan.id)}>
            Activate free card
          </Button>
        ) : null}
        <Button variant="ghost" className="mt-3 rounded-xl" onClick={onClose}>Cancel</Button>
      </UserPanel>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-teal">Edit card</p>
          <h2 className="font-display text-xl">Family & membership</h2>
        </div>
        <Button variant="secondary" size="sm" className="rounded-xl" onClick={onClose}>Done</Button>
      </div>

      <UserPanel title="Membership details">
        <Badge tone="success">Active</Badge>
        <p className="mt-2 font-semibold">{m.plan.name}</p>
        <p className="text-sm text-ink-soft">{m.number}</p>
        <p className="mt-2 text-sm text-ink-soft">
          Valid until {formatDate(m.expiresAt)} · {Number(m.plan.flatDiscountPercent ?? 30)}% off on tests
        </p>
      </UserPanel>

      <UserPanel title="Family on your card" subtitle={`Up to ${m.plan.maxFamilyMembers ?? 5} members`}>
        <div className="space-y-2">
          {(m.members ?? []).map((member) => (
            <div key={member.id} className="rounded-xl border border-line/60 bg-white/60 px-4 py-3">
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-ink-soft">{member.relation}{member.isPrimary ? ' · Primary' : ''}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="block space-y-2 text-sm">
            <span className="font-semibold text-ink/80">Relation</span>
            <select className="w-full rounded-2xl border border-line/80 bg-white/90 px-4 py-3.5 outline-none focus:border-teal" value={relation} onChange={(e) => setRelation(e.target.value)}>
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
              className="w-full rounded-xl"
              disabled={!name || addFamily.isPending}
              onClick={() => addFamily.mutate({ name, relation, age: age ? Number(age) : undefined })}
            >
              Add member
            </Button>
          </div>
        </div>
        {(family.data ?? []).length > (m.members?.length ?? 0) ? (
          <p className="mt-3 text-xs text-ink-soft">Saved family members sync to your card automatically.</p>
        ) : null}
        <Link to="/profile" className="mt-3 inline-block text-sm font-semibold text-teal hover:underline">
          Update profile & address →
        </Link>
      </UserPanel>
    </div>
  )
}
