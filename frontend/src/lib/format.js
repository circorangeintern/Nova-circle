/** Relative "time ago" formatting for report timestamps. */
export function timeAgo(iso) {
  const then = new Date(iso).getTime()
  const secs = Math.max(1, Math.round((Date.now() - then) / 1000))
  const table = [
    [60, 'sec'],
    [3600, 'min', 60],
    [86400, 'hr', 3600],
    [604800, 'day', 86400],
    [2629800, 'wk', 604800],
  ]
  for (const [limit, unit, div] of table) {
    if (secs < limit) {
      const n = div ? Math.floor(secs / div) : secs
      return `${n} ${unit}${n !== 1 ? 's' : ''} ago`
    }
  }
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Full date, e.g. "8 Jul 2026, 12:10 PM". */
export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
