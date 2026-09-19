import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Clock } from 'lucide-react';
export function HomeUpcoming({ testName, date, time, href }) {
    return (<Link to={href} className="group flex items-center gap-4 rounded-2xl border border-teal/15 bg-white p-4 shadow-sm transition hover:border-teal/30 hover:shadow-md md:p-5">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-teal to-[#256d8f] text-white shadow-sm">
        <Calendar className="h-6 w-6"/>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-teal">Your next visit</p>
        <p className="mt-0.5 truncate font-semibold text-ink">{testName}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
          <Clock className="h-3.5 w-3.5"/> {date} · {time}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-teal transition group-hover:translate-x-0.5"/>
    </Link>);
}
