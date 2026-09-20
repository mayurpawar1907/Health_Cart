import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/utils'

export const Select = forwardRef(function Select(
  { label, error, className, id, children, compact = false, ...props },
  ref,
) {
  const selectId = id ?? props.name

  return (
    <label className={cn('block', compact ? 'space-y-1.5' : 'space-y-2')}>
      {label ? <span className={cn('font-semibold text-ink/80', compact ? 'text-[13px]' : 'text-sm')}>{label}</span> : null}
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full appearance-none border border-line/80 bg-white/90 pr-10 text-ink shadow-sm outline-none transition',
            compact ? 'rounded-xl px-3.5 py-2.5 text-sm' : 'rounded-2xl px-4 py-3.5',
            'focus:border-teal focus:bg-white focus:shadow-[0_0_0_4px_rgba(26,77,109,0.08)]',
            error && 'border-danger focus:shadow-[0_0_0_4px_rgba(224,58,40,0.1)]',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
          aria-hidden
        />
      </div>
      {error ? <span className="text-xs font-medium leading-tight text-danger">{error}</span> : null}
    </label>
  )
})
