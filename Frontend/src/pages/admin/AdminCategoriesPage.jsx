import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/api/client';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AdminPage, AdminPageHeader, AdminPanel, AdminTHead, AdminTh, AdminTr, AdminTd, AdminTable, Badge, } from '@/components/admin/AdminUi';
export function AdminCategoriesPage() {
    const qc = useQueryClient();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const { data, isLoading } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: async () => unwrap((await api.get('/admin/categories')).data),
    });
    const create = useMutation({
        mutationFn: () => api.post('/admin/categories', { name, description }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-categories'] });
            setName('');
            setDescription('');
        },
    });
    const toggle = useMutation({
        mutationFn: ({ id, isActive }) => api.patch(`/admin/categories/${id}`, { isActive }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
    });
    if (isLoading)
        return <Loading label="Loading categories"/>;
    return (<AdminPage>
      <AdminPageHeader title="Categories" subtitle="Organize tests by clinical area"/>

      <AdminPanel title="Add category" subtitle="Create a new test grouping">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)}/>
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)}/>
        </div>
        <Button size="sm" className="mt-4 rounded-xl" disabled={!name.trim()} onClick={() => create.mutate()}>Create</Button>
      </AdminPanel>

      <AdminTable>
        <table className="w-full text-left text-sm">
          <AdminTHead>
            <AdminTh>Name</AdminTh>
            <AdminTh>Tests</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh className="text-right">Actions</AdminTh>
          </AdminTHead>
          <tbody>
            {(data ?? []).map((c) => (<AdminTr key={c.id}>
                <AdminTd>
                  <p className="font-semibold">{c.name}</p>
                  {c.description ? <p className="text-xs text-ink-soft">{c.description}</p> : null}
                </AdminTd>
                <AdminTd>{c._count.tests}</AdminTd>
                <AdminTd><Badge tone={c.isActive ? 'success' : 'danger'}>{c.isActive ? 'Active' : 'Off'}</Badge></AdminTd>
                <AdminTd className="text-right">
                  <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => toggle.mutate({ id: c.id, isActive: !c.isActive })}>
                    {c.isActive ? 'Disable' : 'Enable'}
                  </Button>
                </AdminTd>
              </AdminTr>))}
          </tbody>
        </table>
      </AdminTable>
    </AdminPage>);
}
