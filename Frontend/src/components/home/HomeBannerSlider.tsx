import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgePercent,
  Bell,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  FlaskConical,
  Gift,
  HeartPulse,
  Home,
  MessageCircle,
  Package,
  Receipt,
  Sparkles,
  Star,
  Truck,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLATFORM } from '@/data/platform-content'
import { usePlatformPricing } from '@/hooks/usePlatformPricing'

type SlideTheme = {
  shell: string
  glow: string
  badge: string
  stat: string
  accent: string
  ring: string
}

type FeaturedSlide = {
  id: string
  tag: string
  title: string
  highlight: string
  body: string
  cta: string
  to: string
  visual: 'discount' | 'packages' | 'wallet' | 'family'
  theme: SlideTheme
}

const SLIDE_THEMES = {
  teal: {
    shell: 'from-[#0c1929] via-[#1a4d6d] to-[#1e6b8a]',
    glow: 'bg-cyan-400/25',
    badge: 'bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-300/30',
    stat: 'text-cyan-200',
    accent: 'from-cyan-300 to-teal-200',
    ring: 'ring-cyan-300/25',
  },
  red: {
    shell: 'from-[#3d0f0a] via-[#e03a28] to-[#ff6b57]',
    glow: 'bg-orange-300/25',
    badge: 'bg-white/15 text-white ring-1 ring-white/25',
    stat: 'text-orange-100',
    accent: 'from-orange-200 to-amber-100',
    ring: 'ring-orange-200/30',
  },
  indigo: {
    shell: 'from-[#1e1b4b] via-[#4338ca] to-[#7c3aed]',
    glow: 'bg-violet-300/25',
    badge: 'bg-white/15 text-white ring-1 ring-white/25',
    stat: 'text-violet-100',
    accent: 'from-violet-200 to-fuchsia-100',
    ring: 'ring-violet-200/30',
  },
  emerald: {
    shell: 'from-[#064e3b] via-[#059669] to-[#14b8a6]',
    glow: 'bg-emerald-300/25',
    badge: 'bg-white/15 text-white ring-1 ring-white/25',
    stat: 'text-emerald-100',
    accent: 'from-emerald-200 to-teal-100',
    ring: 'ring-emerald-200/30',
  },
} as const

const UPDATES = [
  {
    id: 'invoice',
    icon: Receipt,
    title: 'Payment invoices',
    body: 'Download tax invoices for every booking from your wallet.',
    to: '/transactions',
    tone: 'bg-indigo-50 text-indigo-800 border-indigo-100',
    iconTone: 'bg-indigo-500 text-white',
  },
  {
    id: 'reports',
    icon: FileText,
    title: 'Reports in app',
    body: 'Lab PDFs download securely — also sent on WhatsApp.',
    to: '/history',
    tone: 'bg-teal-light text-teal-dark border-teal/20',
    iconTone: 'bg-teal text-white',
  },
  {
    id: 'collection',
    icon: Truck,
    title: 'Free home visit',
    body: 'Phlebotomist at your doorstep on every booking.',
    to: '/appointments/book',
    tone: 'bg-amber-50 text-amber-900 border-amber-100',
    iconTone: 'bg-amber-500 text-white',
  },
  {
    id: 'cbc',
    icon: HeartPulse,
    title: 'Free annual CBC',
    body: 'Members get one Complete Blood Count every year.',
    to: '/tests',
    tone: 'bg-rose-50 text-rose-900 border-rose-100',
    iconTone: 'bg-[#e03a28] text-white',
  },
] as const

const QUICK_OFFERS = [
  {
    id: 'full-body',
    label: 'Top package',
    title: 'Full Body Basic',
    value: '₹999',
    sub: '8 tests · Home collection',
    to: '/tests?packages=true',
    icon: Package,
    gradient: 'from-teal to-[#0f3349]',
    ribbon: 'Best value',
  },
  {
    id: 'bonus',
    label: 'Wallet',
    title: 'Joining bonus',
    value: '₹250',
    sub: 'Instant on card activation',
    to: '/wallet',
    icon: Gift,
    gradient: 'from-amber-500 to-orange-600',
    ribbon: 'Free credit',
  },
  {
    id: 'whatsapp',
    label: 'Reports',
    title: 'WhatsApp delivery',
    value: '24–48h',
    sub: 'Digital vault + chat',
    to: '/history',
    icon: MessageCircle,
    gradient: 'from-[#e03a28] to-[#9a2a1e]',
    ribbon: 'Fast',
  },
  {
    id: 'refer',
    label: 'Referrals',
    title: 'Refer & earn',
    value: '₹1000',
    sub: '₹200 off per test',
    to: '/wallet',
    icon: Sparkles,
    gradient: 'from-indigo-500 to-violet-700',
    ribbon: 'Earn more',
  },
] as const

