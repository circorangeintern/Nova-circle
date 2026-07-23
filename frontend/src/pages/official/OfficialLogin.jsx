import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/cn'

const schema = z.object({
  email: z.string().min(1, 'Enter your official email.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

/** Official login (Master PRD §3.7). Uses RHF + Zod. Mock auth for MVP. */
export default function OfficialLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
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
      navigate(location.state?.from ?? '/official/dashboard', { replace: true })
    } else {
      setFormError(res.error)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-navy-900 via-civic-600 to-civic-500 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/">
          <Logo />
        </Link>
        <div>
          <ShieldCheck className="size-10 text-white/90" />
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight">
            The government portal for transparent infrastructure response.
          </h1>
          <p className="mt-3 max-w-md text-white/80">
            Acknowledge reports, update their status, and respond to your community in the open —
            where accountability is visible to everyone.
          </p>
        </div>
        <p className="text-sm text-white/60">Authorized officials only · All actions are auditable.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-surface p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Link to="/">
              <Logo onDark={false} />
            </Link>
          </div>

          <h2 className="mt-8 text-h2 font-bold text-ink lg:mt-0">Official Login</h2>
          <p className="mt-2 text-slate">Sign in to manage reports in your jurisdiction.</p>

          {formError && (
            <div className="mt-5 flex items-start gap-2 rounded-card border border-critical/30 bg-critical/[0.06] p-3 text-sm text-critical">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <Field label="Official email" error={errors.email?.message} icon={Mail}>
              <input
                type="email"
                autoComplete="email"
                placeholder="official@publiceye.ng"
                {...register('email')}
                className={inputCls(errors.email)}
              />
            </Field>

            <Field label="Password" error={errors.password?.message} icon={Lock}>
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your password"
                {...register('password')}
                className={cn(inputCls(errors.password), 'pr-11')}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-slate"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </Field>

            <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-2">
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {/* Demo hint — remove once real auth is wired */}
          <div className="mt-6 rounded-card border border-line bg-white p-3 text-xs text-muted">
            <span className="font-semibold text-slate">Demo login:</span> official@publiceye.ng · publiceye
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            <Link to="/" className="font-medium text-civic-600 hover:underline">
              ← Back to public site
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="relative mt-1.5">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />}
        {children}
      </div>
      {error && <span className="mt-1 block text-sm font-medium text-critical">{error}</span>}
    </label>
  )
}

function inputCls(error) {
  return cn(
    'h-12 w-full rounded-lg border bg-white pl-10 pr-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-civic/30',
    error ? 'border-critical focus:border-critical' : 'border-line focus:border-civic',
  )
}
