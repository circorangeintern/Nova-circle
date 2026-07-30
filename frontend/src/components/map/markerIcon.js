import L from 'leaflet'
import { STATUSES } from '@/lib/constants'

/**
 * Build a status-coloured Leaflet divIcon (teardrop pin). Critical/open reports
 * get an animated halo. Pure SVG so it scales crisply and matches the tokens.
 * (PRD §5.3: pins colour-coded by status.)
 */
export function statusMarker(status = 'open', { pulse = false } = {}) {
  const s = STATUSES[status] ?? STATUSES.open
  const halo = pulse
    ? `<span class="pe-pin-halo" style="--pin:${s.color}"></span>`
    : ''
  return L.divIcon({
    className: 'pe-pin-wrap',
    html: `
      <span class="pe-pin" style="--pin:${s.color}">
        ${halo}
        <svg viewBox="0 0 24 24" width="30" height="30" fill="${s.color}" stroke="white" stroke-width="1.6">
          <path d="M12 2C7.6 2 4 5.6 4 10c0 5.2 6.4 11 7.3 11.8.4.3.9.3 1.3 0C13.6 21 20 15.2 20 10c0-4.4-3.6-8-8-8Z"/>
          <circle cx="12" cy="10" r="3" fill="white" stroke="none"/>
        </svg>
      </span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
  })
}
