import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'
import { AuthShell } from '@/components/auth/AuthShell'
import { AuthField, authInputCls, PasswordStrengthMeter } from '@/components/auth/authUtils'
import { useCitizenAuthStore } from '@/store/citizenAuthStore'
import { cn } from '@/lib/cn'

const schema = z
  .object({
    name: z.string().min(2, 'Enter your first name.'),
    email: z.string().min(1, 'Enter your email.').email('Enter a valid email address.'),
    password: z.string().min(8, 'Use at least 8 characters.'),
    confirm: z.string().min(1, 'Re-enter your password.'),
    legalAccepted: z.literal(true, { errorMap: () => ({ message: 'You must accept the Terms & Conditions and Privacy Policy.' }) }),
  })
  .refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Passwords do not match.' })

export default function CitizenRegister() {
  const navigate = useNavigate()
  const register = useCitizenAuthStore((s) => s.register)
  const [showPw, setShowPw] = useState(false)
  const [formError, setFormError] = useState('')

  const {
    register: field,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', password: '', confirm: '', legalAccepted: false } })

  const password = watch('password')

  const onSubmit = async (values) => {
    setFormError('')
    const res = await register(values)
    if (res.ok) {
      toast.success(`Welcome to PublicEye, ${values.name.split(' ')[0]}!`)
      navigate('/account', { replace: true })
    } else {
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

      <h2 className="mt-8 text-h2 font-bold text-ink lg:mt-0">Create your account</h2>
      <p className="mt-2 text-slate">Keep track of every issue you report.</p>

      {formError && (
        <div className="mt-5 flex items-start gap-2 rounded-card border border-critical/30 bg-critical/[0.06] p-3 text-sm text-critical">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <AuthField label="First name" error={errors.name?.message} icon={User}>
          <input type="text" autoComplete="given-name" placeholder="e.g. Adaeze" {...field('name')} className={authInputCls(errors.name)} />
        </AuthField>

        <AuthField label="Email" error={errors.email?.message} icon={Mail}>
          <input type="email" autoComplete="email" placeholder="you@example.com" {...field('email')} className={authInputCls(errors.email)} />
        </AuthField>

        <div>
          <AuthField label="Password" error={errors.password?.message} icon={Lock}>
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              {...field('password')}
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
          <PasswordStrengthMeter password={password} />
        </div>

        <AuthField label="Confirm password" error={errors.confirm?.message} icon={Lock}>
          <input type={showPw ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter your password" {...field('confirm')} className={authInputCls(errors.confirm)} />
        </AuthField>

        <label className="flex cursor-pointer items-start gap-3 rounded-card border border-line bg-surface p-3 text-sm text-slate">
          <input
            type="checkbox"
            {...field('legalAccepted')}
            className="mt-0.5 size-4 shrink-0 rounded border-line text-civic focus:ring-civic"
            aria-describedby={errors.legalAccepted ? 'legal-error' : undefined}
          />
          <span>
            I agree to the <Link to="/terms" className="font-semibold text-civic-600 hover:underline">Terms &amp; Conditions</Link> and acknowledge the <Link to="/privacy" className="font-semibold text-civic-600 hover:underline">Privacy Policy</Link>.
          </span>
        </label>
        {errors.legalAccepted && <p id="legal-error" className="-mt-2 text-sm font-medium text-critical">{errors.legalAccepted.message}</p>}

        <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-2">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-civic-600 hover:underline">
          Sign in
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-muted">
        <Link to="/report" className="hover:underline">
          Or report an issue without an account →
        </Link>
      </p>
    </AuthShell>
  )
}
