import { FileText, MapPin, CheckCircle2, TrendingUp, ArrowUp } from 'lucide-react'
import { Reveal } from '@/components/common/Reveal'
import { CountUp } from '@/components/common/CountUp'
import { Card } from '@/components/ui/Card'

/**
 * StatsBar — four headline metrics on a white card (Landing §3.1 / Image #4).
 * Each stat: coloured icon tile, animated number, label, "↑ x% this month".
 */
const STATS = (s) => [
  { icon: FileText, value: s.reports.value, label: 'Infrastructure Reports', delta: s.reports.deltaPct, valueClass: 'text-civic-600', iconBg: 'bg-civic/10', iconColor: 'text-civic-600' },
  { icon: MapPin, value: s.lgas.value, label: 'LGAs Participating', delta: s.lgas.deltaPct, valueClass: 'text-success', iconBg: 'bg-success/10', iconColor: 'text-success' },
  { icon: CheckCircle2, value: s.resolved.value, label: 'Issues Resolved', delta: s.resolved.deltaPct, valueClass: 'text-success', iconBg: 'bg-success/10', iconColor: 'text-success' },
  { icon: TrendingUp, value: s.responseRate.value, suffix: '%', label: 'Govt Response Rate', delta: s.responseRate.deltaPct, valueClass: 'text-accent', iconBg: 'bg-accent/10', iconColor: 'text-accent' },
]

export function StatsBar({ stats }) {
  return (
    <section className="container-page mt-8">
      <Reveal>
        <Card className="grid grid-cols-1 gap-x-6 gap-y-8 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
          {STATS(stats).map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="flex items-start gap-4">
                <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${stat.iconBg}`}>
                  <Icon className={`size-6 ${stat.iconColor}`} strokeWidth={2} />
                </span>
                <div>
                  <div className={`font-data text-2xl font-bold leading-none ${stat.valueClass}`}>
                    <CountUp value={stat.value} suffix={stat.suffix ?? ''} />
                  </div>
                  <div className="mt-1.5 text-[15px] font-medium text-slate">{stat.label}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-success">
                    <ArrowUp className="size-3.5" strokeWidth={2.5} />
                    {stat.delta}% this month
                  </div>
                </div>
              </div>
            )
          })}
        </Card>
      </Reveal>
    </section>
  )
}
