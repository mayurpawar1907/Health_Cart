import { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Globe, Mail, Phone, RotateCcw, Shield } from 'lucide-react';
import { cn, formatDate } from '@/utils/utils';
const COMPANY = {
    name: 'HealthID Card Pvt. Ltd.',
    tagline: 'Care Beyond Borders',
    address: '401, Skyline Heights, Veera Desai Road, Andheri West, Mumbai — 400053',
    helpline: '1800-123-4567',
    email: 'care@healthidcard.com',
    website: 'www.healthidcard.com',
    cin: 'U85110MH2024PTC123456',
    supportHours: '24×7 customer support',
};
export function HealthIdCard({ data, className, flipped: controlledFlipped, onFlipChange, disableTapFlip = false, hideBuiltInFlipHint = false, compact = false, }) {
    const [internalFlipped, setInternalFlipped] = useState(false);
    const flipped = controlledFlipped ?? internalFlipped;
    function toggleFlip() {
        const next = !flipped;
        onFlipChange?.(next);
        if (controlledFlipped === undefined)
            setInternalFlipped(next);
    }
    return (<div className={cn('mx-auto w-full max-w-[440px]', className)}>
      <div className="perspective-[1200px]">
        <motion.div className={cn('relative w-full [transform-style:preserve-3d]', compact ? 'h-[240px]' : 'h-[292px]', !disableTapFlip && 'cursor-pointer')} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }} onClick={disableTapFlip ? undefined : toggleFlip}>
          <CardFront data={data}/>
          <CardBack />
        </motion.div>
      </div>
      {!hideBuiltInFlipHint && !disableTapFlip ? (<button type="button" onClick={toggleFlip} className="mt-5 flex w-full items-center justify-center gap-2 text-sm text-ink-soft transition hover:text-teal">
          <RotateCcw className="h-4 w-4"/>
          Tap card to view {flipped ? 'front' : 'back'}
        </button>) : null}
    </div>);
}
function CardFront({ data }) {
    const members = data.familyMembers.length ? data.familyMembers : [{ name: data.memberName, relation: 'Self', isPrimary: true }];
    return (<div className="absolute inset-0 overflow-hidden rounded-[24px] shadow-[0_24px_60px_rgba(43,90,121,0.35)] [backface-visibility:hidden]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a3d56] via-[#2B5A79] to-[#1f4460]"/>
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-red/20 blur-2xl"/>
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(227,62,43,0.18),transparent_45%)]"/>

      <div className="relative flex h-full flex-col px-6 py-5 text-left text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/brand/health-id-icon.png" alt="" className="h-10 w-10 shrink-0 rounded-lg bg-white/95 p-1 object-contain"/>
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80">HealthID Card</p>
              <p className="text-[10px] leading-none text-white/50">Family Health Membership</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 pt-0.5">
            <ContactlessIcon />
            <p className="text-right text-[9px] font-medium uppercase tracking-[0.14em] text-brand-red-light/90">{data.plan}</p>
          </div>
        </div>

        {/* Main body */}
        <div className="mt-5 flex flex-1 gap-5">
          <div className="flex min-w-0 flex-1 flex-col">
            <Chip />

            <div className="mt-4 space-y-1">
              <FieldLabel>Primary member</FieldLabel>
              <p className="font-display text-[22px] leading-snug tracking-tight">{data.memberName}</p>
            </div>

            <div className="mt-3">
              <FieldLabel>Date of birth</FieldLabel>
              <p className="text-[12px] font-medium leading-snug text-white/85">
                {data.dateOfBirth ? formatDate(data.dateOfBirth) : '—'}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-0">
              <div className="space-y-1">
                <FieldLabel>Valid from</FieldLabel>
                <p className="text-[12px] font-medium leading-snug">{formatDate(data.validFrom)}</p>
              </div>
              <div className="space-y-1">
                <FieldLabel>Valid thru</FieldLabel>
                <p className="text-[12px] font-medium leading-snug text-brand-red-light">{formatDate(data.validUntil)}</p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center justify-start gap-2 pt-1">
            <div className="rounded-xl bg-white p-2 shadow-lg">
              <QRCodeSVG value={data.qrPayload} size={76} level="M" bgColor="#ffffff" fgColor="#1a3d56"/>
            </div>
            <p className="text-center text-[8px] uppercase tracking-[0.12em] text-white/45">Scan to verify</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 border-t border-white/12 pt-4">
          <FieldLabel>Covered members</FieldLabel>
          <ul className="mt-2 space-y-1.5">
            {members.slice(0, 3).map((m) => (<li key={m.name} className="flex items-baseline justify-between gap-3 text-[11px] leading-snug">
                <span className="truncate font-medium text-white/90">{m.name}</span>
                <span className="shrink-0 text-right text-white/45">{m.relation}</span>
              </li>))}
            {members.length > 3 ? (<li className="text-[10px] text-white/45">+{members.length - 3} more member{members.length - 3 > 1 ? 's' : ''}</li>) : null}
          </ul>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] tracking-[0.14em] text-white/75">{data.membershipId}</p>
            <span className="shrink-0 rounded-full bg-brand-red px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-white">
              {data.flatDiscountPercent}% off
            </span>
          </div>
        </div>
      </div>
    </div>);
}
function CardBack() {
    return (<div className="absolute inset-0 overflow-hidden rounded-[24px] shadow-[0_24px_60px_rgba(43,90,121,0.35)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#152a3a] via-[#1f4460] to-[#2B5A79]"/>

      <div className="relative flex h-full flex-col text-left text-white">
        <div className="mx-0 h-12 shrink-0 bg-gradient-to-r from-[#0d1820] via-[#1a1a1a] to-[#0d1820]"/>

        <div className="flex flex-1 flex-col justify-between px-6 py-5">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 shrink-0 text-brand-red"/>
                <p className="font-display text-[17px] leading-tight">{COMPANY.name}</p>
              </div>
              <p className="pl-[26px] text-[10px] uppercase tracking-[0.22em] text-white/50">{COMPANY.tagline}</p>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4">
              <div className="space-y-1">
                <FieldLabel>Registered office</FieldLabel>
                <p className="text-[11px] leading-relaxed text-white/80">{COMPANY.address}</p>
              </div>

              <div className="space-y-2">
                <ContactRow icon={Phone} label="Helpline" value={`${COMPANY.helpline} · ${COMPANY.supportHours}`}/>
                <ContactRow icon={Mail} label="Email" value={COMPANY.email}/>
                <ContactRow icon={Globe} label="Website" value={COMPANY.website}/>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
            <div className="flex flex-wrap gap-2">
              {['30% discount', 'Home collection', 'WhatsApp updates', 'Digital reports'].map((b) => (<span key={b} className="rounded-md bg-white/10 px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.1em] text-white/70">
                  {b}
                </span>))}
            </div>

            <p className="text-[9px] leading-[1.55] text-white/40">
              CIN: {COMPANY.cin} · Authorized NABL partner network · Non-transferable card.
              Present at home collection or partner lab.
            </p>

            <div className="flex items-center justify-between gap-4 text-[8px] uppercase tracking-[0.1em] text-white/35">
              <span>ISO 27001 certified</span>
              <span>Issued in India</span>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
function FieldLabel({ children }) {
    return (<p className="text-[8px] font-medium uppercase tracking-[0.18em] text-white/45">{children}</p>);
}
function ContactRow({ icon: Icon, label, value }) {
    return (<div className="grid grid-cols-[14px_52px_1fr] items-start gap-x-2.5 text-[11px] leading-snug">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-red"/>
      <span className="text-white/45">{label}</span>
      <span className="text-white/80">{value}</span>
    </div>);
}
function Chip() {
    return (<div className="h-8 w-11 rounded-md bg-gradient-to-br from-[#d4af37] via-[#f5e6a3] to-[#b8962e] shadow-inner">
      <div className="grid h-full grid-cols-2 gap-px p-1">
        <div className="rounded-sm bg-[#c9a227]/40"/>
        <div className="rounded-sm bg-[#c9a227]/20"/>
        <div className="rounded-sm bg-[#c9a227]/20"/>
        <div className="rounded-sm bg-[#c9a227]/40"/>
      </div>
    </div>);
}
function ContactlessIcon() {
    return (<svg viewBox="0 0 24 24" className="h-5 w-5 text-white/60" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8.5 12.5c1.5-2 4-2 5.5 0" strokeLinecap="round"/>
      <path d="M6 10c2.8-3.5 7.2-3.5 10 0" strokeLinecap="round"/>
      <path d="M3.5 7.5c4.1-5 10.9-5 15 0" strokeLinecap="round"/>
    </svg>);
}
