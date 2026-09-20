import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import api, { unwrap } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { PaymentDiscountBadge } from '@/components/brand/PaymentDiscountOffer'
import { Loading } from '@/components/ui/Loading'
import { formatCardPrice, LANDING_CONTAINER, specialPrice, testCountLabel } from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

function FeaturedCard({ item, isPackage }) {
  const mrp = Number(item.price)
  const special = specialPrice(item)
  const prices = formatCardPrice(mrp, special)

  return (
    <article className="flex h-full flex-col rounded-2xl border border-line/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal/25 hover:shadow-md">
      <p className="text-[10px] font-bold uppercase tracking-wider text-teal">
        {isPackage ? testCountLabel(item) : item.category?.name}
      </p>
      <h3 className="mt-2 line-clamp-2 min-h-[2.75rem] font-display text-lg leading-snug text-ink">{item.name}</h3>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <span className="text-2xl font-bold text-teal">{prices.special}</span>
        <span className="text-sm text-ink-soft line-through">{prices.mrp}</span>
        {prices.save > 0 ? (
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
            Save {prices.save}%
          </span>
        ) : null}
      </div>
      <PaymentDiscountBadge size="sm" tone="teal" className="mt-2" />
      <Link to="/signup" className="mt-auto pt-4">
        <Button variant="primary" className="w-full rounded-xl text-xs">
          Book with free card
        </Button>
      </Link>
    </article>
  )
}

export function LandingFeatured() {
  const [tab, setTab] = useState('packages')

  const packagesQ = useQuery({
    queryKey: ['public-packages'],
    queryFn: async () => unwrap((await api.get('/tests', { params: { packages: 'true' } })).data),
  })
  const popularQ = useQuery({
    queryKey: ['public-popular-tests'],
    queryFn: async () => unwrap((await api.get('/tests', { params: { popular: 'true' } })).data),
  })

  const packages = (packagesQ.data ?? [])
    .filter((t) => t.isPackage)
    .sort((a, b) => Number(b.isPopular) - Number(a.isPopular))
    .slice(0, 6)

  const tests = (popularQ.data ?? []).filter((t) => !t.isPackage).slice(0, 6)
  const loading = tab === 'packages' ? packagesQ.isLoading : popularQ.isLoading
  const items = tab === 'packages' ? packages : tests

  return (
    <section id="packages" className="py-14 md:py-16">
      <div className={LANDING_CONTAINER}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal">Most booked</p>
          <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">Start with what families choose</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Curated from your lab catalog — special member rates and free home collection on every booking.
          </p>
          <a
            href="#catalog"
            className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-teal hover:underline"
          >
            Browse full catalog
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="inline-flex rounded-xl border border-line/80 bg-cream/60 p-1">
          {[
            { id: 'packages', label: 'Health packages' },
            { id: 'tests', label: 'Popular tests' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-semibold transition',
                tab === t.id ? 'bg-white text-teal shadow-sm' : 'text-ink-soft hover:text-ink',
              )}
            >
              {t.label}
            </button>
          ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-8">
            <Loading label="Loading featured items…" />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <FeaturedCard key={item.id} item={item} isPackage={tab === 'packages'} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
