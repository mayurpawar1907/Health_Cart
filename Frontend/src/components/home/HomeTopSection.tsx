import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Calendar,
  CalendarPlus,
  ChevronRight,
  Clock,
  CreditCard,
  FlaskConical,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { greeting } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

type HomeTopSectionProps = {
  firstName: string
  city?: string
  hasMembership: boolean
  hasAddress: boolean
  onSearch: (q: string) => void
  upcoming?: {
    testName: string
    date: string
    time: string
    href: string
  } | null
}

const QUICK_ACTIONS: {
  to: string
  label: string
  sub: string
  icon: typeof CalendarPlus
  primary?: boolean
}[] = [
  {
    to: '/appointments/book',
    label: 'Book visit',
    sub: 'Home collection',
    icon: CalendarPlus,
    primary: true,
  },
  {
    to: '/tests',
    label: 'Tests',
    sub: '63+ rates',
    icon: FlaskConical,
  },
  {
    to: '/tests?packages=true',
    label: 'Packages',
    sub: '29 bundles',
    icon: Package,
  },
  {
    to: '/wallet',
    label: 'Wallet',
    sub: 'Credits & refer',
    icon: Wallet,
  },
]

export function HomeTopSection({
  firstName,
  city,
  hasMembership,
  hasAddress,
  onSearch,
  upcoming,
}: HomeTopSectionProps) {
  const setupDone = hasMembership && hasAddress
  const setupSteps = [
    { done: hasMembership, label: 'Activate card', to: '/home?edit=card', icon: CreditCard },
    { done: hasAddress, label: 'Add address', to: '/profile', icon: MapPin },
  ]

  return (
    <section aria-label="Dashboard overview" className="space-y-4">
      {/* Welcome + search */}
      <div className="overflow-hidden rounded-[28px] border border-line/70 bg-white shadow-[0_12px_40px_rgba(12,25,41,0.06)]">
        <div className="relative bg-gradient-to-br from-[#f4f9fc] via-white to-[#fff8e6]/40 px-5 py-5 md:px-6 md:py-6">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 left-1/4 h-32 w-32 rounded-full bg-[#e03a28]/5 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-teal">
                <Sparkles className="h-3.5 w-3.5" />
                {greeting()}
              </p>
              <h1 className="mt-2 font-display text-2xl text-ink md:text-3xl">{firstName}</h1>
              <p className="mt-1 text-sm text-ink-soft">
                {city ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0 text-teal" />
                    {city} · Free home sample pickup available
                  </span>
                ) : (
                  'Search tests, book home collection, and manage your HealthID Card'
                )}
              </p>
            </div>
            <Link to="/appointments/book" className="shrink-0 md:pt-1">
              <Button
                size="lg"
                className="h-11 w-full rounded-xl border-0 bg-gradient-to-r from-[#e03a28] to-[#c42e1e] px-5 text-sm font-bold shadow-[0_8px_24px_rgba(224,58,40,0.28)] hover:brightness-105 md:w-auto"
              >
                <CalendarPlus className="mr-2 h-4 w-4" />
                Book now
              </Button>
            </Link>
          </div>

          <form
            className="relative mt-5 flex items-center gap-2 rounded-2xl border border-line/80 bg-white p-1.5 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault()
              const q = new FormData(e.currentTarget).get('q')
              onSearch(String(q ?? ''))
            }}
          >
            <Search className="ml-3 h-5 w-5 shrink-0 text-teal" />
            <input
              name="q"
              placeholder="Search tests, packages, CBC, thyroid…"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/55"
            />
            <Button type="submit" size="sm" className="rounded-xl px-4">
              Search
            </Button>
          </form>
        </div>

        {/* Setup checklist */}
        {!setupDone ? (
          <div className="border-t border-line/60 bg-amber-50/50 px-5 py-4 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                <p className="text-sm font-semibold text-amber-950">Complete your setup</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {setupSteps.map((step) => {
                  const Icon = step.icon
                  if (step.done) {
                    return (
                      <span
                        key={step.label}
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {step.label} ✓
                      </span>
                    )
                  }
                  return (
                    <Link
                      key={step.label}
                      to={step.to}
                      className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100/80"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {step.label}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}

        {/* Upcoming visit */}
        {upcoming ? (
          <Link
            to={upcoming.href}
            className="group flex items-center gap-4 border-t border-teal/15 bg-gradient-to-r from-teal-light/50 to-white px-5 py-4 transition hover:from-teal-light/70 md:px-6"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal text-white shadow-sm">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal">Next home visit</p>
              <p className="truncate font-semibold text-ink">{upcoming.testName}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-soft">
                <Clock className="h-3.5 w-3.5" />
                {upcoming.date} · {upcoming.time}
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-teal">
              Details
              <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ) : null}
      </div>

      {/* Quick actions — complements sidebar, not duplicate profile */}
      <nav aria-label="Quick actions">
        <div className="mb-2.5 flex items-center justify-between px-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-soft">Quick actions</p>
          <Link to="/appointments" className="text-xs font-semibold text-teal hover:underline">
            All bookings
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.to}
                to={action.to}
                className={`group flex flex-col rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${
                  action.primary
                    ? 'border-[#e03a28]/20 bg-gradient-to-br from-red-50/80 to-white'
                    : 'border-line/70 bg-white hover:border-teal/25'
                }`}
              >
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl ${
                    action.primary ? 'bg-[#e03a28] text-white shadow-sm' : 'bg-teal-light text-teal'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-ink">{action.label}</p>
                <p className="text-[11px] text-ink-soft">{action.sub}</p>
              </Link>
            )
          })}
        </div>
      </nav>
    </section>
  )
}
