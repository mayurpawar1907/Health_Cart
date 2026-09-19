import { Activity, FlaskConical, HeartPulse, Microscope, Pill, Stethoscope, } from 'lucide-react';
import { cn } from '@/utils/utils';
const CATEGORY_STYLES = [
    { bg: 'from-teal-light to-white', icon: 'bg-teal text-white', iconComp: FlaskConical },
    { bg: 'from-red-50 to-white', icon: 'bg-[#e03a28] text-white', iconComp: HeartPulse },
    { bg: 'from-indigo-50 to-white', icon: 'bg-indigo-500 text-white', iconComp: Microscope },
    { bg: 'from-emerald-50 to-white', icon: 'bg-emerald-500 text-white', iconComp: Activity },
    { bg: 'from-amber-50 to-white', icon: 'bg-amber-500 text-white', iconComp: Pill },
    { bg: 'from-sky-50 to-white', icon: 'bg-sky-500 text-white', iconComp: Stethoscope },
];
export function TestsCategoryGrid({ categories, activeSlug, onSelect }) {
    if (!categories.length)
        return null;
    return (<section aria-label="Browse by category">
      <div className="mb-4">
        <h2 className="font-display text-xl text-ink md:text-2xl">Browse by category</h2>
        <p className="mt-1 text-sm text-ink-soft">Tap a category to filter the catalog</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <button type="button" onClick={() => onSelect('')} className={cn('flex flex-col rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md', !activeSlug
            ? 'border-teal/40 bg-gradient-to-br from-teal-light to-white ring-2 ring-teal/20'
            : 'border-line/60 bg-gradient-to-br from-slate-50 to-white hover:border-teal/30')}>
          <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-slate-600 text-white shadow-sm">
            <FlaskConical className="h-5 w-5"/>
          </span>
          <span className="text-sm font-semibold text-ink">All tests</span>
          <span className="mt-1 text-[11px] text-ink-soft">Full catalog</span>
        </button>
        {categories.map((c, i) => {
            const style = CATEGORY_STYLES[i % CATEGORY_STYLES.length];
            const Icon = style.iconComp;
            const active = activeSlug === c.slug;
            return (<button key={c.id} type="button" onClick={() => onSelect(c.slug)} className={cn('group flex flex-col rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md', active
                    ? 'border-teal/40 ring-2 ring-teal/20'
                    : 'border-line/60 hover:border-teal/30', `bg-gradient-to-br ${style.bg}`)}>
              <span className={cn('mb-3 grid h-10 w-10 place-items-center rounded-xl shadow-sm transition group-hover:scale-105', style.icon)}>
                <Icon className="h-5 w-5"/>
              </span>
              <span className="text-sm font-semibold leading-snug text-ink">{c.name}</span>
              {c.description ? (<span className="mt-1 line-clamp-2 text-[11px] text-ink-soft">{c.description}</span>) : null}
            </button>);
        })}
      </div>
    </section>);
}
