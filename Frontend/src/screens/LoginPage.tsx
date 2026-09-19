import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import api, { unwrap } from '@/services/api'
import { setSession } from '@/store/authSlice'
import type { AuthUser } from '@/types'
import { useState, type ReactNode } from 'react'
import { Logo } from '@/components/brand/Logo'

const schema = z.object({
  identifier: z.string().min(3, 'Enter email or mobile'),
  password: z.string().min(1, 'Password is required'),
})

export function LoginPage() {
  const dispatch = useDispatch()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const registered = Boolean((location.state as { registered?: boolean } | null)?.registered)
  const prefill = (location.state as { email?: string } | null)?.email ?? ''
  const [error, setError] = useState('')
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { identifier: prefill, password: '' },
  })

  async function onSubmit(values: z.infer<typeof schema>) {
    setError('')
    try {
      const res = unwrap<{ accessToken: string; refreshToken: string; user: AuthUser }>(
        (await api.post('/auth/login', values)).data,
      )
      dispatch(setSession(res))
      await qc.invalidateQueries({ queryKey: ['tests'] })
      const from = (location.state as { from?: string } | null)?.from
      const next = from && from !== '/login' && from !== '/signup' ? from : '/home'
      navigate(res.user.role === 'ADMIN' || res.user.role === 'SUPER_ADMIN' ? '/admin' : next, { replace: true })
    } catch (e: unknown) {
      const err = e as {
        message?: string
        code?: string
        response?: { data?: { message?: string }; status?: number }
      }
      if (!err.response) {
        setError('Cannot reach the server. Start the backend: cd Backend && npm run start:dev (port 5000).')
        return
      }
      setError(err.response.data?.message ?? 'Unable to sign in')
    }
  }

  return (
    <AuthFrame title="Welcome back" subtitle="Sign in with your email or mobile to continue.">
      {registered ? (
        <p className="mb-4 rounded-2xl bg-teal-light px-4 py-3 text-sm text-teal-dark">
          Account created. Please log in to enter HealthID Card.
        </p>
      ) : null}
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Input label="Email or mobile" {...form.register('identifier')} error={form.formState.errors.identifier?.message} />
        <Input label="Password" type="password" {...form.register('password')} error={form.formState.errors.password?.message} />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button className="w-full" size="lg" type="submit">Log in</Button>
      </form>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link to="/forgot-password" className="text-teal">Forgot password?</Link>
        <Link to="/signup" className="font-medium text-teal">Create free account →</Link>
      </div>
      <div className="mt-8 space-y-1 text-xs text-ink-soft">
        <p>Demo customer: mayur@healthcart.com / Demo@1234</p>
        <p>Super admin: superadmin@healthidcard.com / Super@1234</p>
      </div>
    </AuthFrame>
  )
}

export function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid h-screen w-screen overflow-hidden app-mesh lg:grid-cols-2">
      <div className="relative hidden h-full overflow-hidden lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1929] via-[#1a4d6d] to-[#0f3349]" />
        <div className="relative p-12">
          <Logo variant="full" onDark />
        </div>
        <div className="relative max-w-lg px-12 pb-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-300">HealthID Card</p>
          <h2 className="mt-4 font-display text-5xl leading-[1.08] text-white">
            Simple home lab tests.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/60">
            Book tests, get home collection, and receive reports on WhatsApp — all in one place.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {['63+ tests', 'Free collection', 'Family card'].map((t) => (
              <div key={t} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center text-xs font-semibold text-white/80 backdrop-blur-sm">
                {t}
              </div>
            ))}
          </div>
        </div>
        <p className="relative px-12 pb-10 text-sm text-white/35">Care beyond borders</p>
      </div>
      <div className="flex h-full items-center overflow-y-auto px-6 py-10">
        <div className="mx-auto w-full max-w-[440px]">
          <div className="glass-panel mb-8 rounded-[28px] p-8 md:p-10">
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <Logo variant="compact" />
              <Link to="/" className="text-sm font-semibold text-teal">← Home</Link>
            </div>
            <h1 className="font-display text-3xl">{title}</h1>
            <p className="mt-2 mb-8 text-ink-soft">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
