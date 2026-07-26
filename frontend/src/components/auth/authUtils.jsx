import { cn } from '@/lib/cn'

/**
 * scorePassword — lightweight strength estimate that educates rather than
 * criticises (Master PRD §3.7). Returns { score 0-4, label, color }.
 */
export function scorePassword(pw = '') {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  score = Math.min(score, 4)
  const meta = [
    { label: 'Too short', color: '#DC2626' },
    { label: 'Weak', color: '#F97316' },
    { label: 'Fair', color: '#F59E0B' },
    { label: 'Strong', color: '#16A34A' },
    { label: 'Excellent', color: '#15803D' },
  ][score]
  return { score, ...meta }
}

export function PasswordStrengthMeter({ password }) {
  if (!password) return null
  const { score, label, color } = scorePassword(password)
  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ backgroundColor: i < score ? color : '#E5E7EB' }}
          />
        ))}
      </div>
      <p className="mt-1 text-xs font-medium" style={{ color }}>
        {label}
      </p>
    </div>
  )
}

/** AuthField — labelled input with leading icon, error text and optional slot. */
export function AuthField({ label, error, icon: Icon, children, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="relative mt-1.5">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />}
        {children}
      </div>
      {error ? (
        <span className="mt-1 block text-sm font-medium text-critical">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  )
}

export function authInputCls(error, hasIcon = true) {
  return cn(
    'h-12 w-full rounded-lg border bg-white pr-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-civic/30',
    hasIcon ? 'pl-10' : 'pl-3',
    error ? 'border-critical focus:border-critical' : 'border-line focus:border-civic',
  )
}
