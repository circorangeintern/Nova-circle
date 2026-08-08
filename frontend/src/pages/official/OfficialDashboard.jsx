import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import { FileText, CheckCircle2, Clock3, TriangleAlert, ArrowRight, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/common/PageLoader'
import { CATEGORY_MAP, STATUSES } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'
import { getReportStats } from '@/services/api'
import { trackOfficialDashboardViewed } from '@/lib/analytics'

/** Official dashboard / analytics (Nova Circle PRD Feature 4). */
export default function OfficialDashboard() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getReportStats().then((data) => {
      setStats(data)
      if (data) {
        trackOfficialDashboardViewed({
          total: data.total,
          resolved: data.resolved,
          open: data.open,
        })
      }
    })
  }, [])

  if (!stats) return <PageLoader />

  const categoryData = Object.entries(stats.byCategory).map(([key, value]) => ({
    name: CATEGORY_MAP[key]?.shortLabel ?? key,
    value,
    color: '#2563EB',
  }))
  const statusData = Object.entries(stats.byStatus).map(([key, value]) => ({
    name: STATUSES[key]?.label ?? key,
    value,
    color: STATUSES[key]?.color ?? '#6B7280',
  }))
  const mostReported = stats.mostReported ? CATEGORY_MAP[stats.mostReported]?.label : '—'

  const kpis = [
    { label: 'Total Reports', value: stats.total, icon: FileText, color: 'text-civic-600', bg: 'bg-civic/10' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock3, color: 'text-civic-600', bg: 'bg-civic/10' },
    { label: 'Awaiting Action', value: stats.open, icon: TriangleAlert, color: 'text-accent', bg: 'bg-accent/10' },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-h2 font-bold text-ink">
            Welcome{user ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-slate">
            {user ? `${user.department} · ${user.lga}, ${user.state}` : 'Monthly summary'}
          </p>
        </div>
        <Link
          to="/official/reports"
          className="inline-flex items-center gap-2 rounded-lg bg-civic-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-civic-600"
        >
          Open report queue <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* KPI cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon
          return (
            <Card key={k.label} className="p-5">
              <span className={`grid size-11 place-items-center rounded-xl ${k.bg}`}>
                <Icon className={`size-5 ${k.color}`} />
              </span>
              <div className={`mt-3 font-data text-3xl font-bold ${k.color}`}>{k.value}</div>
              <div className="mt-0.5 text-sm font-medium text-slate">{k.label}</div>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-h3 font-bold text-ink">Reports by category</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill="#2563EB" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-h3 font-bold text-ink">Reports by status</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={2}>
                  {statusData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Most reported */}
      <Card className="mt-4 flex items-center gap-4 p-5">
        <span className="grid size-12 place-items-center rounded-xl bg-accent/10 text-accent">
          <Trophy className="size-6" />
        </span>
        <div>
          <div className="text-sm font-medium text-muted">Most frequently reported issue</div>
          <div className="text-xl font-bold text-ink">{mostReported}</div>
        </div>
      </Card>
    </div>
  )
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E5E7EB',
  boxShadow: '0 8px 24px -12px rgba(16,24,40,0.2)',
  fontSize: 13,
}
