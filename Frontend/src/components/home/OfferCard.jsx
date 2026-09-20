import { Link } from 'react-router-dom';
import { Clock, Droplets, Home } from 'lucide-react';
import { cn, formatMoney } from '@/utils/utils';
import { Button } from '@/components/ui/Button';
import { PaymentDiscountCardNote } from '@/components/brand/PaymentDiscountOffer';

export function OfferCard({ test, badge, fluid }) {
    const memberPrice = test.memberPrice ?? test.discountedPrice ?? test.price;
    const mrp = Number(test.price);
    const savings = mrp - Number(memberPrice);
    const discountPct = mrp > 0 ? Math.round((savings / mrp) * 100) : 0;

    return (
        <article
            className={cn(
                'group flex h-full flex-col rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(12,25,41,0.05)] transition duration-200',
                'hover:border-teal/25 hover:shadow-[0_8px_24px_rgba(26,77,109,0.08)]',
                fluid ? 'w-full' : 'min-w-[272px] max-w-[300px]',
            )}
        >
            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-light text-teal">
                        <Droplets className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            {badge ? (
                                <span className="rounded-md bg-teal-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-dark">
                                    {badge}
                                </span>
                            ) : null}
                            {discountPct > 0 ? (
                                <span className="text-[10px] font-medium text-ink-soft">{discountPct}% off MRP</span>
                            ) : null}
                        </div>
                        <h3 className="mt-1.5 font-display text-base font-bold leading-snug text-ink group-hover:text-teal-dark">
                            {test.name}
                        </h3>
                    </div>
                </div>

                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-soft">{test.shortDescription}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                    {test.sampleType ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-cream px-2 py-1 text-[10px] font-medium text-ink-soft">
                            <Droplets className="h-3 w-3 text-teal" aria-hidden />
                            {test.sampleType}
                        </span>
                    ) : null}
                    {test.reportHours ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-cream px-2 py-1 text-[10px] font-medium text-ink-soft">
                            <Clock className="h-3 w-3 text-teal" aria-hidden />
                            {test.reportHours}h report
                        </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1 rounded-md bg-cream px-2 py-1 text-[10px] font-medium text-ink-soft">
                        <Home className="h-3 w-3 text-teal" aria-hidden />
                        Home pickup
                    </span>
                </div>

                <div className="mt-auto border-t border-line/60 pt-4">
                    <div className="flex items-end justify-between gap-2">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Special price</p>
                            <div className="mt-0.5 flex items-baseline gap-2">
                                <span className="font-display text-xl font-bold text-teal-dark">{formatMoney(Number(memberPrice))}</span>
                                {savings > 0 ? (
                                    <span className="text-xs text-ink-soft line-through">{formatMoney(mrp)}</span>
                                ) : null}
                            </div>
                        </div>
                        {savings > 0 ? (
                            <span className="rounded-md bg-teal-light px-2 py-1 text-[10px] font-semibold text-teal-dark">
                                Save {formatMoney(savings)}
                            </span>
                        ) : null}
                    </div>
                    <PaymentDiscountCardNote specialPrice={Number(memberPrice)} variant="inline" />

                    <div className="mt-4 flex gap-2">
                        <Link to={`/appointments/book?testId=${test.id}`} className="flex-1">
                            <Button size="sm" className="w-full rounded-xl">Book now</Button>
                        </Link>
                        <Link to={`/tests/${test.slug}`}>
                            <Button variant="secondary" size="sm" className="rounded-xl px-4">Details</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
