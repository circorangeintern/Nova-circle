import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CountUp } from '@/components/common/CountUp'
import { Button } from '@/components/ui/Button'

const rows = (stats) => [
  { label: 'Infrastructure Reports', value: stats.reports.value, delta: stats.reports.deltaPct, color: 'text-civic-600' },
  { label: 'LGAs Covered', value: stats.lgas.value, delta: stats.lgas.deltaPct, color: 'text-success' },
  { label: 'Reports Resolved', value: stats.resolved.value, delta: stats.resolved.deltaPct, color: 'text-success' },
  { label: 'Avg. Response Rate', value: stats.responseRate.value, suffix: '%', delta: stats.responseRate.deltaPct, color: 'text-accent' },
]
export function LivePlatformStats({ stats }) { return <div className="w-full rounded-panel bg-white p-6 shadow-e3 sm:p-7"><div className="flex items-center justify-between"><h3 className="font-display text-lg font-bold text-ink">Live Platform Stats</h3><span className="text-sm font-semibold text-success">Live</span></div><dl className="mt-5 divide-y divide-line">{rows(stats).map((row) => <div key={row.label} className="flex items-center justify-between py-3.5"><dt className="text-[15px] text-slate">{row.label}</dt><dd className="flex items-center gap-2"><span className={`font-data text-xl font-bold ${row.color}`}><CountUp value={row.value} suffix={row.suffix ?? ''} /></span><span className="rounded-full bg-civic/10 px-2 py-0.5 text-xs font-semibold text-civic">+{row.delta}%</span></dd></div>)}</dl><Button as={Link} to="/dashboard" fullWidth size="lg" iconRight={ArrowRight} className="mt-5">View Full Dashboard</Button></div> }
