import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api, { unwrap } from '@/api/client';
import { formatDate } from '@/utils/utils';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { AdminPage, AdminPageHeader, AdminPagination, AdminSearch, AdminSelect, AdminTHead, AdminTh, AdminTr, AdminTd, AdminTable, AdminToolbar, Badge, EmptyRow, } from '@/components/admin/AdminUi';
export function AdminCustomersPage() {
    const qc = useQueryClient();
    const actor = useSelector((s) => s.auth.user);
    const [q, setQ] = useState('');
    const [page, setPage] = useState(1);
    const [roleFilter, setRoleFilter] = useState('');
    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', q, page, roleFilter],
        queryFn: async () => unwrap((await api.get('/admin/users', { params: { q: q || undefined, page, role: roleFilter || undefined } })).data),
    });
    const toggle = useMutation({
        mutationFn: ({ id, isActive }) => api.patch(`/admin/users/${id}/active`, { isActive }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
    });
    const setRole = useMutation({
        mutationFn: ({ id, role }) => api.patch(`/admin/users/${id}`, { role }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
    });
    if (isLoading)
        return <Loading label="Loading customers"/>;
    return (<AdminPage>
      <AdminPageHeader title="Customers" subtitle={`${data?.total ?? 0} registered users`}/>

      <AdminToolbar>
        <AdminSearch value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search name, email, mobile…"/>
        <AdminSelect value={roleFilter} onChange={(v) => { setRoleFilter(v); setPage(1); }}>
          <option value="">All roles</option>
          <option value="USER">Customers</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </AdminSelect>
      </AdminToolbar>

      <AdminTable>
        <table className="w-full min-w-[800px] text-left text-sm">
          <AdminTHead>
            <AdminTh>Customer</AdminTh>
            <AdminTh>Mobile</AdminTh>
            <AdminTh>Role</AdminTh>
            <AdminTh>Bookings</AdminTh>
            <AdminTh>Joined</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh className="text-right">Actions</AdminTh>
          </AdminTHead>
          <tbody>
            {!data?.items.length ? (<EmptyRow colSpan={7} message="No customers found"/>) : (data.items.map((u) => (<AdminTr key={u.id}>
                  <AdminTd>
                    <Link to={`/admin/customers/${u.id}`} className="font-semibold text-teal hover:underline">{u.fullName}</Link>
                    <p className="text-xs text-ink-soft">{u.email}</p>
                  </AdminTd>
                  <AdminTd>{u.mobile}</AdminTd>
                  <AdminTd>
                    {actor?.role === 'SUPER_ADMIN' && u.role !== 'SUPER_ADMIN' ? (<AdminSelect value={u.role} onChange={(role) => setRole.mutate({ id: u.id, role })} className="text-xs py-1.5">
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      </AdminSelect>) : (<Badge tone={u.role === 'USER' ? 'default' : 'teal'}>{u.role.replace('_', ' ')}</Badge>)}
                  </AdminTd>
                  <AdminTd>{u._count.appointments}</AdminTd>
                  <AdminTd className="text-ink-soft">{formatDate(u.createdAt)}</AdminTd>
                  <AdminTd>
                    <Badge tone={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                  </AdminTd>
                  <AdminTd className="text-right">
                    <Button size="sm" variant="secondary" className="rounded-xl" disabled={u.id === actor?.id} onClick={() => toggle.mutate({ id: u.id, isActive: !u.isActive })}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </AdminTd>
                </AdminTr>)))}
          </tbody>
        </table>
      </AdminTable>

      {data ? <AdminPagination page={page} pages={data.pages} onPage={setPage}/> : null}
    </AdminPage>);
}
