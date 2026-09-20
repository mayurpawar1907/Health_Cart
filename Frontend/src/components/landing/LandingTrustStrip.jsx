import { Award, Clock, Home, ShieldCheck } from 'lucide-react'
import { LANDING_CONTAINER } from '@/components/landing/landing-utils'

const ITEMS = [
  { icon: ShieldCheck, label: '100% accurate reports' },
  { icon: Award, label: 'NABL partner labs' },
  { icon: Home, label: 'Free home collection' },
  { icon: Clock, label: 'Reports in 24–48 hrs' },
]

export function LandingTrustStrip({ stats }) {
  return (
    <section className="landing-trust-strip landing-reveal py-3.5 md:py-4">
      <div className={LANDING_CONTAINER}>
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 md:justify-between">
          {ITEMS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5 text-xs font-semibold text-ink sm:text-sm">
              <span className="landing-trust-icon">
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </span>
              {label}
            </li>
          ))}
          {stats?.testCount ? (
            <li className="hidden items-center gap-2 text-xs font-semibold text-ink-soft lg:flex lg:text-sm">
              <span className="font-display text-base font-bold text-teal">{stats.testCount}+</span>
              tests & packages
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  )
}
