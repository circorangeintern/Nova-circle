import { useRef, useState } from 'react'
import { Camera, ImagePlus, RotateCcw, Loader2, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { compressImage, formatBytes } from '@/lib/image'
import { cn } from '@/lib/cn'

/**
 * PhotoStep — capture or upload a photo of the issue. Compresses client-side
 * before storing (Nova Circle PRD non-functional requirement).
 * `value` is a data URL; `onChange(dataUrl)` updates the form.
 */
export function PhotoStep({ value, onChange, error }) {
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState('')
  const [meta, setMeta] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const captureIdRef = useRef(0)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Phone cameras frequently create photos larger than 15 MB. They are
    // reduced to a 1600px JPEG by compressImage, so do not reject them before
    // the user can even see their capture.
    const captureId = ++captureIdRef.current
    setBusy(true)
    setLocalError('')

    // FileReader data URLs render consistently after a native camera app
    // hands control back to mobile browsers, including where blob URLs do not.
    const reader = new FileReader()
    reader.onload = () => {
      if (captureId === captureIdRef.current && typeof reader.result === 'string') {
        setPreviewUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
    try {
      const result = await compressImage(file)
      if (captureId !== captureIdRef.current) return
      onChange(result.dataUrl)
      setMeta(result)
      captureIdRef.current += 1 // ignore a late FileReader callback
      setPreviewUrl('')
    } catch (err) {
      if (captureId !== captureIdRef.current) return
      setLocalError(err.message)
    } finally {
      setBusy(false)
      e.target.value = '' // allow re-selecting the same file
    }
  }

  const imageSrc = previewUrl || value

  return (
    <div>
      <h2 className="text-h3 font-bold text-ink">Add a photo of the issue</h2>
      <p className="mt-1 text-slate">Your photo is the evidence. A clear, close-up shot makes your report stronger.</p>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="sr-only"
        aria-label="Take a photo of the issue"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="sr-only"
        aria-label="Choose a photo from your gallery"
      />

      {!imageSrc ? (
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={busy}
          className={cn(
            'mt-5 flex w-full flex-col items-center justify-center gap-3 rounded-panel border-2 border-dashed border-line bg-surface px-6 py-14 text-center transition-colors hover:border-civic/50 hover:bg-civic/[0.03]',
            (error || localError) && 'border-critical/50',
          )}
        >
          {busy ? (
            <>
              <Loader2 className="size-9 animate-spin text-civic-500" />
              <span className="font-semibold text-slate">Compressing image…</span>
            </>
          ) : (
            <>
              <span className="grid size-16 place-items-center rounded-full bg-civic-500 text-white shadow-e1">
                <Camera className="size-8" />
              </span>
              <span className="font-semibold text-ink">Take a photo of the issue</span>
              <span className="text-sm text-muted">or tap to choose from your gallery</span>
            </>
          )}
        </button>
      ) : (
        <div className="mt-5">
          <div className="overflow-hidden rounded-panel border border-line shadow-e1">
            <img src={imageSrc} alt="Your report photo preview" className="max-h-[420px] w-full object-cover" />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            {busy ? (
              <span className="inline-flex items-center gap-2 text-sm text-muted">
                <Loader2 className="size-4 animate-spin text-civic-500" /> Saving your photo…
              </span>
            ) : meta && (
              <span className="text-sm text-muted">
                Compressed to {formatBytes(meta.approxSize)} · {meta.width}×{meta.height}px
              </span>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" icon={RotateCcw} disabled={busy} onClick={() => cameraInputRef.current?.click()}>
                Take another photo
              </Button>
              <Button type="button" variant="ghost" size="sm" icon={ImagePlus} disabled={busy} onClick={() => galleryInputRef.current?.click()}>
                Choose from gallery
              </Button>
            </div>
          </div>
        </div>
      )}

      {(error || localError) && (
        <p className="mt-3 text-sm font-medium text-critical">{localError || error}</p>
      )}

      {!imageSrc && (
        <div className="mt-5 flex gap-2 rounded-card border border-civic/15 bg-civic/[0.04] p-3 text-sm text-slate">
          <Info className="mt-0.5 size-4 shrink-0 text-civic-600" />
          <span>Stand safely, capture the whole issue, and make sure there's good lighting.</span>
        </div>
      )}

      {!imageSrc && (
        <Button type="button" variant="ghost" icon={ImagePlus} className="mt-4" onClick={() => galleryInputRef.current?.click()}>
          Choose from gallery
        </Button>
      )}
    </div>
  )
}
