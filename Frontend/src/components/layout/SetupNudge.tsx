import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

type SetupNudgeProps = {
  hasMembership: boolean
  hasAddress: boolean
}

export function SetupNudge({ hasMembership, hasAddress }: SetupNudgeProps) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed || (hasMembership && hasAddress)) return null

  const steps = [
    !hasMembership && {
      title: 'Get your free HealthID Card',
      body: 'Unlock special rates on 63+ tests',
      cta: 'Activate',
      to: '/home#healthid-card-section',
    },
    !hasAddress && {
      title: 'Add home collection address',
      body: 'Required for phlebotomist visit',
      cta: 'Add address',
      to: '/profile',
    },
  ].filter(Boolean) as { title: string; body: string; cta: string; to: string }[]

  const progress = ((hasMembership ? 1 : 0) + (hasAddress ? 1 : 0)) / 2 * 100

  return (
    <div className="glass-panel relative rounded-3xl p-5 md:p-6">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-4 rounded-xl p-1.5 text-ink-soft transition hover:bg-white/80"
      >
        <X className="h-4 w-4" />
      </button>

      <p className="text-xs font-bold uppercase tracking-wider text-teal">Complete setup</p>
      <p className="mt-1 font-display text-lg">Finish your profile for smooth booking</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line/80">
        <div className="h-full rounded-full bg-teal transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {steps.map((s) => (
          <div key={s.title} className="rounded-2xl border border-line/60 bg-white/60 p-4">
            <p className="font-semibold text-ink">{s.title}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{s.body}</p>
            <Link to={s.to} className="mt-3 inline-block">
              <Button size="sm" className="rounded-xl">{s.cta}</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
