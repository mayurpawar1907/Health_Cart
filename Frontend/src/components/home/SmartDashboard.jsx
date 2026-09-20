import { Link } from 'react-router-dom';
import { Activity, ChevronRight, FlaskConical, HeartPulse, Microscope, Pill, Stethoscope, } from 'lucide-react';
import { cn } from '@/utils/utils';
import { OfferCard } from './OfferCard';
const CATEGORY_STYLES = [
    { bg: 'from-teal-light to-white', icon: 'bg-teal text-white', iconComp: FlaskConical },
    { bg: 'from-red-50 to-white', icon: 'bg-[#e03a28] text-white', iconComp: HeartPulse },
    { bg: 'from-indigo-50 to-white', icon: 'bg-indigo-500 text-white', iconComp: Microscope },
    { bg: 'from-emerald-50 to-white', icon: 'bg-emerald-500 text-white', iconComp: Activity },
    { bg: 'from-amber-50 to-white', icon: 'bg-amber-500 text-white', iconComp: Pill },
    { bg: 'from-sky-50 to-white', icon: 'bg-sky-500 text-white', iconComp: Stethoscope },
];
export function HomeExplore({ categories, popular }) {
    return (<div className="space-y-10">
      {categories.length > 0 ? (<section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-ink md:text-2xl">Browse by category</h2>
              <p className="mt-1 text-sm text-ink-soft">Find the right test for your health needs</p>
            </div>
            <Link to="/tests" className="flex items-center gap-0.5 text-sm font-semibold text-teal hover:underline">
              All tests <ChevronRight className="h-4 w-4"/>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((c, i) => {
                const style = CATEGORY_STYLES[i % CATEGORY_STYLES.length];
                const Icon = style.iconComp;
                return (<Link key={c.id} to={`/tests?category=${c.slug}`} className={cn('group flex flex-col rounded-2xl border border-line/60 bg-gradient-to-br p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal/30 hover:shadow-md', style.bg)}>
                  <span className={cn('mb-3 grid h-10 w-10 place-items-center rounded-xl shadow-sm transition group-hover:scale-105', style.icon)}>
                    <Icon className="h-5 w-5"/>
                  </span>
                  <span className="text-sm font-semibold leading-snug text-ink">{c.name}</span>
                  {c.description ? (<span className="mt-1 line-clamp-2 text-[11px] text-ink-soft">{c.description}</span>) : null}
                </Link>);
            })}
          </div>
        </section>) : null}

      {popular.length > 0 ? (<section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-ink md:text-2xl">Popular tests</h2>
              <p className="mt-1 text-sm text-ink-soft">Extra 30% off at payment · Free home collection · Fast reports</p>
            </div>
            <Link to="/tests?popular=true" className="flex items-center gap-0.5 text-sm font-semibold text-teal hover:underline">
              See all <ChevronRight className="h-4 w-4"/>
            </Link>
          </div>
          <div className="-mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 scroll-smooth [scrollbar-width:thin]">
            {popular.filter((t) => !t.isPackage).slice(0, 8).map((t, i) => (<div key={t.id} className="snap-start">
                <OfferCard test={t} badge="Popular"/>
              </div>))}
          </div>
        </section>) : null}
    </div>);
}
/** @deprecated use HomeExplore — kept for import compatibility */
export const SmartDashboard = HomeExplore;
export function SmartSearchBar() {
    return null;
}
export function PopularTestRow({ test }) {
    return (<Link to={`/appointments/book?testId=${test.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-line/60 bg-white px-4 py-3 transition hover:border-teal/30">
      <span className="truncate text-sm font-medium text-ink">{test.name}</span>
    </Link>);
}
