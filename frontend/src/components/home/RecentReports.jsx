import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ReportCard } from '@/components/reports/ReportCard'
import { Reveal } from '@/components/common/Reveal'
import { Button } from '@/components/ui/Button'
import { getRecentReports } from '@/services/api'

/** RecentReports — grid of the six most recent public reports (Landing §3.1). */
export function RecentReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    getRecentReports(6).then((data) => {
      if (alive) {
        setReports(data)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className="container-page py-16 sm:py-20">
      <SectionHeading
        eyebrow="Live from the community"
        title="Latest Reports"
        description="Real infrastructure issues documented by citizens across Nigeria, updated as they happen."
      >
        <Button as={Link} to="/map" variant="ghost" iconRight={ArrowRight} className="hidden sm:inline-flex">
          View all on map
        </Button>
      </SectionHeading>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ReportCardSkeleton key={i} />)
          : reports.map((report, i) => (
              <Reveal key={report.id} delay={(i % 3) * 0.06}>
                <ReportCard report={report} />
              </Reveal>
            ))}
      </div>

      <div className="mt-8 flex justify-center sm:hidden">
        <Button as={Link} to="/map" variant="secondary" iconRight={ArrowRight}>
          View all reports on the map
        </Button>
      </div>
    </section>
  )
}

/** Skeleton that matches the final card layout (Master PRD §3.14). */
function ReportCardSkeleton() {
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
