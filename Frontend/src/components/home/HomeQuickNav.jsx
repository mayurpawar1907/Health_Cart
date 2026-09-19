import { Link } from 'react-router-dom';
import { CalendarDays, FileText, FlaskConical, UserRound, Wallet } from 'lucide-react';
const items = [
    { to: '/tests', label: 'Tests', icon: FlaskConical, bg: 'bg-teal-light', color: 'text-teal' },
    { to: '/wallet', label: 'Wallet', icon: Wallet, bg: 'bg-amber-50', color: 'text-amber-700' },
    { to: '/appointments', label: 'Bookings', icon: CalendarDays, bg: 'bg-red-50', color: 'text-[#e03a28]' },
    { to: '/history', label: 'Reports', icon: FileText, bg: 'bg-indigo-50', color: 'text-indigo-600' },
    { to: '/profile', label: 'Profile', icon: UserRound, bg: 'bg-emerald-50', color: 'text-emerald-600' },
];
export function HomeQuickNav() {
    return (<nav aria-label="Quick navigation" className="grid grid-cols-5 gap-2 sm:gap-3">
      {items.map((item) => {
            const Icon = item.icon;
            return (<Link key={item.to} to={item.to} className="flex flex-col items-center gap-2.5 rounded-2xl border border-line/70 bg-white px-2 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-teal/25 hover:shadow-md">
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${item.bg} ${item.color}`}>
              <Icon className="h-5 w-5"/>
            </span>
            <span className="text-xs font-semibold text-ink">{item.label}</span>
          </Link>);
        })}
    </nav>);
}
