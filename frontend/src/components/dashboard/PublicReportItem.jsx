import { Link } from 'react-router-dom'
import { MapPin, CalendarDays, ArrowRight, AlertTriangle } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { CATEGORY_MAP } from '@/lib/constants'
import { formatDate, timeAgo } from '@/lib/format'
import { cn } from '@/lib/cn'

/**
 * PublicReportItem — one row of the public reports list (Feature 2).
 * Shows exactly the five public facts: title + category, location (State/LGA),
 * current status, date reported, and a "View Details" action.
 *
 * Deliberately NOT a single wrapping <Link> (unlike ReportRow) because the spec
 * calls for an explicit View Details button, and an anchor cannot be nested
 * inside another anchor.
 */
export function PublicReportItem({ report, className }) {
  const category = CATEGORY_MAP[report.category]
  const Icon = category?.icon ?? AlertTriangle
  const place = [report.lga, report.state].filter(Boolean).join(', ') || 'Location not specified'

  return (
    <li
      className={cn(
        'group flex flex-col gap-4 rounded-card border border-line bg-white p-4 shadow-card transition-all duration-200 hover:border-civic/30 hover:shadow-e2 sm:flex-row sm:items-center',
        className,
      )}
    >
      <span
        className="grid size-11 shrink-0 place-items-center rounded-xl bg-civic/10 text-civic-600"
        aria-hidden
      >
        <Icon className="size-5" strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-civic-600">
            {category?.label ?? 'Infrastructure'}
          </span>
          <StatusBadge status={report.status} size="sm" />
        </div>

        <h3 className="mt-1.5 font-sans text-[15px] font-semibold leading-snug text-ink">
          <Link
            to={`/reports/${report.id}`}
            className="hover:text-civic-600 hover:underline"
          >
            {report.title}
          </Link>
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {place}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            <span className="font-data">{formatDate(report.createdAt)}</span>
            <span className="text-line" aria-hidden>
              ·
            </span>
            <span>{timeAgo(report.createdAt)}</span>
          </span>
        </div>
      </div>

      <Link
        to={`/reports/${report.id}`}
        className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-civic/25 bg-white px-4 text-sm font-semibold text-civic transition-colors hover:border-civic hover:bg-civic/[0.04]"
      >
        View Details
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </li>
  )
}
