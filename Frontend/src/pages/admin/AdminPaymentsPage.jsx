import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { unwrap } from '@/api/client';
import { formatMoney } from '@/utils/utils';
import { Loading } from '@/components/ui/Loading';
import { AdminPage, AdminPageHeader, AdminPagination, AdminSearch, AdminSelect, AdminTHead, AdminTh, AdminTr, AdminTd, AdminTable, AdminToolbar, Badge, EmptyRow, StatCard, } from '@/components/admin/AdminUi';
function statusTone(status) {
    if (status === 'PAID')
        return 'success';
    if (status === 'PENDING')
        return 'warn';
    if (status === 'FAILED')
        return 'danger';
    return 'default';
}
export function AdminPaymentsPage() {
    const [q, setQ] = useState('');
    const [status, setStatus] = useState('');
    const [method, setMethod] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading } = useQuery({
        queryKey: ['admin-payments', q, status, method, page],
        queryFn: async () => unwrap((await api.get('/admin/payments', {
            params: {
                q: q || undefined,
                status: status || undefined,
                method: method || undefined,
                page,
                limit: 25,
            },
        })).data),
    });
    if (isLoading)
        return <Loading label="Loading payments"/>;
    const paidStat = data?.stats?.find((s) => s.status === 'PAID');
    const pendingStat = data?.stats?.find((s) => s.status === 'PENDING');
    return (<AdminPage>
      <AdminPageHeader title="Payments ledger" subtitle="All booking payments, promo discounts, and settlement status"/>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total transactions" value={data?.total ?? 0}/>
        <StatCard label="Paid volume" value={formatMoney(paidStat?.amount ?? 0)} hint={`${paidStat?.count ?? 0} paid`} tone="accent"/>
        <StatCard label="Pending / COD" value={pendingStat?.count ?? 0} hint={formatMoney(pendingStat?.amount ?? 0)} tone="warn"/>
        <StatCard label="Failed / refunded" value={(data?.stats?.find((s) => s.status === 'FAILED')?.count ?? 0) + (data?.stats?.find((s) => s.status === 'REFUNDED')?.count ?? 0)}/>
      </div>

      <AdminToolbar>
        <AdminSearch value={q} onChange={setQ} placeholder="Search booking, test, customer…"/>
        <AdminSelect value={status} onChange={(v) => { setStatus(v); setPage(1); }}>
          <option value="">All statuses</option>
          {['PENDING', 'PAID', 'FAILED', 'REFUNDED'].map((s) => (<option key={s} value={s}>{s}</option>))}
        </AdminSelect>
        <AdminSelect value={method} onChange={(v) => { setMethod(v); setPage(1); }}>
          <option value="">All methods</option>
          {['UPI', 'CARD', 'COD', 'WALLET'].map((m) => (<option key={m} value={m}>{m}</option>))}
        </AdminSelect>
      </AdminToolbar>

      <AdminTable>
        <table className="w-full min-w-[1100px] text-left text-sm">
          <AdminTHead>
            <AdminTh>Date</AdminTh>
            <AdminTh>Booking</AdminTh>
            <AdminTh>Customer</AdminTh>
            <AdminTh>Test</AdminTh>
            <AdminTh>Method</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Amount</AdminTh>
            <AdminTh>Promo</AdminTh>
            <AdminTh> </AdminTh>
          </AdminTHead>
          <tbody>
            {!data?.items.length ? (<EmptyRow colSpan={9} message="No payment transactions"/>) : (data.items.map((t) => (<AdminTr key={t.id}>
                  <AdminTd className="whitespace-nowrap text-xs text-ink-soft">
                    {new Date(t.createdAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            })}
                  </AdminTd>
                  <AdminTd className="font-mono text-xs">{t.bookingCode}</AdminTd>
                  <AdminTd>
                    <p className="font-semibold">{t.user?.fullName ?? '—'}</p>
                    <p className="text-xs text-ink-soft">{t.user?.mobile ?? t.user?.email}</p>
                  </AdminTd>
                  <AdminTd>{t.testName}</AdminTd>
                  <AdminTd>{t.method}</AdminTd>
                  <AdminTd><Badge tone={statusTone(t.status)}>{t.status}</Badge></AdminTd>
                  <AdminTd className="font-semibold">{formatMoney(t.amount)}</AdminTd>
                  <AdminTd className="text-xs text-[#e03a28]">
                    {t.breakdown?.paymentDiscountPercent
                ? `${t.breakdown.paymentDiscountPercent}% (−${formatMoney(t.breakdown.paymentDiscountAmount)})`
                : '—'}
                  </AdminTd>
                  <AdminTd>
                    <div className="flex flex-col gap-1">
                      <Link to={`/admin/payments/${t.id}`} className="text-xs font-semibold text-teal hover:underline">
                        Details →
                      </Link>
                      <Link to={`/admin/payments/${t.id}/invoice`} className="text-[11px] text-ink-soft hover:text-teal">
                        Invoice
                      </Link>
                    </div>
                  </AdminTd>
                </AdminTr>)))}
          </tbody>
        </table>
      </AdminTable>

      <AdminPagination page={data?.page ?? 1} pages={data?.pages ?? 1} onPage={setPage}/>
    </AdminPage>);
}
