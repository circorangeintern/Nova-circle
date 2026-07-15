/* ---------------------------------------------------------------------------
   Shared domain constants — categories, statuses, severities.
   Mirrors the backend contract described in the PRD so both sides agree on
   the vocabulary. Keys are the stable API values; labels are display strings.

   MVP SCOPE (Nova Circle PRD): report categories are restricted to the 4 core
   types; description max is 250 chars; official status workflow is
   Reported → Acknowledged → In Progress → Resolved ("Disputed" is Post-MVP).
--------------------------------------------------------------------------- */

import {
  Waypoints,
  GraduationCap,
  Droplets,
  Zap,
  Hospital,
  Construction,
  Waves,
  Store,
  Building2,
  CircleHelp,
} from 'lucide-react'

// The 4 MVP report categories (Nova Circle PRD §6, Feature 1) — listed first.
export const CORE_CATEGORY_KEYS = ['roads', 'school', 'water', 'electricity']

// Full taxonomy. Categories beyond the first 4 are Post-MVP but kept defined so
// legacy/seed reports still render everywhere.
export const CATEGORIES = [
  { key: 'roads', label: 'Roads & Drainage', shortLabel: 'Road', icon: Waypoints },
  { key: 'school', label: 'Schools', shortLabel: 'School', icon: GraduationCap },
  { key: 'water', label: 'Water & Sanitation', shortLabel: 'Water', icon: Droplets },
  { key: 'electricity', label: 'Electricity', shortLabel: 'Electricity', icon: Zap },
  // --- Post-MVP categories ---
  { key: 'hospital', label: 'Hospitals', shortLabel: 'Hospital', icon: Hospital },
  { key: 'bridge', label: 'Bridges', shortLabel: 'Bridge', icon: Construction },
  { key: 'drainage', label: 'Drainage', shortLabel: 'Drainage', icon: Waves },
  { key: 'market', label: 'Markets', shortLabel: 'Market', icon: Store },
  { key: 'public', label: 'Public Buildings', shortLabel: 'Public', icon: Building2 },
  { key: 'other', label: 'Other', shortLabel: 'Other', icon: CircleHelp },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]))

// Only the MVP categories, for the citizen report form.
export const CORE_CATEGORIES = CATEGORIES.filter((c) => CORE_CATEGORY_KEYS.includes(c.key))

// Report lifecycle statuses (semantic colours consistent everywhere).
// `open` remains the stable API key for the citizen-facing "Reported" state.
export const STATUSES = {
  open: { key: 'open', label: 'Reported', color: '#F97316', tint: '#FFF1E6' },
  acknowledged: { key: 'acknowledged', label: 'Acknowledged', color: '#D97706', tint: '#FEF3C7' },
  progress: { key: 'progress', label: 'In Progress', color: '#2563EB', tint: '#DBEAFE' },
  resolved: { key: 'resolved', label: 'Resolved', color: '#16A34A', tint: '#DCFCE7' },
  // Post-MVP — kept defined for the design system; dispute UI is not surfaced in MVP.
}

// The status flow an official can move a report through (MVP, in order).
export const OFFICIAL_STATUS_FLOW = ['open', 'acknowledged', 'progress', 'resolved']

// Severity levels (Master PRD §5.2 — Low / Medium / High / Critical).
export const SEVERITIES = {
  low: { key: 'low', label: 'Low', color: '#16A34A', blurb: 'Nuisance only' },
  medium: { key: 'medium', label: 'Medium', color: '#F59E0B', blurb: 'Affects daily use' },
  high: { key: 'high', label: 'High', color: '#F97316', blurb: 'Dangerous' },
  critical: { key: 'critical', label: 'Critical', color: '#DC2626', blurb: 'Emergency' },
}

// Report constraints (Nova Circle PRD).
export const DESCRIPTION_MIN = 20
export const DESCRIPTION_MAX = 250
