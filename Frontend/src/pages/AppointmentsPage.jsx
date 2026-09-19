import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { unwrap } from '@/api/client';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate, formatMoney } from '@/utils/utils';
import { UserBadge, UserEmptyRow, UserPage, UserPageHeader, UserPanel, UserSearch, UserSelect, UserTable, UserTd, UserTh, UserTHead, UserToolbar, UserTr, } from '@/components/user/UserUi';
import { APPOINTMENT_TIME_SLOTS } from '@/utils/appointments';
const STATUS_FILTERS = ['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
function statusTone(status) {
    if (status === 'COMPLETED')
        return 'success';
    if (status === 'CANCELLED')
        return 'danger';
    if (status === 'CONFIRMED')
        return 'teal';
    if (status === 'PENDING' || status === 'RESCHEDULED')
        return 'warn';
    return 'default';
}
function paymentTone(status) {
    if (status === 'PAID')
        return 'success';
    if (status === 'FAILED' || status === 'REFUNDED')
        return 'danger';
    if (status === 'PENDING')
        return 'warn';
    return 'default';
}
export function AppointmentsPage() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('ALL');
    const [query, setQuery] = useState('');
    const q = useQuery({
        queryKey: ['appointments', status],
        queryFn: async () => unwrap((await api.get('/appointments', { params: { status } })).data),
    });
    const filtered = useMemo(() => {
        const list = q.data ?? [];
        const qLower = query.trim().toLowerCase();
        if (!qLower)
            return list;
        return list.filter((a) => a.code.toLowerCase().includes(qLower) ||
            a.test.name.toLowerCase().includes(qLower) ||
            a.patientName.toLowerCase().includes(qLower) ||
            a.location.toLowerCase().includes(qLower));
    }, [q.data, query]);
    return (<UserPage>
      <UserPageHeader title="Bookings" subtitle="Track home collection appointments" actions={<Link to="/appointments/book">
            <Button className="rounded-xl">Book test</Button>
          </Link>}/>

      <UserToolbar>
        <UserSearch value={query} onChange={setQuery} placeholder="Search code, test, patient…"/>
        <UserSelect value={status} onChange={setStatus}>
          {STATUS_FILTERS.map((f) => (<option key={f} value={f}>
              {f === 'CONFIRMED' ? 'Upcoming' : f === 'ALL' ? 'All statuses' : f.charAt(0) + f.slice(1).toLowerCase()}
            </option>))}
        </UserSelect>
      </UserToolbar>

      {q.isLoading ? (<Loading label="Loading bookings"/>) : !q.data?.length ? (<EmptyState title="No appointments" body="Book a laboratory test to see it here." action={{ label: 'Book a test', onClick: () => navigate('/appointments/book') }}/>) : (<UserTable>
          <table className="w-full min-w-[920px] text-left text-sm">
            <UserTHead>
              <UserTh>Code</UserTh>
              <UserTh>Test / Patient</UserTh>
              <UserTh>Schedule</UserTh>
              <UserTh>Location</UserTh>
              <UserTh>Amount</UserTh>
              <UserTh>Status</UserTh>
              <UserTh>Payment</UserTh>
              <UserTh>Actions</UserTh>
            </UserTHead>
            <tbody>
              {!filtered.length ? (<UserEmptyRow colSpan={8} message="No bookings match your search"/>) : (filtered.map((a) => (<UserTr key={a.id}>
                    <UserTd className="font-mono text-xs">{a.code}</UserTd>
                    <UserTd>
                      <p className="font-semibold">{a.test.name}</p>
                      <p className="text-xs text-ink-soft">{a.patientName}</p>
                    </UserTd>
                    <UserTd className="text-ink-soft">
                      {formatDate(a.date)} · {a.timeSlot}
                    </UserTd>
                    <UserTd className="max-w-[140px] text-xs text-ink-soft">
                      <span className="block truncate" title={a.location}>
                        {a.location}
                      </span>
                    </UserTd>
                    <UserTd>{a.finalPrice != null ? formatMoney(Number(a.finalPrice)) : '—'}</UserTd>
                    <UserTd>
                      <UserBadge tone={statusTone(a.status)}>{a.status}</UserBadge>
                    </UserTd>
                    <UserTd>
                      <UserBadge tone={paymentTone(a.paymentStatus)}>{a.paymentStatus ?? 'PENDING'}</UserBadge>
                    </UserTd>
                    <UserTd>
                      <Link to={`/appointments/${a.id}`}>
                        <Button size="sm" variant="secondary" className="rounded-lg text-xs">
                          View
                        </Button>
                      </Link>
                    </UserTd>
                  </UserTr>)))}
            </tbody>
          </table>
        </UserTable>)}
    </UserPage>);
}
export function AppointmentDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('08:00 AM');
    const [initialized, setInitialized] = useState(false);
    const q = useQuery({
        queryKey: ['appointment', id],
        queryFn: async () => unwrap((await api.get(`/appointments/${id}`)).data),
    });
    useEffect(() => {
        if (!q.data || initialized)
            return;
        setDate(q.data.date.slice(0, 10));
        setTimeSlot(q.data.timeSlot);
        setInitialized(true);
    }, [q.data, initialized]);
    const cancel = useMutation({
        mutationFn: async () => api.delete(`/appointments/${id}`),
        onSuccess: () => {
            qc.invalidateQueries();
            navigate('/appointments');
        },
    });
    const reschedule = useMutation({
        mutationFn: async () => api.patch(`/appointments/${id}`, { date, timeSlot }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['appointment', id] }),
    });
    if (q.isLoading || !q.data)
        return <Loading label="Loading booking"/>;
    const a = q.data;
    return (<UserPage className="max-w-3xl">
      <UserPageHeader title={a.test.name} subtitle={`${a.code} · ${formatDate(a.date)} · ${a.timeSlot}`} actions={<Link to="/appointments">
            <Button variant="secondary" size="sm" className="rounded-xl">
              ← Back
            </Button>
          </Link>}/>

      <UserTable>
        <table className="w-full text-left text-sm">
          <UserTHead>
            <UserTh>Field</UserTh>
            <UserTh>Details</UserTh>
          </UserTHead>
          <tbody>
            <UserTr>
              <UserTd className="text-ink-soft">Booking code</UserTd>
              <UserTd className="font-mono text-xs">{a.code}</UserTd>
            </UserTr>
            <UserTr>
              <UserTd className="text-ink-soft">Patient</UserTd>
              <UserTd className="font-semibold">{a.patientName}</UserTd>
            </UserTr>
            <UserTr>
              <UserTd className="text-ink-soft">Location</UserTd>
              <UserTd>{a.location}</UserTd>
            </UserTr>
            <UserTr>
              <UserTd className="text-ink-soft">Status</UserTd>
              <UserTd>
                <UserBadge tone={statusTone(a.status)}>{a.status}</UserBadge>
              </UserTd>
            </UserTr>
            <UserTr>
              <UserTd className="text-ink-soft">Payment</UserTd>
              <UserTd>
                <UserBadge tone={paymentTone(a.paymentStatus)}>{a.paymentStatus ?? 'PENDING'}</UserBadge>
              </UserTd>
            </UserTr>
            <UserTr>
              <UserTd className="text-ink-soft">Amount paid</UserTd>
              <UserTd>{a.finalPrice != null ? formatMoney(Number(a.finalPrice)) : '—'}</UserTd>
            </UserTr>
          </tbody>
        </table>
      </UserTable>

      {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' ? (<UserPanel title="Reschedule or cancel">
          <div className="grid gap-3 md:grid-cols-2">
            <Input type="date" label="New date" value={date} onChange={(e) => setDate(e.target.value)}/>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Time slot</label>
              <UserSelect value={timeSlot} onChange={setTimeSlot} className="w-full">
                {APPOINTMENT_TIME_SLOTS.map((slot) => (<option key={slot} value={slot}>
                    {slot}
                  </option>))}
              </UserSelect>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" className="rounded-xl" disabled={!date || reschedule.isPending} onClick={() => reschedule.mutate()}>
              Reschedule
            </Button>
            <Button variant="danger" className="rounded-xl" disabled={cancel.isPending} onClick={() => cancel.mutate()}>
              Cancel booking
            </Button>
          </div>
        </UserPanel>) : null}
    </UserPage>);
}
