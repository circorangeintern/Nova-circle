const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

const SESSION_KEYS = {
  citizen: 'publiceye-citizen-session',
  official: 'publiceye-official-auth',
}

const CATEGORY_TO_API = {
  roads: 'ROAD',
  school: 'SCHOOL',
  water: 'WATER',
  electricity: 'ELECTRICITY',
}

const CATEGORY_FROM_API = Object.fromEntries(
  Object.entries(CATEGORY_TO_API).map(([client, api]) => [api, client]),
)

const STATUS_TO_API = {
  open: 'REPORTED',
  acknowledged: 'ACKNOWLEDGED',
  progress: 'IN_PROGRESS',
  resolved: 'RESOLVED',
}

const STATUS_FROM_API = Object.fromEntries(
  Object.entries(STATUS_TO_API).map(([client, api]) => [api, client]),
)

const SEVERITY_TO_API = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  critical: 'CRITICAL',
}

const SEVERITY_FROM_API = Object.fromEntries(
  Object.entries(SEVERITY_TO_API).map(([client, api]) => [api, client]),
)

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

function getStoredToken(kind) {
  if (typeof localStorage === 'undefined') return null
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEYS[kind]))
    return session?.state?.token ?? null
  } catch {
    return null
  }
}

async function request(path, { token, headers, ...options } = {}) {
  const finalHeaders = new Headers(headers)
  if (!(options.body instanceof FormData) && options.body != null) {
    finalHeaders.set('Content-Type', 'application/json')
  }
  if (token) finalHeaders.set('Authorization', `Bearer ${token}`)

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: finalHeaders,
    })
  } catch {
    throw new ApiError('Unable to reach the PublicEye server. Check your connection and try again.')
  }

  if (response.status === 204) return null

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(data.message || 'The request could not be completed.', {
      status: response.status,
      code: data.error,
      details: data.details,
    })
  }
  return data
}

function apiAssetUrl(path) {
  if (!path || /^(data:|blob:|https?:\/\/)/i.test(path)) return path
  if (/^https?:\/\//i.test(API_BASE_URL)) {
    return new URL(path, API_BASE_URL).toString()
  }
  return path
}

function deriveTitle(report) {
  const names = {
    roads: 'Road',
    school: 'School',
    water: 'Water',
    electricity: 'Electricity',
  }
  const category = CATEGORY_FROM_API[report.category] ?? report.category ?? 'infrastructure'
  return `${names[category] ?? 'Infrastructure'} issue reported${report.lga ? ` in ${report.lga}` : ''}`
}

function mapTimeline(report) {
  const initial = {
    status: 'open',
    label: 'Reported',
    date: report.createdAt,
    party: 'Citizen report',
    note: 'Report published to the public map.',
  }
  const history = (report.statusHistory ?? []).map((entry) => ({
    status: STATUS_FROM_API[entry.status] ?? entry.status,
    label: {
      ACKNOWLEDGED: 'Acknowledged',
      IN_PROGRESS: 'In Progress',
      RESOLVED: 'Resolved',
    }[entry.status] ?? entry.status,
    date: entry.createdAt,
    party: entry.changedBy?.name
      ? `${entry.changedBy.name}${entry.changedBy.jurisdiction ? `, ${entry.changedBy.jurisdiction}` : ''}`
      : 'Government official',
    note: entry.note || 'Status updated by a government official.',
  }))
  return [initial, ...history]
}

function mapReport(report) {
  if (!report) return null
  return {
    id: report.id,
    title: report.title || deriveTitle(report),
    category: CATEGORY_FROM_API[report.category] ?? report.category,
    severity: SEVERITY_FROM_API[report.severity] ?? report.severity ?? 'medium',
    status: STATUS_FROM_API[report.status] ?? report.status,
    description: report.description,
    lga: report.lga || 'Pinned location',
    state: report.state || 'Nigeria',
    address: report.address || '',
    coordinates: {
      lat: Number(report.latitude),
      lng: Number(report.longitude),
    },
    confirmations: report.confirmations ?? 0,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    photo: apiAssetUrl(report.photoUrl),
    ownerId: report.citizenId ?? report.citizen?.id ?? null,
    citizen: report.citizen ?? null,
    reporter:
      report.reporterName || report.reporterContact
        ? { name: report.reporterName, contact: report.reporterContact }
        : null,
    timeline: mapTimeline(report),
  }
}

