import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'
import { AuthShell } from '@/components/auth/AuthShell'
import { AuthField, authInputCls } from '@/components/auth/authUtils'
import { useCitizenAuthStore } from '@/store/citizenAuthStore'
import { cn } from '@/lib/cn'
import { identify, trackCitizenLoginSucceeded, trackCitizenLoginFailed } from '@/lib/analytics'

const schema = z.object({
  email: z.string().min(1, 'Enter your email.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

export default function CitizenLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useCitizenAuthStore((s) => s.login)
  const [showPw, setShowPw] = useState(false)
  const [formError, setFormError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })

  const onSubmit = async (values) => {
    setFormError('')
    const res = await login(values)
    if (res.ok) {
      const user = useCitizenAuthStore.getState().user
      if (user) identify(user.id, { name: user.name, email: user.email, role: 'citizen' })
      trackCitizenLoginSucceeded()
      toast.success('Signed in.')
      navigate(location.state?.from ?? '/account', { replace: true })
    } else {
      trackCitizenLoginFailed(res.error)
      setFormError(res.error)
    }
  }

  return (
    <AuthShell>
      <div className="lg:hidden">
        <Link to="/">
          <Logo onDark={false} />
        </Link>
      </div>

      <h2 className="mt-8 text-h2 font-bold text-ink lg:mt-0">Welcome back</h2>
      <p className="mt-2 text-slate">Sign in to track the issues you've reported.</p>

      {formError && (
        <div className="mt-5 flex items-start gap-2 rounded-card border border-critical/30 bg-critical/[0.06] p-3 text-sm text-critical">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <AuthField label="Email" error={errors.email?.message} icon={Mail}>
          <input type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} className={authInputCls(errors.email)} />
        </AuthField>

        <AuthField label="Password" error={errors.password?.message} icon={Lock}>
          <input
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Your password"
            {...register('password')}
            className={cn(authInputCls(errors.password), 'pr-11')}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-slate"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </AuthField>

        <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-2">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate">
        New to PublicEye?{' '}
        <Link to="/register" className="font-semibold text-civic-600 hover:underline">
          Create an account
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-muted">
        <Link to="/terms" className="hover:underline">Terms &amp; Conditions</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
      </p>
      <p className="mt-3 text-center text-xs text-muted">
        <Link to="/report" className="hover:underline">
          Or report an issue without an account →
        </Link>
      </p>
    </AuthShell>
  )
}
