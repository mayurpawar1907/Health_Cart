import { LandingBlock, LandingSectionHeader } from '@/components/landing/LandingSection'
import { HEALTH_RISK_GRID, SERVICE_TAB_LABELS } from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

export function LandingHealthRisks({ city, onSelect }) {
  return (
    <LandingBlock id="health-risks" className="landing-block--white">
      <LandingSectionHeader
        eyebrow="Browse by concern"
        title="Health risk"
        subtitle={`Browse lab tests by health concern — home collection in ${city}.`}
      />

      <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:mt-8">
        {HEALTH_RISK_GRID.map(({ filterKey, blurb }) => {
          const label = SERVICE_TAB_LABELS[filterKey] ?? filterKey
          return (
            <button
              key={filterKey}
              type="button"
              onClick={() => onSelect?.(filterKey)}
              className={cn(
                'landing-card rounded-xl bg-gradient-to-b from-white to-cream/30 p-4 text-left',
              )}
            >
              <h3 className="text-sm font-bold text-ink">{label}</h3>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-soft">{blurb}</p>
              <span className="mt-2 inline-block text-[11px] font-bold text-teal">Book in {city} →</span>
            </button>
          )
        })}
      </div>
    </LandingBlock>
  )
}
