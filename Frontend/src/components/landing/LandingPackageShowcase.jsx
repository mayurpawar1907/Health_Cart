import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import api, { unwrap } from '@/api/client'
import { Loading } from '@/components/ui/Loading'
import { LandingRichPackageCard } from '@/components/landing/LandingRichPackageCard'
import { LandingBlock, LandingSectionHeader } from '@/components/landing/LandingSection'
import { filterBrowsePackages, PACKAGE_CATEGORY_TABS } from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

export function LandingPackageShowcase({ city, reportHours = 24, id = 'packages' }) {
  const scrollRef = useRef(null)
  const [filterKey, setFilterKey] = useState('full-body-packages')

  const packagesQ = useQuery({
    queryKey: ['public-packages'],
    queryFn: async () => unwrap((await api.get('/tests', { params: { packages: 'true' } })).data),
  })

  const packages = filterBrowsePackages(packagesQ.data ?? [], filterKey).slice(0, 16)

  function scrollBy(dir) {
    scrollRef.current?.scrollBy({ left: dir * 360, behavior: 'smooth' })
  }

  return (
    <LandingBlock id={id} className="landing-block--white">
      <LandingSectionHeader
        eyebrow="Popular packages"
        title={`Full Body Checkup in ${city}`}
        subtitle="Member special rates · Free home collection · NABL partner labs"
      />

      <div className="landing-scroll-row mt-5 flex justify-start gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
        {PACKAGE_CATEGORY_TABS.map((tab) => {
          const active = tab.filterKey === filterKey
          return (
            <button
              key={tab.filterKey}
              type="button"
              onClick={() => setFilterKey(tab.filterKey)}
              className={cn(
                'landing-filter-pill shrink-0 px-4 py-2 text-xs md:text-sm',
                active && 'is-active',
                !active && 'text-ink-soft',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="relative mt-6 md:mt-8">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          className="absolute -left-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line/80 bg-white text-teal shadow-lg transition hover:border-teal/30 md:grid lg:-left-5"
          aria-label="Previous packages"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {packagesQ.isLoading ? (
          <Loading label="Loading packages…" />
        ) : packages.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line/70 bg-cream/40 px-4 py-12 text-center text-sm text-ink-soft">
            No packages in this category yet. Load your lab catalog in MySQL to see cards here.
          </p>
        ) : (
          <div
            ref={scrollRef}
            className="landing-scroll-row flex gap-4 overflow-x-auto px-1 pb-3 snap-x snap-mandatory md:gap-5 md:px-8"
          >
            {packages.map((item) => (
              <LandingRichPackageCard key={item.id} item={item} reportHours={reportHours} />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => scrollBy(1)}
          className="absolute -right-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line/80 bg-white text-teal shadow-lg transition hover:border-teal/30 md:grid lg:-right-5"
          aria-label="Next packages"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </LandingBlock>
  )
}
