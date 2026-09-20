import { LandingBlock } from '@/components/landing/LandingSection'
import {
  JourneyIconBook,
  JourneyIconHome,
  JourneyIconReport,
  JourneyIconTruck,
} from '@/components/landing/LandingJourneyIcons'
import { cn } from '@/utils/utils'

const STEPS = [
  {
    Icon: JourneyIconBook,
    title: 'Book with Ease',
    body: 'Choose your test, time slot and book instantly.',
    pos: 'high',
  },
  {
    Icon: JourneyIconHome,
    title: 'Hassle-Free Home Collection',
    body: 'Safe & timely sample collection by trained phlebotomist.',
    pos: 'low',
  },
  {
    Icon: JourneyIconTruck,
    title: 'Secure Sample Transfer to Labs',
    body: 'Temperature-controlled & safe sample transportation to lab.',
    pos: 'high',
  },
  {
    Icon: JourneyIconReport,
    title: 'Quick & Easy Report Access',
    body: 'Get your reports via WhatsApp, SMS and Email.',
    pos: 'low',
  },
]

function JourneyWave() {
  return (
    <svg
      className="landing-journey-wave pointer-events-none absolute inset-x-0 top-8 hidden h-[7rem] w-full xl:block"
      viewBox="0 0 1000 112"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
    >
      <path
        className="landing-journey-wave-path"
        d="M 0 56 C 62 56 94 24 125 24 C 218 24 281 88 375 88 C 468 88 531 24 625 24 C 718 24 781 88 875 88 C 938 88 969 56 1000 56"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 6"
        strokeLinecap="round"
      />
      <circle className="landing-journey-wave-dot" cx="250" cy="56" r="4.5" />
      <circle className="landing-journey-wave-dot landing-journey-wave-dot--accent" cx="500" cy="56" r="4.5" />
      <circle className="landing-journey-wave-dot" cx="750" cy="56" r="4.5" />
    </svg>
  )
}

export function LandingJourney({ reportHours = 24 }) {
  const steps = STEPS.map((step, i) =>
    i === 3
      ? {
          ...step,
          body: `Get your reports within ${reportHours} hours via WhatsApp, SMS and Email.`,
        }
      : step,
  )

  return (
    <LandingBlock id="health-journey" className="landing-journey !border-t-0 !bg-cream">
      <header className="text-left">
        <p className="text-sm text-ink-soft md:text-base">Your HealthID</p>
        <h2 className="mt-1 font-display text-[1.65rem] font-bold leading-tight text-teal md:text-[1.85rem] lg:text-[2rem]">
          Health Checkup Journey
        </h2>
        <div className="mt-5 h-px w-full max-w-md bg-gradient-to-r from-line via-line/60 to-transparent" aria-hidden />
      </header>

      <div className="landing-journey-track relative mx-auto mt-12 max-w-6xl lg:mt-14">
        <JourneyWave />

        <ol className="grid gap-12 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-14 xl:grid-cols-4 xl:gap-8">
          {steps.map(({ Icon, title, body, pos }, i) => (
            <li
              key={title}
              className={cn(
                'landing-journey-step flex flex-col items-center',
                `landing-journey-step--${i + 1}`,
                pos === 'low' ? 'landing-journey-step--low' : 'landing-journey-step--high',
              )}
            >
              <div className="landing-journey-icon relative z-10 flex h-[6.25rem] w-[6.25rem] shrink-0 items-center justify-center rounded-full bg-teal-light ring-4 ring-white">
                <Icon />
              </div>

              <div className="landing-journey-copy mt-5 w-full max-w-[13.5rem] text-left">
                <h3 className="landing-journey-title text-[0.9375rem] font-bold leading-snug text-teal-dark md:text-base">
                  {title}
                </h3>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-soft md:text-sm">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </LandingBlock>
  )
}
