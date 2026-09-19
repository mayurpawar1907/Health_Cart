import { type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' | 'glass'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ className, variant = 'primary', size = 'md', ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45',
        variant === 'primary' && 'bg-gradient-to-b from-teal to-teal-dark text-white shadow-[0_4px_14px_rgba(26,77,109,0.25)] hover:brightness-110',
        variant === 'secondary' && 'border border-line/80 bg-white text-ink shadow-sm hover:border-teal/30 hover:bg-teal-light/50',
        variant === 'ghost' && 'text-teal hover:bg-teal-light/60',
        variant === 'danger' && 'bg-danger text-white shadow-sm',
        variant === 'accent' && 'bg-gradient-to-b from-brand-red to-brand-red-dark text-white shadow-[0_4px_14px_rgba(224,58,40,0.3)] hover:brightness-110',
        variant === 'glass' && 'glass-panel text-ink hover:bg-white/90',
        size === 'sm' && 'px-3.5 py-2 text-xs',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-7 py-3.5 text-base',
        className,
      )}
      {...props}
    />
  )
}
