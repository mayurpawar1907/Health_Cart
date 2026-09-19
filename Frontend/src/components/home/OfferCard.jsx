import { Link } from 'react-router-dom';
import { Clock, Droplets, Home, TrendingUp } from 'lucide-react';
import { cn, formatMoney } from '@/utils/utils';
import { PaymentDiscountBadge, PaymentDiscountCardNote } from '@/components/brand/PaymentDiscountOffer';
const ACCENTS = [
    { bar: 'from-[#1a4d6d] to-[#2d7aa8]', icon: 'bg-teal-light text-teal', ring: 'ring-teal/20' },
    { bar: 'from-[#e03a28] to-[#f06554]', icon: 'bg-red-50 text-[#e03a28]', ring: 'ring-red-200/60' },
    { bar: 'from-[#4338ca] to-[#6366f1]', icon: 'bg-indigo-50 text-indigo-600', ring: 'ring-indigo-200/60' },
    { bar: 'from-[#059669] to-[#10b981]', icon: 'bg-emerald-50 text-emerald-600', ring: 'ring-emerald-200/60' },
];
export function OfferCard({ test, badge, accentIndex = 0, fluid }) {
    const memberPrice = test.memberPrice ?? test.discountedPrice ?? test.price;
    const mrp = Number(test.price);
    const savings = mrp - Number(memberPrice);
    const accent = ACCENTS[accentIndex % ACCENTS.length];
    const discountPct = mrp > 0 ? Math.round((savings / mrp) * 100) : 0;
    return (<article className={cn('group flex h-full flex-col overflow-hidden rounded-3xl border border-line/70 bg-white shadow-[0_8px_30px_rgba(12,25,41,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(12,25,41,0.1)]', fluid ? 'w-full' : 'min-w-[272px] max-w-[300px]')}>
      <div className={cn('h-1.5 bg-gradient-to-r', accent.bar)}/>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-2xl ring-4', accent.icon, accent.ring)}>
            <Droplets className="h-5 w-5"/>
          </span>
          <div className="flex flex-wrap justify-end gap-1.5">
            {badge ? (<span className="rounded-full bg-teal px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                {badge}
              </span>) : null}
            {discountPct > 0 ? (<span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                <TrendingUp className="h-3 w-3"/>
                {discountPct}% off MRP
              </span>) : null}
            <PaymentDiscountBadge size="sm"/>
          </div>
        </div>

        <h3 className="mt-4 font-display text-lg leading-snug text-ink group-hover:text-teal">{test.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-soft">{test.shortDescription}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {test.sampleType ? (<span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-medium text-ink-soft">
              <Droplets className="h-3 w-3 text-teal"/>
              {test.sampleType}
            </span>) : null}
          {test.reportHours ? (<span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-medium text-ink-soft">
              <Clock className="h-3 w-3 text-teal"/>
              {test.reportHours}h report
            </span>) : null}
          <span className="inline-flex items-center gap-1 rounded-lg bg-teal-light px-2 py-1 text-[10px] font-medium text-teal">
            <Home className="h-3 w-3"/>
            Home pickup
          </span>
        </div>

        <div className="mt-auto border-t border-line/60 pt-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Special price</p>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-teal">{formatMoney(Number(memberPrice))}</span>
                {savings > 0 ? (<span className="text-sm text-ink-soft line-through">{formatMoney(mrp)}</span>) : null}
              </div>
            </div>
            {savings > 0 ? (<span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                Save {formatMoney(savings)}
              </span>) : null}
          </div>
          <PaymentDiscountCardNote specialPrice={Number(memberPrice)}/>

          <div className="mt-4 flex gap-2">
            <Link to={`/appointments/book?testId=${test.id}`} className="flex-1 rounded-xl bg-gradient-to-r from-[#e03a28] to-[#c42e1e] py-2.5 text-center text-xs font-bold text-white shadow-sm transition hover:brightness-105">
              Book now
            </Link>
            <Link to={`/tests/${test.slug}`} className="rounded-xl border border-line px-3 py-2.5 text-xs font-semibold text-ink-soft transition hover:border-teal hover:text-teal">
              Details
            </Link>
          </div>
        </div>
      </div>
    </article>);
}
