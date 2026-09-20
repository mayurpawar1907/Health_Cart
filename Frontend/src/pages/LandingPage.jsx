import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LandingFooter, LandingHeader } from '@/components/landing/LandingLayout'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingServiceHub } from '@/components/landing/LandingServiceHub'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingFeatured } from '@/components/landing/LandingFeatured'
import { LandingMembership } from '@/components/landing/LandingMembership'
import { LandingSocialProof } from '@/components/landing/LandingSocialProof'
import { LandingRateList } from '@/components/landing/LandingRateList'
import { LANDING_CONTAINER, readLandingCity, saveLandingCity } from '@/components/landing/landing-utils'
import { useCatalogStats } from '@/hooks/usePlatformPricing'
import api, { unwrap } from '@/api/client'
import { PaymentDiscountBadge } from '@/components/brand/PaymentDiscountOffer'
import { cn } from '@/utils/utils'

const PAGE_TITLE = 'HealthID Card — Home Lab Tests & Free Family Health Card'
const PAGE_DESC =
  'Book blood tests and health packages with free home collection. HealthID Card offers special partner rates, family membership, wallet credits, and WhatsApp reports.'

export function LandingPage() {
  const navigate = useNavigate()
  const { user, accessToken } = useSelector((s) => s.auth)
  const stats = useCatalogStats()
  const [searchQuery, setSearchQuery] = useState('')
  const [rateCategory, setRateCategory] = useState('All')
  const [city, setCity] = useState(readLandingCity)
  const [serviceTab, setServiceTab] = useState('full-body-packages')

  function handleCityChange(next) {
    setCity(next)
    saveLandingCity(next)
  }

  const plansQ = useQuery({
    queryKey: ['landing-plans'],
    queryFn: async () => unwrap((await api.get('/membership/plans')).data),
  })

  const planBenefits =
    plansQ.data?.[0]?.benefits?.map((b) => b.title).filter(Boolean) ?? [
      'Extra off special price at every payment',
      'Free 1-year family membership',
      'Exclusive special rates on lab tests',
      'Free home sample collection',
      'WhatsApp booking updates & reports',
    ]

  const FAQ = [
    {
      q: `How does the extra ${stats.flatDiscount}% discount at payment work?`,
      a: `MRP is shown for reference only. You pay the special partner rate first, then get an extra flat ${stats.flatDiscount}% off that special price at checkout — not off MRP.`,
    },
    {
      q: 'Is the HealthID Card really free?',
      a: 'Yes. During our launch period, you get a 1-year family membership at zero cost — including exclusive special rates and free home collection.',
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
    document.title = PAGE_TITLE

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', PAGE_DESC)

    return () => {
      document.body.style.overflow = 'hidden'
      document.title = 'HealthID Card — Care Beyond Borders'
    }
  }, [])

  return (
    <div className="landing-page min-h-screen bg-cream text-ink">
      <LandingHeader city={city} onCityChange={handleCityChange} />

      <main>
        {/* Primary discovery — category mega menu */}
        <LandingServiceHub city={city} activeTab={serviceTab} onTabChange={setServiceTab} />

        {/* Hero — value prop + search + conversion */}
        <LandingHero
          city={city}
          stats={stats}
          onSearch={(q) => {
            setSearchQuery(q)
            setRateCategory('All')
          }}
        />

        {/* Reduce anxiety — show process early */}
        <LandingHowItWorks />

        {/* Curated picks — packages & popular tests */}
        <LandingFeatured />

        {/* Single source of truth for pricing */}
        <LandingRateList
          externalQuery={searchQuery}
          externalCategory={rateCategory}
          onCategoryChange={setRateCategory}
          onQueryChange={setSearchQuery}
        />

        {/* Membership conversion */}
        <LandingMembership benefits={planBenefits} />

        {/* Trust + social proof */}
        <LandingSocialProof />

        {/* FAQ */}
        <section id="faq" className={cn(LANDING_CONTAINER, 'max-w-3xl py-14 md:py-16')}>
          <h2 className="text-center font-display text-3xl text-ink">Common questions</h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-ink-soft">
            Everything you need to know before booking your first home collection.
          </p>
          <div className="mt-10 divide-y divide-line rounded-2xl border border-line/80 bg-white shadow-sm">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5 py-4 sm:px-6 sm:py-5">
                <summary className="cursor-pointer list-none font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {f.q}
                    <ChevronRight
                      className="h-5 w-5 shrink-0 text-teal transition group-open:rotate-90"
                      aria-hidden
                    />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-line/60 bg-gradient-to-r from-teal to-teal-dark px-4 py-14 text-center text-white md:px-6 md:py-16">
          <PaymentDiscountBadge size="lg" className="mx-auto mb-4 !bg-white/15" />
          <h2 className="font-display text-3xl md:text-4xl">Ready to book your first test?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/80">
            Free 1-year HealthID Card · Extra {stats.flatDiscount}% off at payment · {stats.testCount || '…'}+ tests ·
            Home collection in {city}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="rounded-xl px-10">
                Create free account
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                className="rounded-xl border border-white/30 bg-transparent px-10 text-white hover:bg-white/10"
              >
                I have an account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
