import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, Clock, FileText, Users } from 'lucide-react'
import {
  fastingLabel,
  formatCardPrice,
  groupPerPersonPrice,
  packageParameterPreview,
  recommendedAudience,
  specialPrice,
  testCountLabel,
} from '@/components/landing/landing-utils'
import { cn, formatMoney } from '@/utils/utils'

export function LandingRichPackageCard({ item, reportHours = 24, className }) {
  const [members, setMembers] = useState(1)
  const [expanded, setExpanded] = useState(false)

  const mrp = Number(item.price)
  const special = specialPrice(item)
  const perPerson = groupPerPersonPrice(special, members)
  const total = perPerson * members
  const prices = formatCardPrice(mrp, special)
  const params = packageParameterPreview(item)
  const preview = params.slice(0, expanded ? params.length : 4)
  const audience = recommendedAudience(item.name)
  const testBadge = testCountLabel(item).replace(' Included', '').replace('Multi-test package', 'Panel')

  return (
    <article
      className={cn(
        'landing-card landing-rich-card flex w-[min(100%,320px)] shrink-0 snap-center flex-col overflow-hidden rounded-2xl sm:w-[340px]',
        className,
      )}
    >
      <div className="flex flex-1 flex-col p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 flex-1 text-sm font-bold leading-snug text-ink">{item.name}</h3>
          <span className="shrink-0 rounded-lg bg-teal px-2.5 py-1 text-[11px] font-bold text-white">
            {testBadge}
          </span>
        </div>

        <div className="mt-3">
          <p className="text-[11px] font-bold text-ink-soft">Tests Included:</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            {preview.join(', ')}
            {!expanded && params.length > 4 ? (
              <>
                {' '}
                <button type="button" onClick={() => setExpanded(true)} className="font-bold text-teal hover:underline">
                  ...more
                </button>
              </>
            ) : null}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-line/70 pt-3">
          <Link to="/signup" className="text-xs font-bold text-teal hover:underline">
            + Know more
          </Link>
          <div className="relative">
            <select
              value={members}
              onChange={(e) => setMembers(Number(e.target.value))}
              className="appearance-none rounded-lg border border-teal/20 bg-teal-light/50 py-1.5 pl-3 pr-8 text-xs font-semibold text-teal outline-none"
              aria-label="Number of members"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} Member{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-teal" />
          </div>
        </div>

        <p className="mt-2 text-[11px] font-medium text-teal">
          {members === 1
            ? `+ Add 1 more member → better per-person rate with HealthID Card`
            : `Family booking · ${formatMoney(perPerson)} per person locked`}
        </p>

        <ul className="mt-3 space-y-1.5 border-t border-line/50 pt-3">
          <li className="flex items-center gap-2 text-[10px] text-ink-soft">
            <Clock className="h-3.5 w-3.5 shrink-0 text-teal" aria-hidden />
            {fastingLabel(item.preparation)}
          </li>
          <li className="flex items-center gap-2 text-[10px] text-ink-soft">
            <Users className="h-3.5 w-3.5 shrink-0 text-teal" aria-hidden />
            Recommended for {audience}
          </li>
          <li className="flex items-center gap-2 text-[10px] text-ink-soft">
            <FileText className="h-3.5 w-3.5 shrink-0 text-teal" aria-hidden />
            Reports within {reportHours} hours
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-between gap-3 bg-teal-light/70 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">
            {formatMoney(perPerson)}{' '}
            <span className="text-[11px] font-semibold text-ink-soft">per person</span>
          </p>
          <p className="text-xs text-ink-soft">
            <span className="font-bold text-ink">{formatMoney(total)}</span>{' '}
            <span className="line-through">{prices.mrp}</span>
          </p>
        </div>
        <Link
          to="/signup"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-dark"
        >
          Book now
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  )
}
