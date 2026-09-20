import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Home } from 'lucide-react'
import api, { unwrap } from '@/api/client'
import { Loading } from '@/components/ui/Loading'
import { LandingMegaCategoryPanel } from '@/components/landing/LandingMegaCategoryPanel'
import { LandingMegaFullBodyPanel } from '@/components/landing/LandingMegaFullBodyPanel'
import { LANDING_CONTAINER, PRIMARY_NAV, SERVICE_TAB_LABELS } from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

const CLOSE_DELAY_MS = 180
const MEGA_MAX_H = 'max-h-[min(520px,68vh)]'

function MegaMenuPanel({
  tab,
  city,
  sidebarId,
  onSidebarChange,
  allPackages,
  tests,
  loading,
  onPickCategory,
  onBrowseCatalog,
  onClose,
  reportHours = 24,
}) {
  const isPackageTab = tab === 'full-body-packages'
  const tabLabel = SERVICE_TAB_LABELS[tab] ?? 'Lab tests'

  if (loading && !isPackageTab) {
    return (
      <div className={cn('landing-mega-panel px-5 py-10', MEGA_MAX_H)}>
        <Loading label={`Loading ${tabLabel.toLowerCase()}…`} />
      </div>
    )
  }

  if (isPackageTab) {
    return (
      <LandingMegaFullBodyPanel
        city={city}
        sidebarId={sidebarId}
        onSidebarChange={onSidebarChange}
        allPackages={allPackages}
        loading={loading}
        onPickCategory={onPickCategory}
        onBrowseCatalog={onBrowseCatalog}
        onClose={onClose}
      />
    )
  }

  return (
    <LandingMegaCategoryPanel
      tab={tab}
      city={city}
      allPackages={allPackages}
      loading={loading}
      reportHours={reportHours}
      onClose={onClose}
    />
  )
}

export function LandingServiceHub({ city, activeTab, onTabChange, reportHours = 24, onBrowseCatalog }) {
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
    const navSlugs = PRIMARY_NAV.map((t) => t.slug)
    if (navSlugs.includes(slug)) {
      openMenu(slug)
      return
    }
    closeMenu()
    document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
    <section id="service-hub" className="landing-mega-menu landing-reveal relative z-50">
      <div
        className="landing-nav-pro relative"
        onMouseLeave={scheduleClose}
      >
        <nav
          aria-label="Test categories"
          className={cn(LANDING_CONTAINER, 'flex items-center justify-start gap-0.5 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden')}
        >
          <Link
            to="/"
            className="mr-2 flex shrink-0 cursor-pointer items-center px-2 py-4 text-white/90 transition hover:text-white"
            aria-label="Home"
          >
            <Home className="h-6 w-6" />
          </Link>

          {PRIMARY_NAV.map((tab) => {
            const isActive = highlightedTab === tab.slug
            const isOpen = openTab === tab.slug
            return (
              <div key={tab.slug} className="relative shrink-0 cursor-pointer" onMouseEnter={() => openMenu(tab.slug)}>
                <button
                  type="button"
                  onClick={() => handleTabClick(tab.slug)}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  className={cn(
                    'landing-nav-tab relative flex cursor-pointer items-center gap-1.5 whitespace-nowrap px-3 py-4 text-[15px] font-semibold transition md:px-4 md:text-base',
                    isActive ? 'text-white' : 'text-white/80 hover:text-white',
                    isOpen && 'is-open',
                  )}
                >
                  {tab.label}
                  <ChevronDown className={cn('h-4 w-4 opacity-60 transition-transform', isOpen && 'rotate-180')} aria-hidden />
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
              <div className={cn(LANDING_CONTAINER, openTab === 'full-body-packages' && 'max-w-[88rem]')}>
                <MegaMenuPanel
                  tab={openTab}
                  city={city}
                  sidebarId={sidebarId}
                  onSidebarChange={setSidebarId}
                  allPackages={allPackages}
                  tests={testsQ.data ?? []}
                  loading={loading}
                  onPickCategory={handlePickCategory}
                  onBrowseCatalog={onBrowseCatalog}
                  onClose={closeMenu}
                  reportHours={reportHours}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}
