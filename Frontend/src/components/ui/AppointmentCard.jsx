import { CalendarClock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/utils/utils';
import { Badge } from './Badge';
const tones = {
    CONFIRMED: 'teal',
    RESCHEDULED: 'sand',
    COMPLETED: 'success',
    CANCELLED: 'danger',
    PENDING: 'sand',
};
export function AppointmentCard({ appointment }) {
    return (<Link to={`/appointments/${appointment.id}`} className="block">
      <article className="glass-panel rounded-3xl p-5 transition hover:border-teal/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-ink-soft">{appointment.code}</p>
            <h3 className="mt-1 font-display text-lg">{appointment.test.name}</h3>
          </div>
          <Badge tone={tones[appointment.status] ?? 'ink'}>{appointment.status}</Badge>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
          <CalendarClock className="h-4 w-4 text-teal"/>
          {formatDate(appointment.date)} · {appointment.timeSlot}
        </div>
        <p className="mt-2 text-sm text-ink-soft">{appointment.location}</p>
      </article>
    </Link>);
}
