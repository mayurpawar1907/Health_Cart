import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Clock, Layers, Package } from 'lucide-react';
import { cn, formatMoney } from '@/utils/utils';
import { packageIncludedTests } from '@/utils/packages';
import { PaymentDiscountBadge, PaymentDiscountCardNote } from '@/components/brand/PaymentDiscountOffer';
const ACCENTS = [
    'from-[#1a4d6d] to-[#2d7aa8]',
    'from-[#e03a28] to-[#f06554]',
    'from-[#4338ca] to-[#6366f1]',
    'from-[#059669] to-[#10b981]',
    'from-[#d97706] to-[#f59e0b]',
    'from-[#7c3aed] to-[#8b5cf6]',
];
export function PackageCard({ pkg, accentIndex = 0, compact, showIncluded }) {
    const [expanded, setExpanded] = useState(false);
    const included = packageIncludedTests(pkg);
    const mrp = Number(pkg.price);
    const memberPrice = Number(pkg.memberPrice ?? pkg.discountedPrice ?? pkg.price);
    const savings = mrp - memberPrice;
    const accent = ACCENTS[accentIndex % ACCENTS.length];
    const preview = included.slice(0, 4);
    const rest = included.length - preview.length;
    return (<article className={cn('group flex h-full flex-col overflow-hidden rounded-3xl border border-line/70 bg-white shadow-[0_8px_30px_rgba(12,25,41,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(12,25,41,0.1)]', compact ? 'min-w-[300px] max-w-[340px]' : 'w-full')}>
      <div className={cn('h-2 bg-gradient-to-r', accent)}/>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-teal">
            <Package className="h-3 w-3"/>
            Health package
          </span>
          <div className="flex flex-wrap justify-end gap-1">
            {pkg.isPopular ? (<span className="rounded-full bg-teal px-2.5 py-1 text-[10px] font-bold text-white">Popular</span>) : null}
            <PaymentDiscountBadge size="sm"/>
          </div>
        </div>

        <h3 className="mt-3 font-display text-lg leading-snug text-ink group-hover:text-teal">{pkg.name}</h3>
        <p className={cn('mt-1.5 text-xs leading-relaxed text-ink-soft', compact ? 'line-clamp-2' : 'line-clamp-3')}>
          {staticPkg?.shortDescription ?? pkg.shortDescription}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-medium text-ink-soft">
            <Layers className="h-3 w-3 text-teal"/>
            {included.length} tests included
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-medium text-ink-soft">
            <Clock className="h-3 w-3 text-teal"/>
            ~{pkg.reportHours}h report
          </span>
        </div>

        {showIncluded && included.length > 0 ? (<div className="mt-3 rounded-xl border border-line/70 bg-cream/40 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Included tests</p>
            <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-ink-soft">
              {(expanded ? included : preview).map((t) => (<li key={t} className="flex gap-1.5">
                  <span className="text-teal">•</span>
                  <span>{t}</span>
                </li>))}
            </ul>
            {rest > 0 ? (<button type="button" onClick={() => setExpanded((v) => !v)} className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-teal hover:underline">
                {expanded ? 'Show less' : `+ ${rest} more tests`}
                <ChevronDown className={cn('h-3 w-3 transition', expanded && 'rotate-180')}/>
              </button>) : null}
          </div>) : null}

        <div className="mt-auto border-t border-line/60 pt-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Special price</p>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-teal">{formatMoney(memberPrice)}</span>
                {savings > 0 ? <span className="text-sm text-ink-soft line-through">{formatMoney(mrp)}</span> : null}
              </div>
            </div>
            {savings > 0 ? (<span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                Save {formatMoney(savings)}
              </span>) : null}
          </div>
          <PaymentDiscountCardNote specialPrice={memberPrice}/>

          <div className="mt-4 flex gap-2">
            <Link to={`/appointments/book?testId=${pkg.id}`} className="flex-1 rounded-xl bg-gradient-to-r from-[#e03a28] to-[#c42e1e] py-2.5 text-center text-xs font-bold text-white shadow-sm transition hover:brightness-105">
              Book package
            </Link>
            <Link to={`/tests/${pkg.slug}`} className="rounded-xl border border-line px-3 py-2.5 text-xs font-semibold text-ink-soft transition hover:border-teal hover:text-teal">
              Details
            </Link>
          </div>
        </div>
      </div>
    </article>);
}
