import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { AuthFrame } from './LoginPage'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import api from '@/services/api'
import { useState } from 'react'

const schema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile'),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, '8+ chars with upper, lower, number'),
    confirmPassword: z.string(),
    dateOfBirth: z.string().min(1),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
    referralCode: z.string().optional(),
  })
  .refine((v) => v.password === v.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

export function SignupPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      gender: 'PREFER_NOT_TO_SAY' as const,
      referralCode: '',
    },
  })

  async function onSubmit(values: z.infer<typeof schema>) {
    setError('')
    try {
      await api.post('/auth/signup', values)
      localStorage.removeItem('hc_user')
      localStorage.removeItem('hc_access')
      localStorage.removeItem('hc_refresh')
      navigate('/login', { replace: true, state: { registered: true, email: values.email } })
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message ?? 'Unable to create account')
    }
  }

  return (
    <AuthFrame title="Create your account" subtitle="After signup you will be asked to log in before entering HealthID Card.">
      <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <Input label="Full name" {...form.register('fullName')} error={form.formState.errors.fullName?.message} />
        <Input label="Email" type="email" {...form.register('email')} error={form.formState.errors.email?.message} />
        <Input label="Mobile" {...form.register('mobile')} error={form.formState.errors.mobile?.message} />
        <Input label="Date of birth" type="date" {...form.register('dateOfBirth')} error={form.formState.errors.dateOfBirth?.message} />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink-soft">Gender</span>
          <select className="w-full rounded-2xl border border-line bg-white px-4 py-3" {...form.register('gender')}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </label>
        <Input label="Password" type="password" {...form.register('password')} error={form.formState.errors.password?.message} />
        <Input label="Confirm password" type="password" {...form.register('confirmPassword')} error={form.formState.errors.confirmPassword?.message} />
        <Input label="Referral code (optional)" placeholder="Friend's HealthID code" {...form.register('referralCode')} />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button className="w-full" size="lg" type="submit">Create account</Button>
      </form>
      <p className="mt-4 text-sm text-ink-soft">Already have an account? <Link to="/login" className="text-teal">Log in</Link></p>
    </AuthFrame>
  )
}
