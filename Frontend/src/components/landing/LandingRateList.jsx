import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import api, { unwrap } from '@/api/client'
import { formatMoney } from '@/utils/utils'
import { Button } from '@/components/ui/Button'
import { PaymentDiscountBadge, usePaymentDiscountCopy } from '@/components/brand/PaymentDiscountOffer'
import { Loading } from '@/components/ui/Loading'
import { LANDING_CONTAINER } from '@/components/landing/landing-utils'
import { cn } from '@/utils/utils'

function savingsPercent(mrp, special) {
  if (!mrp || mrp <= 0) return 0
  return Math.round(((mrp - special) / mrp) * 100)
}

function specialPrice(test) {
  return Number(test.discountedPrice ?? test.memberPrice ?? test.price)
}

export function LandingRateList({
  externalQuery = '',
  externalCategory = 'All',
  onCategoryChange,
  onQueryChange,
}) {
  const [query, setQuery] = useState(externalQuery)
  const [category, setCategory] = useState(externalCategory)
  const [catalogTab, setCatalogTab] = useState('tests')
  const discount = usePaymentDiscountCopy()

  useEffect(() => {
    setQuery(externalQuery)
  }, [externalQuery])

  useEffect(() => {
    setCategory(externalCategory)
  }, [externalCategory])

  function updateQuery(value) {
    setQuery(value)
    onQueryChange?.(value)
  }

  function updateCategory(value) {
    setCategory(value)
    onCategoryChange?.(value)
  }

  const categoriesQ = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => unwrap((await api.get('/tests/categories')).data),
  })
  const testsQ = useQuery({
    queryKey: ['public-tests'],
    queryFn: async () => unwrap((await api.get('/tests', { params: { packages: 'false' } })).data),
  })
  const packagesQ = useQuery({
    queryKey: ['public-packages'],
    queryFn: async () => unwrap((await api.get('/tests', { params: { packages: 'true' } })).data),
  })

  const categories = useMemo(() => {
    const names = (categoriesQ.data ?? []).map((c) => c.name)
    return ['All', ...names]
  }, [categoriesQ.data])

  const tests = useMemo(() => (testsQ.data ?? []).filter((t) => !t.isPackage), [testsQ.data])
  const packages = useMemo(() => (packagesQ.data ?? []).filter((t) => t.isPackage), [packagesQ.data])

  const source = catalogTab === 'tests' ? tests : packages

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return source.filter((t) => {
      const catName = t.category?.name ?? ''
      if (category !== 'All' && catName !== category) return false
      if (!q) return true
      return t.name.toLowerCase().includes(q) || catName.toLowerCase().includes(q)
    })
  }, [source, query, category, catalogTab])

  const loading =
    catalogTab === 'tests'
      ? testsQ.isLoading || categoriesQ.isLoading
      : packagesQ.isLoading || categoriesQ.isLoading

  return (
    <section id="catalog" className="border-t border-line/60 bg-cream/30 py-14 md:py-16">
      <div className={LANDING_CONTAINER}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal">Full catalog</p>
          <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">Search tests & packages</h2>
          <p className="mt-3 text-ink-soft">
            Official partner rates
            {discount.isPromoActive ? (
              <>
                {' '}
                with an extra <strong className="text-ink">{discount.pct}% off at payment</strong>
              </>
            ) : null}
            . MRP is for reference — special price includes free home collection for members.
          </p>
          <PaymentDiscountBadge size="lg" tone="teal" className="mx-auto mt-4" />
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 lg:flex-row lg:justify-center">
          <div className="inline-flex rounded-xl border border-line/80 bg-white p-1">
            {[
              { id: 'tests', label: `Tests (${tests.length})` },
              { id: 'packages', label: `Packages (${packages.length})` },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setCatalogTab(t.id)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-semibold transition',
                  catalogTab === t.id ? 'bg-teal text-white shadow-sm' : 'text-ink-soft hover:text-ink',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder={catalogTab === 'tests' ? 'Search tests…' : 'Search packages…'}
              className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-teal/30 focus:ring-2"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => updateCategory(c)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition',
                category === c
                  ? 'bg-teal text-white'
                  : 'border border-line bg-white text-ink-soft hover:border-teal/40 hover:text-teal',
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {loading ? (
            <div className="p-10">
              <Loading label="Loading catalog…" />
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-gradient-to-r from-teal to-teal-dark text-white">
                      <th className="w-12 px-4 py-3.5 font-medium">#</th>
                      <th className="px-4 py-3.5 font-medium">{catalogTab === 'tests' ? 'Test name' : 'Package name'}</th>
                      <th className="hidden px-4 py-3.5 font-medium lg:table-cell">Category</th>
                      <th className="px-4 py-3.5 text-right font-medium">MRP</th>
                      <th className="bg-teal-dark/90 px-4 py-3.5 text-right font-medium">Special</th>
                      <th className="hidden px-4 py-3.5 text-right font-medium sm:table-cell">Save</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-ink-soft">
                          No matches — try another keyword or category.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((t, i) => {
                        const mrp = Number(t.price)
                        const special = specialPrice(t)
                        const save = savingsPercent(mrp, special)
                        return (
                          <tr
                            key={t.id}
                            className={cn(
                              'border-b border-line/70 transition hover:bg-teal-light/30',
                              i % 2 === 0 ? 'bg-white' : 'bg-cream/40',
                            )}
                          >
                            <td className="px-4 py-3 text-ink-soft">{i + 1}</td>
                            <td className="px-4 py-3 font-medium leading-snug">{t.name}</td>
                            <td className="hidden px-4 py-3 text-ink-soft lg:table-cell">{t.category?.name}</td>
                            <td className="px-4 py-3 text-right text-ink-soft line-through">{formatMoney(mrp)}</td>
                            <td className="px-4 py-3 text-right font-bold text-teal">{formatMoney(special)}</td>
                            <td className="hidden px-4 py-3 text-right sm:table-cell">
                              <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                                {save}%
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="divide-y divide-line/70 md:hidden">
                {filtered.length === 0 ? (
                  <li className="px-4 py-10 text-center text-sm text-ink-soft">No matches found.</li>
                ) : (
                  filtered.map((t) => {
                    const mrp = Number(t.price)
                    const special = specialPrice(t)
                    const save = savingsPercent(mrp, special)
                    return (
                      <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{t.name}</p>
                          <p className="text-[11px] text-ink-soft">{t.category?.name}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-teal">{formatMoney(special)}</p>
                          <p className="text-[10px] text-ink-soft line-through">{formatMoney(mrp)}</p>
                          {save > 0 ? <p className="text-[10px] font-semibold text-success">Save {save}%</p> : null}
                        </div>
                      </li>
                    )
                  })
                )}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-cream/60 px-4 py-4">
                <p className="text-xs text-ink-soft">
                  Showing {filtered.length} of {source.length} {catalogTab}
                </p>
                <Link to="/signup">
                  <Button variant="primary" size="sm" className="rounded-lg">
                    Get free card to book
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
