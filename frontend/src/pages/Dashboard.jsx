import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Maximize2, SearchX, ChevronDown, ShieldCheck } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { PublicReportItem } from '@/components/dashboard/PublicReportItem'
import { DashboardMap } from '@/components/dashboard/DashboardMap'
import { RecentReportsPanel } from '@/components/dashboard/RecentReportsPanel'
import { getPublicReports, getPublicSummary } from '@/services/api'

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
 * and any personal citizen information. The data itself is sanitised at the
 * service boundary by getPublicReports/getPublicSummary, so no citizen identity
 * ever reaches this page.
 */
export default function Dashboard() {
  const [reports, setReports] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(null)
  const [status, setStatus] = useState(null)
  const [visible, setVisible] = useState(PAGE_SIZE)

  // Fetch once, filter client-side: keeps the list, the map and the counts
  // reacting instantly to a filter change without re-hitting the network.
  useEffect(() => {
    let alive = true
    Promise.all([getPublicReports(), getPublicSummary()]).then(([list, stats]) => {
      if (!alive) return
      setReports(list)
      setSummary(stats)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  const filtered = useMemo(
    () =>
      reports.filter(
        (r) => (!category || r.category === category) && (!status || r.status === status),
      ),
    [reports, category, status],
  )

  // Any filter change resets the list back to the first page.
  const applyCategory = (next) => {
    setCategory(next)
    setVisible(PAGE_SIZE)
  }
  const applyStatus = (next) => {
    setStatus(next)
    setVisible(PAGE_SIZE)
  }
  const reset = () => {
    setCategory(null)
    setStatus(null)
    setVisible(PAGE_SIZE)
  }

  const shown = filtered.slice(0, visible)
  const hasFilters = Boolean(category || status)

  return (
    <div className="pb-20">
      {/* ---------- Page header ---------- */}
      <header className="border-b border-line bg-white">
        <div className="container-page py-10 sm:py-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-civic/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-civic-600">
            <Eye className="size-3.5" aria-hidden />
            Public accountability
          </span>
          <h1 className="mt-4 max-w-3xl text-h1 font-bold text-ink">
            Every report, every status, in the open
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate">
            A live, read-only record of the infrastructure issues citizens have documented across
            Nigeria — and exactly how far each one has moved toward being fixed. No account
            needed.
          </p>
        </div>
      </header>

      <div className="container-page">
        {/* ---------- 1. Summary cards ---------- */}
        <SummaryCards summary={summary} className="-mt-6 sm:-mt-8" />

        {/* ---------- 2 + 3. Reports list with filters ---------- */}
        <section className="mt-14 sm:mt-16" aria-label="Public reports list">
          <SectionHeading
            eyebrow="Public record"
            title="All public reports"
            description="Narrow the list by category or status. Open any report to see its photo, location and full response timeline."
          />

          <DashboardFilters
            className="mt-6"
            category={category}
            status={status}
            onCategoryChange={applyCategory}
            onStatusChange={applyStatus}
            onReset={reset}
            resultCount={filtered.length}
          />

          {loading ? (
            <ul className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </ul>
          ) : filtered.length === 0 ? (
            <EmptyState onReset={reset} hasFilters={hasFilters} />
          ) : (
            <>
              <ul className="mt-4 space-y-3">
                {shown.map((report) => (
                  <PublicReportItem key={report.id} report={report} />
                ))}
              </ul>

              {visible < filtered.length && (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="secondary"
                    iconRight={ChevronDown}
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  >
                    Show {Math.min(PAGE_SIZE, filtered.length - visible)} more
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* ---------- 4. Map view ---------- */}
        <section className="mt-16 sm:mt-20" aria-label="Map view">
          <SectionHeading
            eyebrow="Geographic view"
            title="Where the reports are"
            description="Each pin is a report, coloured by its current status. Click a pin to preview it, then open the full report."
          >
            <Button
              as={Link}
              to="/map"
              variant="ghost"
              iconRight={Maximize2}
              className="hidden sm:inline-flex"
            >
              Open full map
            </Button>
          </SectionHeading>

          <DashboardMap reports={filtered} className="mt-6" />

          {hasFilters && (
            <p className="mt-3 text-sm text-muted">
              Showing the {filtered.length} {filtered.length === 1 ? 'report' : 'reports'} that
              match your current filters.{' '}
              <button onClick={reset} className="font-semibold text-civic-600 hover:underline">
                Show all
              </button>
            </p>
          )}
        </section>

        {/* ---------- 5. Recent reports ---------- */}
        <section className="mt-16 sm:mt-20" aria-label="Recent reports">
          <SectionHeading
            eyebrow="Just in"
            title="Recent reports"
            description="The latest issues submitted to the platform, newest first."
          />

          <RecentReportsPanel reports={reports} loading={loading} className="mt-6" />
        </section>

        {/* ---------- Transparency note ---------- */}
        <aside className="mt-16 flex flex-col gap-4 rounded-panel border border-line bg-white p-6 shadow-card sm:flex-row sm:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-success/10 text-success">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div>
            <h3 className="font-sans text-[15px] font-bold text-ink">
              This page is read-only — and identity-free
            </h3>
            <p className="mt-1 text-sm text-slate">
              Anyone can view this record without signing in. Status updates are made by verified
              government officials in their own portal, and the reporter&apos;s personal details are
              never published here.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

/** Skeleton matching PublicReportItem's layout. */
function RowSkeleton() {
  return (
    <li className="flex items-center gap-4 rounded-card border border-line bg-white p-4 shadow-card">
      <div className="size-11 shrink-0 animate-pulse rounded-xl bg-slate/10" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-28 animate-pulse rounded bg-slate/10" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate/10" />
      </div>
      <div className="hidden h-9 w-28 animate-pulse rounded-lg bg-slate/10 sm:block" />
    </li>
  )
}

function EmptyState({ onReset, hasFilters }) {
  return (
    <div className="mt-4 flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-white px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-surface text-muted">
        <SearchX className="size-6" aria-hidden />
      </span>
      <h3 className="font-sans text-[15px] font-bold text-ink">No reports match these filters</h3>
      <p className="max-w-sm text-sm text-slate">
        {hasFilters
          ? 'Try a different category or status — or clear the filters to see the full public record.'
          : 'No reports have been published yet. Check back shortly.'}
      </p>
      {hasFilters && (
        <Button variant="secondary" size="sm" onClick={onReset} className="mt-1">
          Clear filters
        </Button>
      )}
    </div>
  )
}
