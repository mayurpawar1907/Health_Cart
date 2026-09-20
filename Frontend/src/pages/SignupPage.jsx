import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { AuthFrame } from '@/components/auth/AuthFrame'
import { AuthForm, AuthFormFooter, AuthFormRow, AuthFormSection } from '@/components/auth/AuthForm'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import api from '@/api/client'

const schema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email'),
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile required'),
    password: z
      .string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, '8+ chars with upper, lower, and number'),
    confirmPassword: z.string(),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
    referralCode: z.string().optional(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const field = { compact: true }

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
      gender: 'PREFER_NOT_TO_SAY',
      referralCode: '',
    },
  })

  async function onSubmit(values) {
    setError('')
    try {
      await api.post('/auth/signup', values)
      localStorage.removeItem('hc_user')
      localStorage.removeItem('hc_access')
      localStorage.removeItem('hc_refresh')
      navigate('/login', { replace: true, state: { registered: true, email: values.email } })
    } catch (e) {
      const err = e
      setError(err.response?.data?.message ?? 'Unable to create account')
    }
  }

  return (
    <AuthFrame
      wide
      compact
      title="Create your account"
      subtitle="Free HealthID Card — member rates and home collection after sign in."
    >
      <AuthForm onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <AuthFormSection title="Personal details">
          <Input
            label="Full name"
            autoComplete="name"
            placeholder="As on your ID"
            {...field}
            {...form.register('fullName')}
            error={form.formState.errors.fullName?.message}
          />

          <AuthFormRow>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              {...field}
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />
            <Input
              label="Mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="10-digit number"
              maxLength={10}
              {...field}
              {...form.register('mobile')}
              error={form.formState.errors.mobile?.message}
            />
          </AuthFormRow>

          <AuthFormRow>
            <Input
              label="Date of birth"
              type="date"
              autoComplete="bday"
              {...field}
              {...form.register('dateOfBirth')}
              error={form.formState.errors.dateOfBirth?.message}
            />
            <Select label="Gender" {...field} {...form.register('gender')}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </Select>
          </AuthFormRow>
        </AuthFormSection>

        <AuthFormSection title="Account security" divided>
          <AuthFormRow>
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              {...field}
              {...form.register('password')}
              error={form.formState.errors.password?.message}
            />
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter password"
              {...field}
              {...form.register('confirmPassword')}
              error={form.formState.errors.confirmPassword?.message}
            />
          </AuthFormRow>
          <p className="text-[11px] leading-snug text-ink-soft">
            Uppercase, lowercase, and a number · min. 8 characters
          </p>
        </AuthFormSection>

        <AuthFormSection divided>
          <Input
            label="Referral code (optional)"
            placeholder="Friend's HealthID code"
            {...field}
            {...form.register('referralCode')}
          />
        </AuthFormSection>

        {error ? (
          <p className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2.5 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <Button className="w-full" size="lg" type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </AuthForm>

      <AuthFormFooter>
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-teal hover:underline">
          Log in
        </Link>
      </AuthFormFooter>
    </AuthFrame>
  )
}
