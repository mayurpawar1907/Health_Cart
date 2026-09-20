import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, MapPin, Menu, Phone, User, X } from 'lucide-react'
import { LandingLogo } from '@/components/landing/LandingLogo'
import { Button } from '@/components/ui/Button'
import { PaymentDiscountStrip } from '@/components/brand/PaymentDiscountOffer'
import { LANDING_CITIES, LANDING_CONTAINER } from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

const SUPPORT_PHONE = '1800-123-4567'
const SUPPORT_PHONE_TEL = '18001234567'

export function LandingHeader({ city, onCityChange }) {
  const [open, setOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <PaymentDiscountStrip />

      <header className="landing-header-pro sticky top-0 z-[60] border-b bg-white/98 backdrop-blur-md">
        <div className={cn(LANDING_CONTAINER, 'flex items-center justify-between gap-4 py-3')}>
          <div className="flex min-w-0 items-center gap-3 md:gap-5">
            <LandingLogo compact />

            <div className="hidden h-9 w-px bg-line/80 sm:block" aria-hidden />

            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setCityOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-left transition hover:bg-cream/80"
                aria-expanded={cityOpen}
              >
                <MapPin className="h-5 w-5 text-teal" aria-hidden />
                <span>
                  <span className="block text-[10px] font-medium text-ink-soft">Your location</span>
                  <span className="flex items-center gap-1 text-sm font-bold text-ink">
                    {city}
                    <ChevronDown className={cn('h-4 w-4 text-ink-soft transition', cityOpen && 'rotate-180')} />
                  </span>
                </span>
              </button>
              {cityOpen ? (
                <>
                  <button type="button" className="fixed inset-0 z-40" aria-label="Close cities" onClick={() => setCityOpen(false)} />
                  <ul className="absolute left-0 top-full z-50 mt-1 w-48 rounded-xl border border-line/80 bg-white py-1 shadow-xl">
                    {LANDING_CITIES.map((c) => (
                      <li key={c}>
                        <button
                          type="button"
                          className={cn(
                            'w-full px-4 py-2 text-left text-sm hover:bg-teal-light/40',
                            c === city ? 'font-bold text-teal' : 'text-ink-soft',
                          )}
                          onClick={() => {
                            onCityChange?.(c)
                            setCityOpen(false)
                          }}
                        >
                          {c}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-cream/80 lg:flex"
            >
              <User className="h-5 w-5 text-teal" aria-hidden />
              <span>
                <span className="block text-[10px] text-ink-soft">Login/Signup</span>
                <span className="font-bold text-ink">Member</span>
              </span>
            </Link>

            <div className="hidden h-9 w-px bg-line/80 lg:block" aria-hidden />

            <div className="hidden items-center gap-2 lg:flex">
              <Phone className="h-5 w-5 text-teal" aria-hidden />
              <span>
                <span className="block text-[10px] text-ink-soft">Customer support</span>
                <a href={`tel:${SUPPORT_PHONE_TEL}`} className="text-sm font-bold text-ink hover:text-teal">
                  {SUPPORT_PHONE}
                </a>
              </span>
            </div>

            <div className="hidden h-9 w-px bg-line/80 xl:block" aria-hidden />

            <div className="hidden items-center gap-2 xl:flex">
              <Phone className="h-5 w-5 text-teal" aria-hidden />
              <a href={`tel:${SUPPORT_PHONE_TEL}`} className="text-sm font-bold text-ink hover:text-teal">
                Enquiry
              </a>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${SUPPORT_PHONE_TEL}`}
                className="grid h-9 w-9 place-items-center rounded-lg border border-line/80 text-teal lg:hidden"
                aria-label="Call support"
              >
                <Phone className="h-4 w-4" />
              </a>
              <Link to="/signup" className="hidden sm:block">
                <Button variant="primary" size="sm" className="rounded-lg px-4">
                  Get free card
                </Button>
              </Link>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-lg border border-line/80 lg:hidden"
                aria-label={open ? 'Close menu' : 'Open menu'}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-line/50 px-4 py-2 sm:hidden">
          <label className="flex items-center gap-2 text-xs">
            <MapPin className="h-4 w-4 text-teal" />
            <span className="font-semibold text-ink-soft">Location</span>
            <select
              value={city}
              onChange={(e) => onCityChange?.(e.target.value)}
              className="flex-1 rounded-lg border border-line/80 px-2 py-1.5 text-sm font-bold"
            >
              {LANDING_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[70] bg-white p-4 lg:hidden">
          <div className="mb-4 flex items-center justify-between">
            <LandingLogo compact />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close"><X className="h-6 w-6" /></button>
          </div>
          <nav className="space-y-2">
            <Link to="/login" onClick={() => setOpen(false)} className="block rounded-xl border border-line/80 px-4 py-3 font-semibold">Sign in</Link>
            <a href="#catalog" onClick={() => setOpen(false)} className="block rounded-xl border border-line/80 px-4 py-3 font-semibold">Browse catalog</a>
            <a href="#faq" onClick={() => setOpen(false)} className="block rounded-xl border border-line/80 px-4 py-3 font-semibold">FAQ</a>
            <Link to="/signup" onClick={() => setOpen(false)} className="block pt-2">
              <Button variant="primary" className="w-full rounded-xl">Get free HealthID Card</Button>
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  )
}

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-gradient-to-b from-[#0a2540] to-[#061829] text-white">
      <div className={cn(LANDING_CONTAINER, 'py-12 md:py-14')}>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="text-center lg:col-span-5 lg:text-left">
            <div className="inline-flex rounded-2xl bg-white px-4 py-3">
              <img
                src="/brand/health-id-logo.svg"
                alt="HealthID Card — Care Beyond Borders"
                width={176}
                height={44}
                className="h-11 w-auto object-contain"
              />
            </div>
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/65 lg:mx-0">
              HealthID Card — Care beyond borders. Book lab tests with free home collection, family membership, wallet
              credits, and digital reports on WhatsApp.
            </p>
          </div>
          <div className="grid gap-8 text-center sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3 lg:text-left">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/45">Explore</p>
              <ul className="mt-4 space-y-2.5 text-sm text-white/75">
                <li><a href="#service-hub" className="hover:text-white">Browse categories</a></li>
                <li><a href="#packages" className="hover:text-white">Featured packages</a></li>
                <li><a href="#catalog" className="hover:text-white">Full catalog</a></li>
                <li><a href="#how-it-works" className="hover:text-white">How it works</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/45">Account</p>
              <ul className="mt-4 space-y-2.5 text-sm text-white/75">
                <li><Link to="/signup" className="hover:text-white">Create free account</Link></li>
                <li><Link to="/login" className="hover:text-white">Member login</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/45">Contact</p>
              <ul className="mt-4 space-y-2.5 text-sm text-white/75">
                <li><a href={`tel:${SUPPORT_PHONE_TEL}`} className="hover:text-white">{SUPPORT_PHONE}</a></li>
                <li><a href="mailto:care@healthidcard.com" className="hover:text-white">care@healthidcard.com</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} HealthID Card Pvt. Ltd. · NABL partner network
        </div>
      </div>
    </footer>
  )
}
