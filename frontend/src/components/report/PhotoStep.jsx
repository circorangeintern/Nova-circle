import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, ImagePlus, RotateCcw, Loader2, Info, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CameraCapture, supportsWebcam } from '@/components/report/CameraCapture'
import { compressImage, formatBytes } from '@/lib/image'
import { cn } from '@/lib/cn'

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024

/**
 * PhotoStep — capture or upload a photo of the issue. Compresses client-side
 * before storing (Nova Circle PRD non-functional requirement).
 * `value` is a data URL; `onChange(dataUrl)` updates the form.
 *
 * TWO DISTINCT PATHS, never conflated:
 *  - "Take a photo"  → phones: the native camera app via `capture="environment"`.
 *                      laptops: an in-page getUserMedia viewfinder, because
 *                      desktop browsers ignore `capture` and would otherwise
 *                      just open a file dialog.
 *  - "Upload from gallery" → a plain file input with NO `capture` attribute, so
 *                      the OS opens its photo picker / file browser. (A `capture`
 *                      attribute here is what previously sent gallery taps
 *                      straight to the camera.)
 * Laptops additionally get drag-and-drop and paste-from-clipboard.
 */
export function PhotoStep({ value, onChange, error }) {
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState('')
  const [meta, setMeta] = useState(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [dragging, setDragging] = useState(false)

  /** Shared pipeline for every source: input, camera, drop, paste. */
  const processFile = useCallback(
    async (file) => {
      if (!file) return
      if (!file.type?.startsWith('image/')) {
        setLocalError('That file is not an image. Please choose a JPEG, PNG or WEBP photo.')
        return
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setLocalError('That image is very large. Please choose one under 15MB.')
        return
      }
      setBusy(true)
      setLocalError('')
      try {
        const result = await compressImage(file)
        onChange(result.dataUrl)
        setMeta(result)
      } catch (err) {
        setLocalError(err.message)
      } finally {
        setBusy(false)
      }
    },
    [onChange],
  )

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    // Reset first (and unconditionally, including on cancel) so picking the
    // same file twice still fires a change event.
    e.target.value = ''
    processFile(file)
  }

  const openGallery = () => galleryInputRef.current?.click()

  /**
   * Route to whichever camera actually works on this device.
   * Touch-primary devices get the OS camera app; everything else gets the
   * in-page viewfinder; if neither is possible we fall back to the file dialog.
   */
  const openCamera = () => {
    const touchFirst =
      typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
    if (touchFirst) cameraInputRef.current?.click()
    else if (supportsWebcam()) setCameraOpen(true)
    else cameraInputRef.current?.click()
  }

  // Paste a screenshot or copied image (laptop convenience).
  useEffect(() => {
    const onPaste = (e) => {
      // Never hijack a paste aimed at a text field — EditReport renders this
      // step next to the description textarea.
      const el = e.target
      if (
        el instanceof HTMLElement &&
        (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName))
      ) {
        return
      }
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith('image/'),
      )
      const file = item?.getAsFile()
      if (file) processFile(file)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [processFile])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files?.[0])
  }

  return (
    <div>
      <h2 className="text-h3 font-bold text-ink">Add a photo of the issue</h2>
      <p className="mt-1 text-slate">
        Your photo is the evidence. A clear, close-up shot makes your report stronger.
      </p>

      {/* Native camera app — phones only (desktop browsers ignore `capture`). */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      {/* Gallery / file picker — deliberately NO `capture` attribute. */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {!value ? (
        /* Drop zone — every action inside it is explicitly labelled. */
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'mt-5 rounded-panel border-2 border-dashed transition-colors',
            dragging ? 'border-civic bg-civic/[0.06]' : 'border-line bg-surface',
            (error || localError) && !dragging && 'border-critical/50',
          )}
        >
          {busy ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <Loader2 className="size-9 animate-spin text-civic-500" />
              <span className="font-semibold text-slate">Compressing image…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
              <span className="grid size-16 place-items-center rounded-full bg-civic-500 text-white shadow-e1">
                <Camera className="size-8" aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-ink">Add a photo of the issue</p>
                <p className="mt-1 text-sm text-muted">
                  Take one now, or upload an existing photo.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button type="button" icon={Camera} onClick={openCamera}>
                  Take a photo
                </Button>
                <Button type="button" variant="secondary" icon={ImagePlus} onClick={openGallery}>
                  Upload from gallery
                </Button>
              </div>

              <p className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
                <UploadCloud className="size-3.5" aria-hidden />
                or drag an image here, or paste one with Ctrl+V
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5">
          <div className="overflow-hidden rounded-panel border border-line shadow-e1">
            <img
              src={value}
              alt="Your report photo preview"
              className="max-h-[420px] w-full object-cover"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            {meta && (
              <span className="text-sm text-muted">
                Compressed to {formatBytes(meta.approxSize)} · {meta.width}×{meta.height}px
              </span>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={RotateCcw}
                loading={busy}
                onClick={openCamera}
              >
                Retake photo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={ImagePlus}
                disabled={busy}
                onClick={openGallery}
              >
                Upload a different photo
              </Button>
            </div>
          </div>
        </div>
      )}

      {(error || localError) && (
        <p className="mt-3 text-sm font-medium text-critical" role="alert">
          {localError || error}
        </p>
      )}

      {!value && (
        <div className="mt-5 flex gap-2 rounded-card border border-civic/15 bg-civic/[0.04] p-3 text-sm text-slate">
          <Info className="mt-0.5 size-4 shrink-0 text-civic-600" aria-hidden />
          <span>Stand safely, capture the whole issue, and make sure there's good lighting.</span>
        </div>
      )}

      {/* Laptop/desktop viewfinder. */}
      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => {
          setCameraOpen(false)
          processFile(file)
        }}
        onPickFile={() => {
          setCameraOpen(false)
          openGallery()
        }}
      />
    </div>
  )
}
