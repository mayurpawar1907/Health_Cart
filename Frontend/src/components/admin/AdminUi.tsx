import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function AdminPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-7xl space-y-6', className)}>{children}</div>
}

export function AdminPageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal">Operations</p>
        <h1 className="mt-1 font-display text-3xl text-ink md:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

export function StatCard({ label, value, hint, tone = 'default' }: { label: string; value: string | number; hint?: string; tone?: 'default' | 'accent' | 'warn' }) {
  return (
    <div className={cn(
      'glass-panel rounded-3xl p-5 transition hover:shadow-md',
      tone === 'accent' && 'ring-1 ring-brand-red/15',
      tone === 'warn' && 'ring-1 ring-amber-300/40',
    )}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  )
}

export function AdminSection({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function AdminPanel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">{title}</p>
      {subtitle ? <p className="mt-1 text-sm text-ink-soft">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </div>
  )
}

export function AdminToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="glass-panel flex flex-wrap items-center gap-3 rounded-2xl p-3 md:p-4">
      {children}
    </div>
  )
}

export function AdminSearch({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn('relative min-w-[200px] flex-1', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line/80 bg-white/90 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal focus:shadow-[0_0_0_4px_rgba(26,77,109,0.08)]"
      />
    </div>
  )
}

export function AdminSelect({
  value,
  onChange,
  children,
  className,
  label,
}: {
  value: string
  onChange: (v: string) => void
  children: ReactNode
  className?: string
  label?: string
}) {
  const select = (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'rounded-xl border border-line/80 bg-white/90 px-4 py-2.5 text-sm font-medium shadow-sm outline-none transition focus:border-teal focus:shadow-[0_0_0_4px_rgba(26,77,109,0.08)]',
        className,
      )}
    >
      {children}
    </select>
  )
  if (!label) return select
  return (
    <label className="block space-y-2 text-sm">
      <span className="font-semibold text-ink/80">{label}</span>
      {select}
    </label>
  )
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="glass-panel overflow-hidden rounded-3xl p-0">
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

export function AdminTHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-line/60 bg-gradient-to-r from-teal/[0.08] to-cream/80 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
        {children}
      </tr>
    </thead>
  )
}

export function AdminTh({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cn('px-4 py-3.5 md:px-5', className)}>{children}</th>
}

export function AdminTr({ children }: { children: ReactNode }) {
  return <tr className="border-b border-line/40 transition hover:bg-teal-light/30">{children}</tr>
}

export function AdminTd({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3.5 md:px-5', className)}>{children}</td>
}

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'success' | 'warn' | 'danger' | 'teal' }) {
  const tones = {
    default: 'bg-ink/5 text-ink-soft',
    success: 'bg-emerald-50 text-success',
    warn: 'bg-amber-50 text-amber-800',
    danger: 'bg-brand-red-light text-brand-red',
    teal: 'bg-teal-light text-teal-dark',
  }
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide', tones[tone])}>
      {children}
    </span>
  )
}

export function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-14 text-center text-sm text-ink-soft">{message}</td>
    </tr>
  )
}

export function AdminPagination({
  page,
  pages,
  onPage,
}: {
  page: number
  pages: number
  onPage: (p: number) => void
}) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2">
      <Button size="sm" variant="secondary" className="rounded-xl" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-[100px] text-center text-sm text-ink-soft">Page {page} of {pages}</span>
      <Button size="sm" variant="secondary" className="rounded-xl" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function AdminQuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-2xl border border-line/60 bg-white/60 px-4 py-3.5 text-sm font-semibold text-ink transition hover:border-teal/40 hover:bg-teal-light/40 hover:text-teal"
    >
      {label}
      <span className="text-teal">→</span>
    </Link>
  )
}
