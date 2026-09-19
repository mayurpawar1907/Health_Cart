import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Wallet } from 'lucide-react';
import api, { unwrap } from '@/api/client';
import { clearSession, updateUser } from '@/store/slices/authSlice';
import { formatMoney } from '@/utils/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { UserPage, UserPageHeader, UserPanel } from '@/components/user/UserUi';
export function ProfilePage() {
    const user = useSelector((s) => s.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const q = useQuery({
        queryKey: ['profile'],
        queryFn: async () => unwrap((await api.get('/users/profile')).data),
    });
    const family = useQuery({
        queryKey: ['family'],
        queryFn: async () => unwrap((await api.get('/family')).data),
    });
    const wallet = useQuery({
        queryKey: ['wallet'],
        queryFn: async () => unwrap((await api.get('/wallet')).data),
    });
    const [form, setForm] = useState({});
    const [locationMsg, setLocationMsg] = useState('');
    const [saveMsg, setSaveMsg] = useState('');
    const save = useMutation({
        mutationFn: async () => api.patch('/users/profile', {
            fullName: form.fullName ?? q.data?.fullName,
            dateOfBirth: form.dateOfBirth,
            gender: form.gender,
            avatarUrl: form.avatarUrl,
            language: q.data?.profile?.language,
            theme: form.theme ?? q.data?.profile?.theme,
            notificationsOn: form.notificationsOn ?? q.data?.profile?.notificationsOn,
            whatsappOn: form.whatsappOn ?? q.data?.profile?.whatsappOn,
            locationLat: form.locationLat ?? q.data?.profile?.locationLat,
            locationLng: form.locationLng ?? q.data?.profile?.locationLng,
            line1: form.line1 ?? q.data?.addresses[0]?.line1,
            city: form.city ?? q.data?.addresses[0]?.city,
            state: form.state ?? q.data?.addresses[0]?.state,
            pincode: form.pincode ?? q.data?.addresses[0]?.pincode,
        }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['profile'] });
            const nextName = form.fullName ?? q.data?.fullName;
            if (nextName)
                dispatch(updateUser({ fullName: nextName }));
            setSaveMsg('Profile saved successfully');
            setTimeout(() => setSaveMsg(''), 3000);
        },
        onError: () => setSaveMsg('Could not save profile. Please try again.'),
    });
    async function logout(all = false) {
        try {
            await api.post(all ? '/auth/logout-all' : '/auth/logout', { refreshToken: localStorage.getItem('hc_refresh') });
        }
        finally {
            dispatch(clearSession());
            navigate('/login');
        }
    }
    async function onPhoto(file) {
        const reader = new FileReader();
        reader.onload = () => setForm((f) => ({ ...f, avatarUrl: String(reader.result) }));
        reader.readAsDataURL(file);
    }
    function shareLocation() {
        navigator.geolocation?.getCurrentPosition((pos) => {
            setForm((f) => ({ ...f, locationLat: pos.coords.latitude, locationLng: pos.coords.longitude }));
            setLocationMsg('Location captured. Save profile to enable home delivery.');
        }, () => setLocationMsg('Could not access location.'));
    }
    if (q.isLoading || !q.data)
        return <Loading />;
    const p = q.data;
    const addr = p.addresses[0];
    return (<UserPage className="max-w-3xl">
      <UserPageHeader title="Profile" subtitle="Personal details, address, and preferences" actions={<Link to="/wallet">
            <Button variant="secondary" className="rounded-xl">
              <Wallet className="mr-2 h-4 w-4"/>
              Wallet {wallet.data ? formatMoney(wallet.data.totalSpendable) : ''}
            </Button>
          </Link>}/>

      {wallet.data ? (<Link to="/wallet" className="block rounded-2xl border border-teal/20 bg-gradient-to-r from-teal-light/50 to-white p-4 transition hover:border-teal/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal">HealthID Wallet</p>
              <p className="mt-1 font-display text-2xl text-ink">{formatMoney(wallet.data.totalSpendable)}</p>
              <p className="mt-0.5 text-xs text-ink-soft">
                {formatMoney(wallet.data.balance)} balance · {formatMoney(wallet.data.referralBalance)} referral
              </p>
            </div>
            <p className="font-mono text-sm font-bold text-teal">{wallet.data.referralCode}</p>
          </div>
        </Link>) : null}

      <UserPanel title="Personal information">
        <div className="flex items-center gap-4">
          {form.avatarUrl ?? p.avatarUrl ? (<img src={form.avatarUrl ?? p.avatarUrl ?? ''} alt="" className="h-16 w-16 rounded-full bg-teal object-cover"/>) : (<span className="grid h-16 w-16 place-items-center rounded-full bg-teal text-xl font-bold text-white">
              {p.fullName?.[0]?.toUpperCase() ?? '?'}
            </span>)}
          <label className="text-sm text-teal">
            Update photo
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onPhoto(e.target.files[0])}/>
          </label>
        </div>
        <Input label="Name" defaultValue={p.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}/>
        <Input label="Email" defaultValue={p.email} disabled/>
        <Input label="Mobile (WhatsApp)" defaultValue={p.mobile} disabled/>
        <Input label="Date of birth" type="date" defaultValue={p.dateOfBirth?.slice(0, 10)} onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}/>
      </UserPanel>

      <UserPanel title="Home collection address" subtitle="Required for free sample pickup">
        <Input label="Address" defaultValue={addr?.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}/>
        <div className="grid gap-3 md:grid-cols-3">
          <Input label="City" defaultValue={addr?.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}/>
          <Input label="State" defaultValue={addr?.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}/>
          <Input label="Pincode" defaultValue={addr?.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}/>
        </div>
        <Button variant="secondary" onClick={shareLocation}>Share current location</Button>
        {locationMsg ? <p className="text-sm text-teal">{locationMsg}</p> : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button className="rounded-xl" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? 'Saving…' : 'Save profile'}
          </Button>
          {saveMsg ? (<p className={`text-sm ${saveMsg.includes('success') ? 'text-emerald-700' : 'text-brand-red'}`}>{saveMsg}</p>) : null}
        </div>
      </UserPanel>

      <UserPanel title="Family members" subtitle="Manage members on your HealthID Card">
        <div className="space-y-2">
          {(family.data ?? []).map((f) => (<div key={f.id} className="flex items-center justify-between rounded-2xl border border-line px-4 py-3 text-sm">
              <span>{f.name} · {f.relation}{f.age ? ` · ${f.age} yrs` : ''}</span>
            </div>))}
          {!family.data?.length ? <p className="text-sm text-ink-soft">No family members yet. Add them from your HealthID Card.</p> : null}
        </div>
        <Link to="/home?edit=card" className="text-sm font-semibold text-teal hover:underline">Manage family on HealthID Card →</Link>
      </UserPanel>

      <UserPanel title="Notifications">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked={p.profile?.notificationsOn} onChange={(e) => setForm((f) => ({ ...f, notificationsOn: e.target.checked }))}/>
          In-app notifications
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked={p.profile?.whatsappOn ?? true} onChange={(e) => setForm((f) => ({ ...f, whatsappOn: e.target.checked }))}/>
          <MessageCircle className="h-4 w-4 text-teal"/> WhatsApp updates (bookings, reminders, reports)
        </label>
        <Link to="/notifications" className="text-sm font-semibold text-teal hover:underline">View all notifications →</Link>
        <Link to="/reminders" className="text-sm font-semibold text-teal hover:underline">Manage reminders →</Link>
        <select className="w-full rounded-2xl border border-line/80 bg-white/90 px-4 py-3 text-sm outline-none focus:border-teal" defaultValue={p.profile?.theme} onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}>
          <option value="system">Theme: System</option>
          <option value="light">Theme: Light</option>
          <option value="dark">Theme: Dark</option>
        </select>
      </UserPanel>

      <UserPanel title="Security">
        <ChangePasswordForm />
        <Sessions />
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => logout(false)}>Logout</Button>
          <Button variant="danger" onClick={() => logout(true)}>Logout all devices</Button>
        </div>
        {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (<Link to="/admin" className="text-sm font-semibold text-teal hover:underline">Open operations console →</Link>) : null}
      </UserPanel>
    </UserPage>);
}
function ChangePasswordForm() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    async function submit() {
        try {
            await api.post('/users/change-password', { currentPassword, newPassword });
            setMessage('Password updated');
            setCurrentPassword('');
            setNewPassword('');
        }
        catch {
            setMessage('Could not change password');
        }
    }
    return (<div className="grid gap-3 md:grid-cols-2">
      <Input label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}/>
      <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
      <Button type="button" variant="secondary" onClick={submit}>Change password</Button>
      {message ? <p className="text-sm text-ink-soft">{message}</p> : null}
    </div>);
}
function Sessions() {
    const q = useQuery({
        queryKey: ['sessions'],
        queryFn: async () => unwrap((await api.get('/auth/sessions')).data),
    });
    if (!q.data?.length)
        return <p className="text-sm text-ink-soft">No other active sessions.</p>;
    return (<div className="space-y-2">
      {q.data.map((s) => (<p key={s.id} className="text-sm text-ink-soft">{s.userAgent ?? 'Device'} · {new Date(s.createdAt).toLocaleString()}</p>))}
    </div>);
}
