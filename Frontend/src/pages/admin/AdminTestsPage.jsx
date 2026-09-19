import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { unwrap } from '@/api/client';
import { formatMoney } from '@/utils/utils';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AdminPage, AdminPageHeader, AdminPanel, AdminSearch, AdminSelect, AdminTHead, AdminTh, AdminTr, AdminTd, AdminTable, AdminToolbar, Badge, EmptyRow, } from '@/components/admin/AdminUi';
function specialPrice(mrp, discount) {
    return Math.round(mrp * (1 - discount / 100));
}
export function AdminTestsPage() {
    const qc = useQueryClient();
    const [q, setQ] = useState('');
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        name: '',
        categoryId: '',
        shortDescription: '',
        description: '',
        preparation: 'Standard preparation.',
        sampleType: 'Blood',
        price: 0,
        specialPrice: 0,
        isPopular: false,
        isActive: true,
    });
    const tests = useQuery({
        queryKey: ['admin-tests', q],
        queryFn: async () => unwrap((await api.get('/admin/tests', { params: { q: q || undefined } })).data),
    });
    const categories = useQuery({
        queryKey: ['admin-categories'],
        queryFn: async () => unwrap((await api.get('/admin/categories')).data),
    });
    const save = useMutation({
        mutationFn: async () => {
            const payload = { ...form, description: form.description || form.shortDescription };
            if (editing)
                return api.patch(`/admin/tests/${editing.id}`, payload);
            return api.post('/admin/tests', payload);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-tests'] });
            setEditing(null);
            setCreating(false);
        },
    });
    const toggleActive = useMutation({
        mutationFn: ({ id, isActive }) => api.patch(`/admin/tests/${id}`, { isActive }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tests'] }),
    });
    const filtered = useMemo(() => tests.data ?? [], [tests.data]);
    function openEdit(t) {
        setEditing(t);
        setCreating(false);
        setForm({
            name: t.name,
            categoryId: t.category.id,
            shortDescription: t.name,
            description: t.name,
            preparation: 'Standard preparation.',
            sampleType: 'Blood',
            price: Number(t.price),
            specialPrice: specialPrice(Number(t.price), Number(t.discountPercent)),
            isPopular: t.isPopular,
            isActive: t.isActive,
        });
    }
    if (tests.isLoading)
        return <Loading label="Loading tests"/>;
    return (<AdminPage>
      <AdminPageHeader title="Tests & rates" subtitle={`${filtered.length} tests in catalog`} actions={<Button size="sm" className="rounded-xl" onClick={() => {
                setCreating(true);
                setEditing(null);
                setForm({ ...form, name: '', price: 0, specialPrice: 0, categoryId: categories.data?.[0]?.id ?? '' });
            }}>
            Add test
          </Button>}/>

      <AdminToolbar>
        <AdminSearch value={q} onChange={setQ} placeholder="Search tests…"/>
      </AdminToolbar>

      {(creating || editing) ? (<AdminPanel title={editing ? 'Edit test' : 'New test'} subtitle="Update MRP and HealthID Card special price">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Test name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
            <AdminSelect label="Category" value={form.categoryId} onChange={(categoryId) => setForm({ ...form, categoryId })}>
              {(categories.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </AdminSelect>
            <Input label="MRP (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}/>
            <Input label="Special price (₹)" type="number" value={form.specialPrice} onChange={(e) => setForm({ ...form, specialPrice: Number(e.target.value) })}/>
            <Input label="Short description" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="sm:col-span-2"/>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" className="rounded-xl" onClick={() => save.mutate()}>Save</Button>
            <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => { setEditing(null); setCreating(false); }}>Cancel</Button>
          </div>
        </AdminPanel>) : null}

      <AdminTable>
        <table className="w-full min-w-[900px] text-left text-sm">
          <AdminTHead>
            <AdminTh>Test</AdminTh>
            <AdminTh>Category</AdminTh>
            <AdminTh className="text-right">MRP</AdminTh>
            <AdminTh className="text-right">Special</AdminTh>
            <AdminTh>Flags</AdminTh>
            <AdminTh className="text-right">Actions</AdminTh>
          </AdminTHead>
          <tbody>
            {!filtered.length ? (<EmptyRow colSpan={6} message="No tests found"/>) : (filtered.map((t) => {
            const sp = specialPrice(Number(t.price), Number(t.discountPercent));
            return (<AdminTr key={t.id}>
                    <AdminTd className="font-semibold">{t.name}</AdminTd>
                    <AdminTd className="text-ink-soft">{t.category.name}</AdminTd>
                    <AdminTd className="text-right text-ink-soft line-through">{formatMoney(Number(t.price))}</AdminTd>
                    <AdminTd className="text-right font-bold text-teal">{formatMoney(sp)}</AdminTd>
                    <AdminTd>
                      {t.isPopular ? <Badge tone="warn">Popular</Badge> : null}{' '}
                      <Badge tone={t.isActive ? 'success' : 'danger'}>{t.isActive ? 'Active' : 'Off'}</Badge>
                    </AdminTd>
                    <AdminTd className="text-right">
                      <Button size="sm" variant="secondary" className="mr-2 rounded-xl" onClick={() => openEdit(t)}>Edit</Button>
                      <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => toggleActive.mutate({ id: t.id, isActive: !t.isActive })}>
                        {t.isActive ? 'Disable' : 'Enable'}
                      </Button>
                    </AdminTd>
                  </AdminTr>);
        }))}
          </tbody>
        </table>
      </AdminTable>
    </AdminPage>);
}
