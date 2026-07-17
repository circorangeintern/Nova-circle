import { Link } from 'react-router-dom'
import { MapPin, ChevronUp, AlertTriangle } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { CATEGORY_MAP } from '@/lib/constants'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/cn'

/**
 * ReportRow — compact list item for a report (Image #5 / "Report Row").
 * Icon tile · title + meta · status pill · confirmation count · time ago.
 */
export function ReportRow({ report, className }) {
  const category = CATEGORY_MAP[report.category]
  const Icon = category?.icon ?? AlertTriangle

  return (
    <Link
      to={`/reports/${report.id}`}
      className={cn(
        'group flex items-center gap-4 rounded-card border border-line bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-civic/30 hover:shadow-e2',
        className,
      )}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-civic/10 text-civic-600">
        <Icon className="size-5" strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-sans text-[15px] font-semibold text-ink group-hover:text-civic-600">
          {report.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {report.lga}, {report.state}
          </span>
          <span aria-hidden>·</span>
          <span className="truncate">{category?.label}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <StatusBadge status={report.status} size="sm" />
        <span className="hidden items-center gap-1 font-data text-sm font-semibold text-slate sm:flex">
          <ChevronUp className="size-4 text-success" strokeWidth={2.5} />
          {report.confirmations}
        </span>
        <span className="hidden whitespace-nowrap text-sm text-muted md:inline">
          {timeAgo(report.createdAt)}
        </span>
      </div>
    </Link>
  )
}
