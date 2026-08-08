import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, CheckCircle2, Clock3, TriangleAlert, Eye,
  MapPin, Calendar, LayoutList, Map as MapIcon, Search, X, ArrowRight,
} from 'lucide-react'
import { ReportMap } from '@/components/map/ReportMap'
import { ReportCard } from '@/components/reports/ReportCard'
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  CORE_CATEGORIES, STATUSES, OFFICIAL_STATUS_FLOW, CATEGORY_MAP,
} from '@/lib/constants'
import { getReports, getReportStats, getRecentReports } from '@/services/api'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/cn'
import {
  trackDashboardViewed, trackFilterApplied, trackFilterCleared,
} from '@/lib/analytics'

const KPI_CONFIG = [
  { key: 'total',        label: 'Total Reports',      icon: FileText,      color: 'text-civic-600', bg: 'bg-civic/10'   },
  { key: 'resolved',     label: 'Resolved',           icon: CheckCircle2,  color: 'text-success',   bg: 'bg-success/10' },
  { key: 'inProgress',   label: 'In Progress',        icon: Clock3,        color: 'text-civic-600', bg: 'bg-civic/10'   },
  { key: 'acknowledged', label: 'Acknowledged',       icon: Eye,           color: 'text-[#D97706]', bg: 'bg-yellow-50'  },
  { key: 'open',         label: 'Reported (Pending)', icon: TriangleAlert, color: 'text-accent',    bg: 'bg-accent/10'  },
]

const PAGE_SIZE = 8

/**
 * Public Accountability Dashboard (/dashboard).
 *
 * A READ-ONLY transparency view of every published report:
 *   1. Five summary metric cards
 *   2. The public reports list (title/category · location · status · date)
 *   3. Category + status filters
 *   4. An interactive map of report locations
 *   5. The most recent reports
 *
 * Deliberately absent (these live in the Government Official portal only):
 * login, edit report, update status, delete report, government-only analytics,
 * and any personal citizen information.
 */
