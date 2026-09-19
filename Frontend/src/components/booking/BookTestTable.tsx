import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type { LabTest } from '@/types'
import { formatMoney, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const PAGE_SIZE = 10

type SortField = 'name' | 'category' | 'mrp' | 'price'
type SortDir = 'asc' | 'desc'

type BookTestTableProps = {
  tests: LabTest[]
  onSelect: (testId: string) => void
}

function testPrice(t: LabTest) {
  return Number(t.memberPrice ?? t.discountedPrice ?? t.price)
}

function SortHeader({
  label,
  field,
  sortField,
  sortDir,
  onSort,
  align = 'left',
}: {
  label: string
  field: SortField
  sortField: SortField
  sortDir: SortDir
  onSort: (field: SortField) => void
  align?: 'left' | 'right'
}) {
  const active = sortField === field
  const Icon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        'inline-flex items-center gap-1 transition hover:text-teal',
        align === 'right' && 'ml-auto',
        active ? 'text-teal' : 'text-ink-soft',
      )}
    >
      {label}
      <Icon className={cn('h-3.5 w-3.5 shrink-0', !active && 'opacity-45')} />
    </button>
  )
}

export function BookTestTable({ tests, onSelect }: BookTestTableProps) {
  const [query, setQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = tests.filter((t) => {
      if (!q) return true
      return (
        t.name.toLowerCase().includes(q) ||
        t.category?.name?.toLowerCase().includes(q) ||
        t.shortDescription?.toLowerCase().includes(q)
      )
    })

    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortField === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortField === 'category') cmp = (a.category?.name ?? '').localeCompare(b.category?.name ?? '')
      else if (sortField === 'mrp') cmp = Number(a.price) - Number(b.price)
      else cmp = testPrice(a) - testPrice(b)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [tests, query, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function onSearch(v: string) {
    setQuery(v)
    setPage(1)
  }

  return (
    <Card glass className="w-full overflow-hidden p-0">
      <div className="border-b border-line/60 p-5 md:p-6">
        <p className="text-sm font-medium text-ink">What would you like to book?</p>
        <p className="mt-0.5 text-xs text-ink-soft">{filtered.length} tests & packages · HealthID Card special rates</p>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search tests, packages, categories…"
            className="w-full rounded-xl border border-line/80 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/10"
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full table-fixed text-left text-sm">
          <thead>
            <tr className="border-b border-line/60 bg-cream/80 text-[11px] font-bold uppercase tracking-wider">
              <th className="w-14 px-4 py-3 md:px-6">#</th>
              <th className="px-4 py-3 md:px-6">
                <SortHeader label="Test name" field="name" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
              </th>
              <th className="hidden w-[18%] px-4 py-3 md:table-cell md:px-6">
                <SortHeader label="Category" field="category" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
              </th>
              <th className="w-[11%] px-4 py-3 text-right md:px-6">
                <SortHeader label="MRP" field="mrp" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="right" />
              </th>
              <th className="w-[13%] px-4 py-3 text-right md:px-6">
                <SortHeader label="Your price" field="price" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="right" />
              </th>
              <th className="w-[100px] px-4 py-3 text-right text-ink-soft md:px-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-ink-soft">
                  No tests match your search.
                </td>
              </tr>
            ) : (
              rows.map((t, i) => {
                const price = testPrice(t)
                const mrp = Number(t.price)
                const sr = (safePage - 1) * PAGE_SIZE + i + 1
                return (
                  <tr
                    key={t.id}
                    onClick={() => onSelect(t.id)}
                    className="cursor-pointer border-b border-line/40 transition hover:bg-teal-light/40"
                  >
                    <td className="px-4 py-3.5 text-ink-soft md:px-6">{sr}</td>
                    <td className="px-4 py-3.5 md:px-6">
                      <p className="font-semibold text-ink">{t.name}</p>
                      <p className="mt-0.5 text-xs text-ink-soft md:hidden">{t.category?.name ?? '—'}</p>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {t.isPackage ? (
                          <span className="inline-block rounded-md bg-teal-light px-1.5 py-0.5 text-[10px] font-bold text-teal">
                            Package
                          </span>
                        ) : null}
                        {t.isPopular ? (
                          <span className="inline-block rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                            Popular
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="hidden truncate px-4 py-3.5 text-ink-soft md:table-cell md:px-6">{t.category?.name ?? '—'}</td>
                    <td className="px-4 py-3.5 text-right text-ink-soft line-through md:px-6">{formatMoney(mrp)}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-teal md:px-6">{formatMoney(price)}</td>
                    <td className="px-4 py-3.5 text-right md:px-6">
                      <Button
                        size="sm"
                        variant="primary"
                        className="rounded-xl text-xs"
                        onClick={(e) => { e.stopPropagation(); onSelect(t.id) }}
                      >
                        Select
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/60 px-5 py-4 md:px-6">
        <p className="text-xs text-ink-soft">
          Showing {(safePage - 1) * PAGE_SIZE + (rows.length ? 1 : 0)}–{(safePage - 1) * PAGE_SIZE + rows.length} of {filtered.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-xl"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[80px] text-center text-xs font-semibold text-ink">
            Page {safePage} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-xl"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
