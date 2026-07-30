import { FileText, CheckCircle2, Loader, Eye, Megaphone } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { CountUp } from '@/components/common/CountUp'
import { STATUSES } from '@/lib/constants'
import { cn } from '@/lib/cn'

/**
 * SummaryCards — the five at-a-glance metrics that open the Public
 * Accountability Dashboard (Feature 1):
 *   Total · Resolved · In Progress · Acknowledged · Reported (Pending)
 *
 * Every count except the total is coloured with its status token, so the cards
 * read as the same vocabulary used by the pills, the map pins and the legend.
 */

const CARDS = [
  {
    key: 'total',
    label: 'Total Reports',
    hint: 'Published to date',
    icon: FileText,
    color: '#1D4ED8',
    tint: '#E8EEFC',
  },
  {
    key: 'resolved',
    label: 'Resolved',
    hint: 'Work completed',
    icon: CheckCircle2,
    color: STATUSES.resolved.color,
    tint: STATUSES.resolved.tint,
  },
  {
    key: 'inProgress',
    label: 'In Progress',
    hint: 'Being fixed now',
    icon: Loader,
    color: STATUSES.progress.color,
    tint: STATUSES.progress.tint,
  },
  {
    key: 'acknowledged',
    label: 'Acknowledged',
    hint: 'Seen by an official',
    icon: Eye,
    color: STATUSES.acknowledged.color,
    tint: STATUSES.acknowledged.tint,
  },
  {
    key: 'reported',
    label: 'Reported',
    hint: 'Awaiting a response',
    icon: Megaphone,
    color: STATUSES.open.color,
    tint: STATUSES.open.tint,
  },
]

export function SummaryCards({ summary, className }) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5',
        className,
      )}
    >
      {CARDS.map(({ key, label, hint, icon: Icon, color, tint }) => (
        <Card key={key} className="p-4 sm:p-5">
          <span
            className="grid size-10 place-items-center rounded-xl"
            style={{ backgroundColor: tint, color }}
          >
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="mt-3 font-data text-3xl font-bold leading-none" style={{ color }}>
            {summary ? (
              <CountUp value={summary[key] ?? 0} />
            ) : (
              <span className="inline-block h-7 w-12 animate-pulse rounded bg-line align-middle" />
            )}
          </div>
          <div className="mt-1.5 text-sm font-semibold text-ink">{label}</div>
          <div className="text-xs text-muted">{hint}</div>
        </Card>
      ))}
    </div>
  )
}
