import { useState } from 'react'
import toast from 'react-hot-toast'
import { Check, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { OFFICIAL_STATUS_FLOW, STATUSES } from '@/lib/constants'
import { updateReportStatus } from '@/services/api'
import { cn } from '@/lib/cn'

const WORKFLOW_LABELS = {
  open: 'Reported',
  acknowledged: 'Acknowledged',
  progress: 'In Progress',
  resolved: 'Resolved',
}

/**
 * StatusUpdatePanel — the ONLY mutation an official can perform on a report
 * (Nova Circle PRD Feature 3). Officials cannot edit citizen content or delete
 * reports — those affordances are intentionally absent, not merely disabled.
 */
export function StatusUpdatePanel({ report, onUpdated }) {
  const [selected, setSelected] = useState(report.status)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const changed = selected !== report.status
  const currentIndex = OFFICIAL_STATUS_FLOW.indexOf(report.status)
  const nextStatus = OFFICIAL_STATUS_FLOW[currentIndex + 1] ?? null

  const save = async () => {
    if (!changed) return
    setSaving(true)
    try {
      const updated = await updateReportStatus(report.id, selected, note.trim())
      toast.success(`Status updated to "${WORKFLOW_LABELS[selected]}".`)
      setNote('')
      onUpdated?.(updated)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-panel border border-line bg-white p-5 shadow-e1">
      <h3 className="text-h3 font-bold text-ink">Update status</h3>
      <p className="mt-1 text-sm text-muted">
        Move this report through the workflow. Your update is published publicly and recorded on the
        timeline.
      </p>

      <div className="mt-4 space-y-2">
        {OFFICIAL_STATUS_FLOW.map((key) => {
          const s = STATUSES[key]
          const isCurrent = report.status === key
          const isSelected = selected === key
          const selectable = key === report.status || key === nextStatus
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              disabled={!selectable}
              aria-pressed={isSelected}
              className={cn(
                'flex w-full items-center gap-3 rounded-card border-2 p-3 text-left transition-colors',
                isSelected ? 'shadow-e1' : 'border-line hover:border-civic/40',
                !selectable && 'cursor-not-allowed opacity-45',
              )}
              style={isSelected ? { borderColor: s.color, backgroundColor: `${s.color}0d` } : undefined}
            >
              <span className="grid size-6 place-items-center rounded-full" style={{ backgroundColor: s.color }}>
                {isSelected && <Check className="size-4 text-white" strokeWidth={3} />}
              </span>
              <span className="font-semibold text-ink">{WORKFLOW_LABELS[key]}</span>
              {isCurrent && (
                <span className="ml-auto rounded-full bg-slate/[0.08] px-2 py-0.5 text-xs font-medium text-muted">
                  Current
                </span>
              )}
            </button>
          )
        })}
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-ink">Official response (optional)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="e.g. Contractor has been mobilised, work begins Monday."
          className="mt-1.5 w-full resize-none rounded-card border border-line px-3 py-2 text-sm focus:border-civic focus:outline-none focus:ring-2 focus:ring-civic/30"
        />
      </label>

      <Button fullWidth size="lg" loading={saving} disabled={!changed} onClick={save} className="mt-3">
        {changed ? 'Publish status update' : 'Select a new status'}
      </Button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
        <Lock className="size-3.5" /> You can update status only — citizen reports cannot be edited or deleted.
      </p>
    </div>
  )
}
