import {
  BadgeIndianRupee,
  CalendarClock,
  FileCheck,
  Home,
  ShieldCheck,
  Smartphone,
  Users,
  Zap,
} from 'lucide-react'
import { LandingBlock, LandingSectionHeader } from '@/components/landing/LandingSection'
import { WHY_CHOOSE_ITEMS } from '@/components/landing/landing-utils'

const ICONS = [ShieldCheck, BadgeIndianRupee, Smartphone, FileCheck, Home, Zap, Users, CalendarClock]

export function LandingWhyChoose() {
  return (
    <LandingBlock id="why-choose" className="landing-block--white">
      <LandingSectionHeader
        eyebrow="Trust & value"
        title="Why choose HealthID Card?"
        subtitle="Trusted home lab tests with member pricing — built for Indian families."
      />

      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 md:mt-8 md:gap-5">
        {WHY_CHOOSE_ITEMS.map(({ title, desc }, i) => {
          const Icon = ICONS[i % ICONS.length]
          return (
            <li
              key={title}
              className="landing-stat-card landing-card flex flex-col items-center rounded-xl bg-cream/30 p-3 text-center sm:p-4"
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-teal/15 bg-white text-teal shadow-sm">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-3 text-xs font-bold text-ink sm:text-sm">{title}</h3>
              <p className="mt-1 hidden text-[11px] leading-snug text-ink-soft sm:block">{desc}</p>
            </li>
          )
        })}
      </ul>
    </LandingBlock>
  )
}
