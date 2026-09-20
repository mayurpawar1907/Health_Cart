import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  ArrowRight,
  Baby,
  ChevronDown,
  ChevronRight,
  Droplets,
  FlaskConical,
  Heart,
  Home,
  Layers,
  List,
  Star,
  Truck,
  X,
} from 'lucide-react'
import api, { unwrap } from '@/api/client'
import { Loading } from '@/components/ui/Loading'
import {
  filterPackages,
  filterTests,
  formatCardPrice,
  LANDING_CONTAINER,
  MEGA_SIDEBAR,
  PRIMARY_NAV,
  SERVICE_TAB_LABELS,
  specialPrice,
  testCountLabel,
  TRENDING_PICKS,
} from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

const CLOSE_DELAY_MS = 180
const MEGA_MAX_H = 'max-h-[min(520px,68vh)]'

const SIDEBAR_ICONS = {
  popular: Star,
  'blood-tests': FlaskConical,
  'all-packages': Layers,
  'risk-panels': Heart,
  'rate-list': List,
}

function PickIcon({ slug }) {
  const cls = 'h-5 w-5 text-teal'
  if (slug === 'diabetes') return <Droplets className={cls} aria-hidden />
  if (slug === 'heart') return <Heart className={cls} aria-hidden />
  if (slug === 'pregnancy') return <Baby className={cls} aria-hidden />
  return <Activity className={cls} aria-hidden />
}

