import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './Button'

/**
 * ConfirmDialog — accessible confirmation modal for destructive actions
 * (Master PRD: every destructive action is confirmed). Esc + backdrop close.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  children,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && !loading && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, loading])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => !loading && onClose()} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-md rounded-modal bg-white p-6 shadow-e3"
          >
            <button
              onClick={() => !loading && onClose()}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-muted hover:bg-slate/[0.06]"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            {variant === 'danger' && (
              <span className="grid size-11 place-items-center rounded-full bg-critical/10 text-critical">
                <AlertTriangle className="size-6" />
              </span>
            )}

            <h3 id="confirm-title" className="mt-4 text-h3 font-bold text-ink">
              {title}
            </h3>
            {description && <p className="mt-2 text-slate">{description}</p>}
            {children}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose} disabled={loading}>
                {cancelLabel}
              </Button>
              <Button variant={variant} onClick={onConfirm} loading={loading}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
