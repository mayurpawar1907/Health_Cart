import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, MapPin, Search, Sparkles, Truck } from 'lucide-react';
import { useState } from 'react';
import { cn, greeting } from '@/utils/utils';
import { NotifyBell } from '@/components/ui/SearchBar';
const QUICK_SEARCHES = ['Full body checkup', 'HbA1c', 'Vitamin D', 'Thyroid profile', 'CBC'];
const BANNERS = {
    main: '/banners/hero-lab.jpg',
    home: '/banners/hero-home.jpg',
    family: '/banners/hero-family.jpg',
};
export function HomeTopHeader({ firstName, city, pincode, unreadCount, hasMembership }) {
    const [q, setQ] = useState('');
    const navigate = useNavigate();
    function onSearch(e) {
        e.preventDefault();
        const value = q.trim();
        if (!value)
            return;
        const recent = JSON.parse(localStorage.getItem('hc_recent_searches') || '[]');
        localStorage.setItem('hc_recent_searches', JSON.stringify([value, ...recent.filter((x) => x !== value)].slice(0, 6)));
        navigate(`/search?q=${encodeURIComponent(value)}`);
    }
    function quickSearch(term) {
        navigate(`/search?q=${encodeURIComponent(term)}`);
    }
    return (<section className="overflow-hidden rounded-[24px] border border-line/60 shadow-[0_12px_40px_rgba(43,90,121,0.12)]">
      {/* Banner hero */}
      <div className="relative min-h-[220px] md:min-h-[260px]">
        <img src={BANNERS.main} alt="" className="absolute inset-0 h-full w-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2a3d]/95 via-[#2B5A79]/88 to-[#2B5A79]/55"/>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_30%,rgba(227,62,43,0.22),transparent_42%)]"/>

        <div className="relative grid h-full gap-6 p-5 md:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
          {/* Left — copy */}
          <div className="text-white">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-white/80">
                {greeting()}, <span className="text-white">{firstName}</span>
              </p>
              <div className="flex shrink-0 items-center gap-2 lg:hidden">
                {hasMembership ? <MembershipPill compact/> : null}
                <NotifyBell count={unreadCount} onDark/>
              </div>
            </div>

            <h1 className="mt-3 max-w-xl font-display text-[1.75rem] leading-[1.12] tracking-tight md:text-[2.15rem]">
              Book lab tests at home
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80">
              Free home sample collection · Digital reports · WhatsApp updates
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link to="/appointments/book" className="inline-flex items-center rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-red-dark">
                Book home collection
              </Link>
              <Link to="/profile" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 backdrop-blur-sm transition hover:bg-white/15">
                <MapPin className="h-4 w-4 text-brand-red-light"/>
                <span className="text-xs">
                  <span className="block text-[10px] uppercase tracking-wider text-white/55">Location</span>
                  <span className="flex items-center gap-0.5 font-semibold">
                    {city ?? 'Set city'}
                    <ChevronDown className="h-3.5 w-3.5 opacity-70"/>
                  </span>
                </span>
                {pincode ? <span className="hidden text-white/60 sm:inline">· {pincode}</span> : null}
              </Link>

              <span className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/85 backdrop-blur-sm sm:inline-flex">
                <Truck className="h-3.5 w-3.5"/> Same-day slots available
              </span>
            </div>

            <div className="mt-5 hidden items-center gap-2.5 lg:flex">
              {hasMembership ? <MembershipPill /> : null}
              <NotifyBell count={unreadCount} onDark/>
            </div>
          </div>

          {/* Right — image collage */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_1fr] lg:gap-3">
            <div className="overflow-hidden rounded-2xl border-2 border-white/20 shadow-xl">
              <img src={BANNERS.home} alt="Home sample collection" className="h-36 w-full object-cover"/>
              <p className="bg-white/95 px-3 py-2 text-[11px] font-semibold text-ink">Home collection</p>
            </div>
            <div className="overflow-hidden rounded-2xl border-2 border-white/20 shadow-xl">
              <img src={BANNERS.family} alt="Family health checkups" className="h-36 w-full object-cover"/>
              <p className="bg-white/95 px-3 py-2 text-[11px] font-semibold text-ink">Family health</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search panel */}
      <div className="relative z-10 -mt-1 bg-white px-5 pb-5 pt-4 md:px-7 md:pb-6">
        <form onSubmit={onSearch} className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-teal"/>
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tests, packages, vitamins, diabetes..." className={cn('w-full rounded-2xl border border-line bg-cream/40 py-4 pl-12 pr-28', 'text-[15px] text-ink placeholder:text-ink-soft/70', 'shadow-[0_4px_16px_rgba(43,90,121,0.06)]', 'outline-none transition', 'focus:border-teal focus:bg-white focus:shadow-[0_0_0_4px_rgba(43,90,121,0.1)]')}/>
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-dark active:scale-[0.98]">
            Search
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">Trending</span>
          {QUICK_SEARCHES.map((term) => (<button key={term} type="button" onClick={() => quickSearch(term)} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink-soft shadow-sm transition hover:border-teal/40 hover:bg-teal-light/70 hover:text-teal">
              {term}
            </button>))}
        </div>

        {/* Mobile image strip */}
        <div className="mt-4 grid grid-cols-2 gap-3 lg:hidden">
          <BannerThumb src={BANNERS.home} label="Home collection"/>
          <BannerThumb src={BANNERS.family} label="Family health"/>
        </div>
      </div>
    </section>);
}
function MembershipPill({ compact }) {
    return (<Link to="/membership/card" className={cn('inline-flex items-center gap-1.5 rounded-full bg-white/15 font-semibold text-white backdrop-blur-sm transition hover:bg-white/25', compact ? 'px-2.5 py-1.5 text-[10px]' : 'px-3.5 py-2 text-xs')}>
      <Sparkles className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}/>
      30% off active
    </Link>);
}
function BannerThumb({ src, label }) {
    return (<div className="overflow-hidden rounded-xl border border-line shadow-sm">
      <img src={src} alt={label} className="h-24 w-full object-cover"/>
      <p className="bg-white px-3 py-2 text-center text-xs font-semibold text-ink">{label}</p>
    </div>);
}
