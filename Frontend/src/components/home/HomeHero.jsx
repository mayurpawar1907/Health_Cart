import { Link } from 'react-router-dom';
import { CalendarPlus, MapPin, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { greeting } from '@/utils/utils';
import { Button } from '@/components/ui/Button';
export function HomeHero({ firstName, city, hasMembership, hasAddress, onSearch }) {
    const setupDone = hasMembership && hasAddress;
    return (<section className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white via-[#f3f9fc] to-[#e8f4fa] p-6 shadow-[0_8px_40px_rgba(26,77,109,0.08)] md:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#e03a28]/8 blur-3xl"/>
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[#1a4d6d]/10 blur-3xl"/>

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-teal-light px-3 py-1 text-xs font-semibold text-teal">
            <Sparkles className="h-3.5 w-3.5"/>
            {greeting()}
          </p>
          <h1 className="mt-3 font-display text-3xl text-ink md:text-4xl">{firstName}</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {city ? (<span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-teal"/> {city} · Free home sample pickup
              </span>) : ('Book lab tests with free home collection and member discounts')}
          </p>
        </div>
        <Link to="/appointments/book" className="shrink-0">
          <Button size="lg" className="w-full rounded-2xl border-0 bg-gradient-to-r from-[#e03a28] to-[#c42e1e] text-white shadow-[0_8px_24px_rgba(224,58,40,0.35)] hover:brightness-105 lg:w-auto">
            <CalendarPlus className="mr-2 h-5 w-5"/>
            Book home collection
          </Button>
        </Link>
      </div>

      <form className="relative mt-6 flex items-center gap-2 rounded-2xl border border-line/80 bg-white p-1.5 shadow-sm" onSubmit={(e) => {
            e.preventDefault();
            const q = new FormData(e.currentTarget).get('q');
            onSearch(String(q ?? ''));
        }}>
        <Search className="ml-3 h-5 w-5 shrink-0 text-teal"/>
        <input name="q" placeholder="Search tests — CBC, thyroid, vitamin D…" className="min-w-0 flex-1 bg-transparent py-3 text-sm text-ink outline-none placeholder:text-ink-soft/60"/>
        <Button type="submit" size="sm" className="rounded-xl">
          Search
        </Button>
      </form>

      {!setupDone ? (<div className="relative mt-5 flex flex-wrap gap-2">
          {!hasMembership ? (<Link to="/home#healthid-card-section" className="inline-flex items-center gap-2 rounded-full border border-teal/15 bg-teal-light px-4 py-2 text-xs font-semibold text-teal transition hover:bg-teal/10">
              <ShieldCheck className="h-3.5 w-3.5"/> Activate free HealthID Card
            </Link>) : null}
          {!hasAddress ? (<Link to="/profile" className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-100">
              <MapPin className="h-3.5 w-3.5"/> Add home address
            </Link>) : null}
        </div>) : null}
    </section>);
}