function SlideVisual({
  type,
  theme,
  discountPct,
}: {
  type: FeaturedSlide['visual']
  theme: SlideTheme
  discountPct: number
}) {
  if (type === 'discount') {
    return (
      <div className="relative flex h-[140px] w-[140px] items-center justify-center md:h-[168px] md:w-[168px]">
        <div className={cn('absolute inset-0 rounded-[32px] bg-gradient-to-br opacity-90 blur-sm', theme.accent)} />
        <div className={cn('relative grid place-items-center rounded-[32px] bg-white/10 p-5 ring-1 backdrop-blur-md', theme.ring)}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Extra off</p>
          <p className="font-display text-5xl leading-none text-white md:text-6xl">{discountPct}%</p>
          <p className="mt-1 text-center text-[10px] font-semibold text-white/70">on special price</p>
          <BadgePercent className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-white p-1.5 text-[#e03a28] shadow-lg" />
        </div>
        <div className="absolute -bottom-2 -left-3 rounded-xl bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-teal shadow-md">
          Not on MRP
        </div>
      </div>
    )
  }

  if (type === 'packages') {
    return (
      <div className="relative h-[140px] w-[160px] md:h-[168px] md:w-[180px]">
        {['Diabetic', 'Cardiac', 'PCOD', 'Senior'].map((label, i) => (
          <div
            key={label}
            className={cn(
              'absolute rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold text-white backdrop-blur-sm',
              i === 0 && 'left-0 top-0 rotate-[-6deg]',
              i === 1 && 'right-0 top-2 rotate-[4deg]',
              i === 2 && 'bottom-8 left-2 rotate-[3deg]',
              i === 3 && 'bottom-0 right-0 rotate-[-3deg]',
            )}
          >
            {label}
          </div>
        ))}
        <div className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/30">
          <Package className="h-8 w-8 text-white" />
        </div>
        <p className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-[10px] font-bold text-[#e03a28] shadow">
          {PLATFORM.packageCount} packages
        </p>
      </div>
    )
  }

  if (type === 'wallet') {
    return (
      <div className="relative flex h-[140px] w-[150px] flex-col items-center justify-end md:h-[168px] md:w-[170px]">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'absolute rounded-2xl border border-white/25 bg-gradient-to-br from-white/25 to-white/5 backdrop-blur-sm',
              i === 0 && 'bottom-0 h-14 w-28',
              i === 1 && 'bottom-4 h-12 w-24 opacity-80',
              i === 2 && 'bottom-8 h-10 w-20 opacity-60',
            )}
          />
        ))}
        <div className="relative mb-2 grid h-14 w-14 place-items-center rounded-2xl bg-white text-indigo-600 shadow-xl">
          <Wallet className="h-7 w-7" />
        </div>
        <p className="relative rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold text-white">Fintech wallet</p>
      </div>
    )
  }

  return (
    <div className="relative flex h-[140px] w-[160px] items-center justify-center md:h-[168px] md:w-[180px]">
      <div className="absolute inset-0 rounded-full bg-white/5" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            'absolute grid h-10 w-10 place-items-center rounded-full bg-white/15 text-xs font-bold text-white ring-2 ring-white/20',
            i === 0 && 'left-1/2 top-0 -translate-x-1/2',
            i === 1 && 'left-0 top-1/2 -translate-y-1/2',
            i === 2 && 'right-0 top-1/2 -translate-y-1/2',
            i === 3 && 'bottom-2 left-4',
            i === 4 && 'bottom-2 right-4',
          )}
        >
          {i === 0 ? 'You' : '•'}
        </div>
      ))}
      <Users className="relative h-12 w-12 text-white/90" />
      <p className="absolute -bottom-1 rounded-full bg-white px-3 py-1 text-[10px] font-bold text-emerald-700 shadow">
        {PLATFORM.familyMembers} members
      </p>
    </div>
  )
}

