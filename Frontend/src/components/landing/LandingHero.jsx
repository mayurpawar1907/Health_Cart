import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PaymentDiscountBadge } from '@/components/brand/PaymentDiscountOffer'
import { LANDING_CONTAINER } from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

const TRUST = ['NABL partner labs', 'Free home collection', 'WhatsApp reports', 'Verified phlebotomists']

export function LandingHero({ city, stats, onSearch }) {
  const [query, setQuery] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSearch?.(query.trim())
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="landing-hero relative overflow-hidden border-b border-line/60 bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(26,77,109,0.08),transparent)]" />

      <div className={cn('relative py-10 md:py-14 lg:py-16', LANDING_CONTAINER)}>
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line/80 bg-cream/80 px-3 py-1 text-[11px] font-semibold text-ink-soft">
              <MapPin className="h-3.5 w-3.5 text-teal" aria-hidden />
              Home collection in {city}
            </span>
            <PaymentDiscountBadge size="sm" tone="teal" />
          </div>

          <h1 className="mt-5 font-display text-[2rem] leading-[1.15] tracking-tight text-ink sm:text-4xl lg:text-[2.85rem]">
            Book lab tests at home.
            <span className="mt-1 block text-teal">Pay less with your free HealthID Card.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
            {stats.testCount || '…'}+ tests and {stats.packageCount || '…'} health packages at partner-lab special
            rates — plus an extra {stats.flatDiscount}% off at every payment. No lab visits required.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-xl flex-col gap-2 sm:flex-row"
            role="search"
            aria-label="Search lab tests and packages"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-teal" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search CBC, thyroid, full body checkup…"
                className="w-full rounded-xl border border-line/80 bg-white py-3.5 pl-12 pr-4 text-sm shadow-sm outline-none ring-teal/25 placeholder:text-ink-soft/60 focus:ring-2"
              />
            </div>
            <Button type="submit" size="lg" className="shrink-0 rounded-xl px-6">
              Search
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="rounded-xl px-8">
                Get free card
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="rounded-xl px-6">
                Sign in
              </Button>
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-ink-soft md:text-sm">
            {TRUST.map((label) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Key metrics — scannable proof */}
        <dl className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
          {[
            { value: `${stats.flatDiscount}%`, label: 'Extra off at checkout' },
            { value: `${stats.testCount || '…'}+`, label: 'Individual tests' },
            { value: `${stats.packageCount || '…'}`, label: 'Health packages' },
            { value: `${stats.reportHours}h`, label: 'Typical report time' },
          ].map((s) => (
            <div key={s.label} className="landing-stat-card rounded-2xl border border-line/70 bg-cream/50 px-4 py-4 text-center">
              <dt className="font-display text-2xl text-teal md:text-3xl">{s.value}</dt>
              <dd className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
