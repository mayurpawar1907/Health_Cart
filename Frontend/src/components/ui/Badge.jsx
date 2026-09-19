import { cn } from '@/utils/utils';
export function Badge({ children, tone = 'teal' }) {
    return (<span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', tone === 'teal' && 'bg-teal-light text-teal-dark', tone === 'sand' && 'bg-[#f4ead8] text-[#8a6a32]', tone === 'ink' && 'bg-cream text-ink-soft', tone === 'success' && 'bg-emerald-50 text-success', tone === 'danger' && 'bg-red-50 text-danger', tone === 'red' && 'bg-brand-red-light text-brand-red')}>
      {children}
    </span>);
}