export function HomeBannerSlider() {
  const { activePercent, isPromoActive } = usePlatformPricing()
  const discountPct = isPromoActive ? activePercent : PLATFORM.membership.flatDiscount

  const featured = useMemo<FeaturedSlide[]>(
    () => [
      {
        id: 'rates',
        tag: 'Launch offer',
        title: `Extra ${discountPct}% off at every payment`,
        highlight: `${PLATFORM.testCount}+ tests · special partner rates`,
        body: 'Discount applies on special price (not MRP). Auto-applied at checkout with wallet & referral credits.',
        cta: 'Browse tests',
        to: '/tests',
        visual: 'discount',
        theme: SLIDE_THEMES.teal,
      },
      {
        id: 'packages',
        tag: 'Bundle & save',
        title: `${PLATFORM.packageCount} health packages`,
        highlight: 'Full Body Basic from ₹999',
        body: 'Diabetic, cardiac, thyroid, PCOD & senior panels — one visit, maximum savings.',
        cta: 'Explore packages',
        to: '/tests?packages=true',
        visual: 'packages',
        theme: SLIDE_THEMES.red,
      },
      {
        id: 'wallet',
        tag: 'Fintech rewards',
        title: '₹250 bonus + ₹1000 referrals',
        highlight: 'Credits auto-apply at checkout',
        body: 'Joining bonus on card activation. Refer friends — redeem ₹200 per test booking (up to 5 tests).',
        cta: 'Open wallet',
        to: '/wallet',
        visual: 'wallet',
        theme: SLIDE_THEMES.indigo,
      },
      {
        id: 'family',
        tag: 'Family care',
        title: 'One HealthID Card, whole family',
        highlight: 'Free home collection every time',
        body: `Add ${PLATFORM.familyMembers} members · WhatsApp reports in ${PLATFORM.reportHours} hours · lifetime digital vault.`,
        cta: 'Manage card',
        to: '/home#healthid-card-section',
        visual: 'family',
        theme: SLIDE_THEMES.emerald,
      },
    ],
    [discountPct],
  )

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  const slide = featured[index]

  useEffect(() => {
    if (paused) return
    const duration = 6500
    const tick = 50
    const timer = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setIndex((i) => (i + 1) % featured.length)
          setAnimKey((k) => k + 1)
          return 0
        }
        return p + (tick / duration) * 100
      })
    }, tick)
    return () => window.clearInterval(timer)
  }, [paused, index, featured.length])

  function goTo(i: number) {
    setIndex(i)
    setProgress(0)
    setAnimKey((k) => k + 1)
  }

  return (
    <section aria-label="Offers and updates" className="space-y-4">
      {/* Section header */}
      <div className="flex flex-wrap items-end justify-between gap-3 px-0.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e03a28] opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e03a28]" />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e03a28]">Live for members</p>
          </div>
          <h2 className="mt-1 font-display text-2xl text-ink md:text-[1.65rem]">Offers & updates</h2>
        </div>
        <Link
          to="/tests"
          className="inline-flex items-center gap-1.5 rounded-full border border-teal/25 bg-teal-light/50 px-4 py-2 text-xs font-bold text-teal transition hover:bg-teal-light"
        >
          View all deals
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Main carousel card */}
      <div
        className="overflow-hidden rounded-[28px] border border-line/80 bg-white shadow-[0_16px_48px_rgba(12,25,41,0.08)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <article
          key={animKey}
          className={cn(
            'relative overflow-hidden bg-gradient-to-br text-white transition-opacity duration-500',
            slide.theme.shell,
          )}
        >
          {/* Decorative layers */}
          <div className={cn('pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl', slide.theme.glow)} />
          <div className="pointer-events-none absolute -bottom-20 left-1/4 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.14),transparent_45%)]" />

          <div className="relative grid min-h-[240px] items-center gap-6 p-6 md:min-h-[220px] md:grid-cols-[1fr_auto] md:p-8 lg:min-h-[200px]">
            <div className="min-w-0 space-y-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider', slide.theme.badge)}>
                  <Sparkles className="h-3 w-3" />
                  {slide.tag}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-black/15 px-2.5 py-1 text-[10px] font-semibold text-white/80">
                  <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                  Member exclusive
                </span>
              </div>
              <h3 className="max-w-lg font-display text-[1.65rem] leading-[1.15] md:text-[1.85rem]">{slide.title}</h3>
              <p className={cn('text-sm font-bold', slide.theme.stat)}>{slide.highlight}</p>
              <p className="max-w-md text-sm leading-relaxed text-white/78">{slide.body}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to={slide.to}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-ink shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-white/95"
                >
                  {slide.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="inline-flex items-center gap-1.5 text-xs text-white/55">
                  <Clock className="h-3.5 w-3.5" />
                  Limited launch pricing
                </span>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <SlideVisual type={slide.visual} theme={slide.theme} discountPct={discountPct} />
            </div>
          </div>

          {/* Controls */}
          <div className="relative border-t border-white/10 bg-black/10 px-4 py-3 backdrop-blur-sm md:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Previous offer"
                onClick={() => goTo((index - 1 + featured.length) % featured.length)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex flex-1 items-center gap-2">
                {featured.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    aria-label={`Show offer: ${b.title}`}
                    onClick={() => goTo(i)}
                    className="group relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/20"
                  >
                    <span
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full bg-white transition-all',
                        i === index ? 'opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-40',
                      )}
                      style={i === index ? { width: `${progress}%` } : undefined}
                    />
                  </button>
                ))}
              </div>
              <span className="hidden text-[10px] font-bold tabular-nums text-white/50 sm:inline">
                {index + 1}/{featured.length}
              </span>
              <button
                type="button"
                aria-label="Next offer"
                onClick={() => goTo((index + 1) % featured.length)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </article>

        {/* Thumbnail strip — quick jump */}
        <div className="grid grid-cols-2 gap-px bg-line/60 sm:grid-cols-4">
          {featured.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                'flex items-center gap-2.5 bg-white px-4 py-3 text-left transition hover:bg-teal-light/30',
                i === index && 'bg-teal-light/50 ring-1 ring-inset ring-teal/20',
              )}
            >
              <span
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white',
                  i === index
                    ? 'from-teal to-teal-dark shadow-sm'
                    : 'from-slate-400/90 to-slate-500/90',
                )}
              >
                {b.visual === 'discount' ? (
                  <BadgePercent className="h-4 w-4" />
                ) : b.visual === 'packages' ? (
                  <Package className="h-4 w-4" />
                ) : b.visual === 'wallet' ? (
                  <Wallet className="h-4 w-4" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
              </span>
              <span className="min-w-0">
                <p className="truncate text-[11px] font-bold text-ink">{b.tag}</p>
                <p className="truncate text-[10px] text-ink-soft">{b.highlight.split('·')[0]}</p>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Platform updates — horizontal cards */}
      <div>
        <div className="mb-3 flex items-center gap-2 px-0.5">
          <Bell className="h-4 w-4 text-teal" />
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">What&apos;s new</p>
        </div>
        <div className="-mx-1 flex gap-3 overflow-x-auto pb-1 px-1 scrollbar-thin">
          {UPDATES.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.id}
                to={item.to}
                className={cn(
                  'group flex min-w-[220px] max-w-[260px] shrink-0 flex-col rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:min-w-[240px]',
                  item.tone,
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={cn('grid h-9 w-9 place-items-center rounded-xl shadow-sm', item.iconTone)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-50" />
                </div>
                <p className="mt-3 text-sm font-bold leading-snug">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed opacity-80">{item.body}</p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick pick banners */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-2 px-0.5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#e03a28]" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">Quick picks</p>
          </div>
          <Link to="/tests?packages=true" className="text-[11px] font-semibold text-teal hover:underline">
            See packages →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {QUICK_OFFERS.map((offer) => {
            const Icon = offer.icon
            return (
              <Link
                key={offer.id}
                to={offer.to}
                className="group relative overflow-hidden rounded-[22px] shadow-[0_8px_28px_rgba(12,25,41,0.1)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(12,25,41,0.14)]"
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br', offer.gradient)} />
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                <div className="pointer-events-none absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-black/10 blur-xl" />
                <span className="absolute right-3 top-3 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                  {offer.ribbon}
                </span>
                <div className="relative flex min-h-[148px] flex-col p-4 text-white">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 ring-1 ring-white/25 backdrop-blur-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-auto pt-4 text-[10px] font-bold uppercase tracking-wider text-white/70">{offer.label}</p>
                  <p className="font-display text-lg leading-tight">{offer.title}</p>
                  <p className="mt-1 font-display text-2xl leading-none">{offer.value}</p>
                  <p className="mt-1 text-[11px] text-white/75">{offer.sub}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-white/90 opacity-0 transition group-hover:opacity-100">
                    Claim offer <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Dual promo strip */}
      <div className="grid gap-3 md:grid-cols-2">
        <Link
          to="/appointments/book"
          className="group relative overflow-hidden rounded-[22px] border border-teal/20 bg-gradient-to-r from-teal-light via-white to-cream p-5 transition hover:shadow-md"
        >
          <div className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 rounded-full bg-teal/10 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-teal text-white shadow-lg">
              <Home className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal">Home collection</p>
              <p className="font-display text-xl text-ink">Book a visit today</p>
              <p className="text-sm text-ink-soft">Free phlebotomist at your doorstep</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-teal opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100" />
          </div>
        </Link>

        <Link
          to="/tests"
          className="group relative overflow-hidden rounded-[22px] border border-[#e03a28]/20 bg-gradient-to-r from-[#fff5f4] via-white to-teal-light/30 p-5 transition hover:shadow-md"
        >
          <div className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 rounded-full bg-[#e03a28]/10 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#e03a28] to-[#c42e1e] text-white shadow-lg">
              <FlaskConical className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#e03a28]">{PLATFORM.testCount}+ tests</p>
              <p className="font-display text-xl text-ink">Member special rates</p>
              <p className="text-sm text-ink-soft">
                Up to {PLATFORM.maxSavingsPct}% off MRP + {discountPct}% at payment
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-[#e03a28] opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100" />
          </div>
        </Link>
      </div>
    </section>
  )
}
