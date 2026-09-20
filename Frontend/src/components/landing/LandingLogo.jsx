import { Link } from 'react-router-dom'
import { cn } from '@/utils/utils'

/** Official landing-page logo — do not substitute text or alternate artwork. */
const LANDING_LOGO_SRC = '/brand/health-id-logo.svg'

export function LandingLogo({ className, compact = false }) {
  return (
    <Link to="/" className={cn('inline-flex shrink-0 items-center', className)} aria-label="HealthID Card home">
      <img
        src={LANDING_LOGO_SRC}
        alt="HealthID Card — Care Beyond Borders"
        width={compact ? 152 : 190}
        height={compact ? 60 : 75}
        className={cn('w-auto object-contain', compact ? 'h-[52px]' : 'h-16')}
        decoding="async"
      />
    </Link>
  )
}
