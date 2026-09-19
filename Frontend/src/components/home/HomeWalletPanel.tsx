import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, Copy, Gift, Lock, Share2, Wallet } from 'lucide-react'
import api, { unwrap } from '@/services/api'
import type { WalletSummary } from '@/types'
import { formatMoney } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

type HomeWalletPanelProps = {
  hasMembership?: boolean
}

export function HomeWalletPanel({ hasMembership }: HomeWalletPanelProps) {
  const [copied, setCopied] = useState(false)
  const wallet = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => unwrap<WalletSummary>((await api.get('/wallet')).data),
  })

  if (wallet.isLoading) {
    return (
      <div className="flex min-h-[320px] flex-1 items-center justify-center rounded-2xl border border-dashed border-line/80 bg-cream/30">
        <Loading label="Loading wallet" />
      </div>
    )
  }

  const w = wallet.data
  if (!w) return null

  async function copyCode() {
    await navigator.clipboard.writeText(w!.referralCode)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  async function shareReferral() {
    const text = `Join HealthID Card with code ${w!.referralCode} — free membership & special lab rates!`
    if (navigator.share) {
      await navigator.share({ title: 'HealthID Card referral', text }).catch(() => undefined)
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Balance hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal via-[#256d8f] to-[#1a4d6d] p-5 text-white shadow-[0_12px_32px_rgba(26,77,109,0.25)]">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Available to spend</p>
              <p className="text-xs text-white/60">Applied automatically at checkout</p>
            </div>
          </div>
          {!hasMembership ? (
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold uppercase text-white/80">
              <Lock className="h-3 w-3" />
              Bonus locked
            </span>
          ) : null}
        </div>
        <p className="relative mt-4 font-display text-[2.5rem] leading-none tracking-tight">
          {formatMoney(w.totalSpendable)}
        </p>
        {!hasMembership ? (
          <p className="relative mt-2 text-sm text-white/75">
            Activate card to unlock ₹{w.rules.JOINING_BONUS} joining bonus
          </p>
        ) : (
          <p className="relative mt-2 text-sm text-white/75">
            {formatMoney(w.balance)} balance + {formatMoney(w.referralBalance)} referral
          </p>
        )}
      </div>

      {/* Split balances */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line/70 bg-cream/40 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Wallet balance</p>
          <p className="mt-1 font-display text-xl text-ink">{formatMoney(w.balance)}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-ink-soft">Joining bonus & credits</p>
        </div>
        <div className="rounded-xl border border-[#e03a28]/20 bg-gradient-to-br from-red-50/80 to-white p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#e03a28]">Referral credits</p>
          <p className="mt-1 font-display text-xl text-[#e03a28]">{formatMoney(w.referralBalance)}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-ink-soft">
            {formatMoney(w.referralPerTest)}/test · {w.referralTestsRemaining} uses left
          </p>
        </div>
      </div>

      {/* Referral */}
      <div className="rounded-xl border border-teal/20 bg-teal-light/20 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-teal">Refer & earn ₹{w.rules.REFERRAL_BONUS}</p>
          <Gift className="h-4 w-4 text-teal" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-white px-3 py-2.5 font-mono text-base font-bold tracking-[0.2em] text-ink">
            {w.referralCode}
          </code>
          <button
            type="button"
            onClick={copyCode}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line/70 bg-white text-teal transition hover:border-teal/40 hover:bg-teal-light/30"
            aria-label="Copy referral code"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={shareReferral}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line/70 bg-white text-teal transition hover:border-teal/40 hover:bg-teal-light/30"
            aria-label="Share referral"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-soft">Friend activates their card → you earn referral wallet credits</p>
      </div>

      <Link to="/wallet" className="mt-auto">
        <Button variant="secondary" className="h-11 w-full rounded-xl text-sm font-semibold">
          View transaction history
        </Button>
      </Link>
    </div>
  )
}
