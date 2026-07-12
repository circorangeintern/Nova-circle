import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import {
  MapPin,
  LocateFixed,
  Loader2,
  ChevronDown,
  ShieldCheck,
  Search,
  Crosshair,
  TriangleAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useGeolocation } from '@/hooks/useGeolocation'
import { reverseGeocode, searchPlace } from '@/lib/geocode'
import { cn } from '@/lib/cn'

const NIGERIA_CENTER = [9.082, 8.6753]

const pinIcon = L.divIcon({
  className: 'pe-pin-wrap',
  html: `<span class="pe-pin" style="--pin:#2563EB">
      <svg viewBox="0 0 24 24" width="34" height="34" fill="#2563EB" stroke="white" stroke-width="1.6">
        <path d="M12 2C7.6 2 4 5.6 4 10c0 5.2 6.4 11 7.3 11.8.4.3.9.3 1.3 0C13.6 21 20 15.2 20 10c0-4.4-3.6-8-8-8Z"/>
        <circle cx="12" cy="10" r="3" fill="white" stroke="none"/>
      </svg></span>`,
  iconSize: [34, 34],
  iconAnchor: [17, 31],
})

function Recenter({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 16, { duration: 0.6 })
  }, [coords, map])
  return null
}

function ClickToPlace({ onPlace }) {
  useMapEvents({ click: (e) => onPlace({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

/**
 * LocationStep — set the report location accurately on any device.
 * Three ways to place the pin: (1) search a place, (2) use GPS, (3) tap/drag on
 * the map. GPS accuracy is shown, and low accuracy (common on laptops that use
 * IP-based location) triggers a "please refine" warning so the pin is never
 * silently wrong.
 */
export function LocationStep({ value, onChange, error }) {
  const { status, coords, error: geoError, locate } = useGeolocation()
  const [address, setAddress] = useState(
    value.coordinates ? { lga: value.lga, state: value.state, address: value.address } : null,
  )
  const [accuracy, setAccuracy] = useState(null) // metres, GPS only
  const [geocoding, setGeocoding] = useState(false)
  const [showReporter, setShowReporter] = useState(false)

  // Search state
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef(null)

  const requestedOnce = useRef(false)

  // Auto-request GPS on first mount only.
  useEffect(() => {
    if (!requestedOnce.current && !value.coordinates) {
      requestedOnce.current = true
      locate()
    }
  }, [locate, value.coordinates])

  // When GPS resolves, capture accuracy + apply coords.
  useEffect(() => {
    if (coords) {
      setAccuracy(coords.accuracy ?? null)
      applyCoords(coords)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords])

  // Debounced place search.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 3) {
      setResults([])
      return
    }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      const r = await searchPlace(query)
      setResults(r)
      setSearching(false)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const applyCoords = async (c, known) => {
    onChange({ coordinates: { lat: c.lat, lng: c.lng } })
    if (known?.lga || known?.state) {
      setAddress({ lga: known.lga, state: known.state, address: known.label ?? '' })
      onChange({ coordinates: { lat: c.lat, lng: c.lng }, lga: known.lga, state: known.state, address: known.label ?? '' })
      return
    }
    setGeocoding(true)
    const geo = await reverseGeocode(c.lat, c.lng)
    setGeocoding(false)
    setAddress(geo)
    onChange({ coordinates: { lat: c.lat, lng: c.lng }, lga: geo.lga, state: geo.state, address: geo.address })
  }

  const selectResult = (r) => {
    setAccuracy(null) // manual selection is exact
    setQuery('')
    setResults([])
    applyCoords({ lat: r.lat, lng: r.lng }, r)
  }

  // A manual placement (drag / tap / search) clears the GPS-accuracy warning.
  const placeManually = (c) => {
    setAccuracy(null)
    applyCoords(c)
  }

  const current = value.coordinates
  const locating = status === 'locating'
  const inaccurate = accuracy != null && accuracy > 500

  return (
    <div>
      <h2 className="text-h3 font-bold text-ink">Confirm the location</h2>
      <p className="mt-1 text-slate">
        Search your area, use GPS, or tap the map. Drag the pin to place it exactly on the issue.
      </p>

      {/* Search box */}
      <div className="relative mt-4">
        <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2.5 focus-within:border-civic focus-within:ring-2 focus-within:ring-civic/30">
          <Search className="size-4 shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a place, e.g. FUTO Owerri, Ikeja, Aba"
            className="w-full bg-transparent text-[15px] focus:outline-none"
            aria-label="Search for a location"
          />
          {searching && <Loader2 className="size-4 animate-spin text-muted" />}
        </div>
        {results.length > 0 && (
          <ul className="absolute z-[600] mt-1.5 max-h-64 w-full overflow-auto rounded-card border border-line bg-white py-1 shadow-e3">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => selectResult(r)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-surface"
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-civic-600" />
                  <span className="text-sm text-slate">{r.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div className="relative mt-4 h-72 overflow-hidden rounded-panel border border-line shadow-e1 sm:h-80">
        <MapContainer
          center={current ? [current.lat, current.lng] : NIGERIA_CENTER}
          zoom={current ? 16 : 6}
          scrollWheelZoom
          className="size-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <Recenter coords={current} />
          <ClickToPlace onPlace={placeManually} />
          {current && (
            <Marker
              position={[current.lat, current.lng]}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng()
                  placeManually({ lat, lng })
                },
              }}
            />
          )}
        </MapContainer>

        {locating && (
          <div className="absolute inset-0 z-[500] grid place-items-center bg-white/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-slate">
              <Loader2 className="size-7 animate-spin text-civic-500" />
              <span className="text-sm font-medium">Detecting your location…</span>
            </div>
          </div>
        )}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={LocateFixed}
          onClick={locate}
          className="absolute right-3 top-3 z-[500] bg-white/95 shadow-e2 backdrop-blur"
        >
          Use GPS
        </Button>
      </div>

      {/* Low-accuracy warning */}
      {inaccurate && (
        <div className="mt-3 flex items-start gap-2 rounded-card border border-warning/30 bg-warning/[0.08] p-3 text-sm text-[#92400E]">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
          <span>
            Your device reported an approximate location (±{Math.round(accuracy)}m) — this is common on
            laptops. Please <strong>search your area above</strong> or drag the pin to the exact spot.
          </span>
        </div>
      )}

      {/* Address card */}
      <div className="mt-3 flex items-start gap-3 rounded-card border border-line bg-surface p-4">
        <MapPin className="mt-0.5 size-5 shrink-0 text-civic-600" />
        <div className="min-w-0 flex-1">
          {geocoding ? (
            <span className="text-sm text-muted">Looking up address…</span>
          ) : current ? (
            <>
              <p className="font-semibold text-ink">
                {address?.lga ? `${address.lga}${address.state ? `, ${address.state}` : ''}` : 'Pin placed'}
              </p>
              {address?.address && <p className="mt-0.5 line-clamp-2 text-sm text-muted">{address.address}</p>}
              <p className="mt-1 flex items-center gap-1.5 font-data text-xs text-muted">
                <Crosshair className="size-3" />
                {current.lat.toFixed(5)}, {current.lng.toFixed(5)}
                {accuracy != null && !inaccurate && <span className="text-success">· GPS ±{Math.round(accuracy)}m</span>}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">No location yet — search, allow GPS, or tap the map.</p>
          )}
        </div>
      </div>

      {geoError && <p className="mt-2 text-sm text-warning">{geoError}</p>}
      {error && !current && <p className="mt-2 text-sm font-medium text-critical">{error}</p>}

      {/* Optional reporter details */}
      <div className="mt-5 rounded-card border border-line">
        <button
          type="button"
          onClick={() => setShowReporter((v) => !v)}
          className="flex w-full items-center justify-between p-4 text-left"
          aria-expanded={showReporter}
        >
          <span className="font-semibold text-ink">Add your details (optional)</span>
          <ChevronDown className={cn('size-5 text-muted transition-transform', showReporter && 'rotate-180')} />
        </button>
        {showReporter && (
          <div className="space-y-3 border-t border-line p-4">
            <label className="block">
              <span className="text-sm font-medium text-slate">Your name</span>
              <input
                type="text"
                value={value.reporterName ?? ''}
                onChange={(e) => onChange({ reporterName: e.target.value })}
                placeholder="Anonymous"
                className="mt-1 h-11 w-full rounded-lg border border-line px-3 focus:border-civic focus:outline-none focus:ring-2 focus:ring-civic/30"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate">Phone or email (for official follow-up only)</span>
              <input
                type="text"
                value={value.reporterContact ?? ''}
                onChange={(e) => onChange({ reporterContact: e.target.value })}
                placeholder="Never shown publicly"
                className="mt-1 h-11 w-full rounded-lg border border-line px-3 focus:border-civic focus:outline-none focus:ring-2 focus:ring-civic/30"
              />
            </label>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <ShieldCheck className="size-3.5 text-success" /> Anonymous reports are accepted and treated equally.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
