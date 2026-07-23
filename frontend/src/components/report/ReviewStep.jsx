import { MapPin, Pencil } from 'lucide-react'
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge'
import { CATEGORY_MAP } from '@/lib/constants'
import { cn } from '@/lib/cn'

/**
 * ReviewStep — shows the report exactly as it will appear publicly, so the user
 * knows precisely what becomes public before submitting (Master PRD §3.2 Step 4).
 * Per-section Edit buttons jump back to the relevant step.
 */
export function ReviewStep({ value, onEdit }) {
  const category = CATEGORY_MAP[value.category]
  return (
    <div>
      <h2 className="text-h3 font-bold text-ink">Review your report</h2>
      <p className="mt-1 text-slate">This is exactly what the public will see. You can edit it until an official responds.</p>

      <div className="mt-5 overflow-hidden rounded-panel border border-line shadow-e1">
        {value.photo && (
          <div className="relative">
            <img src={value.photo} alt="Report preview" className="max-h-72 w-full object-cover" />
            <EditChip label="Photo" onClick={() => onEdit(0)} className="absolute right-3 top-3" />
          </div>
        )}
        <div className="space-y-4 p-5">
          <Row label="Details" onEdit={() => onEdit(1)}>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status="open" size="sm" />
              <SeverityBadge severity={value.severity} />
              <span className="inline-flex items-center gap-1 rounded-full bg-civic/10 px-2.5 py-1 text-xs font-semibold text-civic-600">
                {category?.icon && <category.icon className="size-3.5" />}
                {category?.label}
              </span>
            </div>
            <p className="mt-3 leading-relaxed text-slate">{value.description}</p>
          </Row>

          <Row label="Location" onEdit={() => onEdit(2)}>
            <div className="flex items-start gap-2 text-slate">
              <MapPin className="mt-0.5 size-4 shrink-0 text-civic-600" />
              <div>
                <p className="font-medium text-ink">
                  {value.lga ? `${value.lga}${value.state ? `, ${value.state}` : ''}` : 'Pinned location'}
                </p>
                {value.coordinates && (
                  <p className="font-data text-xs text-muted">
                    {value.coordinates.lat.toFixed(5)}, {value.coordinates.lng.toFixed(5)}
                  </p>
                )}
              </div>
            </div>
          </Row>

          {(value.reporterName || value.reporterContact) && (
            <Row label="Your details (private)" onEdit={() => onEdit(2)}>
              <p className="text-sm text-slate">
                {value.reporterName || 'Anonymous'}
                {value.reporterContact ? ` · ${value.reporterContact}` : ''}
              </p>
              <p className="mt-1 text-xs text-muted">Never shown publicly — for official follow-up only.</p>
            </Row>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, onEdit, children }) {
  return (
    <div className="border-t border-line pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</h3>
        <EditChip label="Edit" onClick={onEdit} />
      </div>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function EditChip({ label, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-line bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate shadow-e1 backdrop-blur hover:border-civic/40 hover:text-civic-600',
        className,
      )}
    >
      <Pencil className="size-3" /> {label}
    </button>
  )
}
