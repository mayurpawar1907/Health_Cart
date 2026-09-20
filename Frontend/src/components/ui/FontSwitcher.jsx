import { useEffect, useState } from 'react'
import {
  applyFontPreference,
  FONT_OPTIONS,
  readFontPreference,
  saveFontPreference,
} from '@/utils/font-preference'
import { cn } from '@/utils/utils'

export function FontSwitcher({ className, compact = false }) {
  const [active, setActive] = useState(readFontPreference)

  useEffect(() => {
    applyFontPreference(active)
  }, [active])

  function selectFont(fontId) {
    setActive(fontId)
    saveFontPreference(fontId)
    applyFontPreference(fontId)
  }

  return (
    <div className={cn('inline-flex flex-col gap-1.5', className)}>
      {!compact ? (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Font</span>
      ) : null}
      <div
        className="inline-flex rounded-lg border border-line/80 bg-white p-0.5 shadow-sm"
        role="group"
        aria-label="Choose font family"
      >
        {FONT_OPTIONS.map((font) => (
          <button
            key={font.id}
            type="button"
            onClick={() => selectFont(font.id)}
            aria-pressed={active === font.id}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-semibold transition',
              active === font.id
                ? 'bg-teal text-white shadow-sm'
                : 'text-ink-soft hover:bg-cream/80 hover:text-ink',
            )}
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {font.label}
          </button>
        ))}
      </div>
    </div>
  )
}
