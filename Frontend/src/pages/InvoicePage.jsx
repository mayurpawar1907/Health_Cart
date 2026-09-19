import { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import api, { unwrap } from '@/api/client';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { InvoiceDocument } from '@/components/payments/InvoiceDocument';
import { UserPage, UserPageHeader } from '@/components/user/UserUi';
export function InvoicePage({ mode }) {
    const { id } = useParams();
    const printRef = useRef(null);
    const invoiceApi = mode === 'admin' ? `/admin/payments/${id}/invoice` : `/payments/transactions/${id}/invoice`;
    const backTo = mode === 'admin' ? `/admin/payments/${id}` : `/transactions/${id}`;
    const { data, isLoading, isError } = useQuery({
        queryKey: ['invoice', mode, id],
        enabled: Boolean(id),
        queryFn: async () => unwrap((await api.get(invoiceApi)).data),
    });
    function handlePrint() {
        window.print();
    }
    if (isLoading)
        return <Loading label="Loading invoice"/>;
    if (isError || !data) {
        return (<UserPage>
        <p className="text-sm text-ink-soft">Invoice not found.</p>
        <Link to={mode === 'admin' ? '/admin/payments' : '/transactions'} className="mt-4 inline-block text-teal hover:underline">
          ← Back
        </Link>
      </UserPage>);
    }
    return (<UserPage className="print:max-w-none print:p-0">
      <div className="print:hidden">
        <UserPageHeader title="Invoice" subtitle={data.invoiceNumber} actions={<div className="flex flex-wrap gap-2">
              <Link to={backTo}>
                <Button variant="secondary" className="rounded-xl">
                  <ArrowLeft className="mr-2 h-4 w-4"/>
                  Payment detail
                </Button>
              </Link>
              <Button variant="secondary" className="rounded-xl" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4"/>
                Print / Save PDF
              </Button>
              <Button className="rounded-xl" onClick={handlePrint}>
                <Download className="mr-2 h-4 w-4"/>
                Download
              </Button>
            </div>}/>
      </div>

      <InvoiceDocument ref={printRef} invoice={data} variant={mode}/>
    </UserPage>);
}
