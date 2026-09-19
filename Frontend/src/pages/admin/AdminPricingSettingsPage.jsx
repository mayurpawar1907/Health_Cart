import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { BadgePercent, Save, ShieldAlert } from 'lucide-react';
import api, { unwrap } from '@/api/client';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AdminPage, AdminPageHeader, AdminPanel, } from '@/components/admin/AdminUi';
export function AdminPricingSettingsPage() {
    const user = useSelector((s) => s.auth.user);
    const isSuper = user?.role === 'SUPER_ADMIN';
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['admin-pricing-settings'],
        queryFn: async () => unwrap((await api.get('/admin/settings/pricing')).data),
    });
    const [form, setForm] = useState(null);
    const [saved, setSaved] = useState(false);
    useEffect(() => {
        if (data)
            setForm(data);
    }, [data]);
    const save = useMutation({
        mutationFn: async (payload) => unwrap((await api.patch('/admin/settings/pricing', payload)).data),
        onSuccess: (updated) => {
            setForm(updated);
            setSaved(true);
            qc.invalidateQueries({ queryKey: ['admin-pricing-settings'] });
            qc.invalidateQueries({ queryKey: ['platform-pricing'] });
            setTimeout(() => setSaved(false), 2500);
        },
    });
    if (isLoading || !form)
        return <Loading label="Loading pricing settings"/>;
    if (!isSuper) {
        return (<AdminPage>
        <AdminPageHeader title="Payment promo settings" subtitle="Super admin access required"/>
        <div className="glass-panel flex items-start gap-3 rounded-3xl p-6 text-sm text-amber-900">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0"/>
          <p>Only super admins can change platform-wide payment discounts. Contact your super admin to adjust promo rules.</p>
        </div>
        <AdminPanel title="Current settings (read-only)">
          <SettingsPreview settings={form}/>
        </AdminPanel>
      </AdminPage>);
    }
    return (<AdminPage>
      <AdminPageHeader title="Payment promo settings" subtitle="Manage checkout discount applied on special price (not MRP)" actions={<Button className="rounded-xl" disabled={save.isPending} onClick={() => save.mutate({
                paymentPromoPercent: form.paymentPromoPercent,
                paymentPromoActive: form.paymentPromoActive,
                paymentPromoApplyToAllUsers: form.paymentPromoApplyToAllUsers,
                promoLabel: form.promoLabel,
            })}>
            <Save className="mr-2 h-4 w-4"/>
            {save.isPending ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
          </Button>}/>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Discount rules">
          <div className="space-y-5">
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-line/60 bg-white/60 px-4 py-3">
              <span className="text-sm font-semibold text-ink">Promo active</span>
              <input type="checkbox" checked={form.paymentPromoActive} onChange={(e) => setForm({ ...form, paymentPromoActive: e.target.checked })} className="h-5 w-5 rounded accent-teal"/>
            </label>

            <label className="flex items-center justify-between gap-4 rounded-2xl border border-line/60 bg-white/60 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-ink">Apply to all users</p>
                <p className="text-xs text-ink-soft">When off, only members get payment promo</p>
              </div>
              <input type="checkbox" checked={form.paymentPromoApplyToAllUsers} onChange={(e) => setForm({ ...form, paymentPromoApplyToAllUsers: e.target.checked })} className="h-5 w-5 rounded accent-teal"/>
            </label>

            <Input label="Discount percent (on special price)" type="number" min={0} max={100} value={form.paymentPromoPercent} onChange={(e) => setForm({ ...form, paymentPromoPercent: Number(e.target.value) })}/>

            <Input label="Promo label (shown in app)" value={form.promoLabel} onChange={(e) => setForm({ ...form, promoLabel: e.target.value })}/>
          </div>
        </AdminPanel>

        <AdminPanel title="Live preview">
          <SettingsPreview settings={form}/>
          {form.updatedAt ? (<p className="mt-4 text-xs text-ink-soft">
              Last updated {new Date(form.updatedAt).toLocaleString('en-IN')}
            </p>) : null}
        </AdminPanel>
      </div>
    </AdminPage>);
}
function SettingsPreview({ settings }) {
    const pct = settings.paymentPromoActive ? settings.paymentPromoPercent : 0;
    const sampleSpecial = 1000;
    const after = Math.round(sampleSpecial * (1 - pct / 100));
    return (<div className="rounded-2xl border border-[#e03a28]/20 bg-gradient-to-br from-[#fff5f4] to-teal-light/30 p-5">
      <div className="flex items-center gap-2">
        <BadgePercent className="h-5 w-5 text-[#e03a28]"/>
        <p className="font-semibold text-ink">{settings.promoLabel}</p>
      </div>
      <p className="mt-3 text-sm text-ink-soft">
        Status:{' '}
        <strong className={settings.paymentPromoActive ? 'text-emerald-600' : 'text-ink-soft'}>
          {settings.paymentPromoActive ? 'Active' : 'Inactive'}
        </strong>
        {' · '}
        Audience:{' '}
        <strong>{settings.paymentPromoApplyToAllUsers ? 'All users' : 'Members only'}</strong>
      </p>
      {settings.paymentPromoActive ? (<p className="mt-2 text-sm text-ink">
          Example: special price ₹{sampleSpecial.toLocaleString('en-IN')} → pay ~₹{after.toLocaleString('en-IN')} after {pct}% at checkout
        </p>) : (<p className="mt-2 text-sm text-ink-soft">No payment discount will be applied while inactive.</p>)}
    </div>);
}
