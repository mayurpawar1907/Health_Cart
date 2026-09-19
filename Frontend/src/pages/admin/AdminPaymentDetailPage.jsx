import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText } from 'lucide-react';
import api, { unwrap } from '@/api/client';
import { formatDate, formatMoney } from '@/utils/utils';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { PaymentBreakdown, PaymentBreakdownSummary } from '@/components/payments/PaymentBreakdown';
import { AdminPage, AdminPageHeader, AdminPanel, AdminSelect, Badge, } from '@/components/admin/AdminUi';
export function AdminPaymentDetailPage() {
    const { id } = useParams();
    const qc = useQueryClient();
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-payment', id],
        enabled: Boolean(id),
        queryFn: async () => unwrap((await api.get(`/admin/payments/${id}`)).data),
    });
    const updateStatus = useMutation({
        mutationFn: (status) => api.patch(`/admin/payments/${id}/status`, { status }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-payment', id] });
            qc.invalidateQueries({ queryKey: ['admin-payments'] });
        },
    });
    if (isLoading)
        return <Loading label="Loading payment"/>;
    if (isError || !data) {
        return (<AdminPage>
        <p className="text-sm text-ink-soft">Payment not found.</p>
        <Link to="/admin/payments" className="mt-4 inline-block text-teal hover:underline">
          ← Back to ledger
        </Link>
      </AdminPage>);
    }
    return (<AdminPage>
      <AdminPageHeader title="Payment detail" subtitle={`${data.bookingCode} · ${data.testName}`} actions={<div className="flex flex-wrap gap-2">
            <Link to={`/admin/payments/${id}/invoice`}>
              <Button className="rounded-xl">
                <FileText className="mr-2 h-4 w-4"/>
                View invoice
              </Button>
            </Link>
            <Link to="/admin/payments">
              <Button variant="secondary" className="rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Ledger
              </Button>
            </Link>
          </div>}/>

      {data.breakdown ? <PaymentBreakdownSummary breakdown={data.breakdown}/> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Transaction">
          <dl className="space-y-3 text-sm">
            {data.invoiceNumber ? (<div className="flex justify-between">
                <dt className="text-ink-soft">Invoice no.</dt>
                <dd className="font-mono text-xs font-semibold">{data.invoiceNumber}</dd>
              </div>) : null}
            <div className="flex justify-between">
              <dt className="text-ink-soft">Transaction ID</dt>
              <dd className="font-mono text-xs">{data.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Status</dt>
              <dd><Badge tone={data.status === 'PAID' ? 'success' : 'warn'}>{data.status}</Badge></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Method</dt>
              <dd className="font-semibold">{data.method}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Amount</dt>
              <dd className="font-display text-xl">{formatMoney(data.amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Recorded</dt>
              <dd>{new Date(data.createdAt).toLocaleString('en-IN')}</dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-line/50 pt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Update settlement status</p>
            <AdminSelect value={data.status} onChange={(v) => updateStatus.mutate(v)} className="w-full">
              {['PENDING', 'PAID', 'FAILED', 'REFUNDED'].map((s) => (<option key={s} value={s}>{s}</option>))}
            </AdminSelect>
            <p className="mt-2 text-xs text-ink-soft">Syncs linked appointment payment status.</p>
          </div>
        </AdminPanel>

        <AdminPanel title="Customer & booking">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Customer</dt>
              <dd className="text-right font-semibold">{data.user?.fullName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Contact</dt>
              <dd className="text-right text-ink-soft">{data.user?.mobile ?? data.user?.email}</dd>
            </div>
            {data.appointment ? (<>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Booking code</dt>
                  <dd className="font-mono">{data.appointment.code}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Schedule</dt>
                  <dd>{formatDate(data.appointment.date)}{data.appointment.timeSlot ? ` · ${data.appointment.timeSlot}` : ''}</dd>
                </div>
                {data.appointment.patientName ? (<div className="flex justify-between">
                    <dt className="text-ink-soft">Patient</dt>
                    <dd>{data.appointment.patientName}</dd>
                  </div>) : null}
                <div className="pt-2">
                  <Link to={`/admin/appointments`} className="text-sm font-semibold text-teal hover:underline">
                    View in appointments →
                  </Link>
                </div>
              </>) : null}
          </dl>
        </AdminPanel>
      </div>

      {data.breakdown ? <PaymentBreakdown breakdown={data.breakdown}/> : null}
    </AdminPage>);
}
