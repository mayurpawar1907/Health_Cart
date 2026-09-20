import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import api, { unwrap } from '@/api/client'
import { Loading } from '@/components/ui/Loading'
import { LandingPackageCard } from '@/components/landing/LandingPackageCard'
import { filterBrowsePackages, LANDING_CONTAINER } from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

export function LandingPackageSection({
  id,
  title,
  subtitle,
  filterKey = 'full-body-packages',
  city,
  className,
}) {
  const scrollRef = useRef(null)

  const packagesQ = useQuery({
    queryKey: ['public-packages'],
    queryFn: async () => unwrap((await api.get('/tests', { params: { packages: 'true' } })).data),
  })

  const packages = filterBrowsePackages(packagesQ.data ?? [], filterKey).slice(0, 12)

  function scrollBy(dir) {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  return (
    <section id={id} className={cn('border-b border-line/40 bg-white py-8 md:py-10', className)}>
      <div className={LANDING_CONTAINER}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink md:text-2xl">
              {title}
              {city ? <span className="text-teal"> in {city}</span> : null}
            </h2>
            {subtitle ? <p className="mt-1 text-sm text-ink-soft">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-line/80 bg-white text-teal shadow-sm transition hover:border-teal/30"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-line/80 bg-white text-teal shadow-sm transition hover:border-teal/30"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <a href="#catalog" className="ml-1 inline-flex items-center gap-1 text-sm font-bold text-teal hover:underline">
              View all
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {packagesQ.isLoading ? (
          <div className="mt-6">
            <Loading label="Loading packages…" />
          </div>
        ) : packages.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-line/70 bg-cream/40 px-4 py-10 text-center text-sm text-ink-soft">
            Packages appear here once your lab catalog is loaded in MySQL.
          </p>
        ) : (
          <div
            ref={scrollRef}
            className="landing-scroll-row mt-5 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:gap-4"
          >
            {packages.map((item) => (
              <LandingPackageCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <div className="mt-4 text-center md:hidden">
          <Link to="/signup" className="text-sm font-bold text-teal hover:underline">
            Get free HealthID Card to book →
          </Link>
        </div>
      </div>
    </section>
  )
}
