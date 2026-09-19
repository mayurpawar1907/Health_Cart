import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/api/client';
import { formatDate, formatMoney } from '@/utils/utils';
import { Loading } from '@/components/ui/Loading';
import { AdminPage, AdminPageHeader, AdminSearch, AdminSelect, AdminTHead, AdminTh, AdminTr, AdminTd, AdminTable, AdminToolbar, Badge, EmptyRow, } from '@/components/admin/AdminUi';
const STATUSES = ['PENDING', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'];
export function AdminAppointmentsPage() {
    const qc = useQueryClient();
    const [q, setQ] = useState('');
    const [status, setStatus] = useState('');
    const { data, isLoading } = useQuery({
        queryKey: ['admin-appts', q, status],
        queryFn: async () => unwrap((await api.get('/admin/appointments', { params: { q: q || undefined, status: status || undefined } })).data),
    });
    const setStatusMut = useMutation({
        mutationFn: ({ id, value }) => api.patch(`/admin/appointments/${id}/status`, { status: value }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-appts'] }),
    });
    const setPayment = useMutation({
        mutationFn: ({ id, paymentStatus }) => api.patch(`/admin/appointments/${id}/payment`, { paymentStatus }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-appts'] }),
    });
    if (isLoading)
        return <Loading label="Loading appointments"/>;
    return (<AdminPage>
      <AdminPageHeader title="Appointments" subtitle="Manage bookings, status and payments"/>

      <AdminToolbar>
        <AdminSearch value={q} onChange={setQ} placeholder="Search code, patient, email…"/>
        <AdminSelect value={status} onChange={setStatus}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </AdminSelect>
      </AdminToolbar>

      <AdminTable>
        <table className="w-full min-w-[1000px] text-left text-sm">
          <AdminTHead>
            <AdminTh>Code</AdminTh>
            <AdminTh>Customer</AdminTh>
            <AdminTh>Test / Patient</AdminTh>
            <AdminTh>Schedule</AdminTh>
            <AdminTh>Amount</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Payment</AdminTh>
            <AdminTh>Actions</AdminTh>
          </AdminTHead>
          <tbody>
            {!data?.length ? (<EmptyRow colSpan={8} message="No appointments"/>) : (data.map((a) => (<AdminTr key={a.id}>
                  <AdminTd className="font-mono text-xs">{a.code}</AdminTd>
                  <AdminTd>
                    <p className="font-semibold">{a.user.fullName}</p>
                    <p className="text-xs text-ink-soft">{a.user.mobile}</p>
                  </AdminTd>
                  <AdminTd>
                    <p>{a.test.name}</p>
                    <p className="text-xs text-ink-soft">{a.patientName}</p>
                  </AdminTd>
                  <AdminTd className="text-ink-soft">{formatDate(a.date)} · {a.timeSlot}</AdminTd>
                  <AdminTd>{a.finalPrice != null ? formatMoney(Number(a.finalPrice)) : '—'}</AdminTd>
                  <AdminTd><Badge tone="teal">{a.status}</Badge></AdminTd>
                  <AdminTd><Badge tone={a.paymentStatus === 'PAID' ? 'success' : 'warn'}>{a.paymentStatus}</Badge></AdminTd>
                  <AdminTd>
                    <AdminSelect value={a.status} onChange={(value) => setStatusMut.mutate({ id: a.id, value })} className="mb-1.5 w-full text-xs py-1.5">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </AdminSelect>
                    <AdminSelect value={a.paymentStatus} onChange={(paymentStatus) => setPayment.mutate({ id: a.id, paymentStatus })} className="w-full text-xs py-1.5">
                      {['PENDING', 'PAID', 'FAILED', 'REFUNDED'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </AdminSelect>
                  </AdminTd>
                </AdminTr>)))}
          </tbody>
        </table>
      </AdminTable>
    </AdminPage>);
}
