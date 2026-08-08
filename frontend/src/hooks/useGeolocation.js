import { useCallback, useRef, useState } from 'react'

/**
 * useGeolocation — wraps the browser Geolocation API with clear status states
 * (Nova Circle PRD: "Capture GPS location automatically"). Never throws; sets
 * a friendly, specific error message the UI can show inline.
 */
export function useGeolocation() {
  const [status, setStatus] = useState('idle') // idle | locating | success | error
  const [coords, setCoords] = useState(null) // { lat, lng, accuracy }
  const [error, setError] = useState('')
  const requestId = useRef(0)

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('error')
      setError('Your device does not support location. You can drop the pin manually instead.')
      return
    }
    if (!window.isSecureContext) {
      setStatus('error')
      setError('Location access requires a secure (HTTPS) connection. Please open this site using HTTPS.')
      return
    }
    setStatus('locating')
    setError('')
    const currentRequest = ++requestId.current
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (currentRequest !== requestId.current) return
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
        setStatus('success')
      },
      (err) => {
        if (currentRequest !== requestId.current) return
        setStatus('error')
        const messages = {
          1: 'Location permission was denied. Enable it in your browser, or drop the pin manually.',
          2: 'We could not determine your location. Please drop the pin manually.',
          3: 'Locating took too long. Please try again or drop the pin manually.',
        }
        setError(messages[err.code] ?? 'We could not get your location. Drop the pin manually.')
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    )
  }, [])

  return { status, coords, error, locate, setCoords }
}
