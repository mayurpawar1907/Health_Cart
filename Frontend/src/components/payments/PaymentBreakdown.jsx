import { formatMoney } from '@/utils/utils';
import { cn } from '@/utils/utils';
function Line({ label, value, tone = 'default', bold, strike, }) {
    const toneClass = {
        default: 'text-ink',
        muted: 'text-ink-soft',
        save: 'text-emerald-600',
        accent: 'text-[#e03a28]',
        wallet: 'text-teal',
        referral: 'text-violet-600',
    }[tone];
    return (<div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className={cn('text-ink-soft', bold && 'font-semibold text-ink')}>{label}</span>
      <span className={cn(toneClass, bold && 'font-bold', strike && 'line-through opacity-60')}>{value}</span>
    </div>);
}
function SummaryCard({ label, value, hint, tone = 'default', }) {
    const tones = {
        default: 'border-line/60 bg-white/70',
        accent: 'border-[#e03a28]/25 bg-[#fff5f4]',
        save: 'border-emerald-200 bg-emerald-50/60',
        final: 'border-teal/30 bg-teal-light/40',
    };
    return (<div className={cn('rounded-2xl border p-4', tones[tone])}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-xl text-ink">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-ink-soft">{hint}</p> : null}
    </div>);
}
export function PaymentBreakdownSummary({ breakdown }) {
    const totalDiscount = breakdown.listDiscountFromMrp +
        breakdown.paymentDiscountAmount +
        breakdown.referralCreditApplied +
        breakdown.walletCreditApplied;
    return (<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="MRP" value={formatMoney(breakdown.mrp)} hint="Reference rate" tone="default"/>
      <SummaryCard label="Special price" value={formatMoney(breakdown.specialPrice)} hint="Card / partner rate" tone="accent"/>
      <SummaryCard label="Total discount" value={breakdown.isFreeForMember ? 'FREE (member)' : `−${formatMoney(totalDiscount)}`} hint={breakdown.paymentDiscountPercent > 0
            ? `Includes ${breakdown.paymentDiscountPercent}% payment promo on special price`
            : 'Card + wallet + referral savings'} tone="save"/>
      <SummaryCard label="Final paid" value={breakdown.isFreeForMember ? '₹0' : formatMoney(breakdown.amountDue)} hint="Amount settled at checkout" tone="final"/>
    </div>);
}
export function PaymentBreakdown({ breakdown }) {
    const isFree = breakdown.isFreeForMember;
    return (<div className="space-y-4">
      <PaymentBreakdownSummary breakdown={breakdown}/>
      <div className="rounded-2xl border border-line/60 bg-white/70 p-4 md:p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Detailed calculation</p>
        <div className="mt-3 divide-y divide-line/40">
          <Line label="MRP (reference)" value={formatMoney(breakdown.mrp)} tone="muted" strike/>
          <Line label="Special / card price" value={formatMoney(breakdown.specialPrice)} bold/>
          {breakdown.listDiscountFromMrp > 0 ? (<Line label="Discount vs MRP" value={`−${formatMoney(breakdown.listDiscountFromMrp)}`} tone="save"/>) : null}
          {!isFree && breakdown.paymentDiscountPercent > 0 ? (<>
              <Line label={`Payment promo (${breakdown.paymentDiscountPercent}% on special price)`} value={`−${formatMoney(breakdown.paymentDiscountAmount)}`} tone="accent"/>
              <Line label="After payment discount" value={formatMoney(breakdown.subtotalAfterPaymentDiscount)}/>
            </>) : null}
          {breakdown.referralCreditApplied > 0 ? (<Line label="Referral credit" value={`−${formatMoney(breakdown.referralCreditApplied)}`} tone="referral"/>) : null}
          {breakdown.walletCreditApplied > 0 ? (<Line label="Wallet credit" value={`−${formatMoney(breakdown.walletCreditApplied)}`} tone="wallet"/>) : null}
          <Line label={isFree ? 'Member benefit' : 'Final paid amount'} value={isFree ? 'FREE' : formatMoney(breakdown.amountDue)} bold/>
        </div>
      </div>
    </div>);
}
