import { CategorySelector, SeveritySelector } from './Selectors'
import { DESCRIPTION_MIN, DESCRIPTION_MAX, CATEGORY_MAP } from '@/lib/constants'
import { cn } from '@/lib/cn'

const PLACEHOLDERS = {
  roads: 'Describe potholes, flooding, erosion or collapsed sections, and how long it has been this way.',
  school: 'Describe the damage — roof, walls, classrooms — and how it affects pupils.',
  water: 'Describe the borehole/pipe issue and how long the community has been without water.',
  electricity: 'Describe the fault — transformer, cables, poles — and any safety risk.',
}

/** DetailsStep — category, severity and description (Master PRD §3.2 Step 2). */
export function DetailsStep({ value, onChange, errors = {} }) {
  const count = value.description?.length ?? 0
  const placeholder = PLACEHOLDERS[value.category] ?? 'What is wrong, and how long has it been this way?'

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-h3 font-bold text-ink">Describe the issue</h2>
        <p className="mt-1 text-slate">A few details help officials understand and prioritise it.</p>
      </div>

      <CategorySelector value={value.category} onChange={(v) => onChange({ category: v })} error={errors.category} />
      <SeveritySelector value={value.severity} onChange={(v) => onChange({ severity: v })} error={errors.severity} />

      <div>
        <label htmlFor="description" className="text-sm font-semibold text-ink">
          Description
        </label>
        <textarea
          id="description"
          value={value.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value.slice(0, DESCRIPTION_MAX) })}
          rows={4}
          placeholder={placeholder}
          className={cn(
            'mt-2 w-full resize-none rounded-card border px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-civic/30',
            errors.description ? 'border-critical focus:border-critical' : 'border-line focus:border-civic',
          )}
        />
        <div className="mt-1.5 flex items-center justify-between text-sm">
          <span className={cn('font-medium', errors.description ? 'text-critical' : 'text-muted')}>
            {errors.description || `Minimum ${DESCRIPTION_MIN} characters`}
          </span>
          <span className={cn('font-data', count > DESCRIPTION_MAX - 20 ? 'text-warning' : 'text-muted')}>
            {count}/{DESCRIPTION_MAX}
          </span>
        </div>
      </div>

      {value.category && (
        <p className="text-sm text-muted">
          Category: <span className="font-medium text-slate">{CATEGORY_MAP[value.category]?.label}</span>
        </p>
      )}
    </div>
  )
}
