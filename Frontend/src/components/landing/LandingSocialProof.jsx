import { MessageCircle, ShieldCheck, Star, Truck } from 'lucide-react'
import { LANDING_CONTAINER } from '@/components/landing/landing-utils'

const PILLARS = [
  {
    icon: Truck,
    title: 'Home collection included',
    body: 'Certified phlebotomists visit at your chosen slot — no lab queues.',
  },
  {
    icon: ShieldCheck,
    title: 'NABL partner network',
    body: 'Transparent MRP vs special pricing from accredited partner labs.',
  },
  {
    icon: MessageCircle,
    title: 'Reports where you need them',
    body: 'Secure digital vault plus WhatsApp delivery when results are ready.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Priya S.',
    city: 'Mumbai',
    text: 'Booked a full body checkup for my parents at home. Reports came on WhatsApp the next day.',
    rating: 5,
  },
  {
    name: 'Rahul M.',
    city: 'Bangalore',
    text: 'The free HealthID Card saved us on every test. Adding family members was seamless.',
    rating: 5,
  },
  {
    name: 'Anita K.',
    city: 'Delhi',
    text: 'Simple home collection, clear pricing, and no hidden charges. Exactly what we needed.',
    rating: 5,
  },
]

export function LandingSocialProof() {
  return (
    <section className="border-t border-line/60 bg-white py-14 md:py-16">
      <div className={LANDING_CONTAINER}>
        <div className="mx-auto mb-10 max-w-2xl text-center lg:hidden">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal">Why HealthID Card</p>
          <h2 className="mt-2 font-display text-3xl text-ink">Healthcare built for real life</h2>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
          <div>
            <p className="hidden text-xs font-bold uppercase tracking-[0.2em] text-teal lg:block">Why HealthID Card</p>
            <h2 className="mt-2 hidden font-display text-3xl text-ink lg:block">Healthcare built for real life</h2>
            <ul className="mt-8 space-y-4">
              {PILLARS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4 rounded-xl border border-line/60 bg-cream/30 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-teal-light text-teal">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{title}</h3>
                    <p className="mt-1 text-sm text-ink-soft">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="font-display text-2xl text-ink md:text-3xl">What members say</h2>
            <p className="mt-2 text-sm text-ink-soft">Feedback from families using home lab tests with HealthID Card.</p>
            <div className="mt-6 space-y-4">
              {TESTIMONIALS.map((t) => (
                <blockquote key={t.name} className="rounded-2xl border border-line/70 bg-cream/40 p-5">
                  <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">&ldquo;{t.text}&rdquo;</p>
                  <footer className="mt-3 text-sm font-semibold text-ink">
                    {t.name} · <span className="font-normal text-ink-soft">{t.city}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
