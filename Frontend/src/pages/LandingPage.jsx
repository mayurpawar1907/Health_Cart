import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Heart,
  MessageCircle,
  Shield,
  Star,
  Truck,
  Users,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { LandingFooter, LandingHeader } from '@/components/landing/LandingLayout'
import { LandingHealthPackages, LandingRateList } from '@/components/landing/LandingRateList'
import { useCatalogStats } from '@/hooks/usePlatformPricing'
import api, { unwrap } from '@/api/client'
import { PaymentDiscountBanner, PaymentDiscountBadge } from '@/components/brand/PaymentDiscountOffer'

const STEPS = [
  { icon: Clock, title: 'Book in 2 minutes', body: 'Choose your test, share your location, and pick a convenient home collection slot.' },
  { icon: Truck, title: 'We come to you', body: 'Certified phlebotomists visit your doorstep — no lab queues, no travel.' },
  { icon: MessageCircle, title: 'Reports on WhatsApp', body: 'Digital reports in your secure account, with instant WhatsApp delivery.' },
]

const TESTIMONIALS = [
  { name: 'Priya S.', city: 'Mumbai', text: 'Booked a full body checkup for my parents at home. The phlebotomist was professional and reports came on WhatsApp the next day.', rating: 5 },
  { name: 'Rahul M.', city: 'Bangalore', text: 'The free HealthID Card saved us on every test. Adding my wife and kids to one card was seamless.', rating: 5 },
  { name: 'Anita K.', city: 'Delhi', text: 'Finally a healthcare app that feels simple. Home collection, clear pricing, and no hidden charges.', rating: 5 },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { user, accessToken } = useSelector((s) => s.auth)
  const stats = useCatalogStats()
  const plansQ = useQuery({
    queryKey: ['landing-plans'],
    queryFn: async () => unwrap((await api.get('/membership/plans')).data),
  })
  const planBenefits =
    plansQ.data?.[0]?.benefits?.map((b) => b.title).filter(Boolean) ??
    [
      'Extra off special price at every payment',
      'Free 1-year family membership',
      'Exclusive special rates on lab tests',
      'Free home sample collection',
      'WhatsApp booking updates & reports',
    ]

  const STATS = [
    { value: `${stats.flatDiscount}%`, label: 'Off at every payment' },
    { value: `${stats.testCount || '…'}+`, label: 'Blood tests & profiles' },
    { value: `${stats.packageCount || '…'}`, label: 'Health packages' },
    { value: `${stats.familyMembers}`, label: 'Family members per card' },
  ]

  const FAQ = [
    {
      q: `How does the extra ${stats.flatDiscount}% discount at payment work?`,
      a: `MRP is shown for reference only. You pay the special partner rate first, then get an extra flat ${stats.flatDiscount}% off that special price at checkout — not off MRP.`,
    },
    {
      q: 'Is the HealthID Card really free?',
      a: `Yes. During our launch period, you get a 1-year family membership at zero cost — including exclusive special rates and free home collection.`,
    },
    {
      q: 'Which cities do you serve?',
      a: 'We offer home collection across major metro cities and are expanding rapidly.',
    },
    {
      q: 'How fast will I get my reports?',
      a: 'Most reports are available within 24–48 hours. You receive an in-app notification and a WhatsApp message when ready.',
    },
    {
      q: 'Can I book for family members?',
      a: `Absolutely. Add up to ${stats.familyMembers} family members on your HealthID Card and book tests for anyone in your family.`,
    },
  ]

  useEffect(() => {
    if (user?.id && accessToken) navigate('/home', { replace: true })
  }, [user, accessToken, navigate])

  useEffect(() => {
    document.body.style.overflow = 'auto'
    return () => {
      document.body.style.overflow = 'hidden'
    }
  }, [])

  return (
    <div className="min-h-screen bg-cream text-ink">
      <LandingHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-light via-cream to-[#fff8e6]" />
        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-brand-red/5 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:px-6 lg:grid-cols-2 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-red/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-red">
                Launch offer · Free for 1 year
              </span>
              <PaymentDiscountBadge />
            </div>
            <h1 className="mt-5 font-display text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-[3.25rem]">
              Lab tests at home.
              <br />
              <span className="text-teal">One card for your whole family.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
              HealthID Card brings hospital-grade diagnostics to your doorstep — special rates on {stats.testCount || '…'}+
              tests, an extra <strong className="text-ink">{stats.flatDiscount}% off at every payment</strong>, WhatsApp
              reports, and a free 1-year family membership.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button variant="accent" size="lg" className="rounded-xl px-8">
                  Get your free card
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="rounded-xl px-8">
                  Member login
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-teal">{s.value}</p>
                  <p className="text-xs text-ink-soft">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl border border-line/80 shadow-[0_24px_60px_rgba(43,90,121,0.15)]">
              <div className="relative h-56 lg:h-72">
                <img src="/banners/hero-lab.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f2a3d] via-teal/90 to-teal-light/80" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(227,62,43,0.25),transparent_45%)]" />
                <div className="relative flex h-full flex-col justify-end p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">NABL partner network</p>
                  <p className="mt-1 font-display text-2xl">Diagnostics at your doorstep</p>
                </div>
              </div>
              <div className="bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-teal-light text-teal">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-display text-lg">HealthID Card</p>
                    <p className="text-sm text-ink-soft">Free · 1 year · Family included</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  {[
                    `Extra ${stats.flatDiscount}% off at payment`,
                    `Special rates on ${stats.testCount || '…'}+ tests`,
                    'Free home collection',
                    'WhatsApp reports',
                  ].map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-line bg-white px-4 py-3 shadow-lg md:block">
              <p className="text-xs text-ink-soft">Trusted by</p>
              <p className="font-display text-xl">10,000+</p>
              <p className="text-xs text-ink-soft">families</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-4 md:px-6">
        <PaymentDiscountBanner />
      </section>

      <section className="mt-8 border-y border-line bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-4 md:gap-10 md:px-6">
          {['NABL Partner Labs', 'ISO 27001 Certified', 'CAP Accredited', 'Verified Phlebotomists'].map((b) => (
            <span key={b} className="flex items-center gap-2 text-sm font-medium text-ink-soft">
              <Award className="h-4 w-4 text-teal" />
              {b}
            </span>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">Simple by design</p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">Healthcare that fits your life</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-soft">Three steps from booking to report — no lab visits, no paperwork.</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-red px-3 py-0.5 text-[10px] font-bold uppercase text-white">
                Step {i + 1}
              </span>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-light text-teal">
                <s.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-display text-xl">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="membership" className="bg-gradient-to-br from-ink via-teal-dark to-ink py-20 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red-light">HealthID Card</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">Your family&apos;s health passport</h2>
            <p className="mt-4 text-white/75 leading-relaxed">
              One digital card. One year free. Exclusive partner rates on every test — for you, your spouse, parents, and
              children.
            </p>
            <ul className="mt-8 space-y-3">
              {planBenefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brand-red-light" />
                  {b}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="mt-8 inline-block">
              <Button variant="accent" size="lg" className="rounded-xl px-8">
                Activate free card →
              </Button>
            </Link>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-sm">
            <div className="rounded-2xl bg-gradient-to-br from-[#1a3d56] to-teal p-6 shadow-2xl">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">HealthID Card</p>
              <p className="mt-6 font-display text-2xl">Your Name</p>
              <p className="mt-1 text-sm text-white/60">Valid thru · 12 Sep 2027</p>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-xs text-white/50">Family · Special rates</span>
                <Users className="h-5 w-5 text-brand-red-light" />
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-white/50">Digital card with QR · Share at home collection</p>
          </div>
        </div>
      </section>

      <LandingHealthPackages />
      <LandingRateList />

      <section className="border-y border-line bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-center font-display text-3xl">Trusted by families across India</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.name} className="rounded-2xl border border-line bg-cream/50 p-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">&ldquo;{t.text}&rdquo;</p>
                <footer className="mt-4 text-sm font-semibold">
                  {t.name} · <span className="font-normal text-ink-soft">{t.city}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 md:px-6">
        <h2 className="text-center font-display text-3xl">Questions? We&apos;ve got answers.</h2>
        <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-white">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-6 py-5">
              <summary className="cursor-pointer list-none font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {f.q}
                  <ChevronRight className="h-5 w-5 shrink-0 text-teal transition group-open:rotate-90" />
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-teal px-4 py-16 text-center text-white md:px-6">
        <h2 className="font-display text-3xl md:text-4xl">Start your family&apos;s health journey today</h2>
        <p className="mx-auto mt-3 max-w-lg text-white/80">
          Free 1-year HealthID Card · Extra {stats.flatDiscount}% off at payment · {stats.testCount || '…'}+ tests · Home
          collection
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/signup">
            <Button variant="accent" size="lg" className="rounded-xl px-10">
              Create free account
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" className="rounded-xl border border-white/30 bg-transparent px-10 text-white hover:bg-white/10">
              I already have an account
            </Button>
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
