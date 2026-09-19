import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Clock, Layers } from 'lucide-react'
import api, { unwrap } from '@/services/api'
import type { LabTest } from '@/types'
import { findStaticPackage, packageIncludedTests } from '@/lib/packages'
import { formatMoney } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { UserPage } from '@/components/user/UserUi'
import { PaymentDiscountBadge, PaymentDiscountCardNote } from '@/components/brand/PaymentDiscountOffer'

export function TestDetailsPage() {
  const { id } = useParams()
  const q = useQuery({
    queryKey: ['test', id],
    queryFn: async () => unwrap<LabTest>((await api.get(`/tests/${id}`)).data),
    staleTime: 0,
    refetchOnMount: 'always',
  })
  if (q.isLoading || !q.data) return <Loading />
  const t = q.data
  const staticPkg = findStaticPackage(t)
  const memberPrice = staticPkg?.specialPrice ?? t.memberPrice ?? t.discountedPrice ?? t.price
  const displayMrp = staticPkg?.mrp ?? t.price
  const includedNames = t.isPackage ? packageIncludedTests(t) : []
  const included =
    t.packageTests?.map((pt) => pt.includedTest) ??
    (t.isPackage ? includedNames.map((name, i) => ({ id: `${t.id}-${i}`, name, slug: '' })) : [])

  return (
    <UserPage>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge>{t.category.name}</Badge>
            {t.isPackage ? <Badge tone="teal">{`Health package · ${included.length} tests`}</Badge> : null}
            {t.isPopular ? <Badge tone="sand">Popular</Badge> : null}
            {t.membershipFree ? <Badge tone="success">Free for members</Badge> : null}
            <PaymentDiscountBadge size="sm" />
          </div>
          <h1 className="font-display text-4xl">{t.name}</h1>
          <p className="text-ink-soft">{t.description}</p>

          {t.isPackage && included.length > 0 ? (
            <Card className="p-5">
              <h2 className="flex items-center gap-2 font-display text-xl">
                <Layers className="h-5 w-5 text-teal" />
                Tests included in this package
              </h2>
              <ul className="mt-4 space-y-2">
                {included.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 rounded-xl bg-teal-light/40 px-4 py-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card className="p-5">
            <h2 className="font-display text-xl">Preparation</h2>
            <p className="mt-2 text-ink-soft">{t.preparation}</p>
          </Card>

          {!t.isPackage ? (
            <Card className="p-5">
              <h2 className="font-display text-xl">Parameters included</h2>
              <ul className="mt-3 grid gap-2 md:grid-cols-2">
                {t.parameters.map((p) => (
                  <li key={p.id} className="rounded-2xl bg-cream px-3 py-2 text-sm">
                    {p.name}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {t.faqs?.length ? (
            <Card className="space-y-3 p-5">
              <h2 className="font-display text-xl">FAQs</h2>
              {t.faqs.map((f) => (
                <div key={f.q}>
                  <p className="font-medium">{f.q}</p>
                  <p className="text-sm text-ink-soft">{f.a}</p>
                </div>
              ))}
            </Card>
          ) : null}
        </div>

        <Card className="h-fit p-6">
          <p className="text-sm text-ink-soft">Sample · {t.sampleType}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
            <Clock className="h-4 w-4" /> Report in ~{t.reportHours} hours
          </p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-3xl font-semibold text-teal">{formatMoney(Number(memberPrice))}</span>
            {Number(memberPrice) < Number(displayMrp) ? (
              <span className="text-ink-soft line-through">{formatMoney(Number(displayMrp))}</span>
            ) : null}
          </div>
          {t.membershipFree ? (
            <p className="mt-2 text-sm text-ink-soft">Included free with your HealthID Card</p>
          ) : (
            <PaymentDiscountCardNote specialPrice={Number(memberPrice)} />
          )}
          <Link to={`/appointments/book?testId=${t.id}`}>
            <Button className="mt-6 w-full rounded-xl" size="lg">
              {t.isPackage ? 'Book this package' : 'Book this test'}
            </Button>
          </Link>
        </Card>
      </div>
    </UserPage>
  )
}
