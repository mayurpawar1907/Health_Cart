import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { DummyDebitCard } from '@/components/payments/DummyDebitCard';
import { formatCardExpiry, formatCardNumber, isCardFormValid, validateCardForm, digitsOnly } from '@/utils/card-payment-utils';
import { formatMoney } from '@/utils/utils';
import { cn } from '@/utils/utils';

export { formatCardNumber, formatCardExpiry, validateCardForm, isCardFormValid } from '@/utils/card-payment-utils';

export function CardPaymentForm({ amount, onValidChange, className }) {
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [touched, setTouched] = useState(false);
    const [cvvFocused, setCvvFocused] = useState(false);

    const form = useMemo(() => ({ cardNumber, cardName, expiry, cvv }), [cardNumber, cardName, expiry, cvv]);
    const errors = useMemo(() => (touched ? validateCardForm(form) : {}), [form, touched]);
    const valid = isCardFormValid(form);

    useEffect(() => {
        onValidChange?.(valid);
    }, [valid, onValidChange]);

    return (<div className={cn('rounded-2xl border border-line/80 bg-white/80 p-4 md:p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Debit / credit card</p>
          <p className="mt-0.5 text-sm text-ink-soft">Secure card payment · {formatMoney(amount)}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-teal-light/60 px-2 py-1 text-[10px] font-bold text-teal">
          <Lock className="h-3.5 w-3.5"/>
          SSL
        </div>
      </div>

      <div className="mt-5">
        <DummyDebitCard cardNumber={cardNumber} cardName={cardName} expiry={expiry} cvv={cvv} showBack={cvvFocused || !!cvv}/>
      </div>
      <p className="mt-2 text-center text-[10px] text-ink-soft">Works with any bank · Visa, Mastercard & RuPay</p>

      <div className="mt-5 space-y-3">
        <Input label="Card number" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={formatCardNumber(cardNumber)} onChange={(e) => setCardNumber(e.target.value)} onBlur={() => setTouched(true)} error={errors.cardNumber}/>

        <Input label="Name on card" autoComplete="cc-name" placeholder="As printed on your debit card" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} onBlur={() => setTouched(true)} error={errors.cardName}/>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Valid thru (MM/YY)" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(formatCardExpiry(e.target.value))} onBlur={() => setTouched(true)} error={errors.expiry}/>
          <Input label="CVV / CVC" inputMode="numeric" autoComplete="cc-csc" placeholder="3 digits on back" type="password" maxLength={4} value={cvv} onChange={(e) => setCvv(digitsOnly(e.target.value, 4))} onFocus={() => setCvvFocused(true)} onBlur={() => { setCvvFocused(false); setTouched(true); }} error={errors.cvv}/>
        </div>
      </div>

      {valid ? (<p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-success">
          <CheckCircle2 className="h-4 w-4"/>
          Card details verified — you can confirm payment
        </p>) : touched ? (<p className="mt-4 text-xs text-ink-soft">Enter your debit card details to continue.</p>) : null}

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-cream/80 px-3 py-2 text-[11px] text-ink-soft">
        <ShieldCheck className="h-4 w-4 shrink-0 text-teal"/>
        Demo checkout — use any bank card number. No real charge.
      </div>
    </div>);
}
