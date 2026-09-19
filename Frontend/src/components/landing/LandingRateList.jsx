import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Search } from 'lucide-react'
import api, { unwrap } from '@/api/client'
import { formatMoney } from '@/utils/utils'
import { Button } from '@/components/ui/Button'
import { PaymentDiscountBadge, usePaymentDiscountCopy } from '@/components/brand/PaymentDiscountOffer'
import { Loading } from '@/components/ui/Loading'

function savingsPercent(mrp, special) {
  if (!mrp || mrp <= 0) return 0
  return Math.round(((mrp - special) / mrp) * 100)
}

function specialPrice(test) {
  return Number(test.discountedPrice ?? test.memberPrice ?? test.price)
}

export function LandingRateList() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const discount = usePaymentDiscountCopy()

  const categoriesQ = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => unwrap((await api.get('/tests/categories')).data),
  })
  const testsQ = useQuery({
    queryKey: ['public-tests'],
    queryFn: async () => unwrap((await api.get('/tests', { params: { packages: 'false' } })).data),
  })

  const categories = useMemo(() => {
    const names = (categoriesQ.data ?? []).map((c) => c.name)
    return ['All', ...names]
  }, [categoriesQ.data])

  const tests = useMemo(() => {
    return (testsQ.data ?? []).filter((t) => !t.isPackage)
  }, [testsQ.data])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tests.filter((t) => {
      const catName = t.category?.name ?? ''
      if (category !== 'All' && catName !== category) return false
      if (!q) return true
      return t.name.toLowerCase().includes(q) || catName.toLowerCase().includes(q)
    })
  }, [tests, query, category])

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">Transparent pricing</p>
        <h2 className="mt-3 font-display text-3xl md:text-4xl">Blood test rate list</h2>
        <p className="mx-auto mt-3 max-w-2xl text-ink-soft">
          Official partner rates
          {discount.isPromoActive ? (
            <>
              {' '}
              with an extra <strong className="text-ink">{discount.pct}% off applied at payment</strong>
            </>
          ) : null}
          . MRP shown for reference — special price includes free home collection.
        </p>
        <div className="mt-4 flex justify-center">
          <PaymentDiscountBadge size="lg" />
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tests…"
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-teal/30 focus:ring-2"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                category === c
                  ? 'bg-teal text-white'
                  : 'border border-line bg-white text-ink-soft hover:border-teal/40 hover:text-teal'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        {testsQ.isLoading || categoriesQ.isLoading ? (
          <div className="p-10">
            <Loading label="Loading rate list…" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-gradient-to-r from-teal to-teal-dark text-white">
                    <th className="px-4 py-3.5 font-medium w-12">#</th>
                    <th className="px-4 py-3.5 font-medium">Test name</th>
                    <th className="px-4 py-3.5 font-medium hidden md:table-cell">Category</th>
                    <th className="px-4 py-3.5 font-medium text-right bg-white/10">MRP</th>
                    <th className="px-4 py-3.5 font-medium text-right bg-brand-red/90">Special price</th>
                    <th className="px-4 py-3.5 font-medium text-right hidden sm:table-cell">You save</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-ink-soft">
                        No tests match your search. Try another keyword or category.
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
                          className={`border-b border-line/70 transition hover:bg-teal-light/30 ${
                            i % 2 === 0 ? 'bg-white' : 'bg-cream/40'
                          }`}
                        >
                          <td className="px-4 py-3 text-ink-soft">{i + 1}</td>
                          <td className="px-4 py-3 font-medium leading-snug">{t.name}</td>
                          <td className="px-4 py-3 text-ink-soft hidden md:table-cell">{t.category?.name}</td>
                          <td className="px-4 py-3 text-right text-ink-soft line-through">{formatMoney(mrp)}</td>
                          <td className="px-4 py-3 text-right font-bold text-brand-red">{formatMoney(special)}</td>
                          <td className="px-4 py-3 text-right hidden sm:table-cell">
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
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-cream/60 px-4 py-4">
              <p className="text-xs text-ink-soft">
                Showing {filtered.length} of {tests.length} tests · Prices inclusive of home collection for members
              </p>
              <Link to="/signup">
                <Button variant="accent" size="sm" className="rounded-lg">
                  Get free card to book
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export function LandingHealthPackages() {
  const [expanded, setExpanded] = useState(null)
  const discount = usePaymentDiscountCopy()
  const packagesQ = useQuery({
    queryKey: ['public-packages'],
    queryFn: async () => unwrap((await api.get('/tests', { params: { packages: 'true' } })).data),
  })
  const packages = (packagesQ.data ?? []).filter((t) => t.isPackage)

  return (
    <section id="packages" className="border-y border-line bg-gradient-to-b from-teal-light/30 to-white py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">Official brochure rates</p>
            <h2 className="mt-3 font-display text-3xl">Diagnostic health packages</h2>
            <p className="mt-2 max-w-xl text-sm text-ink-soft">
              {packages.length || '…'} packages from your lab catalog
              {discount.isPromoActive ? ` — special rates plus extra ${discount.pct}% off at payment` : ''}. Free home
              collection on every booking.
            </p>
          </div>
          <Link to="/signup" className="text-sm font-semibold text-teal hover:underline">
            Get free card to book →
          </Link>
        </div>
        {packagesQ.isLoading ? (
          <div className="mt-8">
            <Loading label="Loading packages…" />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => {
              const included = (pkg.parameters ?? []).map((p) => p.name).filter(Boolean)
              const open = expanded === pkg.id
              const preview = included.slice(0, 4)
              const rest = included.length - preview.length
              const mrp = Number(pkg.price)
              const special = specialPrice(pkg)
              return (
                <div
                  key={pkg.id}
                  className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="h-1.5 bg-gradient-to-r from-teal to-[#e03a28]" />
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-teal">
                      {included.length || 'Multi'} parameters · Home collection
                    </p>
                    <h3 className="mt-2 font-display text-lg leading-snug">{pkg.name}</h3>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-brand-red">{formatMoney(special)}</span>
                      <span className="text-sm text-ink-soft line-through">{formatMoney(mrp)}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <p className="text-xs font-medium text-success">Save {savingsPercent(mrp, special)}% vs MRP</p>
                      <PaymentDiscountBadge size="sm" />
                    </div>

                    {included.length > 0 ? (
                      <div className="mt-4 rounded-xl border border-line/80 bg-cream/40 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Included tests</p>
                        <ul className="mt-2 space-y-1 text-xs leading-relaxed text-ink-soft">
                          {(open ? included : preview).map((t) => (
                            <li key={t} className="flex gap-1.5">
                              <span className="text-teal">•</span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                        {rest > 0 ? (
                          <button
                            type="button"
                            onClick={() => setExpanded(open ? null : pkg.id)}
                            className="mt-2 flex items-center gap-1 text-xs font-semibold text-teal hover:underline"
                          >
                            {open ? 'Show less' : `+ ${rest} more tests`}
                            <ChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
                          </button>
                        ) : null}
                      </div>
                    ) : null}

                    <Link to="/signup" className="mt-4 block">
                      <Button className="w-full rounded-lg text-xs">Book with free card</Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export function LandingPopularTests() {
  const popularQ = useQuery({
    queryKey: ['public-popular-tests'],
    queryFn: async () => unwrap((await api.get('/tests', { params: { popular: 'true' } })).data),
  })
  const featured = (popularQ.data ?? []).filter((t) => !t.isPackage).slice(0, 4)

  return (
    <section id="popular" className="border-y border-line bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">Most booked</p>
            <h2 className="mt-3 font-display text-3xl">Popular tests at special rates</h2>
          </div>
          <a href="#pricing" className="text-sm font-semibold text-teal hover:underline">
            View full rate list →
          </a>
        </div>
        {popularQ.isLoading ? (
          <div className="mt-8">
            <Loading label="Loading popular tests…" />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((t) => {
              const mrp = Number(t.price)
              const special = specialPrice(t)
              return (
                <div
                  key={t.id}
                  className="rounded-2xl border border-line p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-teal">{t.category?.name}</p>
                  <h3 className="mt-2 font-display text-lg leading-snug">{t.name}</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-brand-red">{formatMoney(special)}</span>
                    <span className="text-sm text-ink-soft line-through">{formatMoney(mrp)}</span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-success">Save {savingsPercent(mrp, special)}% vs MRP</p>
                  <Link to="/signup" className="mt-4 block">
                    <Button className="w-full rounded-lg text-xs">Book with free card</Button>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