export function mapUser(user) {
  if (!user) return null
  const official = user.role === 'GOVERNMENT_OFFICIAL'
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: official ? 'LGA Official' : 'Citizen',
    backendRole: user.role,
    createdAt: user.createdAt,
    prefs: { defaultAnonymous: user.defaultAnonymous ?? true },
    lga: user.jurisdiction || 'Assigned jurisdiction',
    state: user.state || 'Nigeria',
    department: user.department || 'Works & Infrastructure',
    can: official
      ? { updateStatus: true, viewAnalytics: true, deleteReport: false, editReport: false }
      : undefined,
  }
}

export async function registerAccount(credentials) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  return { user: mapUser(data.user), token: data.token, role: data.user.role }
}

export async function loginAccount(credentials) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    }),
  })
  return { user: mapUser(data.user), token: data.token, role: data.user.role }
}

export async function getCurrentUser(token) {
  const data = await request('/auth/me', { token })
  return mapUser(data.user)
}

export async function updateCurrentUser(token, patch) {
  const data = await request('/auth/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify({
      ...(patch.name != null && { name: patch.name }),
      ...(patch.prefs?.defaultAnonymous != null && {
        defaultAnonymous: patch.prefs.defaultAnonymous,
      }),
    }),
  })
  return mapUser(data.user)
}

export async function changeCurrentPassword(token, { current, next }) {
  await request('/auth/password', {
    method: 'PATCH',
    token,
    body: JSON.stringify({ currentPassword: current, newPassword: next }),
  })
}

export async function deleteCurrentAccount(token) {
  await request('/auth/me', { method: 'DELETE', token })
}

export async function getPlatformStats() {
  const data = await request('/analytics/summary')
  const byStatus = Object.fromEntries(
    data.reportsByStatus.map((entry) => [STATUS_FROM_API[entry.status] ?? entry.status, entry.count]),
  )
  return {
    reports: { value: data.totalReports, deltaPct: 0 },
    lgas: { value: data.activeLgas ?? 0, deltaPct: 0 },
    resolved: { value: byStatus.resolved ?? 0, deltaPct: 0 },
    responseRate: { value: data.responseRate ?? 0, deltaPct: 0 },
  }
}

function publicReportQuery(filters = {}) {
  const params = new URLSearchParams()
  params.set('limit', String(filters.limit ?? 100))
  if (filters.page) params.set('page', String(filters.page))
  if (filters.category) params.set('category', CATEGORY_TO_API[filters.category] ?? filters.category)
  if (filters.status) params.set('status', STATUS_TO_API[filters.status] ?? filters.status)
  return params
}

export async function getReports(filters = {}) {
  const data = await request(`/public/reports?${publicReportQuery(filters)}`)
  return data.reports.map(mapReport)
}

export async function getRecentReports(limit = 6) {
  const data = await request(`/public/reports?${publicReportQuery({ limit })}`)
  return data.reports.map(mapReport)
}

export async function getReportById(id) {
  try {
    const data = await request(`/public/reports/${encodeURIComponent(id)}`)
    return mapReport(data.report)
  } catch (error) {
    if (error.code === 'NOT_FOUND') return null
    throw error
  }
}

export async function getCitizenReportById(id) {
  try {
    const data = await request(`/reports/${encodeURIComponent(id)}`, {
      token: getStoredToken('citizen'),
    })
    return mapReport(data.report)
  } catch (error) {
    if (error.code === 'NOT_FOUND') return null
    throw error
  }
}

