import { Link } from 'react-router-dom'
import { formatCardPrice, specialPrice, testCountLabel } from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

/** Healthians-style package tile — price, test count, dual CTAs */
export function LandingPackageCard({ item, className }) {
  const mrp = Number(item.price)
  const special = specialPrice(item)
  const prices = formatCardPrice(mrp, special)

  return (
    <article
      className={cn(
        'landing-hcard group flex h-full w-[248px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-line/70 bg-white shadow-sm transition hover:border-teal/30 hover:shadow-md sm:w-[260px]',
        className,
      )}
    >
      <div className="h-1.5 bg-gradient-to-r from-teal to-teal-dark" aria-hidden />
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-teal">{testCountLabel(item)}</p>
        <h3 className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-ink group-hover:text-teal">
          {item.name}
        </h3>
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="font-display text-xl font-bold text-brand-red">{prices.special}</span>
          <span className="text-xs text-ink-soft line-through">{prices.mrp}</span>
          {prices.save > 0 ? (
            <span className="rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-bold text-success">
              {prices.save}% off
            </span>
          ) : null}
        </div>
        <div className="mt-auto flex gap-2 pt-4">
          <Link
            to="/signup"
            className="flex-1 rounded-lg border border-teal/35 py-2 text-center text-[11px] font-bold text-teal transition hover:bg-teal-light/50"
          >
            View details
          </Link>
          <Link
            to="/signup"
            className="flex-1 rounded-lg bg-teal py-2 text-center text-[11px] font-bold text-white shadow-sm transition hover:bg-teal-dark"
          >
            Book now
          </Link>
        </div>
      </div>
    </article>
  )
}
