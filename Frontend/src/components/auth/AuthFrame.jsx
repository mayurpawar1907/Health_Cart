import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { cn } from '@/utils/utils'

export function AuthFrame({ title, subtitle, children, wide = false, compact = false }) {
  return (
    <div className="grid min-h-screen w-full overflow-hidden app-mesh lg:grid-cols-2 lg:h-screen">
      <div className="relative hidden min-h-full overflow-hidden lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1929] via-[#1a4d6d] to-[#0f3349]" />
        <div className="relative p-12">
          <Logo variant="full" onDark />
        </div>
        <div className="relative max-w-lg px-12 pb-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-300">HealthID Card</p>
          <h2 className="mt-4 font-display text-5xl leading-[1.08] text-white">Simple home lab tests.</h2>
          <p className="mt-5 text-lg leading-relaxed text-white/60">
            Book tests, get home collection, and receive reports on WhatsApp — all in one place.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {['63+ tests', 'Free collection', 'Family card'].map((t) => (
              <div
                key={t}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center text-xs font-semibold text-white/80 backdrop-blur-sm"
              >
                {t}
              </div>
            ))}
          </div>
        </div>
        <p className="relative px-12 pb-10 text-sm text-white/35">Care beyond borders</p>
      </div>

      <div className="flex min-h-screen min-h-0 flex-col overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:min-h-0 lg:h-full lg:px-8 lg:py-10">
        <div
          className={cn(
            'mx-auto my-auto w-full flex-shrink-0',
            wide ? 'max-w-[520px]' : 'max-w-[420px]',
          )}
        >
          <div
            className={cn(
              'glass-panel rounded-[24px]',
              compact ? 'p-5 sm:p-6' : 'p-6 sm:p-7 md:p-8',
            )}
          >
            <div className={cn('flex items-center justify-between lg:hidden', compact ? 'mb-4' : 'mb-5')}>
              <Logo variant="compact" />
              <Link to="/" className="text-sm font-semibold text-teal">
                ← Home
              </Link>
            </div>
            <div className={compact ? 'mb-5' : 'mb-6'}>
              <h1 className="font-display text-[clamp(1.5rem,3.5vw,1.75rem)] leading-tight text-ink">{title}</h1>
              {subtitle ? (
                <p className={cn('mt-1.5 text-ink-soft', compact ? 'text-sm leading-snug' : 'text-sm leading-relaxed')}>
                  {subtitle}
                </p>
              ) : null}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
