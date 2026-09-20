import { Link } from 'react-router-dom'
import { Shield, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LANDING_CONTAINER } from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

export function LandingMembership({ benefits }) {
  return (
    <section id="membership" className="landing-reveal border-y border-white/5 bg-gradient-to-br from-[#0a2540] via-[#103554] to-[#061829] py-14 text-white shadow-xl md:py-16">
      <div className={cn(LANDING_CONTAINER, 'grid items-center gap-10 lg:grid-cols-2 lg:gap-14')}>
        <div className="text-center lg:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-light">Free for 1 year</p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">One card for your whole family</h2>
          <p className="mx-auto mt-4 max-w-lg leading-relaxed text-white/75 lg:mx-0">
            HealthID Card unlocks partner-lab special rates, free home collection, wallet credits, and WhatsApp
            reports — for you, your spouse, parents, and children on a single account.
          </p>
          <ul className="mt-8 space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-white/90">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-teal-light" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
          <Link to="/signup" className="mt-8 inline-block">
            <Button variant="primary" size="lg" className="rounded-xl px-8">
              Activate free card
            </Button>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <div className="landing-hero-panel rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:p-8">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a3d56] to-teal p-6 shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">HealthID Card</p>
              <p className="mt-8 font-display text-2xl">Your family</p>
              <p className="mt-1 text-sm text-white/60">Member rates · Home collection included</p>
              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-xs text-white/50">Digital QR card</span>
                <Users className="h-5 w-5 text-teal-light" aria-hidden />
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-white/50">Show at home collection · Add up to 5 family members</p>
          </div>
        </div>
      </div>
    </section>
  )
}
