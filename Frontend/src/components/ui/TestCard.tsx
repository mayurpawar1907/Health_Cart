import { Link } from 'react-router-dom'
import { Clock, Layers } from 'lucide-react'
import { Badge } from './Badge'
import { Button } from './Button'
import { formatMoney } from '@/lib/utils'
import type { LabTest } from '@/types'
import { PaymentDiscountCardNote } from '@/components/brand/PaymentDiscountOffer'

export function TestCard({ test }: { test: LabTest }) {
  const memberPrice = test.memberPrice ?? test.discountedPrice ?? test.price
  const mrp = Number(test.price)
  const showStrike = Number(memberPrice) < mrp
  const testCount = test.packageTests?.length ?? test.parameters.length

  return (
    <article className="glass-panel flex h-full flex-col overflow-hidden rounded-3xl">
      <div className="border-b border-line/50 px-5 py-4">
        <div className="flex items-start justify-between gap-2">
          <Badge>{test.category?.name ?? 'Lab test'}</Badge>
          <div className="flex flex-wrap justify-end gap-1">
            {test.isPackage ? <Badge tone="teal">Package</Badge> : null}
            {test.isPopular ? <Badge tone="sand">Popular</Badge> : null}
          </div>
        </div>
        <h3 className="mt-3 font-display text-lg leading-snug">{test.name}</h3>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">{test.shortDescription}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
          {test.isPackage ? (
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-teal" /> {testCount} tests
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> ~{test.reportHours}h report
          </span>
        </div>

        <div className="mt-4 flex items-end gap-2">
          <span className="text-2xl font-bold tracking-tight text-teal">{formatMoney(Number(memberPrice))}</span>
          {showStrike ? (
            <span className="pb-0.5 text-sm text-ink-soft line-through">{formatMoney(mrp)}</span>
          ) : null}
        </div>
        <PaymentDiscountCardNote specialPrice={Number(memberPrice)} />

        <div className="mt-5 flex gap-2">
          <Link to={`/tests/${test.slug}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full rounded-xl">Details</Button>
          </Link>
          <Link to={`/appointments/book?testId=${test.id}`} className="flex-1">
            <Button size="sm" className="w-full rounded-xl">{test.isPackage ? 'Book package' : 'Book'}</Button>
          </Link>
        </div>
      </div>
    </article>
  )
}