/** Compact row — Healthians-style list item */
function PackageRow({ item }) {
  const mrp = Number(item.price)
  const special = specialPrice(item)
  const prices = formatCardPrice(mrp, special)

  return (
    <article className="border-b border-line/50 py-3.5 last:border-0">
      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink">{item.name}</h3>
      <p className="mt-1 text-xs font-semibold text-teal">{testCountLabel(item)}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-soft line-through">{prices.mrp}</span>
        <span className="text-lg font-bold text-teal">{prices.special}</span>
        {prices.save > 0 ? (
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
            Save {prices.save}%
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex gap-2">
        <Link
          to="/signup"
          className="rounded-md border border-teal/30 bg-teal-light/40 px-3 py-1.5 text-xs font-bold text-teal hover:bg-teal-light"
        >
          Know more
        </Link>
        <Link
          to="/signup"
          className="rounded-md bg-teal px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-dark"
        >
          Book now
        </Link>
      </div>
    </article>
  )
}

function PackageMiniTile({ item }) {
  const mrp = Number(item.price)
  const special = specialPrice(item)
  const prices = formatCardPrice(mrp, special)

  return (
    <article className="rounded-xl border border-line/60 bg-cream/30 p-3.5 transition hover:border-teal/30 hover:bg-white">
      <h3 className="line-clamp-2 min-h-[2.5rem] text-xs font-bold leading-snug text-ink">{item.name}</h3>
      <p className="mt-1 text-[11px] font-semibold text-teal">{testCountLabel(item)}</p>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-base font-bold text-teal">{prices.special}</span>
        <span className="text-[11px] text-ink-soft line-through">{prices.mrp}</span>
      </div>
      <Link to="/signup" className="mt-3 block rounded-lg bg-teal py-2 text-center text-[11px] font-bold text-white hover:bg-teal-dark">
        Book now
      </Link>
    </article>
  )
}

function TestRow({ item }) {
  const mrp = Number(item.price)
  const special = specialPrice(item)
  const prices = formatCardPrice(mrp, special)

  return (
    <article className="flex items-center justify-between gap-3 border-b border-line/50 py-3.5 last:border-0">
      <div className="min-w-0">
        <h3 className="truncate text-sm font-bold text-ink">{item.name}</h3>
        <p className="mt-0.5 truncate text-xs text-ink-soft">{item.shortDescription}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-sm font-bold text-teal">{prices.special}</span>
        <Link
          to="/signup"
          className="rounded-md bg-teal px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-dark"
        >
          Book
        </Link>
      </div>
    </article>
  )
}

function MegaPanelHeader({ tabLabel, city, onClose }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/50 bg-teal-light/30 py-3.5">
      <p className="truncate text-base font-semibold text-ink">
        <span className="font-bold text-teal">{tabLabel}</span>
        <span className="text-ink-soft"> · {city}</span>
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden items-center gap-1.5 text-xs font-medium text-ink-soft sm:inline-flex">
          <Truck className="h-3.5 w-3.5 text-teal" aria-hidden />
          Free collection
        </span>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-md border border-line/70 text-ink-soft hover:bg-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

function MegaMenuPanel({
  tab,
  city,
  sidebarId,
  onSidebarChange,
  allPackages,
  tests,
  loading,
  onPickCategory,
  onClose,
}) {
  const isPackageTab = tab === 'full-body-packages'
  const tabLabel = SERVICE_TAB_LABELS[tab] ?? 'Lab tests'

  const sidebarPackages = useMemo(
    () => filterPackages(allPackages, sidebarId),
    [allPackages, sidebarId],
  )

  const mostBought = useMemo(() => {
    const popular = [...allPackages].sort((a, b) => Number(b.isPopular) - Number(a.isPopular))
    const fromSidebar = sidebarPackages.slice(0, 3)
    return fromSidebar.length >= 3 ? fromSidebar : popular.slice(0, 3)
  }, [allPackages, sidebarPackages])

  const trendingGrid = useMemo(() => {
    const popular = [...allPackages].sort((a, b) => Number(b.isPopular) - Number(a.isPopular))
    if (isPackageTab) return popular.slice(0, 4)
    const keyword = tab.replace(/-/g, ' ').split(' ')[0]
    const related = allPackages.filter((p) => p.name.toLowerCase().includes(keyword))
    return (related.length >= 2 ? related : popular).slice(0, 4)
  }, [allPackages, isPackageTab, tab])

  const categoryTests = useMemo(() => filterTests(tests, tab).slice(0, 6), [tests, tab])

  function handleSidebarClick(item) {
    if (item.href) {
      onClose?.()
      document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    onSidebarChange(item.id)
  }

  if (loading) {
    return (
      <div className={cn('landing-mega-panel px-5 py-10', MEGA_MAX_H)}>
        <Loading label={`Loading ${tabLabel.toLowerCase()}…`} />
      </div>
    )
  }

  if (isPackageTab) {
    return (
      <div className="landing-mega-panel overflow-hidden">
        <MegaPanelHeader tabLabel={tabLabel} city={city} onClose={onClose} />

        <div className={cn('grid overflow-y-auto lg:grid-cols-[240px_minmax(0,1.15fr)_minmax(0,1fr)]', MEGA_MAX_H)}>
          {/* Sidebar */}
          <aside className="border-b border-line/50 bg-[#eef2f5] lg:border-b-0 lg:border-r">
            <p className="px-5 pb-1 pt-4 text-[10px] font-bold uppercase tracking-wide text-ink-soft">Browse by</p>
            <ul className="pb-3">
              {MEGA_SIDEBAR.map((item) => {
                const Icon = SIDEBAR_ICONS[item.id] ?? List
                const active = !item.href && sidebarId === item.id
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSidebarClick(item)}
                      className={cn(
                        'flex w-full items-center gap-2.5 border-l-[3px] px-5 py-3 text-left text-sm font-semibold transition',
                        active
                          ? 'border-l-teal bg-white text-teal'
                          : 'border-l-transparent text-ink-soft hover:bg-white/80 hover:text-ink',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="truncate">{item.label}</span>
                      {active ? <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>

          {/* Most bought */}
          <div className="border-b border-line/50 px-4 py-4 lg:border-b-0 lg:border-r lg:px-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink">Most bought packages</h3>
              <a href="#packages" onClick={() => onClose?.()} className="text-xs font-bold text-teal hover:underline">
                View all
              </a>
            </div>
            {mostBought.length === 0 ? (
              <p className="py-4 text-center text-xs text-ink-soft">No packages in this filter.</p>
            ) : (
              mostBought.map((pkg) => <PackageRow key={pkg.id} item={pkg} />)
            )}
          </div>

          {/* Quick picks + trending */}
          <div className="px-4 py-4 lg:px-5">
            <h3 className="text-sm font-bold text-ink">Trending packages</h3>
            <p className="mt-0.5 text-xs text-ink-soft">Quick jump to popular concerns</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {TRENDING_PICKS.map((pick) => (
                <button
                  key={pick.slug}
                  type="button"
                  onClick={() => onPickCategory?.(pick.slug)}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-line/50 bg-white p-2.5 transition hover:border-teal/35 hover:shadow-sm"
                  title={pick.label}
                >
                  <PickIcon slug={pick.slug} />
                  <span className="line-clamp-2 text-center text-[10px] font-bold leading-tight text-ink">
                    {pick.label.replace(' Package', '')}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {trendingGrid.map((pkg) => (
                <PackageMiniTile key={pkg.id} item={pkg} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="landing-mega-panel overflow-hidden">
      <MegaPanelHeader tabLabel={tabLabel} city={city} onClose={onClose} />

      <div className={cn('grid overflow-y-auto lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]', MEGA_MAX_H)}>
        <div className="border-b border-line/50 px-4 py-4 lg:border-b-0 lg:border-r lg:px-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">{tabLabel} tests</h3>
            <a href="#catalog" onClick={() => onClose?.()} className="text-xs font-bold text-teal hover:underline">
              View all
            </a>
          </div>
          {categoryTests.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-soft">
              No tests listed.{' '}
              <button type="button" onClick={() => onPickCategory?.('full-body-packages')} className="font-bold text-teal hover:underline">
                Browse packages
              </button>
            </p>
          ) : (
            categoryTests.map((t) => <TestRow key={t.id} item={t} />)
          )}
        </div>

        <div className="px-4 py-4 lg:px-5">
          <h3 className="text-sm font-bold text-ink">Related packages</h3>
          <p className="mt-0.5 text-xs text-ink-soft">Popular panels for this category</p>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {trendingGrid.map((pkg) => (
              <PackageMiniTile key={pkg.id} item={pkg} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingServiceHub({ city, activeTab, onTabChange }) {
  const [openTab, setOpenTab] = useState(null)
  const [sidebarId, setSidebarId] = useState('popular')
  const closeTimer = useRef(null)

  const packagesQ = useQuery({
    queryKey: ['public-packages'],
    queryFn: async () => unwrap((await api.get('/tests', { params: { packages: 'true' } })).data),
  })
  const testsQ = useQuery({
    queryKey: ['public-tests'],
    queryFn: async () => unwrap((await api.get('/tests', { params: { packages: 'false' } })).data),
  })

  const allPackages = useMemo(
    () => (packagesQ.data ?? []).filter((p) => p.isPackage),
    [packagesQ.data],
  )
  const loading = packagesQ.isLoading || testsQ.isLoading

  const closeMenu = useCallback(() => setOpenTab(null), [])

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    cancelClose()
    closeTimer.current = setTimeout(closeMenu, CLOSE_DELAY_MS)
  }, [cancelClose, closeMenu])

  const openMenu = useCallback(
    (slug) => {
      cancelClose()
      setOpenTab(slug)
      onTabChange?.(slug)
      if (slug === 'full-body-packages') setSidebarId('popular')
    },
    [cancelClose, onTabChange],
  )

  function handleTabClick(slug) {
    if (openTab === slug) closeMenu()
    else openMenu(slug)
  }

  function handlePickCategory(slug) {
    openMenu(slug)
  }

  useEffect(() => {
    if (!openTab) return
    function onKey(e) {
      if (e.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openTab, closeMenu])

  useEffect(() => {
    if (!openTab) return
    const prev = document.body.style.overflow
    if (window.matchMedia('(max-width: 1023px)').matches) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = prev
    }
  }, [openTab])

  const highlightedTab = openTab ?? activeTab

  return (
    <section id="service-hub" className="landing-mega-menu relative z-50">
      <div
        className="relative border-b border-white/10 bg-gradient-to-r from-teal-dark via-teal to-teal-dark shadow-md"
        onMouseLeave={scheduleClose}
      >
        <nav
          aria-label="Test categories"
          className={cn(LANDING_CONTAINER, 'flex items-center justify-start gap-0.5 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden')}
        >
          <Link
            to="/"
            className="mr-2 flex shrink-0 items-center px-2 py-4 text-white/90 transition hover:text-white"
            aria-label="Home"
          >
            <Home className="h-6 w-6" />
          </Link>

          {PRIMARY_NAV.map((tab) => {
            const isActive = highlightedTab === tab.slug
            const isOpen = openTab === tab.slug
            return (
              <div key={tab.slug} className="relative shrink-0" onMouseEnter={() => openMenu(tab.slug)}>
                <button
                  type="button"
                  onClick={() => handleTabClick(tab.slug)}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  className={cn(
                    'relative flex items-center gap-1.5 whitespace-nowrap px-3 py-4 text-base font-semibold transition md:px-4 md:text-[17px] lg:text-lg',
                    isActive ? 'text-white' : 'text-white/85 hover:text-white',
                  )}
                >
                  {tab.label}
                  <ChevronDown className={cn('h-4 w-4 opacity-70 transition-transform', isOpen && 'rotate-180')} aria-hidden />
                  {isOpen ? (
                    <span className="absolute inset-x-2 bottom-0 h-[3px] bg-amber-400" aria-hidden />
                  ) : null}
                </button>
              </div>
            )
          })}
        </nav>

        {openTab ? (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-40 bg-[#0c1929]/15 lg:hidden"
              onClick={closeMenu}
            />
            <div className="landing-mega-dropdown absolute left-0 right-0 top-full z-50 bg-white shadow-[0_12px_32px_rgba(12,25,41,0.12)]" onMouseEnter={cancelClose}>
              <div className={LANDING_CONTAINER}>
                <MegaMenuPanel
                  tab={openTab}
                  city={city}
                  sidebarId={sidebarId}
                  onSidebarChange={setSidebarId}
                  allPackages={allPackages}
                  tests={testsQ.data ?? []}
                  loading={loading}
                  onPickCategory={handlePickCategory}
                  onClose={closeMenu}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}
