import { Link } from 'react-router-dom'
import { ArrowRight, Home, PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LandingBlock } from '@/components/landing/LandingSection'

export function LandingPromoBanners({ city }) {
  return (
    <LandingBlock alt className="!border-t-0">
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <article className="landing-promo-card landing-promo-card--primary relative overflow-hidden p-5 md:p-7">
          <div className="relative z-10 max-w-[72%]">
            <p className="landing-promo-eyebrow text-[10px] font-bold uppercase tracking-wider">Health packages</p>
            <h2 className="mt-1.5 font-display text-xl font-bold md:text-2xl">Best health checkup deals</h2>
            <p className="mt-2 text-xs leading-relaxed text-white/75 md:text-sm">
              Full body & specialty panels at member special rates in {city}.
            </p>
            <Link to="/signup" className="mt-5 inline-block">
              <Button variant="accent" size="sm" className="rounded-lg px-4 text-xs shadow-md">
                View packages
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <PackageOpen className="pointer-events-none absolute -bottom-3 -right-3 h-28 w-28 text-white/10 md:h-32 md:w-32" aria-hidden />
        </article>

        <article className="landing-promo-card landing-promo-card--secondary relative overflow-hidden p-5 md:p-7">
          <div className="relative z-10 max-w-[72%]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal">Home service</p>
            <h2 className="mt-1.5 font-display text-xl font-bold text-ink md:text-2xl">Sample collection at home</h2>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft md:text-sm">
              Certified phlebotomist visits your address — free for HealthID Card members.
            </p>
            <a href="#health-journey" className="mt-5 inline-block">
              <Button variant="secondary" size="sm" className="rounded-lg px-4 text-xs">
                How it works
              </Button>
            </a>
          </div>
          <Home className="pointer-events-none absolute -bottom-2 -right-2 h-28 w-28 text-teal/12 md:h-32 md:w-32" aria-hidden />
        </article>
      </div>
    </LandingBlock>
  )
}
