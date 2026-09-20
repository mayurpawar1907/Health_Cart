/** Flat illustrative step icons — HealthID color schema */

const C = {
  teal: '#1a4d6d',
  tealDark: '#0f3349',
  tealLight: '#e6f2f8',
  red: '#e03a28',
  inkSoft: '#5a6b7d',
  white: '#ffffff',
  success: '#059669',
}

export function JourneyIconBook() {
  return (
    <svg viewBox="0 0 72 72" className="h-[4.25rem] w-[4.25rem]" aria-hidden>
      <rect x="14" y="16" width="36" height="38" rx="4" fill={C.tealLight} stroke={C.teal} strokeWidth="1.5" />
      <rect x="20" y="10" width="36" height="38" rx="4" fill={C.white} stroke={C.teal} strokeWidth="1.5" />
      <line x1="26" y1="22" x2="50" y2="22" stroke={C.inkSoft} strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="30" x2="44" y2="30" stroke={C.inkSoft} strokeWidth="2" strokeLinecap="round" />
      <circle cx="52" cy="48" r="14" fill={C.teal} />
      <circle cx="52" cy="48" r="10" fill={C.white} />
      <line x1="52" y1="48" x2="52" y2="42" stroke={C.teal} strokeWidth="2" strokeLinecap="round" />
      <line x1="52" y1="48" x2="57" y2="50" stroke={C.red} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function JourneyIconHome() {
  return (
    <svg viewBox="0 0 72 72" className="h-[4.25rem] w-[4.25rem]" aria-hidden>
      <path d="M36 14 L58 32 V54 H14 V32 Z" fill={C.white} stroke={C.teal} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M36 14 L58 32 H14 Z" fill={C.red} opacity="0.9" />
      <rect x="28" y="38" width="16" height="16" rx="1" fill={C.tealLight} stroke={C.teal} strokeWidth="1.5" />
      <rect x="22" y="48" width="8" height="6" rx="1" fill={C.inkSoft} opacity="0.35" />
    </svg>
  )
}

export function JourneyIconTruck() {
  return (
    <svg viewBox="0 0 72 72" className="h-[4.25rem] w-[4.25rem]" aria-hidden>
      <rect x="10" y="28" width="34" height="22" rx="3" fill={C.teal} />
      <path d="M44 32 H54 L62 42 V50 H44 Z" fill={C.tealLight} stroke={C.teal} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="22" cy="52" r="6" fill={C.white} stroke={C.teal} strokeWidth="2" />
      <circle cx="52" cy="52" r="6" fill={C.white} stroke={C.teal} strokeWidth="2" />
      <circle cx="54" cy="18" r="10" fill={C.tealDark} />
      <path d="M49 18 L53 22 L60 15" stroke={C.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function JourneyIconReport() {
  return (
    <svg viewBox="0 0 72 72" className="h-[4.25rem] w-[4.25rem]" aria-hidden>
      <rect x="18" y="12" width="36" height="48" rx="3" fill={C.white} stroke={C.teal} strokeWidth="1.5" />
      <line x1="26" y1="24" x2="46" y2="24" stroke={C.inkSoft} strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="32" x2="42" y2="32" stroke={C.inkSoft} strokeWidth="2" strokeLinecap="round" />
      <polyline points="26,48 34,40 40,46 50,34" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="34" r="2" fill={C.red} />
      <rect x="44" y="8" width="14" height="10" rx="2" fill={C.tealLight} stroke={C.teal} strokeWidth="1" />
    </svg>
  )
}
