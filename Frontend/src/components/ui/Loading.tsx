export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-teal/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-teal" />
        <div className="absolute inset-2 rounded-full bg-teal-light/50" />
      </div>
      <p className="text-sm font-medium text-ink-soft">{label}</p>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-gradient-to-r from-line/50 via-line/30 to-line/50 ${className ?? 'h-24'}`} />
}
