import { Bell, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
export function SearchBar({ placeholder = 'Search tests, health packages...' }) {
    const [q, setQ] = useState('');
    const navigate = useNavigate();
    function onSubmit(e) {
        e.preventDefault();
        const value = q.trim();
        if (!value)
            return;
        const recent = JSON.parse(localStorage.getItem('hc_recent_searches') || '[]');
        localStorage.setItem('hc_recent_searches', JSON.stringify([value, ...recent.filter((x) => x !== value)].slice(0, 6)));
        navigate(`/search?q=${encodeURIComponent(value)}`);
    }
    return (<form onSubmit={onSubmit} className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft"/>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="w-full rounded-full border border-line bg-white py-3.5 pl-12 pr-4 shadow-sm outline-none focus:border-teal focus:ring-4 focus:ring-teal/10"/>
    </form>);
}
export function NotifyBell({ count, onDark, compact }) {
    const size = compact ? 'h-8 w-8' : 'h-11 w-11';
    return (<Link to="/notifications" aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`} className={onDark
            ? `relative grid ${size} place-items-center rounded-full border border-white/25 bg-white/10 text-white shadow-sm backdrop-blur-sm transition hover:bg-white/20`
            : `relative grid ${size} place-items-center rounded-lg border border-line/80 bg-white text-ink-soft transition hover:border-teal/30 hover:bg-teal-light/50 hover:text-teal`}>
      <Bell className={compact ? 'h-4 w-4' : 'h-[1.15rem] w-[1.15rem]'} strokeWidth={1.75}/>
      {count > 0 ? (<span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-red px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
          {count > 9 ? '9+' : count}
        </span>) : null}
    </Link>);
}
