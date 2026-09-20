import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Clock, Layers, Package } from 'lucide-react';
import { cn, formatMoney } from '@/utils/utils';
import { packageIncludedTests } from '@/utils/packages';
import { Button } from '@/components/ui/Button';
import { PaymentDiscountCardNote } from '@/components/brand/PaymentDiscountOffer';

export function PackageCard({ pkg, compact, showIncluded }) {
    const [expanded, setExpanded] = useState(false);
    const included = packageIncludedTests(pkg);
    const mrp = Number(pkg.price);
    const memberPrice = Number(pkg.memberPrice ?? pkg.discountedPrice ?? pkg.price);
    const savings = mrp - memberPrice;
    const preview = included.slice(0, 4);
    const rest = included.length - preview.length;

    return (
        <article
            className={cn(
                'group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(12,25,41,0.05)] transition duration-200',
                'hover:border-teal/25 hover:shadow-[0_8px_24px_rgba(26,77,109,0.08)]',
                compact ? 'min-w-[300px] max-w-[340px]' : 'w-full',
            )}
        >
            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-light text-teal">
                        <Package className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-teal-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-dark">
                                Health package
                            </span>
                            {pkg.isPopular ? (
                                <span className="text-[10px] font-medium text-ink-soft">Popular</span>
                            ) : null}
                        </div>
                        <h3 className="mt-1.5 font-display text-base font-bold leading-snug text-ink group-hover:text-teal-dark">
                            {pkg.name}
                        </h3>
                    </div>
                </div>

                <p className={cn('mt-2 text-xs leading-relaxed text-ink-soft', compact ? 'line-clamp-2' : 'line-clamp-3')}>
                    {pkg.shortDescription}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-md bg-cream px-2 py-1 text-[10px] font-medium text-ink-soft">
                        <Layers className="h-3 w-3 text-teal" aria-hidden />
                        {included.length} tests included
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-cream px-2 py-1 text-[10px] font-medium text-ink-soft">
                        <Clock className="h-3 w-3 text-teal" aria-hidden />
                        ~{pkg.reportHours}h report
                    </span>
                </div>

                {showIncluded && included.length > 0 ? (
                    <div className="mt-3 rounded-xl border border-line/70 bg-cream/50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Included tests</p>
                        <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-ink-soft">
                            {(expanded ? included : preview).map((t) => (
                                <li key={t} className="flex gap-1.5">
                                    <span className="text-teal">•</span>
                                    <span>{t}</span>
                                </li>
                            ))}
                        </ul>
                        {rest > 0 ? (
                            <button
                                type="button"
                                onClick={() => setExpanded((v) => !v)}
                                className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-teal hover:underline"
                            >
                                {expanded ? 'Show less' : `+ ${rest} more tests`}
                                <ChevronDown className={cn('h-3 w-3 transition', expanded && 'rotate-180')} aria-hidden />
                            </button>
                        ) : null}
                    </div>
                ) : null}

                <div className="mt-auto border-t border-line/60 pt-4">
                    <div className="flex items-end justify-between gap-2">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Special price</p>
                            <div className="mt-0.5 flex items-baseline gap-2">
                                <span className="font-display text-xl font-bold text-teal-dark">{formatMoney(memberPrice)}</span>
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
                    <PaymentDiscountCardNote specialPrice={memberPrice} variant="inline" />

                    <div className="mt-4 flex gap-2">
                        <Link to={`/appointments/book?testId=${pkg.id}`} className="flex-1">
                            <Button size="sm" className="w-full rounded-xl">Book package</Button>
                        </Link>
                        <Link to={`/tests/${pkg.slug}`}>
                            <Button variant="secondary" size="sm" className="rounded-xl px-4">Details</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
