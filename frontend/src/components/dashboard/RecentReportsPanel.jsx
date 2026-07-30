import { ReportCard } from '@/components/reports/ReportCard'
import { cn } from '@/lib/cn'

/**
 * RecentReportsPanel — the newest reports submitted to the platform
 * (Feature 5). Takes its reports as a prop from the page's already-fetched
 * public list, so it stays in sync with the rest of the dashboard and costs no
 * extra request. Unfiltered by design: this section always shows the latest.
 */
export function RecentReportsPanel({ reports = [], loading = false, limit = 3, className }) {
  const latest = reports.slice(0, limit)

  return (
    <div className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {loading
        ? Array.from({ length: limit }).map((_, i) => <CardSkeleton key={i} />)
        : latest.map((report) => <ReportCard key={report.id} report={report} />)}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-white shadow-card">
      <div className="aspect-[16/10] animate-pulse bg-slate/10" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-24 animate-pulse rounded bg-slate/10" />
        <div className="h-4 w-full animate-pulse rounded bg-slate/10" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate/10" />
      </div>
    </div>
  )
}
