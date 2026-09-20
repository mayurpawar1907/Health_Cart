import { cn } from '@/utils/utils';
import { formatCardNumber } from '@/utils/card-payment-utils';

function detectNetwork(digits) {
    if (digits.startsWith('4'))
        return 'visa';
    if (/^5[1-5]/.test(digits))
        return 'mastercard';
    if (/^6/.test(digits))
        return 'rupay';
    return 'generic';
}

const NETWORK_LABEL = {
    visa: 'VISA',
    mastercard: 'Mastercard',
    rupay: 'RuPay',
    generic: 'DEBIT',
};

function ChipIcon() {
    return (<div className="relative h-9 w-11 rounded-md bg-gradient-to-br from-[#d4af37] via-[#f5e6a8] to-[#c9a227] shadow-inner ring-1 ring-[#b8941f]/50">
      <div className="absolute inset-[3px] grid grid-cols-2 gap-px rounded-[4px] opacity-40">
        <div className="rounded-sm bg-[#8b6914]/30"/>
        <div className="rounded-sm bg-[#8b6914]/30"/>
        <div className="rounded-sm bg-[#8b6914]/30"/>
        <div className="rounded-sm bg-[#8b6914]/30"/>
      </div>
    </div>);
}

function ContactlessIcon() {
    return (<svg className="h-5 w-5 text-white/75" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8.5 12.5c1.5-1.5 3.9-1.5 5.4 0M6 10c2.7-2.7 7.1-2.7 9.8 0M10.5 15c.8-.8 2.1-.8 2.9 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>);
}

export function DummyDebitCard({ cardNumber, cardName, expiry, cvv, showBack = false, className }) {
    const digits = cardNumber.replace(/\D/g, '');
    const network = detectNetwork(digits);
    const displayNumber = formatCardNumber(cardNumber) || '•••• •••• •••• ••••';
    const displayName = (cardName || 'YOUR NAME').toUpperCase().slice(0, 22);
    const displayExpiry = expiry || 'MM/YY';
    const displayCvv = cvv ? '•'.repeat(cvv.length) : '•••';

    return (<div className={cn('payment-card-scene mx-auto w-full max-w-[340px] perspective-[1000px]', className)}>
      <div className={cn('payment-card-inner relative aspect-[1.586/1] w-full transition-transform duration-500 [transform-style:preserve-3d]', showBack && '[transform:rotateY(180deg)]')}>
        {/* Front */}
        <div className="payment-card-face absolute inset-0 overflow-hidden rounded-[18px] bg-gradient-to-br from-[#1a3a52] via-[#1a4d6d] to-[#0f3349] p-5 text-white shadow-[0_12px_40px_rgba(15,51,73,0.35)] [backface-visibility:hidden]">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5"/>
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-36 w-36 rounded-full bg-teal/10"/>
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '8px 8px',
        }}/>

          <div className="relative flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/90">Your Bank</p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-widest text-white/50">Platinum Debit</p>
            </div>
            <ContactlessIcon />
          </div>

          <div className="relative mt-4 flex items-center gap-3">
            <ChipIcon />
            <span className="rounded bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/80">
              Debit
            </span>
          </div>

          <p className="relative mt-5 font-mono text-[17px] tracking-[0.14em] sm:text-lg">
            {displayNumber}
          </p>

          <div className="relative mt-4 flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[8px] uppercase tracking-widest text-white/45">Cardholder name</p>
              <p className="truncate text-sm font-semibold tracking-wide">{displayName}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[8px] uppercase tracking-widest text-white/45">Valid thru</p>
              <p className="font-mono text-sm font-semibold">{displayExpiry}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className={cn('text-sm font-bold italic leading-none', network === 'visa' && 'tracking-wider', network === 'mastercard' && 'text-[13px]')}>
                {NETWORK_LABEL[network]}
              </p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="payment-card-face absolute inset-0 overflow-hidden rounded-[18px] bg-gradient-to-br from-[#152a3a] via-[#1a4d6d] to-[#0f3349] shadow-[0_12px_40px_rgba(15,51,73,0.35)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="mt-5 h-10 w-full bg-[#0c1929]"/>
          <div className="px-5 pt-4">
            <div className="flex items-center justify-end">
              <div className="w-[78%] rounded-md bg-white/95 px-3 py-2 text-right">
                <p className="text-[8px] font-bold uppercase tracking-widest text-ink-soft">CVV</p>
                <p className="font-mono text-base font-bold tracking-[0.35em] text-ink">{displayCvv}</p>
              </div>
            </div>
            <p className="mt-4 text-[9px] leading-relaxed text-white/45">
              This is a demo card for checkout preview. Use any 16-digit number — no real bank account is charged.
            </p>
            <div className="mt-3 flex justify-end">
              <span className="text-xs font-bold italic text-white/70">{NETWORK_LABEL[network]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
