import { Link } from 'react-router-dom'
import { ArrowRight, Check, Clock, FlaskConical, X } from 'lucide-react'
import { Loading } from '@/components/ui/Loading'
import {
  filterBrowsePackages,
  formatCardPrice,
  getMegaCategoryInfo,
  specialPrice,
  testCountLabel,
} from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

const SUPPORT_TEL = '18001234567'

function MegaPreventiveCard({ item, reportHours }) {
  const mrp = Number(item.price)
  const special = specialPrice(item)
  const prices = formatCardPrice(mrp, special)
  const testLabel = testCountLabel(item).replace(' Included', '')
  const hours = item.reportHours ?? reportHours

  return (
    <article className="landing-preventive-card flex min-w-[240px] flex-1 flex-col rounded-xl border border-teal/15 bg-gradient-to-br from-white via-cream/40 to-teal-light/50 p-3.5 shadow-[0_2px_14px_rgba(12,25,41,0.07)] sm:min-w-0 [&_a]:cursor-pointer">
      <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-ink">{item.name}</h3>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-teal/10 bg-white shadow-sm">
            <FlaskConical className="h-3.5 w-3.5 text-teal" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] leading-none text-ink-soft">Test Included</p>
            <p className="mt-0.5 text-[11px] font-bold leading-tight text-ink">{testLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-teal/10 bg-white shadow-sm">
            <Clock className="h-3.5 w-3.5 text-teal" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] leading-none text-ink-soft">Report in</p>
            <p className="mt-0.5 text-[11px] font-bold leading-tight text-ink">{hours} Hrs.</p>
          </div>
        </div>
      </div>

      <div className="my-2.5 border-t border-dashed border-teal/25" aria-hidden />

      <div>
        <p className="text-[9px] font-medium uppercase tracking-wide text-ink-soft">Limited time offer</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-display text-lg font-bold tracking-tight text-ink">{prices.special}</span>
          <span className="text-[11px] text-ink-soft/80 line-through">{prices.mrp}</span>
          {prices.save > 0 ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-teal-light px-2 py-0.5 text-[9px] font-bold text-teal-dark">
              <Check className="h-2.5 w-2.5 shrink-0 text-teal" aria-hidden />
              {prices.save}% off
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-teal/10 pt-2.5">
        <Link
          to="/signup"
          className="text-[11px] font-bold text-ink underline decoration-teal/35 underline-offset-2 transition hover:text-teal"
        >
          Know More
        </Link>
        <Link
          to="/signup"
          className="rounded-lg bg-teal px-4 py-2 text-[11px] font-bold text-white shadow-sm transition hover:bg-teal-dark"
        >
          Book Now
        </Link>
      </div>
    </article>
  )
}

function MegaInfoPanel({ tab, city, info, onClose }) {
  return (
    <aside
      className={cn(
        'relative flex flex-col justify-between rounded-xl bg-gradient-to-b p-5 md:min-h-[320px] md:p-6',
        info.gradient,
      )}
    >
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg border border-line/60 bg-white/80 text-ink-soft lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      <div>
        <h3 className="pr-8 text-base font-bold text-ink md:text-lg">{info.whyHeading}</h3>
        <ul className="mt-4 space-y-2.5 rounded-xl border border-white/60 bg-white/90 p-4 shadow-sm">
          {info.bullets.map((line) => (
            <li key={line} className="flex items-start gap-2.5 text-sm text-ink-soft">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal text-white">
                <ArrowRight className="h-3 w-3" aria-hidden />
              </span>
              {line}
            </li>
          ))}
        </ul>
      </div>

      <a
        href={`tel:${SUPPORT_TEL}`}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-red-dark"
      >
        Talk to a Health Advisor
        <ArrowRight className="h-4 w-4" aria-hidden />
      </a>
      <p className="mt-2 text-center text-[10px] text-ink-soft">Free home collection in {city}</p>
    </aside>
  )
}

/** Healthians-style mega dropdown: info panel + preventive package cards */
export function LandingMegaCategoryPanel({ tab, city, allPackages, loading, reportHours = 24, onClose }) {
  const info = getMegaCategoryInfo(tab)
  const packages = filterBrowsePackages(allPackages, tab).slice(0, 3)

  return (
    <div className="landing-mega-panel overflow-hidden rounded-b-xl">
      <div className="grid gap-4 p-4 md:grid-cols-[minmax(240px,28%)_1fr] md:gap-5 md:p-5 lg:p-6">
        <MegaInfoPanel tab={tab} city={city} info={info} onClose={onClose} />

        <div className="min-w-0">
          <h3 className="font-display text-base font-bold text-ink md:text-lg">{info.packageHeading}</h3>

          {loading ? (
            <div className="mt-5 py-8">
              <Loading label="Loading packages…" />
            </div>
          ) : packages.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-line/70 bg-cream/40 px-4 py-10 text-center text-sm text-ink-soft">
              Packages for this category will appear when your catalog is loaded.
              <Link to="/signup" className="mt-2 block font-bold text-teal hover:underline">
                Create free account →
              </Link>
            </div>
          ) : (
            <div className="landing-scroll-row mt-4 flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:gap-3 lg:overflow-visible lg:pb-0">
              {packages.map((item) => (
                <MegaPreventiveCard key={item.id} item={item} reportHours={reportHours} />
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-teal/15 pt-4">
            <a href="#packages" onClick={onClose} className="cursor-pointer text-xs font-bold text-teal hover:underline">
              View all in {city} →
            </a>
            <Link to="/signup" className="text-xs font-bold text-brand-red hover:underline">
              Get free HealthID Card
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
