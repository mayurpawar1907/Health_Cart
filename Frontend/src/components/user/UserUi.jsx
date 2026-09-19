import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/Button';
export function UserPage({ children, className }) {
    return <div className={cn('mx-auto w-full max-w-6xl space-y-6', className)}>{children}</div>;
}
export function UserPageHeader({ title, subtitle, actions }) {
    return (<div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal">HealthID Card</p>
        <h1 className="mt-1 font-display text-3xl text-ink md:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>);
}
export function UserPanel({ title, subtitle, children, className }) {
    return (<div className={cn('glass-panel rounded-3xl p-5 md:p-6', className)}>
      {title ? <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">{title}</p> : null}
      {subtitle ? <p className="mt-1 text-sm text-ink-soft">{subtitle}</p> : null}
      <div className={title || subtitle ? 'mt-4' : undefined}>{children}</div>
    </div>);
}
export function UserStatCard({ label, value, hint }) {
    return (<div className="glass-panel rounded-3xl p-5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-2xl text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
    </div>);
}
export function UserToolbar({ children }) {
    return <div className="glass-panel flex flex-wrap items-center gap-3 rounded-2xl p-3 md:p-4">{children}</div>;
}
export function UserSearch({ value, onChange, placeholder = 'Search…', onSubmit, }) {
    if (onSubmit) {
        return (<form onSubmit={(e) => {
                e.preventDefault();
                const q = new FormData(e.currentTarget).get('q');
                onSubmit(String(q ?? ''));
            }} className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-1">
        <Search className="h-4 w-4 shrink-0 text-teal"/>
        <input name="q" defaultValue={value} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-ink-soft/60"/>
        <Button type="submit" size="sm" className="rounded-xl">Search</Button>
      </form>);
    }
    return (<div className="relative min-w-[200px] flex-1">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"/>
      <input type="search" value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-line/80 bg-white/90 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal focus:shadow-[0_0_0_4px_rgba(26,77,109,0.08)]"/>
    </div>);
}
export function UserChip({ active, children, onClick }) {
    return (<button type="button" onClick={onClick} className={cn('shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition', active ? 'bg-teal text-white shadow-sm' : 'border border-line/80 bg-white/80 text-ink-soft hover:border-teal/40 hover:text-teal')}>
      {children}
    </button>);
}
export function UserSection({ title, action, children }) {
    return (<section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="font-display text-xl text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>);
}
export function UserQuickLink({ to, label }) {
    return (<Link to={to} className="flex items-center justify-between rounded-2xl border border-line/60 bg-white/60 px-4 py-3.5 text-sm font-semibold text-ink transition hover:border-teal/40 hover:bg-teal-light/40 hover:text-teal">
      {label}
      <span className="text-teal">→</span>
    </Link>);
}
export function UserPagination({ page, pages, onPage, }) {
    if (pages <= 1)
        return null;
    return (<div className="flex items-center justify-center gap-2">
      <Button size="sm" variant="secondary" className="rounded-xl" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft className="h-4 w-4"/>
      </Button>
      <span className="min-w-[100px] text-center text-sm text-ink-soft">Page {page} of {pages}</span>
      <Button size="sm" variant="secondary" className="rounded-xl" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        <ChevronRight className="h-4 w-4"/>
      </Button>
    </div>);
}
export function UserSelect({ value, onChange, children, className, }) {
    return (<select value={value} onChange={(e) => onChange(e.target.value)} className={cn('rounded-xl border border-line/80 bg-white/90 px-4 py-2.5 text-sm font-medium shadow-sm outline-none transition focus:border-teal focus:shadow-[0_0_0_4px_rgba(26,77,109,0.08)]', className)}>
      {children}
    </select>);
}
export function UserTable({ children }) {
    return (<div className="glass-panel overflow-hidden rounded-3xl p-0">
      <div className="overflow-x-auto">{children}</div>
    </div>);
}
export function UserTHead({ children }) {
    return (<thead>
      <tr className="border-b border-line/60 bg-gradient-to-r from-teal/[0.08] to-cream/80 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
        {children}
      </tr>
    </thead>);
}
export function UserTh({ children, className }) {
    return <th className={cn('px-4 py-3.5 md:px-5', className)}>{children}</th>;
}
export function UserTr({ children, className }) {
    return <tr className={cn('border-b border-line/40 transition hover:bg-teal-light/30', className)}>{children}</tr>;
}
export function UserTd({ children, className }) {
    return <td className={cn('px-4 py-3.5 md:px-5', className)}>{children}</td>;
}
export function UserBadge({ children, tone = 'default', }) {
    const tones = {
        default: 'bg-ink/5 text-ink-soft',
        success: 'bg-emerald-50 text-success',
        warn: 'bg-amber-50 text-amber-800',
        danger: 'bg-brand-red-light text-brand-red',
        teal: 'bg-teal-light text-teal-dark',
    };
    return (<span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide', tones[tone])}>
      {children}
    </span>);
}
export function UserEmptyRow({ colSpan, message }) {
    return (<tr>
      <td colSpan={colSpan} className="px-5 py-14 text-center text-sm text-ink-soft">
        {message}
      </td>
    </tr>);
}
