import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarDays,
  FlaskConical,
  History,
  Home,
  LogOut,
  Plus,
  UserRound,
  Wallet,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { cn, formatMoney } from '@/lib/utils'
import type { RootState } from '@/store'
import type { WalletSummary } from '@/types'
import { clearSession } from '@/store/authSlice'
import api, { unwrap } from '@/services/api'
import { Logo } from '@/components/brand/Logo'
import { NotifyBell } from '@/components/ui/SearchBar'
import { PaymentDiscountBadge } from '@/components/brand/PaymentDiscountOffer'

type NavItem = {
  to: string
  label: string
  icon: typeof Home
  end?: boolean
}

const navItems: NavItem[] = [
  { to: '/home', label: 'Home', icon: Home, end: true },
  { to: '/tests', label: 'Tests & packages', icon: FlaskConical },
  { to: '/appointments', label: 'Bookings', icon: CalendarDays },
  { to: '/history', label: 'Reports', icon: History },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
]

const mobileNav = [
  { to: '/home', label: 'Home', icon: Home, end: true },
  { to: '/tests', label: 'Tests', icon: FlaskConical },
  { to: '/appointments/book', label: 'Book', icon: Plus, fab: true },
  { to: '/appointments', label: 'Bookings', icon: CalendarDays },
  { to: '/history', label: 'Reports', icon: History },
] as const

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
          isActive ? 'bg-teal-light text-teal' : 'text-ink-soft hover:bg-slate-50 hover:text-ink',
        )
      }
    >
      <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={2} />
      {item.label}
    </NavLink>
  )
}

export function AppShell() {
  const user = useSelector((s: RootState) => s.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const wallet = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => unwrap<WalletSummary>((await api.get('/wallet')).data),
    staleTime: 60_000,
  })

  const unread = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => unwrap<{ count: number }>((await api.get('/notifications/unread-count')).data),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  useEffect(() => {
    if (user?.id) {
      void qc.invalidateQueries({ queryKey: ['tests'] })
    }
  }, [user?.id, qc])

  async function logout() {
    try {
      await api.post('/auth/logout', { refreshToken: localStorage.getItem('hc_refresh') })
    } finally {
      dispatch(clearSession())
      navigate('/login', { replace: true })
    }
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  return (
    <div className="flex h-screen w-screen overflow-hidden app-mesh">
      {/* Slim sidebar — fixed height, no scroll */}
      <aside className="hidden h-full w-[220px] shrink-0 flex-col border-r border-line/80 bg-white lg:flex xl:w-[232px]">
        <div className="flex h-full flex-col px-3 py-4">
          <Logo variant="compact" className="px-1" />

          <NavLink
            to="/appointments/book"
            className="mt-5 flex items-center justify-center gap-1.5 rounded-lg bg-brand-red py-2.5 text-xs font-bold text-white transition hover:bg-brand-red-dark"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Book collection
          </NavLink>

          <nav aria-label="Main navigation" className="mt-4 space-y-0.5">
            {navItems.map((item) => (
              <SidebarLink key={item.to} item={item} />
            ))}
          </nav>

          <div className="mt-auto space-y-2 border-t border-line/70 pt-3">
            {isAdmin ? (
              <NavLink
                to="/admin"
                className="block rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft transition hover:bg-slate-50 hover:text-teal"
              >
                Admin console →
              </NavLink>
            ) : null}
            <div className="flex items-center gap-2 px-1">
              <NavLink to="/profile" className="min-w-0 flex-1 truncate text-xs font-medium text-ink-soft transition hover:text-teal">
                {user?.fullName}
              </NavLink>
              <button
                type="button"
                onClick={logout}
                title="Sign out"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-soft transition hover:bg-red-50 hover:text-brand-red"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top navbar */}
        <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-line/70 bg-white px-4 lg:h-[52px] lg:px-6">
          <div className="flex min-w-0 items-center gap-2 lg:gap-3">
            <div className="flex items-center gap-2 lg:hidden">
              <Logo variant="icon" />
            </div>
            <PaymentDiscountBadge size="sm" className="hidden lg:inline-flex" />
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 xl:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Home collection
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {wallet.data ? (
              <NavLink
                to="/wallet"
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-light/80 px-2.5 py-1.5 text-xs font-bold text-teal"
              >
                <Wallet className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Wallet</span>
                {formatMoney(wallet.data.totalSpendable)}
              </NavLink>
            ) : null}
            {isAdmin ? (
              <NavLink
                to="/admin"
                className="hidden rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:text-teal sm:inline-flex"
              >
                Admin
              </NavLink>
            ) : null}
            <NotifyBell count={unread.data?.count ?? 0} compact />
            <NavLink
              to="/profile"
              title="Profile & settings"
              className="inline-flex items-center gap-2 rounded-lg border border-line/80 bg-white py-1 pl-1 pr-2.5 transition hover:border-teal/30"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-teal text-xs font-bold text-white">
                {user?.fullName?.[0]}
              </span>
              <span className="hidden max-w-[100px] truncate text-xs font-semibold text-ink md:inline">
                {user?.fullName?.split(' ')[0]}
              </span>
              <UserRound className="h-3.5 w-3.5 text-ink-soft md:hidden" />
            </NavLink>
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="hidden h-8 w-8 place-items-center rounded-lg text-ink-soft transition hover:bg-red-50 hover:text-brand-red lg:grid"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 pt-3 lg:px-6 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-2 bottom-2 z-30 lg:hidden">
        <div className="flex items-end justify-around rounded-xl border border-line/80 bg-white px-0.5 py-1.5 shadow-[0_4px_20px_rgba(12,25,41,0.1)]">
          {mobileNav.map((item) => {
            const Icon = item.icon
            if ('fab' in item && item.fab) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="-mt-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-red text-white shadow-md transition active:scale-95"
                >
                  <Icon className="h-5 w-5" strokeWidth={2.5} />
                </NavLink>
              )
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  cn(
                    'flex min-w-[48px] flex-col items-center gap-0.5 px-1 py-1 text-[9px] font-semibold',
                    isActive ? 'text-teal' : 'text-ink-soft',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.25 : 2} />
                    {item.label}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
