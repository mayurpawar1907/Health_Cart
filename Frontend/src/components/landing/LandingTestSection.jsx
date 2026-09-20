import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import api, { unwrap } from '@/api/client'
import { Loading } from '@/components/ui/Loading'
import { LandingBlock, LandingSectionHeader } from '@/components/landing/LandingSection'
import { formatCardPrice, specialPrice } from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

const CATEGORY_VISUAL = {
  'Blood Tests': 'from-teal-light via-[#eef4f8] to-cream',
  Thyroid: 'from-[#e8f3f8] via-teal-light/80 to-cream',
  Vitamins: 'from-cream via-teal-light/70 to-[#eef4f8]',
  Diabetes: 'from-teal-light/90 via-cream to-teal-light/50',
  Liver: 'from-[#eef4f8] via-teal-light to-cream',
  Kidney: 'from-cream via-[#e8f3f8] to-teal-light/60',
}

function categoryVisual(name) {
  if (!name) return 'from-teal-light/80 via-cream to-teal-light/40'
  for (const [key, tint] of Object.entries(CATEGORY_VISUAL)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return tint
  }
  return 'from-teal-light/80 via-cream to-teal-light/40'
}

function TestCard({ item }) {
  const mrp = Number(item.price)
  const special = specialPrice(item)
  const prices = formatCardPrice(mrp, special)
  const category = item.category?.name ?? 'Lab test'

  return (
    <article className="landing-test-card group flex w-[210px] shrink-0 snap-start flex-col overflow-hidden rounded-xl sm:w-[230px]">
      <div
        className={cn(
          'landing-test-card-visual relative h-[5.5rem] shrink-0 bg-gradient-to-br sm:h-[6rem]',
          categoryVisual(category),
        )}
        aria-hidden
      />

      <div className="flex flex-1 flex-col bg-white p-3.5 pt-3 sm:p-4">
        <span className="inline-flex w-fit rounded-md bg-cream px-2 py-0.5 text-[10px] font-bold text-teal-dark ring-1 ring-line/60">
          {category}
        </span>

        <h3 className="mt-2.5 line-clamp-2 min-h-[2.5rem] text-[0.8125rem] font-bold leading-snug text-teal-dark sm:text-sm">
          {item.name}
        </h3>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div className="min-w-0">
            <p className="text-base font-bold leading-none text-brand-red sm:text-lg">{prices.special}</p>
            <p className="mt-0.5 text-[10px] text-ink-soft line-through sm:text-[11px]">{prices.mrp}</p>
          </div>
          <Link
            to="/signup"
            className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-teal transition group-hover:text-teal-dark group-hover:underline sm:text-xs"
          >
            Book now
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  )
}

export function LandingTestSection() {
  const scrollRef = useRef(null)

  const testsQ = useQuery({
    queryKey: ['public-popular-tests'],
    queryFn: async () => unwrap((await api.get('/tests', { params: { popular: 'true' } })).data),
  })

  const tests = (testsQ.data ?? []).filter((t) => !t.isPackage).slice(0, 12)

  function scrollBy(dir) {
    scrollRef.current?.scrollBy({ left: dir * 246, behavior: 'smooth' })
  }

  return (
    <LandingBlock id="health-checkup" alt className="landing-test-section">
      <div className="flex items-end justify-between gap-4">
        <LandingSectionHeader
          className="mb-0 flex-1"
          eyebrow="Popular tests"
          title="Health checkup"
          subtitle="Individual tests booked most often by HealthID Card members."
        />
        <div className="mb-1 flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className="landing-test-nav grid h-9 w-9 place-items-center rounded-full"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            className="landing-test-nav grid h-9 w-9 place-items-center rounded-full"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {testsQ.isLoading ? (
        <Loading label="Loading tests…" />
      ) : tests.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line/70 bg-white/60 px-4 py-10 text-center text-sm text-ink-soft">
          Popular tests will appear here once your catalog is loaded.
        </p>
      ) : (
        <div
          ref={scrollRef}
          className="landing-test-scroll landing-scroll-row mt-6 flex gap-3.5 overflow-x-auto pb-3 snap-x snap-mandatory md:mt-8 md:gap-4"
        >
          {tests.map((t) => (
            <TestCard key={t.id} item={t} />
          ))}
        </div>
      )}
    </LandingBlock>
  )
}
