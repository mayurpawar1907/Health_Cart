import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, CreditCard, Sparkles } from 'lucide-react'
import api, { unwrap } from '@/services/api'
import type { MembershipPlan } from '@/types'
import { HealthIdCard, type HealthIdCardData } from '@/components/brand/HealthIdCard'
import { Loading } from '@/components/ui/Loading'
import { MembershipEditPanel } from './MembershipEditPanel'
import { HomeWalletPanel } from './HomeWalletPanel'
import { HomeCardActions } from './HomeCardActions'
import { HomeActivatePanel } from './HomeActivatePanel'

type HomeHealthIdCardProps = {
  hasMembership: boolean
  editOpen: boolean
  onEditOpen: (open: boolean) => void
  hasAddress: boolean
}

export function HomeHealthIdCard({ hasMembership, editOpen, onEditOpen, hasAddress }: HomeHealthIdCardProps) {
  const qc = useQueryClient()
  const [flipped, setFlipped] = useState(false)

  const cardQuery = useQuery({
    queryKey: ['card'],
    enabled: hasMembership,
    queryFn: async () => unwrap<HealthIdCardData>((await api.get('/membership/card')).data),
  })
  const plans = useQuery({
    queryKey: ['plans'],
    enabled: !hasMembership,
    queryFn: async () => unwrap<MembershipPlan[]>((await api.get('/membership/plans')).data),
  })

  const subscribe = useMutation({
    mutationFn: async (planId: string) => api.post('/membership', { planId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['membership'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['card'] })
      qc.invalidateQueries({ queryKey: ['wallet'] })
    },
  })

  if (editOpen) {
    return <MembershipEditPanel onClose={() => onEditOpen(false)} />
  }

  if (hasMembership && cardQuery.isLoading) {
    return <Loading label="Loading your card" />
  }

  const plan = plans.data?.[0]

  return (
    <section
      id="healthid-card-section"
      aria-labelledby="healthid-card-heading"
      className="overflow-hidden rounded-[28px] border border-line/80 bg-white shadow-[0_16px_48px_rgba(12,25,41,0.08)]"
    >
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/60 bg-gradient-to-r from-teal-light/40 via-white to-[#fff8e6]/80 px-5 py-4 md:px-6 md:py-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-teal text-white shadow-sm">
            <CreditCard className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal">Member hub</p>
            <h2 id="healthid-card-heading" className="font-display text-xl text-ink md:text-2xl">
              HealthID Card & Wallet
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              {hasMembership
                ? 'Show your card at collection · Spend wallet credits at checkout'
                : 'Activate once for member rates, family coverage & ₹250 bonus'}
            </p>
          </div>
        </div>
        {hasMembership ? (
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            Active member
          </div>
        ) : (
          <span className="rounded-full bg-[#e03a28]/10 px-3 py-1.5 text-xs font-bold text-[#e03a28]">
            Free · 1 year
          </span>
        )}
      </div>

      {/* Two-pane layout */}
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        {/* Card pane */}
        <div className="border-b border-line/60 bg-gradient-to-b from-[#f4f8fb] to-white p-5 md:p-6 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Digital card</p>
            {hasMembership && cardQuery.data ? (
              <span className="rounded-full bg-teal/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-teal">
                {cardQuery.data.flatDiscountPercent}% member discount
              </span>
            ) : null}
          </div>

          {hasMembership && cardQuery.data ? (
            <div className="space-y-5">
              <div className="mx-auto w-full max-w-[400px] rounded-[28px] bg-gradient-to-b from-teal/5 to-transparent p-1 pt-2">
                <HealthIdCard
                  data={cardQuery.data}
                  flipped={flipped}
                  onFlipChange={setFlipped}
                  disableTapFlip
                  hideBuiltInFlipHint
                  className="mx-auto w-full"
                />
              </div>
              <HomeCardActions
                cardData={cardQuery.data}
                flipped={flipped}
                onFlip={() => setFlipped((f) => !f)}
                onEdit={() => onEditOpen(true)}
                hasAddress={hasAddress}
              />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="relative mx-auto w-full max-w-[400px]">
                <div className="aspect-[1.58/1] overflow-hidden rounded-[24px] border-2 border-dashed border-teal/20 bg-gradient-to-br from-[#1a3d56]/5 via-teal-light/30 to-white">
                  <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal/10 text-teal">
                      <CreditCard className="h-7 w-7" />
                    </div>
                    <p className="mt-4 font-display text-lg text-ink">Your card appears here</p>
                    <p className="mt-1 max-w-[240px] text-sm text-ink-soft">
                      One tap activation · Family included · Wallet bonus unlocked instantly
                    </p>
                  </div>
                </div>
              </div>
              <HomeActivatePanel
                compact
                onActivate={plan ? () => subscribe.mutate(plan.id) : undefined}
                activatePending={subscribe.isPending}
              />
            </div>
          )}
        </div>

        {/* Wallet pane */}
        <div className="flex flex-col bg-white p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Wallet credits</p>
            <Link
              to="/wallet"
              className="flex items-center gap-0.5 text-xs font-semibold text-teal transition hover:underline"
            >
              Manage wallet
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <HomeWalletPanel hasMembership={hasMembership} />
        </div>
      </div>
    </section>
  )
}
