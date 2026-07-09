/* ---------------------------------------------------------------------------
   Shared domain constants — categories, statuses, severities.
   Mirrors the backend contract described in the PRD so both sides agree on
   the vocabulary. Keys are the stable API values; labels are display strings.
--------------------------------------------------------------------------- */

import {
  Waypoints,
  Droplets,
  Zap,
  GraduationCap,
  Hospital,
  Construction,
  Waves,
  Store,
  Building2,
  CircleHelp,
} from 'lucide-react'

// Report categories (PRD §5.2)
export const CATEGORIES = [
  { key: 'roads', label: 'Roads & Drainage', icon: Waypoints },
  { key: 'water', label: 'Water & Sanitation', icon: Droplets },
  { key: 'electricity', label: 'Electricity', icon: Zap },
  { key: 'school', label: 'Schools', icon: GraduationCap },
  { key: 'hospital', label: 'Hospitals', icon: Hospital },
  { key: 'bridge', label: 'Bridges', icon: Construction },
  { key: 'drainage', label: 'Drainage', icon: Waves },
  { key: 'market', label: 'Markets', icon: Store },
  { key: 'public', label: 'Public Buildings', icon: Building2 },
  { key: 'other', label: 'Other', icon: CircleHelp },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]))

// Report lifecycle statuses (PRD §5, semantic colours consistent everywhere)
export const STATUSES = {
  open: { key: 'open', label: 'Open', color: '#F97316', tint: '#FFF1E6' },
  acknowledged: { key: 'acknowledged', label: 'Acknowledged', color: '#D97706', tint: '#FEF3C7' },
  progress: { key: 'progress', label: 'In Progress', color: '#2563EB', tint: '#DBEAFE' },
  resolved: { key: 'resolved', label: 'Resolved', color: '#16A34A', tint: '#DCFCE7' },
  disputed: { key: 'disputed', label: 'Disputed', color: '#DC2626', tint: '#FEE2E2' },
}

// Severity levels (PRD §5.2 — Low / Medium / High / Critical)
export const SEVERITIES = {
  low: { key: 'low', label: 'Low', color: '#16A34A', blurb: 'Nuisance only' },
  medium: { key: 'medium', label: 'Medium', color: '#F59E0B', blurb: 'Affects daily use' },
  high: { key: 'high', label: 'High', color: '#F97316', blurb: 'Dangerous' },
  critical: { key: 'critical', label: 'Critical', color: '#DC2626', blurb: 'Emergency' },
}
