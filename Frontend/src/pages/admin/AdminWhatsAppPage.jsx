import { useQuery } from '@tanstack/react-query';
import api, { unwrap } from '@/api/client';
import { formatDate } from '@/utils/utils';
import { Loading } from '@/components/ui/Loading';
import { AdminPage, AdminPageHeader, AdminTHead, AdminTh, AdminTr, AdminTd, AdminTable, Badge, } from '@/components/admin/AdminUi';
export function AdminWhatsAppPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-whatsapp'],
        queryFn: async () => unwrap((await api.get('/admin/whatsapp')).data),
    });
    if (isLoading)
        return <Loading label="Loading messages"/>;
    return (<AdminPage>
      <AdminPageHeader title="WhatsApp log" subtitle="Outbound customer messages (simulated delivery in dev)"/>

      <AdminTable>
        <table className="w-full min-w-[800px] text-left text-sm">
          <AdminTHead>
            <AdminTh>When</AdminTh>
            <AdminTh>Customer</AdminTh>
            <AdminTh>Template</AdminTh>
            <AdminTh>Message</AdminTh>
            <AdminTh>Status</AdminTh>
          </AdminTHead>
          <tbody>
            {(data ?? []).map((m) => (<AdminTr key={m.id}>
                <AdminTd className="text-ink-soft">{formatDate(m.createdAt)}</AdminTd>
                <AdminTd>
                  <p className="font-semibold">{m.user.fullName}</p>
                  <p className="text-xs text-ink-soft">{m.mobile}</p>
                </AdminTd>
                <AdminTd><Badge tone="teal">{m.template}</Badge></AdminTd>
                <AdminTd className="max-w-md text-xs text-ink-soft">{m.body}</AdminTd>
                <AdminTd><Badge tone="success">{m.status}</Badge></AdminTd>
              </AdminTr>))}
          </tbody>
        </table>
      </AdminTable>
    </AdminPage>);
}
