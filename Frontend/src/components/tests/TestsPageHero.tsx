import { Link } from 'react-router-dom'
import {
  CalendarPlus,
  FlaskConical,
  Package,
  Search,
  Sparkles,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PLATFORM } from '@/data/platform-content'
import { PaymentDiscountBadge } from '@/components/brand/PaymentDiscountOffer'
import { cn } from '@/lib/utils'

export type TestsView = 'all' | 'packages' | 'popular'

type TestsPageHeroProps = {
  view: TestsView
  onViewChange: (view: TestsView) => void
  search: string
  onSearchChange: (value: string) => void
  resultCount: number
}

const VIEW_TABS: { id: TestsView; label: string; sub: string; icon: typeof FlaskConical }[] = [
  { id: 'all', label: 'All tests', sub: `${PLATFORM.testCount}+ rates`, icon: FlaskConical },
  { id: 'packages', label: 'Packages', sub: `${PLATFORM.packageCount} bundles`, icon: Package },
  { id: 'popular', label: 'Popular', sub: 'Top picks', icon: Star },
]

export function TestsPageHero({ view, onViewChange, search, onSearchChange, resultCount }: TestsPageHeroProps) {
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
                {PLATFORM.testCount}+ tests · {PLATFORM.packageCount} packages · Extra {PLATFORM.membership.flatDiscount}% off at every payment
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

          <div className="relative mt-5 flex items-center gap-2 rounded-2xl border border-line/80 bg-white p-1.5 shadow-sm">
            <Search className="ml-3 h-5 w-5 shrink-0 text-teal" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search CBC, thyroid, liver, packages…"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/55"
            />
            {search ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="mr-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-slate-50"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="border-t border-line/60 px-5 py-4 md:px-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {VIEW_TABS.map((tab) => {
              const Icon = tab.icon
              const active = view === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onViewChange(tab.id)}
                  className={cn(
                    'flex flex-col items-start rounded-2xl border p-3 text-left transition sm:p-4',
                    active
                      ? 'border-teal/30 bg-teal-light/40 shadow-sm'
                      : 'border-line/70 bg-white hover:border-teal/25 hover:bg-slate-50/80',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-9 w-9 place-items-center rounded-xl',
                      active ? 'bg-teal text-white' : 'bg-slate-100 text-teal',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="mt-2 text-sm font-semibold text-ink">{tab.label}</p>
                  <p className="text-[11px] text-ink-soft">{tab.sub}</p>
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            Showing <span className="font-semibold text-ink">{resultCount}</span>{' '}
            {view === 'packages' ? 'packages' : view === 'popular' ? 'popular tests' : 'tests'}
          </p>
        </div>
      </div>
    </section>
  )
}
