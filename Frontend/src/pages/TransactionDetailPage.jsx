import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, CreditCard, FileText, Hash, User } from 'lucide-react';
import api, { unwrap } from '@/api/client';
import { formatDate, formatMoney } from '@/utils/utils';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { PaymentBreakdown, PaymentBreakdownSummary } from '@/components/payments/PaymentBreakdown';
import { UserBadge, UserPage, UserPageHeader, UserPanel } from '@/components/user/UserUi';
export function TransactionDetailPage() {
    const { id } = useParams();
    const { data, isLoading, isError } = useQuery({
        queryKey: ['payment-transaction', id],
        enabled: Boolean(id),
        queryFn: async () => unwrap((await api.get(`/payments/transactions/${id}`)).data),
    });
    if (isLoading)
        return <Loading label="Loading payment details"/>;
    if (isError || !data) {
        return (<UserPage>
        <p className="text-sm text-ink-soft">Payment not found.</p>
        <Link to="/transactions" className="mt-4 inline-block text-teal hover:underline">
          ← Back to payments
        </Link>
      </UserPage>);
    }
    const appt = data.appointment;
    return (<UserPage>
      <UserPageHeader title="Payment receipt" subtitle={`${data.bookingCode} · ${data.testName}`} actions={<div className="flex flex-wrap gap-2">
            <Link to={`/transactions/${id}/invoice`}>
              <Button className="rounded-xl">
                <FileText className="mr-2 h-4 w-4"/>
                View invoice
              </Button>
            </Link>
            <Link to="/transactions">
              <Button variant="secondary" className="rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                All payments
              </Button>
            </Link>
          </div>}/>

      {data.breakdown ? <PaymentBreakdownSummary breakdown={data.breakdown}/> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <UserPanel title="Transaction">
          <dl className="space-y-4 text-sm">
            {data.invoiceNumber ? (<div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Invoice no.</dt>
                <dd className="font-mono text-xs font-semibold text-ink">{data.invoiceNumber}</dd>
              </div>) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Transaction ID</dt>
              <dd className="font-mono text-xs text-ink">{data.id.slice(0, 12)}…</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Status</dt>
              <dd>
                <UserBadge tone={data.status === 'PAID' ? 'success' : data.status === 'PENDING' ? 'warn' : 'default'}>
                  {data.status}
                </UserBadge>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="flex items-center gap-1.5 text-ink-soft">
                <CreditCard className="h-3.5 w-3.5"/> Method
              </dt>
              <dd className="font-semibold text-ink">{data.method}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Amount</dt>
              <dd className="font-display text-xl text-ink">{formatMoney(data.amount)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Recorded</dt>
              <dd className="text-ink">
                {new Date(data.createdAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })}
              </dd>
            </div>
          </dl>
        </UserPanel>

        {appt ? (<UserPanel title="Booking">
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-ink-soft">
                  <Hash className="h-3.5 w-3.5"/> Code
                </dt>
                <dd className="font-mono font-semibold text-ink">{appt.code}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-ink-soft">
                  <CalendarDays className="h-3.5 w-3.5"/> Schedule
                </dt>
                <dd className="text-ink">
                  {formatDate(appt.date)}
                  {appt.timeSlot ? ` · ${appt.timeSlot}` : ''}
                </dd>
              </div>
              {appt.patientName ? (<div className="flex justify-between gap-4">
                  <dt className="flex items-center gap-1.5 text-ink-soft">
                    <User className="h-3.5 w-3.5"/> Patient
                  </dt>
                  <dd className="text-ink">{appt.patientName}</dd>
                </div>) : null}
              <div className="pt-2">
                <Link to={`/appointments/${appt.id}`} className="text-sm font-semibold text-teal hover:underline">
                  View booking →
                </Link>
              </div>
            </dl>
          </UserPanel>) : null}
      </div>

      {data.breakdown ? <PaymentBreakdown breakdown={data.breakdown}/> : null}
    </UserPage>);
}
