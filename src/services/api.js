/* ---------------------------------------------------------------------------
   API service boundary.
   Every screen talks to the backend ONLY through these functions. Right now
   they resolve mock data after a short delay to simulate the network.

   Backend dev: swap the bodies for real fetch/axios calls to your endpoints
   (see PRD §9.2 route/endpoint list). Keep the function signatures and the
   returned object shapes identical and nothing in the UI needs to change.
--------------------------------------------------------------------------- */

import { platformStats, reports, sampleTimeline } from '@/data/mockData'

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms))

export async function getPlatformStats() {
  await delay(250)
  return platformStats
}

export async function getReports(filters = {}) {
  await delay()
  let result = [...reports]
  if (filters.category) result = result.filter((r) => r.category === filters.category)
  if (filters.status) result = result.filter((r) => r.status === filters.status)
  if (filters.severity) result = result.filter((r) => r.severity === filters.severity)
  return result
}

export async function getRecentReports(limit = 6) {
  await delay()
  return [...reports]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
}

export async function getReportById(id) {
  await delay()
  const report = reports.find((r) => r.id === id)
  return report ? { ...report, timeline: sampleTimeline } : null
}

// Placeholder — backend implements the real POST /report (PRD §5.2)
export async function submitReport(payload) {
  await delay(1200)
  return { id: `PE-2026-${Math.floor(100000 + payload.__seq * 7).toString().slice(0, 6)}` }
}
