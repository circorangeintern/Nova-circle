/* ---------------------------------------------------------------------------
   Reverse geocoding via OpenStreetMap Nominatim (free, no key). Turns GPS
   coordinates into a human address + LGA/state. Used by the report location
   step. Backend dev may later proxy this to avoid Nominatim rate limits.
--------------------------------------------------------------------------- */

/**
 * searchPlace — forward geocoding. Turns a typed query ("FUTO Owerri") into
 * candidate locations so users can place the pin accurately when GPS is off or
 * imprecise (common on laptops using IP-based location). Biased to Nigeria.
 */
export async function searchPlace(query) {
  if (!query || query.trim().length < 3) return []
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=ng&limit=6&addressdetails=1` +
    `&q=${encodeURIComponent(query)}`
  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
    if (!res.ok) throw new Error('search failed')
    const data = await res.json()
    return data.map((d) => {
      const a = d.address ?? {}
      const lga = a.county || a.city || a.municipality || a.town || a.suburb || ''
      const state = (a.state || '').replace(/ State$/i, '')
      return {
        label: d.display_name,
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon),
        lga,
        state,
      }
    })
  } catch {
    return []
  }
}

export async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
  try {
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en' },
    })
    if (!res.ok) throw new Error('geocode failed')
    const data = await res.json()
    const a = data.address ?? {}
    // Nigerian admin levels vary; try the most likely fields for LGA + state.
    const lga =
      a.county || a.city || a.municipality || a.town || a.suburb || a.local_government || ''
    const state = (a.state || '').replace(/ State$/i, '')
    return {
      address: data.display_name ?? '',
      lga,
      state,
    }
  } catch {
    // Graceful fallback — the user can still submit with coordinates only.
    return { address: '', lga: '', state: '' }
  }
}
