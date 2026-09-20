import { Clock, CreditCard, MessageCircle, ShieldCheck, Truck, Wallet } from 'lucide-react'

const BENEFITS = [
  {
    icon: CreditCard,
    title: 'Free HealthID Card',
    body: 'One-year family membership at zero cost — add loved ones and unlock partner special rates on every test.',
  },
  {
    icon: Truck,
    title: 'Free home collection',
    body: 'Certified phlebotomists visit your address at the slot you choose. No lab queues or travel.',
  },
  {
    icon: Wallet,
    title: 'Wallet & referral credits',
    body: 'Joining bonus and referral rewards auto-apply at checkout after your payment discount.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp reports',
    body: 'Digital reports in your secure account, with WhatsApp delivery when results are ready.',
  },
  {
    icon: Clock,
    title: 'Fast turnaround',
    body: 'Most reports are available within 24–48 hours, with in-app status updates.',
  },
  {
    icon: ShieldCheck,
    title: 'NABL partner labs',
    body: 'Tests processed at accredited partner laboratories with transparent MRP vs special pricing.',
  },
]

export function LandingWhyUs() {
  return (
    <section id="why-us" className="border-y border-line/70 bg-gradient-to-b from-cream to-white py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal">Why HealthID Card</p>
          <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">Healthcare that fits your routine</h2>
          <p className="mt-3 text-ink-soft">
            Everything you need to book, collect, and receive lab reports — without leaving home.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="card-premium flex gap-4 rounded-2xl p-5 md:p-6"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-light text-teal">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-lg text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
