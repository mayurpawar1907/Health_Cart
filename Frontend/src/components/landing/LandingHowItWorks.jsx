import { Clock, MessageCircle, Truck } from 'lucide-react'
import { LANDING_CONTAINER } from '@/components/landing/landing-utils'

const STEPS = [
  {
    icon: Clock,
    step: '01',
    title: 'Choose your test',
    body: 'Browse packages from the menu above or search the full catalog. Pick a slot that works for you.',
  },
  {
    icon: Truck,
    step: '02',
    title: 'We collect at home',
    body: 'A certified phlebotomist visits your address — no queues, no travel, no extra collection fee for members.',
  },
  {
    icon: MessageCircle,
    step: '03',
    title: 'Reports on WhatsApp',
    body: 'Digital reports land in your account, with WhatsApp notification when results are ready.',
  },
]

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-line/60 bg-cream/40 py-14 md:py-16">
      <div className={LANDING_CONTAINER}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal">How it works</p>
          <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">From booking to report in 3 steps</h2>
          <p className="mt-3 text-ink-soft">Designed for busy families — book in minutes, collect at home, receive reports digitally.</p>
        </div>

        <ol className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
          {STEPS.map((s) => (
            <li
              key={s.title}
              className="relative rounded-2xl border border-line/70 bg-white p-6 shadow-sm transition hover:border-teal/25 hover:shadow-md"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal">{s.step}</span>
              <div className="mt-4 grid h-12 w-12 place-items-center rounded-xl bg-teal-light text-teal">
                <s.icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-4 font-display text-xl text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