function appendText(formData, key, value) {
  if (value !== undefined && value !== null && value !== '') {
    formData.append(key, String(value))
  }
}

async function appendPhoto(formData, photo) {
  if (!photo || (typeof photo === 'string' && !photo.startsWith('data:'))) return
  if (typeof File !== 'undefined' && photo instanceof File) {
    formData.append('photo', photo)
    return
  }
  const blob = await fetch(photo).then((response) => response.blob())
  formData.append('photo', blob, 'report.jpg')
}

async function reportFormData(payload) {
  const formData = new FormData()
  await appendPhoto(formData, payload.photo)
  appendText(formData, 'title', payload.title || deriveTitle({
    category: CATEGORY_TO_API[payload.category],
    lga: payload.lga,
  }))
  appendText(formData, 'category', CATEGORY_TO_API[payload.category] ?? payload.category)
  appendText(formData, 'severity', SEVERITY_TO_API[payload.severity] ?? payload.severity)
  appendText(formData, 'description', payload.description)
  appendText(formData, 'latitude', payload.coordinates?.lat)
  appendText(formData, 'longitude', payload.coordinates?.lng)
  appendText(formData, 'lga', payload.lga)
  appendText(formData, 'state', payload.state)
  appendText(formData, 'address', payload.address)
  appendText(formData, 'reporterName', payload.reporter?.name)
  appendText(formData, 'reporterContact', payload.reporter?.contact)
  return formData
}

export async function createReport(payload) {
  const data = await request('/reports', {
    method: 'POST',
    token: getStoredToken('citizen'),
    body: await reportFormData(payload),
  })
  const report = mapReport(data.report)
  return { id: report.id, report }
}

export async function getReportsByUser() {
  const data = await request('/reports/mine', {
    token: getStoredToken('citizen'),
  })
  return data.reports.map(mapReport)
}

export async function updateReport(id, ownerId, patch) {
  try {
    const data = await request(`/reports/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      token: getStoredToken('citizen'),
      body: await reportFormData(patch),
    })
    return { ok: true, report: mapReport(data.report) }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

export async function deleteReport(id) {
  try {
    await request(`/reports/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      token: getStoredToken('citizen'),
    })
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

export async function getOfficialReports(filters = {}) {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', CATEGORY_TO_API[filters.category] ?? filters.category)
  if (filters.status) params.set('status', STATUS_TO_API[filters.status] ?? filters.status)
  const query = params.size ? `?${params}` : ''
  const data = await request(`/government/reports${query}`, {
    token: getStoredToken('official'),
  })
  return data.reports.map(mapReport)
}

export async function getOfficialReportById(id) {
  try {
    const data = await request(`/government/reports/${encodeURIComponent(id)}`, {
      token: getStoredToken('official'),
    })
    return mapReport(data.report)
  } catch (error) {
    if (error.code === 'NOT_FOUND') return null
    throw error
  }
}

export async function updateReportStatus(id, nextStatus, note = '') {
  const data = await request(`/government/reports/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    token: getStoredToken('official'),
    body: JSON.stringify({
      status: STATUS_TO_API[nextStatus] ?? nextStatus,
      ...(note && { note }),
    }),
  })
  return mapReport(data.report)
}

export async function getReportStats() {
  const data = await request('/analytics/summary')
  const byCategory = Object.fromEntries(
    data.reportsByCategory.map((entry) => [
      CATEGORY_FROM_API[entry.category] ?? entry.category,
      entry.count,
    ]),
  )
  const byStatus = Object.fromEntries(
    data.reportsByStatus.map((entry) => [
      STATUS_FROM_API[entry.status] ?? entry.status,
      entry.count,
    ]),
  )
  return {
    total: data.totalReports,
    resolved: byStatus.resolved ?? 0,
    open: byStatus.open ?? 0,
    inProgress: byStatus.progress ?? 0,
    byCategory,
    byStatus,
    mostReported: CATEGORY_FROM_API[data.mostReportedCategory] ?? data.mostReportedCategory,
  }
}
