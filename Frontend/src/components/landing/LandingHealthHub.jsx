import { Link } from 'react-router-dom'
import { Calendar, MessageCircle, Users, Wallet } from 'lucide-react'
import { LandingBlock, LandingSectionHeader } from '@/components/landing/LandingSection'

const HUB = [
  {
    icon: Users,
    title: 'Family HealthID Card',
    body: 'Add spouse, parents & children on one free membership.',
    href: '/signup',
  },
  {
    icon: Wallet,
    title: 'Wallet & cashback',
    body: 'Referral rewards and joining bonus at checkout.',
    href: '/signup',
  },
  {
    icon: Calendar,
    title: 'Book appointments',
    body: 'Choose home collection slots that fit your schedule.',
    href: '/signup',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp updates',
    body: 'Booking confirmations and reports on WhatsApp.',
    href: '/signup',
  },
]

export function LandingHealthHub() {
  return (
    <LandingBlock alt>
      <LandingSectionHeader
        eyebrow="Member services"
        title="HealthID member hub"
        subtitle="Everything beyond booking a single test."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 md:mt-8">
        {HUB.map(({ icon: Icon, title, body, href }) => (
          <Link
            key={title}
            to={href}
            className="landing-card group flex flex-col rounded-xl bg-gradient-to-b from-white to-cream/30 p-4"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-light text-teal transition group-hover:bg-teal group-hover:text-white">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-3 text-sm font-bold text-ink">{title}</h3>
            <p className="mt-1 flex-1 text-xs leading-relaxed text-ink-soft">{body}</p>
            <span className="mt-3 text-[11px] font-bold text-teal">Know more →</span>
          </Link>
        ))}
      </div>
    </LandingBlock>
  )
}
