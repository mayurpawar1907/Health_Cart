import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CreditCard, Receipt } from 'lucide-react';
import api, { unwrap } from '@/api/client';
import { formatMoney } from '@/utils/utils';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { UserBadge, UserEmptyRow, UserPage, UserPageHeader, UserPagination, UserTable, UserTd, UserTh, UserTHead, UserTr, } from '@/components/user/UserUi';
import { useState } from 'react';
function statusTone(status) {
    if (status === 'PAID')
        return 'success';
    if (status === 'PENDING')
        return 'warn';
    if (status === 'FAILED')
        return 'danger';
    return 'default';
}
export function TransactionsPage() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useQuery({
        queryKey: ['payment-transactions', page],
        queryFn: async () => unwrap((await api.get('/payments/transactions', { params: { page, limit: 15 } })).data),
    });
    if (isLoading)
        return <Loading label="Loading payment history"/>;
    const items = data?.items ?? [];
    return (<UserPage>
      <UserPageHeader title="Payment history" subtitle="Lab booking payments, discounts applied, and settlement status" actions={<Link to="/wallet">
            <Button variant="secondary" className="rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4"/>
              Wallet
            </Button>
          </Link>}/>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-3xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Total transactions</p>
          <p className="mt-2 font-display text-2xl text-ink">{data?.total ?? 0}</p>
        </div>
        <div className="glass-panel rounded-3xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Paid</p>
          <p className="mt-2 font-display text-2xl text-emerald-600">
            {items.filter((t) => t.status === 'PAID').length}
          </p>
        </div>
        <div className="glass-panel rounded-3xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Pending / COD</p>
          <p className="mt-2 font-display text-2xl text-amber-700">
            {items.filter((t) => t.status === 'PENDING').length}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-teal"/>
          <h2 className="font-display text-lg text-ink">All payments</h2>
        </div>
        <UserTable>
          <table className="w-full min-w-[720px] text-left text-sm">
            <UserTHead>
              <UserTh>Date</UserTh>
              <UserTh>Booking</UserTh>
              <UserTh>Test</UserTh>
              <UserTh>Method</UserTh>
              <UserTh>Status</UserTh>
              <UserTh className="text-right">Amount</UserTh>
              <UserTh className="text-right"> </UserTh>
            </UserTHead>
            <tbody>
              {items.length === 0 ? (<UserEmptyRow colSpan={7} message="No payment transactions yet. Book a test to see your payment ledger here."/>) : (items.map((t) => (<UserTr key={t.id}>
                    <UserTd className="whitespace-nowrap text-ink-soft">
                      {new Date(t.createdAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })}
                    </UserTd>
                    <UserTd className="font-mono text-xs">{t.bookingCode}</UserTd>
                    <UserTd>
                      <p className="font-medium text-ink">{t.testName}</p>
                      {t.breakdown?.paymentDiscountPercent > 0 ? (<p className="text-[11px] text-[#e03a28]">
                          {t.breakdown.paymentDiscountPercent}% promo on special price
                        </p>) : null}
                    </UserTd>
                    <UserTd>
                      <span className="inline-flex items-center gap-1 text-ink-soft">
                        <CreditCard className="h-3.5 w-3.5"/>
                        {t.method}
                      </span>
                    </UserTd>
                    <UserTd>
                      <UserBadge tone={statusTone(t.status)}>{t.status}</UserBadge>
                    </UserTd>
                    <UserTd className="text-right font-bold text-ink">{formatMoney(t.amount)}</UserTd>
                    <UserTd className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <Link to={`/transactions/${t.id}`} className="text-xs font-semibold text-teal hover:underline">
                          Details →
                        </Link>
                        <Link to={`/transactions/${t.id}/invoice`} className="text-[11px] text-ink-soft hover:text-teal">
                          Invoice
                        </Link>
                      </div>
                    </UserTd>
                  </UserTr>)))}
            </tbody>
          </table>
        </UserTable>
        <UserPagination page={data?.page ?? 1} pages={data?.pages ?? 1} onPage={setPage}/>
      </div>
    </UserPage>);
}
