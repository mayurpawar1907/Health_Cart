import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  Award,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  Droplets,
  FlaskConical,
  Heart,
  Home,
  MessageCircle,
  Microscope,
  Pill,
  ShieldCheck,
  Stethoscope,
  Truck,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { HealthIdCard, type HealthIdCardData } from '@/components/brand/HealthIdCard'
import type { Category, LabTest } from '@/types'
import { formatMoney } from '@/lib/utils'

const CATEGORY_ICONS: Record<string, typeof FlaskConical> = {
  'blood-tests': Droplets,
  diabetes: Activity,
  thyroid: Microscope,
  liver: Pill,
  kidney: FlaskConical,
  heart: Heart,
  vitamins: Award,
  hormones: Stethoscope,
  infection: ShieldCheck,
  'full-body-packages': Users,
}

export function HeroSection({
  userName,
  city,
  tests,
  mobile,
}: {
  userName: string
  city?: string
  mobile?: string
  tests: LabTest[]
}) {
  const navigate = useNavigate()
  const [name, setName] = useState(userName)
  const [phone, setPhone] = useState(mobile ?? '')
  const [location, setLocation] = useState(city ?? 'Mumbai')
  const [testId, setTestId] = useState('')

  function onBook(e: FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (testId) params.set('testId', testId)
    navigate(`/appointments/book?${params.toString()}`)
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-teal-light via-white to-[#fff8e6]">
      <div className="grid gap-8 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit rounded-full bg-brand-red/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-red">
            Care beyond borders
          </span>
          <h1 className="mt-4 font-display text-3xl leading-tight text-ink md:text-4xl lg:text-[2.6rem]">
            Full body checkups & lab tests at home
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
            Book blood tests and health profiles with free home sample collection. Get reports on WhatsApp at exclusive HealthID Card rates.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/tests?packages=true">
              <Button size="lg" className="rounded-lg">View all packages</Button>
            </Link>
            <Link to="/membership">
              <Button size="lg" variant="secondary" className="rounded-lg">Get free HealthID Card</Button>
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-line/80 pt-6">
            {[
              { n: '30+', l: 'Lab tests' },
              { n: '30%', l: 'Member savings' },
              { n: '24hr', l: 'Report delivery' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-2xl font-bold text-teal">{s.n}</p>
                <p className="text-xs text-ink-soft">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-[0_12px_40px_rgba(43,90,121,0.08)]">
          <h2 className="font-display text-xl text-ink">Quick book at home</h2>
          <p className="mt-1 text-sm text-ink-soft">Phlebotomist visits your doorstep</p>
          <form onSubmit={onBook} className="mt-5 space-y-3">
            <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="City" value={location} onChange={(e) => setLocation(e.target.value)} />
            <label className="block text-sm">
              Select test / package
              <select
                className="mt-1 w-full rounded-2xl border border-line px-4 py-3 text-sm outline-none focus:border-teal"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
              >
                <option value="">Choose a test</option>
                {tests.slice(0, 12).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </label>
            <Button type="submit" className="mt-2 w-full rounded-lg" size="lg">Book now</Button>
          </form>
        </div>
      </div>
    </section>
  )
}

export function CategoryStrip({ categories }: { categories: Category[] }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">Browse by category</h2>
        <Link to="/tests" className="flex items-center gap-1 text-sm font-medium text-teal hover:underline">
          View all <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => {
          const Icon = CATEGORY_ICONS[c.slug] ?? FlaskConical
          return (
            <Link
              key={c.id}
              to={`/tests?category=${c.slug}`}
              className="flex min-w-[88px] flex-col items-center gap-2 rounded-xl border border-line bg-white px-4 py-4 text-center transition hover:border-teal hover:bg-teal-light/40"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-teal-light text-teal">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium leading-tight text-ink">{c.name}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function SectionHeader({ title, href, linkLabel = 'View all' }: { title: string; href: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="font-display text-2xl text-ink md:text-3xl">{title}</h2>
      <Link to={href} className="flex shrink-0 items-center gap-1 text-sm font-medium text-teal hover:underline">
        {linkLabel} <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export function HorizontalOffers({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  )
}

export function MembershipSection({
  hasMembership,
  cardData,
}: {
  hasMembership: boolean
  cardData?: HealthIdCardData | null
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#fff8e6] via-[#fff3d6] to-teal-light/50">
      <div className="grid items-center gap-8 p-6 lg:grid-cols-2 lg:p-8">
        <div>
          <span className="rounded-full bg-brand-red px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Free for 1 year
          </span>
          <h2 className="mt-4 font-display text-3xl text-ink">HealthID Card membership</h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
            One card for your whole family. Flat 30% off every test, free home collection, WhatsApp updates, and digital reports in your account.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {['Exclusive rates on 63+ tests', 'Add up to 5 family members', 'Free home sample collection', 'Reports on app + WhatsApp'].map((b) => (
              <li key={b} className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-teal" />
                {b}
              </li>
            ))}
          </ul>
          <Link to={hasMembership ? '/membership/card' : '/membership'}>
            <Button className="mt-6 rounded-lg" size="lg" variant={hasMembership ? 'primary' : 'accent'}>
              {hasMembership ? 'View my card' : 'Join now — it\'s free'}
            </Button>
          </Link>
        </div>
        <div className="flex justify-center lg:justify-end">
          {hasMembership && cardData ? (
            <div className="scale-[0.92] origin-center lg:origin-right">
              <HealthIdCard data={cardData} />
            </div>
          ) : (
            <div className="w-full max-w-[380px] rounded-2xl border-2 border-dashed border-teal/30 bg-white/70 p-8 text-center">
              <CreditCardPlaceholder />
              <p className="mt-4 font-display text-xl text-ink">Your digital health card</p>
              <p className="mt-2 text-sm text-ink-soft">Activate once · Valid 12 months · Family included</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function CreditCardPlaceholder() {
  return (
    <div className="mx-auto h-44 w-full max-w-[320px] rounded-2xl bg-gradient-to-br from-ink to-teal p-5 text-left text-white shadow-lg">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">HealthID Card</p>
      <p className="mt-8 font-display text-2xl">Member Name</p>
      <p className="mt-2 text-xs text-white/60">Valid thru · 12 Sep 2027</p>
    </div>
  )
}

export function HowItWorksSection() {
  const steps = [
    { icon: CalendarCheck, title: 'Book online', body: 'Choose test, share location, pick your preferred time slot.' },
    { icon: Home, title: 'Home collection', body: 'Certified phlebotomist visits your home for sample pickup.' },
    { icon: MessageCircle, title: 'Reports on WhatsApp', body: 'Digital reports in your login and shared on WhatsApp.' },
  ]

  return (
    <section className="rounded-2xl border border-line bg-white p-6 md:p-8">
      <h2 className="text-center font-display text-2xl md:text-3xl">How HealthID Card works</h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink-soft">
        From booking to report — a seamless at-home healthcare experience
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="relative text-center">
            {i < steps.length - 1 ? (
              <div className="absolute left-[calc(50%+40px)] top-8 hidden h-px w-[calc(100%-80px)] bg-line md:block" />
            ) : null}
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-light text-teal">
              <s.icon className="h-7 w-7" />
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-brand-red">Step {i + 1}</p>
            <h3 className="mt-2 font-display text-lg">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function TrustSection() {
  const badges = ['NABL Partner Labs', 'ISO 27001 Certified', 'CAP Accredited', 'Verified Phlebotomists']
  return (
    <section className="rounded-2xl bg-ink px-6 py-8 text-white md:px-10">
      <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="text-center md:text-left">
          <h2 className="font-display text-2xl">Trusted healthcare platform</h2>
          <p className="mt-2 text-sm text-white/70">Quality diagnostics with privacy-first digital reports</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {badges.map((b) => (
            <span key={b} className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-wide text-white/85">
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FaqSection() {
  const faqs = [
    { q: 'Is home sample collection really free?', a: 'Yes. HealthID Card members get free home collection across all major cities. Share your location and pick a convenient time slot during booking.' },
    { q: 'How does the 30% member discount work?', a: 'Once you activate your free HealthID Card, a flat 30% discount is automatically applied on every test and package at checkout.' },
    { q: 'Can I add family members to one card?', a: 'Absolutely. Add up to 5 family members on a single card and book tests for anyone in your family.' },
    { q: 'When will I receive my reports?', a: 'Most reports are available within 24–48 hours. You\'ll get an in-app notification and a WhatsApp message when your report is ready.' },
    { q: 'How do I pay for my booking?', a: 'Pay securely via UPI, debit/credit card, or cash on collection (COD) during the booking flow.' },
  ]

  return (
    <section className="rounded-2xl border border-line bg-white p-6 md:p-8">
      <h2 className="font-display text-2xl md:text-3xl">Frequently asked questions</h2>
      <div className="mt-5 divide-y divide-line">
        {faqs.map((f) => (
          <FaqItem key={f.q} question={f.q} answer={f.a} />
        ))}
      </div>
    </section>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="py-4">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-start justify-between gap-4 text-left">
        <span className="font-medium text-ink">{question}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-teal transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? <p className="mt-3 pr-8 text-sm leading-relaxed text-ink-soft">{answer}</p> : null}
    </div>
  )
}

export function UpcomingStrip({
  testName,
  date,
  time,
  address,
  href,
}: {
  testName: string
  date: string
  time: string
  address?: string
  href: string
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-teal/20 bg-teal-light/60 px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal text-white">
          <Truck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal">Upcoming home collection</p>
          <p className="font-medium text-ink">{testName}</p>
          <p className="text-sm text-ink-soft">{date} · {time}{address ? ` · ${address}` : ''}</p>
        </div>
      </div>
      <Link to={href}>
        <Button variant="secondary" size="sm" className="rounded-lg">View booking</Button>
      </Link>
    </div>
  )
}

export function ComparisonTable({ packages }: { packages: LabTest[] }) {
  if (!packages.length) return null
  const rows = ['Home collection', 'Digital reports', 'WhatsApp updates', 'Member 30% off', 'Family coverage']

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="border-b border-line px-6 py-5">
        <h2 className="font-display text-2xl">Compare health packages</h2>
        <p className="mt-1 text-sm text-ink-soft">All packages include free home collection for HealthID Card members</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-cream/80">
              <th className="px-6 py-3 font-medium text-ink-soft">Benefit</th>
              {packages.slice(0, 3).map((p) => (
                <th key={p.id} className="px-4 py-3 font-display text-base text-teal-dark">{p.name.replace(' Package', '').replace(' Checkup', '')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <td className="px-6 py-3 text-ink-soft">Price (member)</td>
              {packages.slice(0, 3).map((p) => (
                <td key={p.id} className="px-4 py-3 font-semibold">{formatMoney(p.memberPrice ?? p.discountedPrice ?? p.price)}</td>
              ))}
            </tr>
            {rows.map((row) => (
              <tr key={row} className="border-b border-line last:border-0">
                <td className="px-6 py-3 text-ink-soft">{row}</td>
                {packages.slice(0, 3).map((p) => (
                  <td key={p.id} className="px-4 py-3 text-success">✓ Included</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
