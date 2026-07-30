import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Camera,
  X,
  RotateCcw,
  Check,
  SwitchCamera,
  TriangleAlert,
  ImagePlus,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

/**
 * CameraCapture — in-page webcam capture for laptops/desktops.
 *
 * WHY THIS EXISTS: `<input type="file" capture="environment">` only opens a
 * camera on mobile. Desktop browsers ignore `capture` entirely and fall back to
 * a plain file dialog, so "Take a photo" was dead on laptops. This component
 * uses getUserMedia + a canvas frame grab to make it work there.
 *
 * Phones keep using the native camera app (better autofocus/flash/quality) —
 * see PhotoStep's device routing.
 *
 * Yields a real File to `onCapture` so it flows through the same
 * compressImage() pipeline as an uploaded photo.
 */

/** True when this browser can do in-page camera capture at all. */
export function supportsWebcam() {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
}

export function CameraCapture({ open, onClose, onCapture, onPickFile }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [phase, setPhase] = useState('starting') // starting | live | review | error
  const [errorMsg, setErrorMsg] = useState('')
  const [mirrored, setMirrored] = useState(false)
  const [facingMode, setFacingMode] = useState('environment')
  const [canSwitch, setCanSwitch] = useState(false)
  const [attempt, setAttempt] = useState(0) // bumped by "Retake" to restart the stream
  const [shot, setShot] = useState(null) // { url, file }

  /** Release the camera — the hardware light must go out when we're done. */
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  // Start (and restart on camera switch / retake). Cleanup always stops tracks.
  useEffect(() => {
    if (!open) return
    let cancelled = false

    const start = async () => {
      setPhase('starting')
      setErrorMsg('')
      setShot(null)

      if (!supportsWebcam()) {
        setPhase('error')
        setErrorMsg(
          typeof window !== 'undefined' && window.isSecureContext === false
            ? 'Browsers only allow camera access over a secure (https) connection. Open this site over https, or upload a photo instead.'
            : 'This browser cannot open the camera in-page. Please upload a photo instead.',
        )
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          // `ideal` (not `exact`) so a laptop with only a front camera still works.
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream

        // Front-facing cameras are previewed mirrored (what users expect of a
        // laptop webcam); rear cameras are not.
        const settings = stream.getVideoTracks()[0]?.getSettings?.() ?? {}
        setMirrored(settings.facingMode !== 'environment')

        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          try {
            await video.play()
          } catch {
            /* autoplay rejection is harmless — the stream still renders */
          }
        }
        setPhase('live')

        // Only offer the switch button when there really is another camera.
        try {
          const devices = await navigator.mediaDevices.enumerateDevices()
          if (!cancelled) {
            setCanSwitch(devices.filter((d) => d.kind === 'videoinput').length > 1)
          }
        } catch {
          /* enumerateDevices can throw on locked-down browsers — non-fatal */
        }
      } catch (err) {
        if (cancelled) return
        setPhase('error')
        setErrorMsg(messageFor(err))
      }
    }

    start()
    return () => {
      cancelled = true
      stopStream()
    }
  }, [open, facingMode, attempt, stopStream])

  // Esc closes.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  /** Grab the current video frame as a JPEG File. */
  const takeShot = () => {
    const video = videoRef.current
    if (!video?.videoWidth) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

    // Saved UNmirrored even when the preview was mirrored: this is evidence, so
    // it should record the scene as it actually is.
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setPhase('error')
          setErrorMsg('We could not capture that frame. Please try again.')
          return
        }
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
        setShot({ url: URL.createObjectURL(blob), file })
        setPhase('review')
        stopStream() // free the camera the moment we have the frame
      },
      'image/jpeg',
      0.92,
    )
  }

  const retake = () => {
    if (shot?.url) URL.revokeObjectURL(shot.url)
    setShot(null)
    setAttempt((n) => n + 1)
  }

  const usePhoto = () => {
    if (!shot) return
    onCapture(shot.file)
    URL.revokeObjectURL(shot.url)
    setShot(null)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Take a photo with your camera"
            initial={{ scale: 0.98, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative flex h-full w-full flex-col overflow-hidden bg-navy-950 sm:h-auto sm:max-w-2xl sm:rounded-modal sm:shadow-e3"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <h3 className="inline-flex items-center gap-2 font-sans text-sm font-bold text-white">
                <Camera className="size-4" aria-hidden />
                {phase === 'review' ? 'Use this photo?' : 'Take a photo'}
              </h3>
              <div className="flex items-center gap-1">
                {canSwitch && phase === 'live' && (
                  <button
                    type="button"
                    onClick={() =>
                      setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))
                    }
                    className="grid size-9 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
                    aria-label="Switch camera"
                    title="Switch camera"
                  >
                    <SwitchCamera className="size-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="grid size-9 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
                  aria-label="Close camera"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Viewfinder */}
            <div className="relative flex-1 bg-black">
              <div className="relative aspect-[4/3] w-full">
                {/* Kept mounted so the ref is always available for srcObject. */}
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className={cn(
                    'size-full object-cover',
                    mirrored && '-scale-x-100',
                    phase !== 'live' && 'invisible',
                  )}
                />

                {phase === 'starting' && (
                  <Overlay>
                    <Loader2 className="size-8 animate-spin text-white/80" />
                    <p className="text-sm text-white/80">Starting your camera…</p>
                    <p className="text-xs text-white/50">
                      Allow camera access if your browser asks.
                    </p>
                  </Overlay>
                )}

                {phase === 'review' && shot && (
                  <img
                    src={shot.url}
                    alt="Photo you just captured"
                    className="absolute inset-0 size-full object-cover"
                  />
                )}

                {phase === 'error' && (
                  <Overlay>
                    <span className="grid size-12 place-items-center rounded-full bg-accent/20 text-accent">
                      <TriangleAlert className="size-6" />
                    </span>
                    <p className="max-w-sm text-sm text-white/90">{errorMsg}</p>
                  </Overlay>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 px-4 py-4">
              {phase === 'live' && (
                <button
                  type="button"
                  onClick={takeShot}
                  className="grid size-16 place-items-center rounded-full bg-white text-ink shadow-e2 ring-4 ring-white/25 transition-transform hover:scale-105 active:scale-95"
                  aria-label="Capture photo"
                >
                  <Camera className="size-7" />
                </button>
              )}

              {phase === 'review' && (
                <>
                  <Button type="button" variant="outline" icon={RotateCcw} onClick={retake}>
                    Retake
                  </Button>
                  <Button type="button" variant="success" icon={Check} onClick={usePhoto}>
                    Use this photo
                  </Button>
                </>
              )}

              {phase === 'error' && (
                <>
                  <Button type="button" variant="outline" icon={RotateCcw} onClick={retake}>
                    Try again
                  </Button>
                  {onPickFile && (
                    <Button type="button" variant="success" icon={ImagePlus} onClick={onPickFile}>
                      Upload a photo instead
                    </Button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Overlay({ children }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
      {children}
    </div>
  )
}

/** Turn a getUserMedia DOMException into something a citizen can act on. */
function messageFor(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Camera access was blocked. Allow camera permission for this site (check the icon in your browser’s address bar), then try again — or upload a photo instead.'
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'We could not find a camera on this device. Please upload a photo instead.'
    case 'NotReadableError':
    case 'TrackStartError':
      return 'Your camera is already being used by another app. Close it (Zoom, Teams, Meet…) and try again.'
    case 'OverconstrainedError':
      return 'This camera does not support the requested video settings. Try switching camera.'
    case 'SecurityError':
      return 'Camera access is blocked on insecure connections. Open this site over https instead.'
    default:
      return 'We could not start the camera. Please upload a photo instead.'
  }
}
