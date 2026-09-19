import { forwardRef } from 'react';
import { formatDate, formatMoney } from '@/utils/utils';
import { Logo } from '@/components/brand/Logo';
export const InvoiceDocument = forwardRef(function InvoiceDocument({ invoice, variant = 'user' }, ref) {
    const p = invoice.pricing;
    return (<div ref={ref} className="mx-auto max-w-3xl rounded-3xl border border-line/70 bg-white p-6 shadow-sm md:p-10 print:max-w-none print:rounded-none print:border-0 print:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-line/60 pb-6">
        <div>
          <Logo variant="compact"/>
          <p className="mt-3 text-sm text-ink-soft">HealthID Card · Lab diagnostics</p>
          <p className="text-xs text-ink-soft">GSTIN: Applied where applicable · support@healthidcard.com</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal">Tax invoice / receipt</p>
          <p className="mt-2 font-mono text-lg font-bold text-ink">{invoice.invoiceNumber}</p>
          <p className="mt-1 text-sm text-ink-soft">Issued {formatDate(invoice.issuedAt)}</p>
          {variant === 'admin' ? (<p className="mt-1 text-[10px] uppercase tracking-wide text-ink-soft">Operations copy</p>) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Bill to</p>
          <p className="mt-1 font-semibold text-ink">{invoice.customer.name}</p>
          <p className="text-sm text-ink-soft">{invoice.customer.email}</p>
          {invoice.customer.mobile ? <p className="text-sm text-ink-soft">{invoice.customer.mobile}</p> : null}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Booking</p>
          <p className="mt-1 font-mono text-sm font-semibold">{invoice.bookingCode}</p>
          {invoice.appointment ? (<p className="text-sm text-ink-soft">
              {formatDate(invoice.appointment.date)}
              {invoice.appointment.timeSlot ? ` · ${invoice.appointment.timeSlot}` : ''}
            </p>) : null}
          {invoice.patientName ? <p className="text-sm text-ink-soft">Patient: {invoice.patientName}</p> : null}
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-line/60">
        <table className="w-full text-left text-sm">
          <thead className="bg-teal-light/50 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
            <tr>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">MRP</th>
              <th className="px-4 py-3 text-right">Special price</th>
              <th className="px-4 py-3 text-right">Discount</th>
              <th className="px-4 py-3 text-right">Final</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-line/40">
              <td className="px-4 py-4">
                <p className="font-semibold text-ink">{invoice.testName}</p>
                <p className="text-xs text-ink-soft">Diagnostic test · home / lab collection</p>
              </td>
              <td className="px-4 py-4 text-right text-ink-soft line-through">{formatMoney(p.mrp)}</td>
              <td className="px-4 py-4 text-right font-medium">{formatMoney(p.specialPrice)}</td>
              <td className="px-4 py-4 text-right text-emerald-600">
                {p.isFreeForMember ? 'Member free' : `−${formatMoney(p.totalDiscount)}`}
              </td>
              <td className="px-4 py-4 text-right font-bold text-ink">
                {p.isFreeForMember ? '₹0' : formatMoney(p.amountDue)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 ml-auto max-w-sm space-y-2 text-sm">
        <Row label="MRP (reference)" value={formatMoney(p.mrp)} muted/>
        <Row label="Special / card price" value={formatMoney(p.specialPrice)}/>
        {p.listDiscountFromMrp > 0 ? <Row label="Savings vs MRP" value={`−${formatMoney(p.listDiscountFromMrp)}`} save/> : null}
        {p.paymentDiscountAmount > 0 ? (<Row label={`Payment promo (${p.paymentDiscountPercent}% on special price)`} value={`−${formatMoney(p.paymentDiscountAmount)}`} accent/>) : null}
        {p.referralCreditApplied > 0 ? (<Row label="Referral credit" value={`−${formatMoney(p.referralCreditApplied)}`}/>) : null}
        {p.walletCreditApplied > 0 ? <Row label="Wallet credit" value={`−${formatMoney(p.walletCreditApplied)}`}/> : null}
        <div className="border-t border-line/60 pt-3">
          <Row label="Final paid amount" value={p.isFreeForMember ? '₹0 (FREE)' : formatMoney(invoice.payment.amount)} bold/>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-6 text-sm">
        <div>
          <p className="text-ink-soft">Payment method</p>
          <p className="font-semibold text-ink">{invoice.payment.method}</p>
        </div>
        <div>
          <p className="text-ink-soft">Payment status</p>
          <p className="font-semibold text-ink">{invoice.payment.status}</p>
        </div>
        <div className="text-right">
          <p className="text-ink-soft">Amount in words</p>
          <p className="font-semibold text-teal">
            {p.isFreeForMember ? 'No charge — member benefit' : `${formatMoney(invoice.payment.amount)} only`}
          </p>
        </div>
      </div>

      <p className="mt-8 text-center text-[11px] text-ink-soft">
        This is a computer-generated invoice from HealthID Card. For billing queries, contact support@healthidcard.com
      </p>
    </div>);
});
function Row({ label, value, bold, muted, save, accent, }) {
    return (<div className="flex justify-between gap-4">
      <span className="text-ink-soft">{label}</span>
      <span className={[
            bold && 'font-bold text-ink',
            muted && 'text-ink-soft line-through',
            save && 'text-emerald-600',
            accent && 'text-[#e03a28]',
            !bold && !muted && !save && !accent && 'text-ink',
        ]
            .filter(Boolean)
            .join(' ')}>
        {value}
      </span>
    </div>);
}
