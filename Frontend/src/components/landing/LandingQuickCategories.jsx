import {
  Activity,
  Droplets,
  FlaskConical,
  Heart,
  Layers,
  Pill,
  Shield,
  Stethoscope,
  Wind,
} from 'lucide-react'
import { LANDING_CONTAINER, QUICK_CATEGORIES } from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

const ICONS = {
  'full-body-packages': Layers,
  vitamins: Pill,
  allergy: Wind,
  thyroid: Activity,
  kidney: FlaskConical,
  liver: Stethoscope,
  heart: Heart,
  diabetes: Droplets,
  joints: Shield,
}

export function LandingQuickCategories({ onSelect }) {
  return (
    <section aria-label="Browse by category" className="landing-reveal border-b border-line/50 bg-white py-4 shadow-sm md:py-5">
      <div className={LANDING_CONTAINER}>
        <div className="landing-scroll-row flex gap-2.5 overflow-x-auto pb-1 md:grid md:grid-cols-9 md:gap-3 md:overflow-visible">
          {QUICK_CATEGORIES.map(({ filterKey, label, tint }) => {
            const Icon = ICONS[filterKey] ?? FlaskConical
            return (
              <button
                key={filterKey}
                type="button"
                onClick={() => onSelect?.(filterKey)}
                className="landing-category-chip flex min-w-[88px] shrink-0 cursor-pointer flex-col items-center gap-2 p-3 md:min-w-0"
              >
                <span className={cn('landing-category-icon grid h-11 w-11 place-items-center', tint)}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-center text-[11px] font-bold leading-tight text-ink">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
