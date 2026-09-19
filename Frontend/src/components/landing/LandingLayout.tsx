import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { PaymentDiscountStrip } from '@/components/brand/PaymentDiscountOffer'

export function LandingHeader() {
  return (
    <>
    <PaymentDiscountStrip />
    <header className="sticky top-0 z-50 border-b border-line/60 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link to="/" className="shrink-0">
          <Logo variant="compact" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
          <a href="#how-it-works" className="transition hover:text-teal">How it works</a>
          <a href="#membership" className="transition hover:text-teal">HealthID Card</a>
          <a href="#pricing" className="transition hover:text-teal">Rate list</a>
          <a href="#faq" className="transition hover:text-teal">FAQ</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login" className="hidden text-sm font-medium text-ink-soft hover:text-teal sm:inline">Log in</Link>
          <Link to="/signup">
            <Button variant="accent" size="sm" className="rounded-lg px-4">Get free card</Button>
          </Link>
        </div>
      </div>
    </header>
    </>
  )
}

export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <Logo variant="compact" onDark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
            HealthID Card — Care beyond borders. Book lab tests with free home collection, family membership, and reports on WhatsApp.
          </p>
          <p className="mt-3 text-xs tracking-[0.2em] text-brand-red-light">CARE BEYOND BORDERS</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Platform</p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li><Link to="/signup" className="hover:text-white">Create account</Link></li>
            <li><Link to="/login" className="hover:text-white">Member login</Link></li>
            <li><a href="#membership" className="hover:text-white">HealthID Card</a></li>
            <li><a href="#pricing" className="hover:text-white">Blood test rates</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>1800-123-4567</li>
            <li>care@healthidcard.com</li>
            <li>Mumbai · Delhi · Bangalore</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} HealthID Card Pvt. Ltd. · NABL partner network · ISO 27001 certified
      </div>
    </footer>
  )
}
