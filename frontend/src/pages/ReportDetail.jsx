import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ThumbsUp,
  Share2,
  Clock,
} from 'lucide-react'
import { ReportMap } from '@/components/map/ReportMap'
import { StatusTimeline } from '@/components/reports/StatusTimeline'
import { ReportCard } from '@/components/reports/ReportCard'
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CATEGORY_MAP } from '@/lib/constants'
import { formatDateTime, timeAgo } from '@/lib/format'
import { getReportById, getReports } from '@/services/api'
import { trackPublicReportViewed, trackReportConfirmed, trackReportShared } from '@/lib/analytics'

export default function ReportDetail() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmations, setConfirmations] = useState(0)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    getReportById(id).then((data) => {
      if (!alive) return
      setReport(data)
      setConfirmations(data?.confirmations ?? 0)
      setLoading(false)
      if (data) {
        trackPublicReportViewed(data.id, {
          category: data.category,
          status: data.status,
          severity: data.severity,
          lga: data.lga,
          state: data.state,
        })
      }
    })
    getReports().then((all) => alive && setRelated(all.filter((r) => r.id !== id).slice(0, 3)))
    return () => {
      alive = false
    }
  }, [id])

  const handleConfirm = () => {
    if (confirmed) return
    // Optimistic increment (PRD §5.4 optimistic UI)
    setConfirmed(true)
    setConfirmations((c) => c + 1)
    trackReportConfirmed(id)
    toast.success('Thanks — your confirmation was added.')
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: report.title, url })
        trackReportShared(id, 'native_share')
      } catch {
        /* dismissed */
      }
    } else {
      await navigator.clipboard.writeText(url)
      trackReportShared(id, 'clipboard')
      toast.success('Report link copied to clipboard.')
    }
  }

  if (loading) return <DetailSkeleton />
  if (!report) return <NotFoundReport />

  const category = CATEGORY_MAP[report.category]

  return (
    <div className="container-page py-8">
      <Link
        to="/map"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate hover:text-civic-600"
      >
        <ArrowLeft className="size-4" /> Back to map
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Left column */}
        <div className="space-y-8">
          {/* Photo */}
          <div className="overflow-hidden rounded-panel border border-line shadow-e1">
            <img
              src={report.photo}
              alt={`Reported issue: ${report.title}`}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>

          {/* Title + meta */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={report.status} />
              <SeverityBadge severity={report.severity} />
              <span className="inline-flex items-center gap-1 rounded-full bg-civic/10 px-2.5 py-1 text-xs font-semibold text-civic-600">
                {category?.icon && <category.icon className="size-3.5" />}
                {category?.label}
              </span>
            </div>
            <h1 className="mt-3 text-h2 font-bold text-ink">{report.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" /> {report.lga}, {report.state}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-4" /> {formatDateTime(report.createdAt)}
              </span>
              <span className="font-data text-xs">ID: {report.id}</span>
            </div>
          </div>

          {/* Description */}
          <div className="max-w-[720px]">
            <h2 className="text-h3 font-bold text-ink">Description</h2>
            <p className="mt-3 leading-relaxed text-slate">{report.description}</p>
          </div>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="mb-5 flex items-center gap-2 text-h3 font-bold text-ink">
              <Clock className="size-5 text-civic-600" /> Status Timeline
            </h2>
            <StatusTimeline events={report.timeline} currentStatus={report.status} />
          </Card>

          {/* Mini map */}
          <div>
            <h2 className="mb-3 text-h3 font-bold text-ink">Location</h2>
            <div className="h-72 overflow-hidden rounded-panel border border-line shadow-e1">
              <ReportMap
                reports={[report]}
                center={[report.coordinates.lat, report.coordinates.lng]}
                zoom={14}
              />
            </div>
          </div>
        </div>

        {/* Right column (sticky actions) */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-xl bg-civic/10 text-civic-600">
                <ThumbsUp className="size-6" />
              </span>
              <div>
                <div className="font-data text-2xl font-bold text-ink">{confirmations}</div>
                <div className="text-sm text-muted">citizens confirm this issue</div>
              </div>
            </div>
            <Button
              onClick={handleConfirm}
              fullWidth
              size="lg"
              icon={ThumbsUp}
              disabled={confirmed}
              className="mt-4"
            >
              {confirmed ? 'Confirmed' : 'I confirm this issue'}
            </Button>
            <p className="mt-2 text-center text-xs text-muted">
              Only confirm reports you have personally observed.
            </p>
            <Button onClick={handleShare} variant="secondary" fullWidth icon={Share2} className="mt-3">
              Share report
            </Button>
          </Card>

          {/* Reporter card */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Report summary</h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <SummaryRow label="Reporter" value="Anonymous citizen" />
              <SummaryRow label="Reported" value={timeAgo(report.createdAt)} />
              <SummaryRow label="Category" value={category?.label} />
              <SummaryRow label="Severity" value={<SeverityBadge severity={report.severity} />} />
              <SummaryRow label="Current status" value={<StatusBadge status={report.status} size="sm" />} />
            </dl>
          </Card>
        </aside>
      </div>

      {/* Related reports */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-h3 font-bold text-ink">Related reports nearby</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="container-page py-8">
      <div className="h-4 w-24 animate-pulse rounded bg-slate/10" />
      <div className="mt-5 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="aspect-[16/9] w-full animate-pulse rounded-panel bg-slate/10" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-slate/10" />
          <div className="h-24 w-full animate-pulse rounded bg-slate/10" />
        </div>
        <div className="h-64 animate-pulse rounded-panel bg-slate/10" />
      </div>
    </div>
  )
}

function NotFoundReport() {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-h2 font-bold text-ink">Report not found</h1>
      <p className="mt-2 text-slate">This report may have been removed or the link is incorrect.</p>
      <Button as={Link} to="/map" variant="secondary" icon={ArrowLeft} className="mt-6">
        Back to map
      </Button>
    </div>
  )
}
