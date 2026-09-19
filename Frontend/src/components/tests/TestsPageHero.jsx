import { Link } from 'react-router-dom'
import { CalendarPlus, FlaskConical, Package, Search, Sparkles, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCatalogStats } from '@/hooks/usePlatformPricing'
import { PaymentDiscountBadge } from '@/components/brand/PaymentDiscountOffer'
import { cn } from '@/utils/utils'

export function TestsPageHero({ view, onViewChange, search, onSearchChange, resultCount }) {
  const stats = useCatalogStats()
  const VIEW_TABS = [
    { id: 'all', label: 'All tests', sub: `${stats.testCount || '…'}+ rates`, icon: FlaskConical },
    { id: 'packages', label: 'Packages', sub: `${stats.packageCount || '…'} bundles`, icon: Package },
    { id: 'popular', label: 'Popular', sub: 'Top picks', icon: Star },
  ]

  return (
    <section aria-label="Tests catalog" className="space-y-4">
      <div className="overflow-hidden rounded-[28px] border border-line/70 bg-white shadow-[0_12px_40px_rgba(12,25,41,0.06)]">
        <div className="relative bg-gradient-to-br from-[#f4f9fc] via-white to-[#fff8e6]/40 px-5 py-5 md:px-6 md:py-6">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 left-1/4 h-32 w-32 rounded-full bg-[#e03a28]/5 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-teal">
                  <Sparkles className="h-3.5 w-3.5" />
                  Official rate list
                </p>
                <PaymentDiscountBadge size="sm" />
              </div>
              <h1 className="mt-2 font-display text-2xl text-ink md:text-3xl">Tests & packages</h1>
              <p className="mt-1 text-sm text-ink-soft">
                {stats.testCount || '…'}+ tests · {stats.packageCount || '…'} packages · Extra {stats.flatDiscount}% off
                at every payment
              </p>
            </div>
            <Link to="/appointments/book" className="shrink-0 md:pt-1">
              <Button
                size="lg"
                className="h-11 w-full rounded-xl border-0 bg-gradient-to-r from-[#e03a28] to-[#c42e1e] px-5 text-sm font-bold shadow-[0_8px_24px_rgba(224,58,40,0.28)] hover:brightness-105 md:w-auto"
              >
                <CalendarPlus className="mr-2 h-4 w-4" />
                Book collection
              </Button>
            </Link>
          </div>

          <div className="relative mt-5 grid gap-2 sm:grid-cols-3">
            {VIEW_TABS.map((tab) => {
              const Icon = tab.icon
              const active = view === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onViewChange(tab.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition',
                    active
                      ? 'border-teal bg-teal text-white shadow-md'
                      : 'border-line/80 bg-white/80 text-ink hover:border-teal/40',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-10 w-10 place-items-center rounded-xl',
                      active ? 'bg-white/15' : 'bg-teal-light text-teal',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{tab.label}</span>
                    <span className={cn('block text-[11px]', active ? 'text-white/80' : 'text-ink-soft')}>
                      {tab.sub}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="relative mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tests or packages…"
                className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-4 text-sm outline-none ring-teal/30 focus:ring-2"
              />
            </div>
            {resultCount != null ? (
              <p className="text-xs font-medium text-ink-soft sm:whitespace-nowrap">{resultCount} results</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
