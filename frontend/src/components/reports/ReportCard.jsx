import { Link } from 'react-router-dom'
import { MapPin, ThumbsUp } from 'lucide-react'
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge'
import { CATEGORY_MAP } from '@/lib/constants'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/cn'

/**
 * ReportCard — photo-led card used in the recent-reports grid, search results,
 * and related reports (PRD §7.3 Report Card). Fully self-contained + reusable.
 */
export function ReportCard({ report, className }) {
  const category = CATEGORY_MAP[report.category]
  const Icon = category?.icon

  return (
    <Link
      to={`/reports/${report.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-e2',
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate/10">
        <img
          src={report.photo}
          alt={`Reported infrastructure issue: ${report.title}`}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={report.status} size="sm" className="shadow-e1" />
        </div>
        <div className="absolute right-3 top-3">
          <SeverityBadge severity={report.severity} className="bg-white/90 shadow-e1 backdrop-blur" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-civic-600">
          {Icon && <Icon className="size-3.5" />}
          {category?.label}
        </div>
        <h3 className="mt-2 line-clamp-2 font-sans text-[15px] font-semibold leading-snug text-ink group-hover:text-civic-600">
          {report.title}
        </h3>
        <div className="mt-2 flex items-center gap-1 text-sm text-muted">
          <MapPin className="size-3.5" />
          {report.lga}, {report.state}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate">
            <ThumbsUp className="size-4 text-civic-500" />
            <span className="font-data">{report.confirmations}</span> confirmed
          </span>
          <span className="text-muted">{timeAgo(report.createdAt)}</span>
        </div>
      </div>
    </Link>
  )
}
