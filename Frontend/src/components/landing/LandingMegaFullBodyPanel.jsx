import { Link } from 'react-router-dom'
import {
  Activity,
  ChevronRight,
  Droplets,
  Heart,
  Wind,
  X,
} from 'lucide-react'
import { Loading } from '@/components/ui/Loading'
import {
  chunkIntoColumns,
  filterPackages,
  formatCardPrice,
  MEGA_GRID_PANELS,
  MEGA_SIDEBAR,
  specialPrice,
  testCountLabel,
  TRENDING_CARD_TINTS,
  TRENDING_PICKS,
} from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

const MEGA_MAX_H = 'max-h-[min(380px,58vh)]'

function TrendingPickIcon({ icon }) {
  const cls = 'h-5 w-5 text-teal'
  if (icon === 'diabetes') return <Droplets className={cls} aria-hidden />
  if (icon === 'allergy') return <Wind className={cls} aria-hidden />
  if (icon === 'thyroid') return <Activity className={cls} aria-hidden />
  return <Heart className={cls} aria-hidden />
}

/** Center column — 4-column link grid (Healthians-style browse) */
function MegaBrowseGrid({ panel, onBrowse }) {
  const columns = chunkIntoColumns(panel.items, 4)

  return (
    <div>
      <h3 className="mb-2 text-sm font-bold text-ink">{panel.title}</h3>
      <div className="grid gap-x-4 gap-y-0 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((col, colIdx) => (
          <ul key={colIdx} className="space-y-1.5">
            {col.map(({ label, query }) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => onBrowse?.(query)}
                  className="cursor-pointer text-left text-[12px] font-medium leading-snug text-ink-soft transition hover:text-teal"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

/** Center column — list rows with dashed dividers */
function MostBoughtRow({ item }) {
  const mrp = Number(item.price)
  const special = specialPrice(item)
  const prices = formatCardPrice(mrp, special)

  return (
    <article className="landing-most-bought-row border-b border-dashed border-teal/30 py-2 last:border-0">
      <h3 className="line-clamp-1 text-[13px] font-bold leading-tight text-ink">{item.name}</h3>
      <p className="mt-0.5 text-[10px] font-semibold text-teal">{testCountLabel(item)}</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
        <span className="text-[11px] text-ink-soft line-through">{prices.mrp}</span>
        <span className="text-base font-bold text-ink">{prices.special}</span>
      </div>
      <div className="mt-1.5 flex gap-1.5">
        <Link
          to="/signup"
          className="flex-1 cursor-pointer rounded-md bg-cream/90 py-1.5 text-center text-[10px] font-bold text-ink-soft transition hover:bg-white"
        >
          Know More
        </Link>
        <Link
          to="/signup"
          className="flex-1 cursor-pointer rounded-md bg-teal py-1.5 text-center text-[10px] font-bold text-white transition hover:bg-teal-dark"
        >
          Book Now
        </Link>
      </div>
    </article>
  )
}

/** Right column — pastel 2×2 card */
function TrendingPackageCard({ item, tintClass }) {
  const mrp = Number(item.price)
  const special = specialPrice(item)
  const prices = formatCardPrice(mrp, special)

  return (
    <article className={cn('landing-trending-card flex flex-col rounded-lg border p-2', tintClass)}>
      <h3 className="line-clamp-2 min-h-[2rem] text-[10px] font-bold leading-tight text-ink">{item.name}</h3>
      <p className="mt-0.5 text-[9px] font-semibold text-teal">{testCountLabel(item)}</p>
      <div className="mt-0.5 flex flex-wrap items-baseline gap-1">
        <span className="text-xs font-bold text-ink">{prices.special}</span>
        <span className="text-[9px] text-ink-soft line-through">{prices.mrp}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-1 pt-1">
        <Link
          to="/signup"
          className="cursor-pointer text-[10px] font-bold text-ink underline decoration-teal/40 underline-offset-2 hover:text-teal"
        >
          Know more
        </Link>
        <Link
          to="/signup"
          className="cursor-pointer rounded-md bg-teal px-2 py-1 text-[9px] font-bold text-white hover:bg-teal-dark"
        >
          Book Now
        </Link>
      </div>
    </article>
  )
}

export function LandingMegaFullBodyPanel({
  city,
  sidebarId,
  onSidebarChange,
  allPackages,
  loading,
  onPickCategory,
  onBrowseCatalog,
  onClose,
}) {
  const gridPanel = MEGA_GRID_PANELS[sidebarId]
  const sidebarPackages = filterPackages(allPackages, sidebarId)
  const popular = [...allPackages].sort((a, b) => Number(b.isPopular) - Number(a.isPopular))
  const mostBought = (sidebarPackages.length >= 3 ? sidebarPackages : popular).slice(0, 3)
  const trendingGrid = popular.slice(0, 4)

  function handleSidebarClick(item) {
    if (item.href) {
      onClose?.()
      document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    onSidebarChange(item.id)
  }

  function handleSidebarHover(item) {
    if (!item.href) onSidebarChange(item.id)
  }

  function handleBrowse(query) {
    onClose?.()
    onBrowseCatalog?.({ query, tab: 'tests', category: 'All' })
  }

  if (loading) {
    return (
      <div className={cn('landing-mega-panel px-5 py-10', MEGA_MAX_H)}>
        <Loading label="Loading packages…" />
      </div>
    )
  }

  return (
    <div className="landing-mega-panel landing-mega-fullbody overflow-hidden rounded-b-xl border border-line/40 bg-white">
      <div className="flex items-center justify-between border-b border-line/40 bg-teal-light/30 px-4 py-2 lg:hidden">
        <span className="text-sm font-bold text-teal-dark">Full Body Checkup · {city}</span>
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-lg border border-line/70 bg-white text-ink-soft"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div
        className={cn(
          'landing-mega-fullbody-grid grid items-start overflow-y-auto lg:grid-cols-[200px_1.15fr_1fr] xl:grid-cols-[220px_1.2fr_1fr]',
          MEGA_MAX_H,
        )}
      >
        {/* Column 1 — sidebar */}
        <aside className="landing-mega-sidebar border-b border-line/40 bg-cream lg:border-b-0 lg:border-r lg:border-line/30">
          <ul className="py-1">
            {MEGA_SIDEBAR.map((item) => {
              const active = !item.href && sidebarId === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSidebarClick(item)}
                    onMouseEnter={() => handleSidebarHover(item)}
                    className={cn(
                      'group flex w-full cursor-pointer items-center gap-1.5 border-l-[3px] px-3 py-2 text-left text-[12px] font-semibold leading-tight transition',
                      active
                        ? 'border-l-teal bg-white text-teal-dark shadow-[inset_0_0_0_1px_rgba(26,77,109,0.06)]'
                        : 'border-l-transparent text-ink-soft hover:bg-teal-light/40 hover:text-teal-dark',
                    )}
                  >
                    <span className="flex-1 truncate">{item.label}</span>
                    <ChevronRight
                      className={cn(
                        'h-3.5 w-3.5 shrink-0 text-ink-soft/50 transition group-hover:text-teal',
                        active && 'text-teal',
                      )}
                      aria-hidden
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* Column 2 — browse grid or most bought */}
        <div className="landing-mega-center border-b border-line/40 px-3 py-2.5 lg:border-b-0 lg:border-r lg:border-teal/10 lg:px-4 lg:py-3">
          {gridPanel ? (
            <MegaBrowseGrid panel={gridPanel} onBrowse={handleBrowse} />
          ) : (
            <>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <h3 className="text-[13px] font-bold text-ink">Most Bought Packages</h3>
                <a
                  href="#packages"
                  onClick={() => onClose?.()}
                  className="cursor-pointer text-[11px] font-bold uppercase tracking-wide text-teal hover:underline"
                >
                  View all
                </a>
              </div>
              {mostBought.length === 0 ? (
                <p className="py-6 text-center text-xs text-ink-soft">Load catalog data to see packages here.</p>
              ) : (
                mostBought.map((pkg) => <MostBoughtRow key={pkg.id} item={pkg} />)
              )}
            </>
          )}
        </div>

        {/* Column 3 — trending */}
        <div className="landing-mega-trending bg-cream/30 px-3 py-2.5 lg:px-4 lg:py-3">
          <h3 className="text-[13px] font-bold text-ink">Trending Packages</h3>

          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {TRENDING_PICKS.map((pick) => (
              <button
                key={pick.slug}
                type="button"
                onClick={() => onPickCategory?.(pick.slug)}
                className={cn(
                  'relative flex cursor-pointer flex-col items-center gap-0.5 rounded-lg border border-line/50 bg-white p-1.5 shadow-sm transition hover:border-teal/25 hover:shadow',
                  pick.tint,
                )}
                title={pick.label}
              >
                {pick.badge ? (
                  <span className="absolute -right-1 -top-1 z-10 rounded-full bg-brand-red px-1.5 py-0.5 text-[7px] font-bold leading-none text-white">
                    {pick.badge}
                  </span>
                ) : null}
                <TrendingPickIcon icon={pick.icon ?? pick.slug} />
                <span className="line-clamp-2 text-center text-[9px] font-bold leading-tight text-ink">
                  {pick.label.replace(' Package', '')}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {trendingGrid.map((pkg, i) => (
              <TrendingPackageCard
                key={pkg.id}
                item={pkg}
                tintClass={TRENDING_CARD_TINTS[i % TRENDING_CARD_TINTS.length]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
