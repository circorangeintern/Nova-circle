/* ---------------------------------------------------------------------------
   API service boundary.
   Every screen talks to the backend ONLY through these functions. For the MVP
   they operate on an in-memory repo seeded from mock data, so submissions and
   official status changes persist for the session and show up everywhere
   (map, lists, dashboard) — giving a cohesive demo.

   Backend dev: swap the bodies for real fetch/axios calls (PRD §9.2). Keep the
   signatures and returned object shapes identical and the UI won't change.
--------------------------------------------------------------------------- */

import { platformStats, reports as seedReports, sampleTimeline } from '@/data/mockData'

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms))

// Mutable session repo (clone so we never mutate the seed module).
let repo = seedReports.map((r) => ({ ...r, timeline: buildTimeline(r) }))
let seq = 4300

function buildTimeline(report) {
  // Seed a plausible timeline from the report's current status.
  const base = [
    { status: 'open', label: 'Reported', date: report.createdAt, party: 'Anonymous citizen', note: 'Report published to the public map.' },
  ]
  if (report.id === 'PE-2026-004218') return sampleTimeline
  return base
}

export async function getPlatformStats() {
  await delay(250)
  const resolved = repo.filter((r) => r.status === 'resolved').length
  return {
    ...platformStats,
    reports: { ...platformStats.reports, value: platformStats.reports.value + (repo.length - seedReports.length) },
    resolved: { ...platformStats.resolved, value: platformStats.resolved.value + Math.max(0, resolved - 1) },
  }
}

export async function getReports(filters = {}) {
  await delay()
  let result = [...repo].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  if (filters.category) result = result.filter((r) => r.category === filters.category)
  if (filters.status) result = result.filter((r) => r.status === filters.status)
  if (filters.severity) result = result.filter((r) => r.severity === filters.severity)
  return result.map(stripTimeline)
}

export async function getRecentReports(limit = 6) {
  await delay()
  return [...repo]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
    .map(stripTimeline)
}

export async function getReportById(id) {
  await delay()
  const report = repo.find((r) => r.id === id)
  return report ? { ...report } : null
}

/**
 * createReport — citizen submission (Nova Circle PRD Feature 1).
 * Accepts the report form payload, assigns an ID, prepends to the repo.
 */
export async function createReport(payload) {
  await delay(900)
  seq += 1
  const id = `PE-2026-${String(seq).padStart(6, '0')}`
  const now = new Date().toISOString()
  const report = {
    id,
    title: payload.title || deriveTitle(payload),
    category: payload.category,
    severity: payload.severity,
    status: 'open',
    description: payload.description,
    lga: payload.lga || 'Unknown',
    state: payload.state || '',
    coordinates: payload.coordinates,
    confirmations: 0,
    createdAt: now,
    photo: payload.photo,
    ownerId: payload.ownerId ?? null, // links a report to a signed-in citizen
    reporter: payload.reporter ?? null, // { name, contact } — never shown publicly
    timeline: [
      { status: 'open', label: 'Reported', date: now, party: 'Anonymous citizen', note: 'Report published to the public map.' },
    ],
  }
  repo = [report, ...repo]
  return { id, report: stripTimeline(report) }
}

/**
 * updateReportStatus — official action (Nova Circle PRD Feature 3).
 * Appends an auditable timeline event. Officials can change status ONLY —
 * never edit citizen content or delete the report.
 */
export async function updateReportStatus(id, nextStatus, note = '', official = {}) {
  await delay(500)
  const report = repo.find((r) => r.id === id)
  if (!report) return null
  report.status = nextStatus
  report.timeline = [
    ...(report.timeline ?? []),
    {
      status: nextStatus,
      label: labelFor(nextStatus),
      date: new Date().toISOString(),
      party: official.name ? `${official.name}, ${official.lga}` : 'LGA Official',
      note,
    },
  ]
  return { ...report }
}

/** All reports owned by a signed-in citizen (their contribution history). */
export async function getReportsByUser(userId) {
  await delay()
  return repo
    .filter((r) => r.ownerId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(stripTimeline)
}

/**
 * updateReport — citizen edits their OWN report. Allowed only while the report
 * is still "open" (immutable once an official acknowledges it — preserves
 * evidentiary integrity). Officials never use this path.
 */
export async function updateReport(id, ownerId, patch) {
  await delay(500)
  const report = repo.find((r) => r.id === id)
  if (!report) return { ok: false, error: 'Report not found.' }
  if (report.ownerId !== ownerId) return { ok: false, error: 'You can only edit your own reports.' }
  if (report.status !== 'open') return { ok: false, error: 'This report can no longer be edited — an official has already responded.' }
  const allowed = ['category', 'severity', 'description', 'photo', 'coordinates', 'lga', 'state']
  for (const key of allowed) if (key in patch) report[key] = patch[key]
  return { ok: true, report: { ...report } }
}

/** deleteReport — citizen removes their OWN report while still "open". */
export async function deleteReport(id, ownerId) {
  await delay(400)
  const report = repo.find((r) => r.id === id)
  if (!report) return { ok: false, error: 'Report not found.' }
  if (report.ownerId !== ownerId) return { ok: false, error: 'You can only delete your own reports.' }
  if (report.status !== 'open') return { ok: false, error: 'This report can no longer be deleted — an official has already responded.' }
  repo = repo.filter((r) => r.id !== id)
  return { ok: true }
}

/** Aggregates for the official/analytics dashboard (Nova Circle PRD Feature 4). */
export async function getReportStats() {
  await delay(300)
  const byCategory = {}
  const byStatus = {}
  for (const r of repo) {
    byCategory[r.category] = (byCategory[r.category] ?? 0) + 1
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1
  }
  const mostReported = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  return {
    total: repo.length,
    resolved: byStatus.resolved ?? 0,
    open: byStatus.open ?? 0,
    inProgress: byStatus.progress ?? 0,
    byCategory,
    byStatus,
    mostReported,
  }
}

// ---- helpers ----
function stripTimeline({ timeline, ...rest }) {
  return rest
}
function deriveTitle(p) {
  const cat = { roads: 'Road', school: 'School', water: 'Water', electricity: 'Electricity' }[p.category] ?? 'Infrastructure'
  return `${cat} issue reported in ${p.lga || 'community'}`
}
function labelFor(status) {
  return { open: 'Reported', acknowledged: 'Acknowledged', progress: 'In Progress', resolved: 'Resolved' }[status] ?? status
}
