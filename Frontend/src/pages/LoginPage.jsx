import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api, { unwrap } from '@/api/client';
import { setSession } from '@/store/slices/authSlice';
import { useState } from 'react';
import { AuthFrame } from '@/components/auth/AuthFrame';
const schema = z.object({
    identifier: z.string().min(3, 'Enter email or mobile'),
    password: z.string().min(1, 'Password is required'),
});
export function LoginPage() {
    const dispatch = useDispatch();
    const qc = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();
    const registered = Boolean(location.state?.registered);
    const prefill = location.state?.email ?? '';
    const [error, setError] = useState('');
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { identifier: prefill, password: '' },
    });
    async function onSubmit(values) {
        setError('');
        try {
            const res = unwrap((await api.post('/auth/login', values)).data);
            dispatch(setSession(res));
            await qc.invalidateQueries({ queryKey: ['tests'] });
            const from = location.state?.from;
            const next = from && from !== '/login' && from !== '/signup' ? from : '/home';
            navigate(res.user.role === 'ADMIN' || res.user.role === 'SUPER_ADMIN' ? '/admin' : next, { replace: true });
        }
        catch (e) {
            const err = e;
            if (!err.response) {
                setError('Cannot reach the server. Start the backend: cd Backend && npm run start:dev (port 5000).');
                return;
            }
            setError(err.response.data?.message ?? 'Unable to sign in');
        }
    }
    return (<AuthFrame compact title="Welcome back" subtitle="Sign in with your email or mobile to continue.">
      {registered ? (<p className="mb-3 rounded-xl bg-teal-light px-3 py-2.5 text-sm text-teal-dark">
          Account created. Please log in to enter HealthID Card.
        </p>) : null}
      <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <Input compact label="Email or mobile" {...form.register('identifier')} error={form.formState.errors.identifier?.message}/>
        <Input compact label="Password" type="password" {...form.register('password')} error={form.formState.errors.password?.message}/>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button className="w-full" size="lg" type="submit">Log in</Button>
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <Link to="/forgot-password" className="text-teal">Forgot password?</Link>
        <Link to="/signup" className="font-medium text-teal">Create free account →</Link>
      </div>
      <div className="mt-5 space-y-0.5 border-t border-line/40 pt-4 text-[11px] leading-snug text-ink-soft">
        <p>Demo customer: mayur@healthcart.com / Demo@1234</p>
        <p>Super admin: superadmin@healthidcard.com / Super@1234</p>
      </div>
    </AuthFrame>);
}
