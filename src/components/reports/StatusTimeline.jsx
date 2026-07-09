import { Check } from 'lucide-react'
import { STATUSES } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/cn'

// Canonical lifecycle order (PRD §5.4 status timeline)
const STAGES = [
  { key: 'open', label: 'Submitted' },
  { key: 'acknowledged', label: 'Acknowledged' },
  { key: 'progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
]

/**
 * StatusTimeline — chronological lifecycle of a report. Completed stages get a
 * filled civic dot; pending stages a hollow dot. Events carry date + note +
 * responsible party. This is the platform's core trust-building component.
 */
export function StatusTimeline({ events = [], currentStatus = 'open' }) {
  const eventByStatus = Object.fromEntries(events.map((e) => [e.status, e]))
  // Everything up to and including the current status is "complete".
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus)
  const reachedIndex = currentStatus === 'disputed' ? 1 : currentIndex

  return (
    <ol className="relative">
      {STAGES.map((stage, i) => {
        const done = i <= reachedIndex
        const evt = eventByStatus[stage.key]
        const color = STATUSES[stage.key].color
        const isLast = i === STAGES.length - 1
        return (
          <li key={stage.key} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Connector line */}
            {!isLast && (
              <span
                className={cn(
                  'absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5',
                  done ? 'bg-civic-500' : 'border-l-2 border-dashed border-line',
                )}
              />
            )}
            {/* Dot */}
            <span
              className={cn(
                'relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2',
                done ? 'border-transparent text-white' : 'border-line bg-white',
              )}
              style={done ? { backgroundColor: color } : undefined}
            >
              {done && <Check className="size-3.5" strokeWidth={3} />}
            </span>
            {/* Content */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('font-semibold', done ? 'text-ink' : 'text-muted')}>
                  {stage.label}
                </span>
                {evt && <span className="font-data text-xs text-muted">{formatDateTime(evt.date)}</span>}
                {!done && <span className="text-xs text-muted">— pending</span>}
              </div>
              {evt?.note && (
                <p className="mt-1.5 rounded-lg bg-surface px-3 py-2 text-sm text-slate">
                  “{evt.note}”
                  {evt.party && <span className="mt-1 block text-xs font-medium text-muted">— {evt.party}</span>}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
