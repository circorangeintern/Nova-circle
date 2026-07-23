import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, ThumbsUp, Clock, Lock, User } from 'lucide-react'
import { ReportMap } from '@/components/map/ReportMap'
import { StatusTimeline } from '@/components/reports/StatusTimeline'
import { StatusUpdatePanel } from '@/components/official/StatusUpdatePanel'
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/common/PageLoader'
import { CATEGORY_MAP } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { getOfficialReportById } from '@/services/api'

/** Official report detail — citizen content is READ-ONLY; only status changes. */
export default function OfficialReportDetail() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getOfficialReportById(id)
      .then(setReport)
      .catch(() => setReport(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageLoader />
  if (!report) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-h2 font-bold text-ink">Report not found</h1>
        <Link to="/official/reports" className="mt-4 inline-block font-medium text-civic-600 hover:underline">
          ← Back to queue
        </Link>
      </div>
    )
  }

  const category = CATEGORY_MAP[report.category]

  return (
    <div>
      <Link to="/official/reports" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate hover:text-civic-600">
        <ArrowLeft className="size-4" /> Back to queue
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Read-only report content */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <SeverityBadge severity={report.severity} />
            <span className="inline-flex items-center gap-1 rounded-full bg-civic/10 px-2.5 py-1 text-xs font-semibold text-civic-600">
              {category?.icon && <category.icon className="size-3.5" />}
              {category?.label}
            </span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-slate/[0.06] px-2.5 py-1 text-xs font-medium text-muted">
              <Lock className="size-3" /> Read-only
            </span>
          </div>

          <h1 className="text-h2 font-bold text-ink">{report.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" /> {report.lga}, {report.state}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" /> {formatDateTime(report.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ThumbsUp className="size-4" /> {report.confirmations} confirmations
            </span>
            <span className="font-data text-xs">{report.id}</span>
          </div>

          <div className="overflow-hidden rounded-panel border border-line shadow-e1">
            <img src={report.photo} alt={`Reported issue: ${report.title}`} className="aspect-[16/9] w-full object-cover" />
          </div>

          <div>
            <h2 className="text-h3 font-bold text-ink">Description</h2>
            <p className="mt-2 leading-relaxed text-slate">{report.description}</p>
          </div>

          {report.reporter && (report.reporter.name || report.reporter.contact) && (
            <Card className="p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <User className="size-4 text-civic-600" /> Reporter contact (private)
              </h3>
              <p className="mt-1 text-sm text-slate">
                {report.reporter.name || 'Anonymous'}
                {report.reporter.contact ? ` · ${report.reporter.contact}` : ''}
              </p>
              <p className="mt-1 text-xs text-muted">For official follow-up only — never shown publicly.</p>
            </Card>
          )}

          <div>
            <h2 className="mb-3 text-h3 font-bold text-ink">Location</h2>
            <div className="h-64 overflow-hidden rounded-panel border border-line shadow-e1">
              <ReportMap reports={[report]} center={[report.coordinates.lat, report.coordinates.lng]} zoom={14} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <StatusUpdatePanel report={report} onUpdated={setReport} />

          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-h3 font-bold text-ink">
              <Clock className="size-5 text-civic-600" /> Timeline
            </h3>
            <StatusTimeline events={report.timeline} currentStatus={report.status} />
          </Card>
        </aside>
      </div>
    </div>
  )
}
