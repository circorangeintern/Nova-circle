import { cn } from '@/lib/cn'
import { STATUSES, SEVERITIES } from '@/lib/constants'

/**
 * StatusBadge — colour-coded report status pill. Colour + label together so
 * status is never conveyed by colour alone (Master PRD §15 accessibility).
 * `pulse` adds a live dot for newly reported issues.
 */
export function StatusBadge({ status = 'open', size = 'md', className }) {
  const s = STATUSES[status] ?? STATUSES.open
  const showPulse = status === 'open'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-[13px]',
        className,
      )}
      style={{ backgroundColor: s.tint, color: s.color }}
    >
      <span className="relative flex size-1.5">
        {showPulse && (
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ backgroundColor: s.color }}
          />
        )}
        <span className="relative inline-flex size-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      </span>
      {s.label}
    </span>
  )
}

/** SeverityBadge — Low / Medium / High / Critical (PRD §7.3). */
export function SeverityBadge({ severity = 'medium', className }) {
  const s = SEVERITIES[severity] ?? SEVERITIES.medium
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold', className)}
      style={{ backgroundColor: `${s.color}18`, color: s.color }}
    >
      {s.label}
    </span>
  )
}

/** Generic Badge for tags / counts. */
export function Badge({ children, variant = 'neutral', className }) {
  const styles = {
    neutral: 'bg-slate/[0.08] text-slate',
    civic: 'bg-civic/10 text-civic',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-[#B45309]',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