export default function Dashboard() {
  const [stats, setStats]                   = useState(null)
  const [reports, setReports]               = useState([])
  const [recent, setRecent]                 = useState([])
  const [loading, setLoading]               = useState(true)
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [statusFilter, setStatusFilter]     = useState(null)
  const [query, setQuery]                   = useState('')
  const [view, setView]                     = useState('list') // 'list' | 'map'
  const searchTimer                         = useRef(null)

  useEffect(() => {
    trackDashboardViewed()
    Promise.all([getReports(), getReportStats(), getRecentReports(6)]).then(
      ([reps, st, rec]) => {
        setReports(reps)
        setStats({ ...st, acknowledged: st.byStatus?.acknowledged ?? 0 })
        setRecent(rec)
        setLoading(false)
      },
    )
  }, [])

  const filtered = useMemo(() => reports.filter((r) => {
    if (categoryFilter && r.category !== categoryFilter) return false
    if (statusFilter   && r.status   !== statusFilter)   return false
    if (query) {
      const q = query.toLowerCase()
      if (
        !r.title.toLowerCase().includes(q) &&
        !r.lga?.toLowerCase().includes(q) &&
        !r.state?.toLowerCase().includes(q)
      ) return false
    }
    return true
  }), [reports, categoryFilter, statusFilter, query])

  const handleCategory = (key) => {
    const next = categoryFilter === key ? null : key
    setCategoryFilter(next)
    if (next) trackFilterApplied('category', next, 'dashboard')
    else trackFilterCleared('dashboard')
  }

  const handleStatus = (key) => {
    const next = statusFilter === key ? null : key
    setStatusFilter(next)
    if (next) trackFilterApplied('status', next, 'dashboard')
    else trackFilterCleared('dashboard')
  }

  const clearAll = () => {
    setCategoryFilter(null); setStatusFilter(null); setQuery('')
    trackFilterCleared('dashboard')
  }
  const hasFilters = categoryFilter || statusFilter || query

  return (
    <div className="container-page py-8">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-h2 font-bold text-ink">Public Accountability Dashboard</h1>
          <p className="mt-1 text-slate">
            A live, transparent record of every infrastructure issue reported by
            citizens across Nigeria.
          </p>
        </div>
        <Button as={Link} to="/report" iconRight={ArrowRight} size="sm">
          Report an issue
        </Button>
      </div>

      {/* ── Summary KPI cards ───────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {KPI_CONFIG.map(({ key, label, icon: Icon, color, bg }) => (
          <Card key={key} className="p-4">
            <span className={cn('grid size-10 place-items-center rounded-xl', bg)}>
              <Icon className={cn('size-5', color)} />
            </span>
            <div className={cn('mt-3 font-data text-3xl font-bold', color)}>
              {loading
                ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate/10" />
                : (stats?.[key] ?? 0).toLocaleString()}
            </div>
            <div className="mt-0.5 text-sm font-medium text-slate">{label}</div>
          </Card>
        ))}
      </div>

      {/* ── Filter bar ──────────────────────────────────────── */}
      <div className="mt-8 rounded-panel border border-line bg-white p-4 shadow-e1">

        {/* Top row: search + view toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
            <Search className="size-4 shrink-0 text-muted" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                clearTimeout(searchTimer.current)
                searchTimer.current = setTimeout(() => {
                  if (e.target.value)
                    trackFilterApplied('search', e.target.value.length, 'dashboard')
                }, 600)
              }}
              placeholder="Search title, LGA, state…"
              className="w-full bg-transparent text-sm focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-muted hover:text-slate">
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* List / Map toggle */}
          <div className="flex rounded-lg border border-line bg-surface p-0.5">
            {[
              { id: 'list', icon: LayoutList, label: 'List' },
              { id: 'map',  icon: MapIcon,    label: 'Map'  },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
                  view === id ? 'bg-white text-ink shadow-e1' : 'text-muted hover:text-slate',
                )}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Category</span>
          {CORE_CATEGORIES.map((c) => {
            const Icon = c.icon
            return (
              <button
                key={c.key}
                onClick={() => handleCategory(c.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                  categoryFilter === c.key
                    ? 'border-civic bg-civic text-white'
                    : 'border-line bg-white text-slate hover:border-civic/50',
                )}
              >
                <Icon className="size-3.5" /> {c.label}
              </button>
            )
          })}
        </div>

        {/* Status chips */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Status</span>
          {OFFICIAL_STATUS_FLOW.map((key) => {
            const s = STATUSES[key]
            return (
              <button
                key={key}
                onClick={() => handleStatus(key)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                  statusFilter === key
                    ? 'border-transparent text-white'
                    : 'border-line bg-white text-slate hover:border-civic/40',
                )}
                style={statusFilter === key ? { backgroundColor: s.color } : undefined}
              >
                {s.label}
              </button>
            )
          })}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-civic-600 hover:underline"
            >
              <X className="size-3" /> Clear all
            </button>
          )}
        </div>

        <p className="mt-3 text-right text-xs text-muted">
          Showing{' '}
          <span className="font-data font-semibold text-ink">{filtered.length}</span>{' '}
          of <span className="font-data">{reports.length}</span> reports
        </p>
      </div>

      {/* ── List or Map view ────────────────────────────────── */}
      <div className="mt-4">
        {view === 'map' ? (
          <div className="h-[520px] overflow-hidden rounded-panel border border-line shadow-e1">
            <ReportMap reports={filtered} />
          </div>
        ) : (
          <div className="overflow-hidden rounded-panel border border-line bg-white shadow-e1">
            {loading ? (
              <ul className="divide-y divide-line">
                {Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-4 p-4">
                    <div className="size-14 shrink-0 animate-pulse rounded-lg bg-slate/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-slate/10" />
                      <div className="h-3 w-1/3 animate-pulse rounded bg-slate/10" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center text-muted">
                <FileText className="mb-3 size-10 opacity-30" />
                <p className="font-medium">No reports match your filters.</p>
                <button
                  onClick={clearAll}
                  className="mt-3 text-sm font-semibold text-civic-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {filtered.map((r) => <ReportRow key={r.id} report={r} />)}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ── Recent Reports ───────────────────────────────────── */}
      {!loading && recent.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center justify-between">
            <h2 className="text-h3 font-bold text-ink">Recent Reports</h2>
            <Link to="/map" className="text-sm font-semibold text-civic-600 hover:underline">
              View on map →
            </Link>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((r) => <ReportCard key={r.id} report={r} />)}
          </div>
        </section>
      )}
    </div>
  )
}

/* ── ReportRow ─────────────────────────────────────────────────────────────
   A single row in the public reports list. Read-only: links to the detail
   page but exposes no mutation affordances.
-------------------------------------------------------------------------- */
function ReportRow({ report }) {
  const cat  = CATEGORY_MAP[report.category]
  const Icon = cat?.icon

  return (
    <li>
      <div className="flex items-start gap-4 px-4 py-3.5 sm:items-center">

        {/* Thumbnail */}
        <div className="relative hidden size-14 shrink-0 overflow-hidden rounded-lg bg-slate/10 sm:block">
          {report.photo ? (
            <img
              src={report.photo}
              alt={report.title}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <span className="grid size-full place-items-center text-muted">
              {Icon && <Icon className="size-6" />}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={report.status} size="sm" />
            <SeverityBadge severity={report.severity} />
            {cat && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-civic-600">
                {Icon && <Icon className="size-3" />}
                {cat.shortLabel}
              </span>
            )}
          </div>
          <p className="mt-1 truncate font-semibold text-ink">{report.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {report.lga}, {report.state}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5" />
              {formatDateTime(report.createdAt)}
            </span>
            <span className="font-data">{report.id}</span>
          </div>
        </div>

        {/* Action — read-only link only */}
        <Button
          as={Link}
          to={`/reports/${report.id}`}
          variant="secondary"
          size="sm"
          icon={Eye}
          className="shrink-0"
        >
          <span className="hidden sm:inline">View Details</span>
          <span className="sm:hidden">View</span>
        </Button>

      </div>
    </li>
  )
}

