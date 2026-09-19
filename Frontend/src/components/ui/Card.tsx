import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function Card({ children, className, glass }: { children: ReactNode; className?: string; glass?: boolean }) {
  return (
    <div className={cn(glass ? 'glass-panel rounded-3xl' : 'card-premium rounded-3xl', className)}>
      {children}
    </div>
  )
}
