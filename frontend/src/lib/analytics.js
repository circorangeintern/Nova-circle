/**
 * analytics.js — central PostHog wrapper for PublicEye NG.
 *
 * Import named functions here instead of calling posthog directly so every
 * event name lives in one file and call-sites stay clean.
 */
import posthog from 'posthog-js'

// ── Identity ─────────────────────────────────────────────────────────────────

/** Tie all subsequent events to a specific user. Call on login / register. */
export const identify = (userId, traits = {}) =>
  posthog.identify(userId, traits)

/** Sever the user↔event association. Call on logout. */
export const resetIdentity = () => posthog.reset()

// ── Auth ─────────────────────────────────────────────────────────────────────

export const trackCitizenLoginSucceeded = () =>
  posthog.capture('citizen_login_succeeded', { role: 'citizen', method: 'email_password' })

export const trackCitizenLoginFailed = (reason = '') =>
  posthog.capture('citizen_login_failed', { role: 'citizen', reason, method: 'email_password' })

export const trackOfficialLoginSucceeded = () =>
  posthog.capture('official_login_succeeded', { role: 'official', method: 'email_password' })

export const trackOfficialLoginFailed = (reason = '') =>
  posthog.capture('official_login_failed', { role: 'official', reason, method: 'email_password' })

export const trackRegistrationSucceeded = (props = {}) =>
  posthog.capture('register_succeeded', props)

export const trackRegistrationFailed = (reason = '') =>
  posthog.capture('register_failed', { reason })

export const trackLogout = (role = 'citizen') =>
  posthog.capture('logout', { role })

// ── Pages / navigation ────────────────────────────────────────────────────────

/** Manual SPA pageview — fired in App.jsx on every route change. */
export const trackPageView = (path) =>
  posthog.capture('$pageview', { $current_url: path })

export const trackDashboardViewed = () =>
  posthog.capture('dashboard_viewed')

export const trackMapViewed = () =>
  posthog.capture('map_viewed')

export const trackAccountViewed = () =>
  posthog.capture('account_viewed')

// ── Reports — public ─────────────────────────────────────────────────────────

export const trackPublicReportViewed = (reportId, props = {}) =>
  posthog.capture('public_reports_viewed', { report_id: reportId, ...props })

export const trackReportConfirmed = (reportId) =>
  posthog.capture('report_confirmed', { report_id: reportId })

export const trackReportShared = (reportId, method = 'clipboard') =>
  posthog.capture('report_shared', { report_id: reportId, method })

export const trackReportCardClicked = (reportId, source = '') =>
  posthog.capture('report_card_clicked', { report_id: reportId, source })

// ── Report submission wizard ──────────────────────────────────────────────────

const STEP_NAMES = ['photo', 'details', 'location', 'review']

export const trackReportFlowStarted = () =>
  posthog.capture('report_flow_started')

export const trackReportStepCompleted = (stepIndex) =>
  posthog.capture('report_step_completed', {
    step: stepIndex,
    step_name: STEP_NAMES[stepIndex] ?? `step_${stepIndex}`,
  })

export const trackReportStepValidationFailed = (stepIndex, fieldNames = []) =>
  posthog.capture('report_step_validation_failed', {
    step: stepIndex,
    step_name: STEP_NAMES[stepIndex] ?? `step_${stepIndex}`,
    fields: fieldNames,
  })

export const trackReportSubmitted = (props = {}) =>
  posthog.capture('report_submitted', props)

// ── Map / filters ─────────────────────────────────────────────────────────────

export const trackFilterApplied = (filterType, value, context = 'map') =>
  posthog.capture('filter_applied', { filter_type: filterType, value, context })

export const trackFilterCleared = (context = 'map') =>
  posthog.capture('filter_cleared', { context })

export const trackMapSearchPerformed = (queryLength, resultsCount) =>
  posthog.capture('map_search_performed', {
    query_length: queryLength,
    results_count: resultsCount,
  })

// ── Official portal ───────────────────────────────────────────────────────────

export const trackOfficialDashboardViewed = (props = {}) =>
  posthog.capture('official_dashboard_viewed', props)

export const trackOfficialReportsViewed = (props = {}) =>
  posthog.capture('official_reports_viewed', props)

export const trackOfficialReportDetailViewed = (reportId, props = {}) =>
  posthog.capture('official_report_detail_viewed', {
    report_id: reportId,
    ...props,
  })

export const trackStatusChanged = (oldStatus, newStatus, props = {}) =>
  posthog.capture('report_status_changed', {
    old_status: oldStatus,
    new_status: newStatus,
    ...props,
  })

// ── Citizen account ───────────────────────────────────────────────────────────

export const trackProfileUpdated = () => posthog.capture('profile_updated')

export const trackPasswordChanged = () => posthog.capture('password_changed')

export const trackAccountDeleted = () => posthog.capture('account_deleted')

export const trackReportDeleted = (reportId) =>
  posthog.capture('report_deleted', { report_id: reportId })

// ── CTA ───────────────────────────────────────────────────────────────────────

export const trackCtaClicked = (label, location = '') =>
  posthog.capture('cta_clicked', { label, location })
