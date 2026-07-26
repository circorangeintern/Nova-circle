import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Map as MapIcon, Share2, Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

/**
 * SuccessStep — "Your report is now public" + report ID and next actions
 * (Master PRD §3.2 Step 5 / Nova Circle PRD success screen).
 */
export function SuccessStep({ reportId, onReportAnother }) {
  const share = async () => {
    const url = `${window.location.origin}/reports/${reportId}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'PublicEye NG report', url })
      } catch {
        /* dismissed */
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Report link copied to clipboard.')
    }
  }

  return (
    <div className="mx-auto max-w-lg py-6 text-center">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 18 }}
        className="mx-auto grid size-20 place-items-center rounded-full bg-success/10 text-success"
      >
        <CheckCircle2 className="size-11" strokeWidth={2} />
      </motion.span>

      <h2 className="mt-6 font-display text-3xl font-bold text-ink">Your report is now public</h2>
      <p className="mt-2 text-slate">
        It's on the public map and officials in the area have been notified. Thank you for helping make it
        impossible to ignore.
      </p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2">
        <FileText className="size-4 text-civic-600" />
        <span className="text-sm text-muted">Report ID</span>
        <span className="font-data font-bold text-ink">{reportId}</span>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Button as={Link} to={`/reports/${reportId}`} size="lg" icon={FileText}>
          View my report
        </Button>
        <Button as={Link} to="/map" size="lg" variant="secondary" icon={MapIcon}>
          View on map
        </Button>
        <Button onClick={share} size="lg" variant="secondary" icon={Share2}>
          Share report
        </Button>
        <Button onClick={onReportAnother} size="lg" variant="ghost" icon={Plus}>
          Report another issue
        </Button>
      </div>
    </div>
  )
}
