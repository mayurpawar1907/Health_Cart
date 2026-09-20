import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  Droplets,
  FlaskConical,
  HeartPulse,
  Microscope,
  Pill,
  Stethoscope,
} from 'lucide-react'
import api, { unwrap } from '@/api/client'
import { Loading } from '@/components/ui/Loading'
import { cn } from '@/utils/utils'

const ICONS = [FlaskConical, HeartPulse, Microscope, Activity, Pill, Stethoscope, Droplets]
const TONES = [
  'from-teal-light to-white border-teal/20 text-teal',
  'from-teal-light/40 to-white border-teal/15 text-teal',
  'from-indigo-50 to-white border-indigo-200/60 text-indigo-600',
  'from-emerald-50 to-white border-emerald-200/60 text-emerald-600',
  'from-amber-50 to-white border-amber-200/60 text-amber-700',
  'from-sky-50 to-white border-sky-200/60 text-sky-600',
  'from-violet-50 to-white border-violet-200/60 text-violet-600',
]

export function LandingCategories({ onSelectCategory }) {
  const categoriesQ = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => unwrap((await api.get('/tests/categories')).data),
  })

  const categories = (categoriesQ.data ?? []).slice(0, 8)

  return (
    <section id="categories" className="bg-white py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal">Browse by concern</p>
          <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">Find the right test for you</h2>
          <p className="mt-3 text-ink-soft">
            Explore categories from our lab catalog — special member rates and free home collection on every booking.
          </p>
        </div>

        {categoriesQ.isLoading ? (
          <div className="mt-10">
            <Loading label="Loading categories…" />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {categories.map((cat, i) => {
              const Icon = ICONS[i % ICONS.length]
              const tone = TONES[i % TONES.length]
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onSelectCategory?.(cat.name)
                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className={cn(
                    'group flex flex-col rounded-2xl border bg-gradient-to-br p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5',
                    tone,
                  )}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white shadow-sm transition group-hover:scale-105">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-sm font-bold leading-snug text-ink sm:text-base">{cat.name}</h3>
                  {cat.description ? (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-soft">{cat.description}</p>
                  ) : null}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
