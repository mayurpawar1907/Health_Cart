import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search, Sparkles, ShieldCheck, Clock, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PaymentDiscountBadge } from '@/components/brand/PaymentDiscountOffer'
import { LANDING_CONTAINER } from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

export function LandingHero({ city, stats, onSearch }) {
  const [query, setQuery] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSearch?.(query.trim())
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="landing-reveal border-b border-line/50 bg-white">
      <div className={cn(LANDING_CONTAINER, 'py-5 md:py-6')}>
        <form
          onSubmit={handleSubmit}
          className="landing-search-bar mx-auto flex max-w-3xl flex-col gap-2 rounded-2xl border border-line/60 bg-white p-1.5 sm:flex-row sm:p-2"
          role="search"
          aria-label="Search lab tests and packages"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for tests, packages or health concerns…"
              className="w-full rounded-xl border border-line/80 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none placeholder:text-ink-soft/60 focus:border-teal focus:bg-white focus:ring-2 focus:ring-teal/15"
            />
          </div>
          <Button type="submit" variant="accent" size="lg" className="shrink-0 rounded-xl px-8 uppercase tracking-wide">
            Search
          </Button>
        </form>
      </div>

      <div className="landing-hero-pro text-white">
        <div className={cn(LANDING_CONTAINER, 'grid items-center gap-8 py-10 md:grid-cols-[1.15fr_0.85fr] md:gap-10 md:py-14')}>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
                Trusted diagnostics · {city}
              </span>
              <PaymentDiscountBadge size="sm" className="!bg-white/12 !backdrop-blur-sm" />
            </div>

            <h1 className="mt-5 font-display text-[1.75rem] font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-[2.35rem]">
              Book lab tests at home.
              <span className="mt-2 block text-teal-light/95">Member rates with your free HealthID Card.</span>
            </h1>

            <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-white/75 md:text-base">
              {stats.testCount || '…'}+ tests · {stats.packageCount || '…'} packages · Extra {stats.flatDiscount}% off at
              payment · NABL partner labs · Free home collection.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button variant="accent" size="lg" className="rounded-xl px-7 shadow-lg">
                  Get free card
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#packages">
                <Button
                  size="lg"
                  className="rounded-xl border border-white/25 bg-white/10 px-7 text-white backdrop-blur-sm hover:bg-white/18"
                >
                  Browse packages
                </Button>
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-white/70 md:text-sm">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-light" aria-hidden />
                NABL accredited
              </li>
              <li className="flex items-center gap-1.5">
                <Home className="h-4 w-4 text-teal-light" aria-hidden />
                Free home visit
              </li>
              <li className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-teal-light" aria-hidden />
                Reports in {stats.reportHours}h
              </li>
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <div className="landing-hero-panel overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md md:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-light/90">Featured checkup</p>
              <p className="mt-2 font-display text-xl font-bold md:text-2xl">Full body health screening</p>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Comprehensive panels · Certified phlebotomist · Digital reports on WhatsApp
              </p>
              <dl className="mt-6 grid grid-cols-3 gap-2.5 text-center">
                {[
                  { v: `${stats.flatDiscount}%`, l: 'Extra off' },
                  { v: `${stats.reportHours}h`, l: 'Reports' },
                  { v: 'Free', l: 'Collection' },
                ].map((s) => (
                  <div key={s.l} className="landing-hero-stat px-2 py-2.5">
                    <dt className="font-display text-lg font-bold">{s.v}</dt>
                    <dd className="text-[10px] text-white/55">{s.l}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
