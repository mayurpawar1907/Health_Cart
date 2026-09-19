import { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowRight, CalendarDays, CheckCircle2, Clock, CreditCard, MapPin, ShieldCheck, Smartphone, Wallet } from 'lucide-react';
import { formatMoney } from '@/utils/utils';
import { resolveCheckoutPricing } from '@/utils/checkout-pricing';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PaymentDiscountBadge } from '@/components/brand/PaymentDiscountOffer';
const UPI_APPS = [
    { id: 'gpay', name: 'Google Pay', short: 'GP' },
    { id: 'phonepe', name: 'PhonePe', short: 'Pe' },
    { id: 'paytm', name: 'Paytm', short: 'Pt' },
    { id: 'bhim', name: 'BHIM UPI', short: 'BH' },
];
function PriceLine({ label, value, tone = 'default', bold, strike, }) {
    const toneClass = {
        default: 'text-ink',
        muted: 'text-ink-soft',
        save: 'text-emerald-700',
        accent: 'text-[#e03a28]',
        wallet: 'text-indigo-700',
        referral: 'text-[#e03a28]',
    }[tone];
    return (<div className={`flex justify-between gap-3 text-sm ${bold ? 'font-semibold' : ''}`}>
      <span className={tone === 'muted' ? 'text-ink-soft' : 'text-ink-soft'}>{label}</span>
      <span className={`${toneClass} ${strike ? 'line-through' : ''}`}>{value}</span>
    </div>);
}
export function BookPaymentPanel({ selected, quote, date, timeSlot, patientName, addressLine, paymentMethod, useWallet, useReferral, onUseWallet, onUseReferral, onPaymentMethod, onConfirm, isPending, error, }) {
    const [upiApp, setUpiApp] = useState(null);
    const [paidSimulated, setPaidSimulated] = useState(false);
    const pricing = resolveCheckoutPricing(quote);
    const amountDue = pricing.amountDue;
    const pct = pricing.paymentDiscountPercent;
    const upiPayload = useMemo(() => {
        const pa = 'healthidcard@upi';
        const pn = encodeURIComponent('HealthID Card');
        const am = amountDue.toFixed(2);
        const tn = encodeURIComponent(`Lab test: ${selected.name.slice(0, 40)}`);
        return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
    }, [amountDue, selected.name]);
    const canConfirm = amountDue === 0 ||
        paymentMethod === 'COD' ||
        (paymentMethod === 'UPI' && paidSimulated) ||
        (paymentMethod === 'CARD' && paidSimulated);
    return (<>
      <div className="rounded-2xl border border-line/80 bg-white/80 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Booking summary</p>
        <div className="mt-3 grid gap-2.5 text-sm">
          <div className="flex items-center gap-2.5 text-ink-soft">
            <CalendarDays className="h-4 w-4 shrink-0 text-teal"/>
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2.5 text-ink-soft">
            <Clock className="h-4 w-4 shrink-0 text-teal"/>
            <span>{timeSlot}</span>
          </div>
          <div className="flex items-center gap-2.5 text-ink-soft">
            <MapPin className="h-4 w-4 shrink-0 text-teal"/>
            <span className="line-clamp-2">{addressLine ?? 'Home collection'}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-teal/20 bg-gradient-to-br from-teal-light/60 to-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal">Payment breakdown</p>
            <p className="mt-0.5 text-sm text-ink-soft">{selected.name} · {patientName}</p>
          </div>
          <PaymentDiscountBadge />
        </div>

        {!quote.isFreeForMember ? (<div className="mt-4 grid gap-2 rounded-xl border border-[#e03a28]/20 bg-[#fff8f7] p-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center sm:gap-3">
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Special price</p>
              <p className="mt-0.5 font-display text-lg text-ink">{formatMoney(pricing.beforePaymentDiscount)}</p>
              <p className="text-[10px] text-ink-soft">Not MRP</p>
            </div>
            <ArrowRight className="mx-auto hidden h-4 w-4 text-[#e03a28] sm:block"/>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#e03a28]">{pct}% off special price</p>
              <p className="mt-0.5 font-display text-lg text-[#e03a28]">−{formatMoney(pricing.paymentDiscountAmount)}</p>
            </div>
            <ArrowRight className="mx-auto hidden h-4 w-4 text-teal sm:block"/>
            <div className="text-center sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal">After {pct}% discount</p>
              <p className="mt-0.5 font-display text-lg text-teal">{formatMoney(pricing.afterPaymentDiscount)}</p>
            </div>
          </div>) : null}

        <div className="mt-4 space-y-2.5 border-t border-teal/15 pt-4">
          <PriceLine label="MRP (lab rate)" value={formatMoney(pricing.mrp)} tone="muted" strike/>

          {pricing.listDiscountFromMrp > 0 ? (<PriceLine label="MRP → special price savings" value={`−${formatMoney(pricing.listDiscountFromMrp)}`} tone="save"/>) : null}

          {pricing.beforePaymentDiscount > 0 && !quote.isFreeForMember ? (<PriceLine label="Special price (discount base)" value={formatMoney(pricing.beforePaymentDiscount)} bold/>) : null}

          {pricing.paymentDiscountAmount > 0 ? (<PriceLine label={`${pct}% off special price (${formatMoney(pricing.beforePaymentDiscount)} × ${pct}%)`} value={`−${formatMoney(pricing.paymentDiscountAmount)}`} tone="accent" bold/>) : null}

          {!quote.isFreeForMember ? (<PriceLine label="Test price after special-price discount" value={formatMoney(pricing.afterPaymentDiscount)} bold/>) : null}

          {pricing.referralCreditApplied > 0 ? (<PriceLine label={`Referral credit (max ₹${quote.referralPerTest}/test)`} value={`−${formatMoney(pricing.referralCreditApplied)}`} tone="referral"/>) : null}

          {pricing.walletCreditApplied > 0 ? (<PriceLine label="Wallet balance applied" value={`−${formatMoney(pricing.walletCreditApplied)}`} tone="wallet"/>) : null}

          <div className="flex justify-between border-t border-teal/15 pt-3">
            <span className="font-display text-xl text-ink">Final price you pay</span>
            <span className="font-display text-2xl text-teal">
              {quote.isFreeForMember ? 'FREE' : formatMoney(amountDue)}
            </span>
          </div>

          {pricing.totalSavings > 0 ? (<p className="text-center text-xs font-semibold text-emerald-700">
              Total savings on this booking: {formatMoney(pricing.totalSavings)}
            </p>) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {!quote.isFreeForMember ? (<Badge tone="success">{`${pct}% off special price applied`}</Badge>) : null}
          {quote.membershipApplied ? <Badge tone="teal">Member rates active</Badge> : null}
        </div>
      </div>

      {!quote.isFreeForMember && (quote.walletBalance > 0 || quote.referralBalance > 0) ? (<div className="rounded-2xl border border-line/80 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">HealthID Wallet</p>
          <p className="mt-1 text-xs text-ink-soft">Credits apply after the {pct}% payment discount</p>
          <div className="mt-3 space-y-3">
            {quote.referralBalance > 0 ? (<label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line/60 p-3 has-[:checked]:border-teal has-[:checked]:bg-teal-light/30">
                <input type="checkbox" checked={useReferral} onChange={(e) => onUseReferral(e.target.checked)} className="mt-1 accent-teal"/>
                <div>
                  <p className="text-sm font-semibold text-ink">Use referral credit</p>
                  <p className="text-xs text-ink-soft">
                    {formatMoney(quote.referralBalance)} available · up to {formatMoney(quote.referralPerTest)} this booking
                  </p>
                </div>
              </label>) : null}
            {quote.walletBalance > 0 ? (<label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line/60 p-3 has-[:checked]:border-teal has-[:checked]:bg-teal-light/30">
                <input type="checkbox" checked={useWallet} onChange={(e) => onUseWallet(e.target.checked)} className="mt-1 accent-teal"/>
                <div>
                  <p className="text-sm font-semibold text-ink">Use wallet balance</p>
                  <p className="text-xs text-ink-soft">{formatMoney(quote.walletBalance)} available (joining bonus & credits)</p>
                </div>
              </label>) : null}
          </div>
        </div>) : null}

      {amountDue === 0 ? (<div className="flex items-start gap-3 rounded-2xl border border-teal/20 bg-teal-light/30 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal"/>
          <div className="flex-1">
            <p className="font-semibold">
              {quote.isFreeForMember ? 'No payment required' : 'Fully covered by wallet'}
            </p>
            <p className="text-sm text-ink-soft">
              {quote.isFreeForMember
                ? 'This test is included free with your HealthID Card.'
                : `After ${pct}% discount, your wallet credits cover the remaining amount.`}
            </p>
            <Button className="mt-4 w-full" size="lg" disabled={isPending} onClick={onConfirm}>
              {isPending ? 'Confirming…' : 'Confirm booking'}
            </Button>
          </div>
        </div>) : (<>
          <div>
            <p className="mb-2 text-sm font-semibold">Pay final amount {formatMoney(amountDue)}</p>
            <div className="grid grid-cols-3 gap-2">
              {['UPI', 'CARD', 'COD'].map((m) => (<button key={m} type="button" onClick={() => { onPaymentMethod(m); setPaidSimulated(false); setUpiApp(null); }} className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition ${paymentMethod === m
                    ? 'border-teal bg-teal-light text-teal shadow-sm'
                    : 'border-line bg-white text-ink-soft hover:border-teal/40'}`}>
                  {m === 'UPI' ? <Smartphone className="h-4 w-4"/> : m === 'CARD' ? <CreditCard className="h-4 w-4"/> : <Wallet className="h-4 w-4"/>}
                  {m === 'COD' ? 'Pay at home' : m}
                </button>))}
            </div>
          </div>

          {paymentMethod === 'UPI' ? (<div className="rounded-2xl border border-line/80 bg-white/80 p-4 md:p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">UPI payment</p>
              <div className="mt-5 flex flex-col items-center gap-6 md:flex-row md:items-start">
                <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-sm">
                  <QRCodeSVG value={upiPayload} size={168} level="M" fgColor="#0c1929"/>
                </div>
                <div className="w-full flex-1">
                  <p className="text-center text-xs text-ink-soft md:text-left">Final amount</p>
                  <p className="text-center font-display text-2xl text-teal md:text-left">{formatMoney(amountDue)}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {UPI_APPS.map((app) => (<button key={app.id} type="button" onClick={() => { setUpiApp(app.id); setPaidSimulated(true); }} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold ${upiApp === app.id ? 'border-teal bg-teal-light text-teal' : 'border-line'}`}>
                        {app.name}
                      </button>))}
                  </div>
                  {paidSimulated ? (<p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-success">
                      <CheckCircle2 className="h-4 w-4"/> Payment initiated
                    </p>) : null}
                </div>
              </div>
            </div>) : null}

          {paymentMethod === 'CARD' ? (<div className="rounded-2xl border border-line/80 bg-white/80 p-4">
              <Button variant="secondary" className="w-full rounded-xl" onClick={() => setPaidSimulated(true)}>
                Simulate card payment · {formatMoney(amountDue)}
              </Button>
            </div>) : null}

          {paymentMethod === 'COD' ? (<div className="rounded-2xl border border-teal/20 bg-teal-light/30 p-4 text-sm">
              Pay {formatMoney(amountDue)} to the phlebotomist at home collection (after {pct}% discount
              {pricing.walletCreditApplied + pricing.referralCreditApplied > 0 ? ' & wallet credits' : ''}).
            </div>) : null}

          {error ? <p className="text-sm font-medium text-danger">Booking failed. Please try again.</p> : null}

          <Button className="w-full" size="lg" disabled={isPending || !canConfirm} onClick={onConfirm}>
            {isPending ? 'Confirming booking…' : `Confirm & pay ${formatMoney(amountDue)}`}
          </Button>
        </>)}
    </>);
}
