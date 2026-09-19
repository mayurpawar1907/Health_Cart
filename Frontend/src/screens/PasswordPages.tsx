import { useState } from 'react'
import { AuthFrame } from './LoginPage'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import api, { unwrap } from '@/services/api'
import { Link } from 'react-router-dom'

export function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [message, setMessage] = useState('')
  const [token, setToken] = useState('')

  async function submit() {
    const res = unwrap<{ message: string; resetToken?: string }>((await api.post('/auth/forgot-password', { identifier })).data)
    setMessage(res.message)
    setToken(res.resetToken ?? '')
  }

  return (
    <AuthFrame title="Forgot password" subtitle="We will issue a reset token for your account.">
      <div className="space-y-4">
        <Input label="Email or mobile" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        <Button className="w-full" onClick={submit}>Send reset link</Button>
        {message ? <p className="text-sm text-success">{message}</p> : null}
        {token ? (
          <p className="break-all rounded-2xl bg-teal-light p-3 text-xs">
            Dev reset token: {token}. Use it on the <Link className="text-teal" to="/reset-password">reset page</Link>.
          </p>
        ) : null}
      </div>
    </AuthFrame>
  )
}

export function ResetPasswordPage() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit() {
    setError('')
    try {
      const res = unwrap<{ message: string }>((await api.post('/auth/reset-password', { token, password })).data)
      setMessage(res.message)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message ?? 'Reset failed')
    }
  }

  return (
    <AuthFrame title="Reset password" subtitle="Paste your token and choose a new password.">
      <div className="space-y-4">
        <Input label="Token" value={token} onChange={(e) => setToken(e.target.value)} />
        <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {message ? <p className="text-sm text-success">{message}</p> : null}
        <Button className="w-full" onClick={submit}>Update password</Button>
        <Link to="/login" className="block text-center text-sm text-teal">Back to login</Link>
      </div>
    </AuthFrame>
  )
}
