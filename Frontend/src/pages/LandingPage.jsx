import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LandingFooter, LandingHeader } from '@/components/landing/LandingLayout'
import { LandingServiceHub } from '@/components/landing/LandingServiceHub'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingDiscoverSection } from '@/components/landing/LandingDiscoverSection'
import { LandingPackageShowcase } from '@/components/landing/LandingPackageShowcase'
import { LandingHealthRisks } from '@/components/landing/LandingHealthRisks'
import { LandingHealthHub } from '@/components/landing/LandingHealthHub'
import { LandingWhyChoose } from '@/components/landing/LandingWhyChoose'
import { LandingJourney } from '@/components/landing/LandingJourney'
import { LandingMembership } from '@/components/landing/LandingMembership'
import { LandingRateList } from '@/components/landing/LandingRateList'
import { LandingBlock, LandingSectionHeader } from '@/components/landing/LandingSection'
import { readLandingCity, saveLandingCity, SERVICE_TAB_LABELS } from '@/components/landing/landing-utils'
import { useCatalogStats } from '@/hooks/usePlatformPricing'
import api, { unwrap } from '@/api/client'
import { PaymentDiscountBadge } from '@/components/brand/PaymentDiscountOffer'

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

  const scrollToCatalog = useCallback((opts = {}) => {
    const { query = '', category = 'All', tab = 'packages' } = opts
    if (query) setSearchQuery(query)
    if (category) setRateCategory(category)
    setServiceTab(tab === 'tests' ? 'blood-tests' : 'full-body-packages')
    window.setTimeout(() => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }, [])

  const handleCategorySelect = useCallback(
    (filterKey) => {
      const label = SERVICE_TAB_LABELS[filterKey]
      setServiceTab(filterKey)
      scrollToCatalog({ category: label ?? 'All', tab: 'packages' })
    },
    [scrollToCatalog],
  )

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
    <div className="landing-page min-h-screen text-ink">
      <LandingHeader city={city} onCityChange={handleCityChange} />

      <main>
        <LandingServiceHub
          city={city}
          activeTab={serviceTab}
          onTabChange={setServiceTab}
          reportHours={stats.reportHours}
          onBrowseCatalog={scrollToCatalog}
        />

        <LandingHero
          city={city}
          stats={stats}
          onSearch={(q) => scrollToCatalog({ query: q, category: 'All' })}
        />

        <LandingDiscoverSection
          city={city}
          stats={stats}
          onSelect={handleCategorySelect}
          onBrowseCatalog={scrollToCatalog}
        />

        <LandingPackageShowcase city={city} reportHours={stats.reportHours} />

        <LandingHealthRisks city={city} onSelect={handleCategorySelect} />

        <LandingHealthHub />

        <LandingWhyChoose />

        <LandingJourney reportHours={stats.reportHours} />

        <div id="how-it-works" className="sr-only" aria-hidden />

        <LandingRateList
          externalQuery={searchQuery}
          externalCategory={rateCategory}
          onCategoryChange={setRateCategory}
          onQueryChange={setSearchQuery}
        />

        <LandingMembership benefits={planBenefits} />

        <LandingBlock id="faq" containerClassName="max-w-3xl">
          <LandingSectionHeader
            center
            title="Common questions"
            subtitle="Everything you need to know before booking your first home collection."
          />
          <div className="landing-faq-panel mt-8 divide-y divide-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5 py-4 sm:px-6">
                <summary className="cursor-pointer list-none font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4 text-sm md:text-base">
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
        </LandingBlock>

        <section className="landing-cta-section landing-reveal border-t border-line/40 px-4 py-12 text-center text-white md:py-16">
          <PaymentDiscountBadge size="lg" className="mx-auto mb-4 !bg-white/15" />
          <h2 className="font-display text-2xl md:text-3xl">Ready to book your first test?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/80 md:text-base">
            Free 1-year HealthID Card · Extra {stats.flatDiscount}% off at payment · Home collection in {city}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/signup">
              <Button variant="accent" size="lg" className="rounded-xl px-8">
                Create free account
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                className="rounded-xl border border-white/30 bg-transparent px-8 text-white hover:bg-white/10"
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
