import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * ProgressStepper — desktop horizontal stepper + mobile "Step x of n" bar
 * (Master PRD §3.2 progress system).
 */
const STEPS = ['Photo', 'Details', 'Location', 'Review']

export function ProgressStepper({ current }) {
  const pct = Math.round(((current + 1) / STEPS.length) * 100)
  return (
    <div>
      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-sm font-medium text-slate">
          <span>
            Step {current + 1} of {STEPS.length}
          </span>
          <span className="font-data">{STEPS[current]}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-civic-500 transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Desktop */}
      <ol className="hidden items-center sm:flex">
        {STEPS.map((label, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold transition-colors',
                    done && 'border-transparent bg-civic-500 text-white',
                    active && 'border-civic-500 text-civic-600',
                    !done && !active && 'border-line text-muted',
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold',
                    active ? 'text-ink' : done ? 'text-slate' : 'text-muted',
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className={cn('mx-3 h-0.5 flex-1 rounded-full', done ? 'bg-civic-500' : 'bg-line')}
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
