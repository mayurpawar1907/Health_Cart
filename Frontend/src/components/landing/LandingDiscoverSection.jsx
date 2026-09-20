import { useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Award,
  Clock,
  Droplets,
  FileUp,
  Heart,
  Layers,
  Phone,
  Pill,
  Stethoscope,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LandingBlock } from '@/components/landing/LandingSection'
import { cn } from '@/utils/utils'

const SUPPORT_PHONE = '1800-123-4567'
const SUPPORT_PHONE_TEL = '18001234567'

const SERVICE_CARDS = [
  {
    filterKey: 'blood-tests',
    label: 'Blood Tests',
    offer: 'Member special rates',
    bg: 'bg-[#e8f4fc]',
    iconBg: 'bg-white/80',
    Icon: Droplets,
    iconClass: 'text-teal',
  },
  {
    filterKey: 'full-body-packages',
    label: 'Full Body Checkups',
    offer: 'Up to 79% off',
    bg: 'bg-[#edeaf8]',
    iconBg: 'bg-white/80',
    Icon: Layers,
    iconClass: 'text-teal-dark',
  },
  {
    filterKey: 'heart',
    label: 'Heart Health',
    offer: 'Up to 70% off',
    bg: 'bg-[#fceee8]',
    iconBg: 'bg-white/80',
    Icon: Heart,
    iconClass: 'text-brand-red',
  },
  {
    filterKey: 'vitamins',
    label: 'Vitamins & Wellness',
    offer: 'Flat 55% off',
    bg: 'bg-[#fce8ef]',
    iconBg: 'bg-white/80',
    Icon: Pill,
    iconClass: 'text-teal',
  },
  {
    filterKey: 'thyroid',
    label: 'Thyroid & Hormones',
    offer: 'Up to 65% off',
    bg: 'bg-[#f5e8fc]',
    iconBg: 'bg-white/80',
    Icon: Activity,
    iconClass: 'text-teal-dark',
  },
  {
    filterKey: 'full-body-packages',
    label: 'Upload Prescription',
    offer: 'Quick booking',
    bg: 'bg-[#e8f4fc]',
    iconBg: 'bg-white/80',
    Icon: FileUp,
    iconClass: 'text-teal',
    action: 'catalog',
  },
]

const TRUST_FEATURES = [
  { icon: Award, label: 'NABL partner labs' },
  { icon: Clock, label: 'On-time home collection' },
  { icon: Stethoscope, label: 'Smart digital reports' },
  { icon: Phone, label: 'WhatsApp report alerts' },
]

function ServiceCarousel({ onSelect, onBrowseCatalog, flatDiscount }) {
  const scrollRef = useRef(null)

  function handleCardClick(card) {
    if (card.action === 'catalog') {
      onBrowseCatalog?.({ query: '', category: 'All' })
      return
    }
    onSelect?.(card.filterKey)
  }

  return (
    <div className="landing-discover-carousel">
      <div
        ref={scrollRef}
        className="landing-scroll-row flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:gap-4"
      >
        {SERVICE_CARDS.map((card) => {
          const { Icon } = card
          const offer =
            card.label === 'Blood Tests' ? `Extra ${flatDiscount}% at payment` : card.offer
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => handleCardClick(card)}
              className="landing-discover-service snap-start shrink-0 text-left"
            >
              <div className={cn('landing-discover-service-visual relative flex flex-col items-center rounded-2xl px-3 pb-3 pt-5', card.bg)}>
                <span className={cn('grid h-16 w-16 place-items-center rounded-2xl shadow-sm', card.iconBg)}>
                  <Icon className={cn('h-8 w-8', card.iconClass)} strokeWidth={1.5} aria-hidden />
                </span>
                <span className="mt-4 w-full rounded-full bg-white px-2 py-1.5 text-center text-[10px] font-bold text-teal shadow-sm ring-1 ring-line/40 sm:text-[11px]">
                  {offer}
                </span>
              </div>
              <p className="mt-2.5 text-center text-xs font-bold text-ink sm:text-[13px]">{card.label}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DiscoverPromoBanners({ city }) {
  return (
    <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2 md:gap-5">
      <article className="landing-discover-banner landing-discover-banner--teal relative overflow-hidden rounded-2xl p-5 md:p-6">
        <div className="relative z-10 max-w-[85%]">
          <h3 className="font-display text-lg font-bold leading-snug text-white md:text-xl">
            NABL partner labs with free home collection in {city}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-white/75 md:text-sm">
            HealthID Card members get special partner rates, family coverage, and WhatsApp reports — book tests from home.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/signup">
              <Button variant="accent" size="sm" className="rounded-lg px-4 text-xs">
                Explore now
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <a href={`tel:${SUPPORT_PHONE_TEL}`}>
              <Button
                size="sm"
                className="rounded-lg border border-white/35 bg-white/10 px-3 text-xs text-white hover:bg-white/20"
              >
                <Phone className="h-3.5 w-3.5" />
                Call {SUPPORT_PHONE}
              </Button>
            </a>
          </div>
        </div>
        <Layers className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-white/10" aria-hidden />
      </article>

      <article className="landing-discover-banner landing-discover-banner--warm relative overflow-hidden rounded-2xl p-5 md:p-6">
        <div className="relative z-10 max-w-[85%]">
          <h3 className="font-display text-lg font-bold leading-snug text-teal-dark md:text-xl">
            Know your health risks with HealthID Card
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-ink-soft md:text-sm">
            Browse tests by health concern, compare member special rates, and book home collection in a few taps.
          </p>
          <a href="#health-risks" className="mt-4 inline-block">
            <Button variant="accent" size="sm" className="rounded-lg px-4 text-xs shadow-md">
              Browse by concern
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
        <Heart className="pointer-events-none absolute -bottom-3 -right-3 h-28 w-28 text-brand-red/15" aria-hidden />
      </article>
    </div>
  )
}

function DiscoverTrustBar({ stats, reportHours }) {
  const countLabel = stats?.testCount ? `${stats.testCount}+` : '10,000+'

  return (
    <div className="landing-discover-trust mt-8 rounded-2xl border border-line/70 bg-white px-4 py-4 shadow-sm md:mt-10 md:px-6 md:py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <p className="text-center text-sm font-semibold text-ink lg:text-left md:text-base">
          Why <span className="font-display font-bold text-teal">{countLabel}</span> families trust HealthID Card
        </p>
        <ul className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-0 lg:justify-end">
          {TRUST_FEATURES.map(({ icon: Icon, label }, i) => (
            <li
              key={label}
              className={cn(
                'flex items-center gap-2 px-0 text-[11px] font-semibold text-ink-soft sm:px-4 sm:text-xs',
                i > 0 && 'sm:border-l sm:border-line/80',
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-teal" aria-hidden />
              <span>
                {label}
                {label.includes('reports') ? ` in ${reportHours}h` : ''}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function LandingDiscoverSection({ city, stats, onSelect, onBrowseCatalog }) {
  return (
    <LandingBlock className="landing-discover-section !border-t-0 landing-block--white">
      <ServiceCarousel
        onSelect={onSelect}
        onBrowseCatalog={onBrowseCatalog}
        flatDiscount={stats?.flatDiscount ?? 30}
      />
      <DiscoverPromoBanners city={city} />
      <DiscoverTrustBar stats={stats} reportHours={stats?.reportHours ?? 24} />
    </LandingBlock>
  )
}
