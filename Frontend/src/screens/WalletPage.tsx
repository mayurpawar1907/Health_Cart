import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Copy, Gift, Receipt, Share2, Wallet } from 'lucide-react'
import api, { unwrap } from '@/services/api'
import type { WalletSummary } from '@/types'
import { formatMoney } from '@/lib/utils'
import { Loading } from '@/components/ui/Loading'
import {
  UserBadge,
  UserEmptyRow,
  UserPage,
  UserPageHeader,
  UserPanel,
  UserStatCard,
  UserTable,
  UserTd,
  UserTh,
  UserTHead,
  UserTr,
} from '@/components/user/UserUi'
import { Button } from '@/components/ui/Button'

export function WalletPage() {
  const wallet = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => unwrap<WalletSummary>((await api.get('/wallet')).data),
  })

  if (wallet.isLoading || !wallet.data) return <Loading label="Loading wallet" />

  const w = wallet.data

  async function copyCode() {
    await navigator.clipboard.writeText(w.referralCode)
  }

  async function shareReferral() {
    const text = `Join HealthID Card with my code ${w.referralCode} — free 1-year membership, ₹250 joining bonus & special lab rates. Sign up at HealthID Card!`
    if (navigator.share) {
      await navigator.share({ title: 'HealthID Card referral', text }).catch(() => undefined)
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  return (
    <UserPage>
      <UserPageHeader
        title="HealthID Wallet"
        subtitle="Use credits at checkout · Refer friends to earn more"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/transactions">
              <Button variant="secondary" className="rounded-xl">
                <Receipt className="mr-2 h-4 w-4" />
                Payment history
              </Button>
            </Link>
            <Link to="/home?edit=card">
              <Button variant="secondary" className="rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to card
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <UserStatCard label="Total spendable" value={formatMoney(w.totalSpendable)} hint="Available at checkout" />
        <UserStatCard label="Wallet balance" value={formatMoney(w.balance)} hint="Joining bonus & credits" />
        <UserStatCard label="Referral credits" value={formatMoney(w.referralBalance)} hint={`${w.referralTestsRemaining} uses left`} />
      </div>

      <UserPanel title="Refer & earn" subtitle={`₹${w.rules.REFERRAL_BONUS} when your friend activates their card`}>
        <div className="rounded-2xl border border-dashed border-teal/30 bg-teal-light/30 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-teal">Your referral code</p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-widest text-ink">{w.referralCode}</p>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" size="sm" className="rounded-xl" onClick={copyCode}>
              <Copy className="mr-1.5 h-4 w-4" /> Copy
            </Button>
            <Button size="sm" className="rounded-xl" onClick={shareReferral}>
              <Share2 className="mr-1.5 h-4 w-4" /> Share
            </Button>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-ink-soft">
          <li className="flex gap-2">
            <Gift className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
            Redeem {formatMoney(w.referralPerTest)} per test booking (max 5 tests)
          </li>
        </ul>
      </UserPanel>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-teal" />
          <h2 className="font-display text-lg text-ink">Transaction history</h2>
        </div>
        <UserTable>
          <table className="w-full min-w-[640px] text-left text-sm">
            <UserTHead>
              <UserTh>Date</UserTh>
              <UserTh>Description</UserTh>
              <UserTh>Type</UserTh>
              <UserTh className="text-right">Amount</UserTh>
            </UserTHead>
            <tbody>
              {w.transactions.length === 0 ? (
                <UserEmptyRow
                  colSpan={4}
                  message={`No wallet activity yet. Activate your card to receive ₹${w.rules.JOINING_BONUS} joining bonus.`}
                />
              ) : (
                w.transactions.map((t) => (
                  <UserTr key={t.id}>
                    <UserTd className="whitespace-nowrap text-ink-soft">
                      {new Date(t.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </UserTd>
                    <UserTd>
                      <p className="font-medium text-ink">{t.description}</p>
                    </UserTd>
                    <UserTd>
                      <UserBadge tone={t.amount >= 0 ? 'success' : 'default'}>{t.amount >= 0 ? 'Credit' : 'Debit'}</UserBadge>
                    </UserTd>
                    <UserTd className={`text-right font-bold ${t.amount >= 0 ? 'text-emerald-600' : 'text-ink'}`}>
                      {t.amount >= 0 ? '+' : ''}
                      {formatMoney(t.amount)}
                    </UserTd>
                  </UserTr>
                ))
              )}
            </tbody>
          </table>
        </UserTable>
      </div>
    </UserPage>
  )
}
