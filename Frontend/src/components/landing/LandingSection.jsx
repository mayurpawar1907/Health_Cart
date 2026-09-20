import { LANDING_CONTAINER } from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

/** Consistent section shell — spacing, optional alt background, scroll reveal */
export function LandingBlock({ id, alt = false, className, containerClassName, children, ...rest }) {
  return (
    <section
      id={id}
      className={cn('landing-block landing-reveal border-t border-line/35', alt && 'landing-block--alt', className)}
      {...rest}
    >
      <div className={cn(LANDING_CONTAINER, containerClassName)}>{children}</div>
    </section>
  )
}

export function LandingSectionHeader({ eyebrow, title, subtitle, center = false, className }) {
  return (
    <div className={cn('landing-section-header', center && 'is-center', className)}>
      {eyebrow ? <p className="landing-eyebrow">{eyebrow}</p> : null}
      {title ? <h2 className="landing-section-title">{title}</h2> : null}
      {subtitle ? <div className="landing-section-subtitle">{subtitle}</div> : null}
    </div>
  )
}
