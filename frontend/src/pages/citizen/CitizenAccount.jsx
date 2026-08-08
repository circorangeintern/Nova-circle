import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FileText,
  Clock3,
  CheckCircle2,
  TriangleAlert,
  Pencil,
  Trash2,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Lock,
  Plus,
  MapPin,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StatusBadge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/common/PageLoader'
import { AuthField, authInputCls, PasswordStrengthMeter } from '@/components/auth/authUtils'
import { CATEGORY_MAP } from '@/lib/constants'
import { timeAgo } from '@/lib/format'
import { getReportsByUser, deleteReport } from '@/services/api'
import { useCitizenAuthStore } from '@/store/citizenAuthStore'
import { cn } from '@/lib/cn'
import {
  trackAccountViewed,
  trackLogout,
  trackProfileUpdated,
  trackPasswordChanged,
  trackAccountDeleted,
  trackReportDeleted,
  resetIdentity,
} from '@/lib/analytics'

export default function CitizenAccount() {
  const navigate = useNavigate()
  const user = useCitizenAuthStore((s) => s.user)
  const [reports, setReports] = useState(null)
  const [tab, setTab] = useState('reports')

  const load = () => {
    if (user) getReportsByUser(user.id).then(setReports)
  }
  useEffect(load, [user])
  useEffect(() => { trackAccountViewed() }, [])

  const stats = useMemo(() => {
    const list = reports ?? []
    return {
      total: list.length,
      open: list.filter((r) => r.status === 'open').length,
      progress: list.filter((r) => ['acknowledged', 'progress'].includes(r.status)).length,
      resolved: list.filter((r) => r.status === 'resolved').length,
    }
  }, [reports])

  if (!user) return <PageLoader />

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="container-page py-8">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-civic-500 font-display text-2xl font-bold text-white">
            {initials}
          </span>
          <div>
            <h1 className="text-h2 font-bold text-ink">{user.name}</h1>
            <p className="text-slate">{user.email}</p>
            <p className="mt-0.5 text-xs text-muted">
              Member since{' '}
              {new Date(user.createdAt).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <Button as={Link} to="/report" icon={Plus}>
          Report an issue
        </Button>
      </div>

      {/* Contribution KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={FileText} label="Total reports" value={stats.total} color="text-civic-600" bg="bg-civic/10" />
        <Kpi icon={TriangleAlert} label="Reported" value={stats.open} color="text-accent" bg="bg-accent/10" />
        <Kpi icon={Clock3} label="Being handled" value={stats.progress} color="text-civic-600" bg="bg-civic/10" />
        <Kpi icon={CheckCircle2} label="Resolved" value={stats.resolved} color="text-success" bg="bg-success/10" />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-line">
        {[
          { key: 'reports', label: 'My Reports' },
          { key: 'settings', label: 'Settings' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
              tab === t.key ? 'border-civic-500 text-civic-600' : 'border-transparent text-muted hover:text-slate',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'reports' ? (
          reports === null ? (
            <PageLoader />
          ) : (
            <MyReports reports={reports} onChanged={load} userId={user.id} />
          )
        ) : (
          <Settings onLoggedOut={() => navigate('/')} />
        )}
      </div>
    </div>
  )
}

function Kpi({ icon: Icon, label, value, color, bg }) {
  return (
    <Card className="p-5">
      <span className={`grid size-10 place-items-center rounded-xl ${bg}`}>
        <Icon className={`size-5 ${color}`} />
      </span>
      <div className={`mt-3 font-data text-3xl font-bold ${color}`}>{value}</div>
      <div className="mt-0.5 text-sm font-medium text-slate">{label}</div>
    </Card>
  )
}

/* -------------------------------- My Reports ------------------------------- */
function MyReports({ reports, onChanged, userId }) {
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const confirmDelete = async () => {
    setDeleting(true)
    const res = await deleteReport(toDelete.id, userId)
    setDeleting(false)
    setToDelete(null)
    if (res.ok) {
      trackReportDeleted(toDelete.id)
      toast.success('Report deleted.')
      onChanged()
    } else {
      toast.error(res.error)
    }
  }

  if (reports.length === 0) {
    return (
      <Card className="flex flex-col items-center py-16 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-civic/10 text-civic-600">
          <FileText className="size-7" />
        </span>
        <h3 className="mt-4 text-xl font-bold text-ink">No reports yet</h3>
        <p className="mt-1 max-w-sm text-slate">
          When you report an infrastructure issue while signed in, it will appear here so you can track it.
        </p>
        <Button as={Link} to="/report" icon={Plus} className="mt-5">
          Report your first issue
        </Button>
      </Card>
    )
  }

  return (
    <>
      <ul className="space-y-3">
        {reports.map((r) => {
          const cat = CATEGORY_MAP[r.category]
          const editable = r.status === 'open'
          return (
            <li key={r.id}>
              <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <img src={r.photo} alt={r.title} className="h-20 w-full rounded-lg object-cover sm:size-20" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={r.status} size="sm" />
                    <span className="text-xs font-medium text-muted">{cat?.label}</span>
                  </div>
                  <h3 className="mt-1.5 font-semibold text-ink">{r.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" /> {r.lga}, {r.state}
                    </span>
                    <span className="font-data text-xs">{r.id}</span>
                    <span>{timeAgo(r.createdAt)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button as={Link} to={`/reports/${r.id}`} variant="ghost" size="sm" icon={ExternalLink}>
                    View
                  </Button>
                  {editable ? (
                    <>
                      <Button as={Link} to={`/account/reports/${r.id}/edit`} variant="secondary" size="sm" icon={Pencil}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setToDelete(r)} className="text-critical hover:bg-critical/[0.06]">
                        Delete
                      </Button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 self-center rounded-full bg-slate/[0.06] px-2.5 py-1 text-xs font-medium text-muted">
                      <Lock className="size-3" /> Locked
                    </span>
                  )}
                </div>
              </Card>
            </li>
          )
        })}
      </ul>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
        <Lock className="size-3.5" /> Reports lock once an official responds — this preserves them as evidence.
      </p>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this report?"
        description="This permanently removes your report from the public map. This can't be undone."
        confirmLabel="Delete report"
      />
    </>
  )
}

/* --------------------------------- Settings -------------------------------- */
function Settings({ onLoggedOut }) {
  const { user, logout, updateProfile, changePassword, deleteAccount } = useCitizenAuthStore()
  const [name, setName] = useState(user.name)
  const [anon, setAnon] = useState(user.prefs?.defaultAnonymous ?? true)
  const [pw, setPw] = useState({ current: '', next: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const saveProfile = () => {
    updateProfile({ name: name.trim(), prefs: { defaultAnonymous: anon } })
    trackProfileUpdated()
    toast.success('Settings saved.')
  }

  const savePassword = async () => {
    setPwError('')
    if (pw.next.length < 8) {
      setPwError('Your new password must be at least 8 characters.')
      return
    }
    setPwSaving(true)
    const res = await changePassword(pw)
    setPwSaving(false)
    if (res.ok) {
      trackPasswordChanged()
      toast.success('Password updated.')
      setPw({ current: '', next: '' })
    } else {
      setPwError(res.error)
    }
  }

  const doLogout = () => {
    logout()
    trackLogout('citizen')
    resetIdentity()
    toast.success('Signed out.')
    onLoggedOut()
  }

  const doDelete = async () => {
    setDeleting(true)
    await deleteAccount()
    trackAccountDeleted()
    resetIdentity()
    setDeleting(false)
    setConfirmDelete(false)
    toast.success('Your account has been deleted.')
    onLoggedOut()
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile */}
      <Card className="p-6">
        <h3 className="text-h3 font-bold text-ink">Profile</h3>
        <div className="mt-4 space-y-4">
          <AuthField label="Display name">
            <input value={name} onChange={(e) => setName(e.target.value)} className={authInputCls(false, false)} />
          </AuthField>
          <AuthField label="Email" hint="Contact support to change your email.">
            <input value={user.email} disabled className={cn(authInputCls(false, false), 'bg-surface text-muted')} />
          </AuthField>
          <div className="flex items-center justify-between rounded-card border border-line p-4">
            <div>
              <span className="block font-medium text-ink">Report anonymously by default</span>
              <span className="text-sm text-muted">Your name is never attached publicly to reports.</span>
            </div>
            <Toggle checked={anon} onChange={setAnon} label="Report anonymously by default" />
          </div>
          <Button onClick={saveProfile} icon={ShieldCheck}>
            Save changes
          </Button>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <h3 className="text-h3 font-bold text-ink">Change password</h3>
        {pwError && <p className="mt-3 text-sm font-medium text-critical">{pwError}</p>}
        <div className="mt-4 space-y-4">
          <AuthField label="Current password" icon={Lock}>
            <input type="password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} className={authInputCls(false)} />
          </AuthField>
          <div>
            <AuthField label="New password" icon={Lock}>
              <input type="password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} className={authInputCls(false)} />
            </AuthField>
            <PasswordStrengthMeter password={pw.next} />
          </div>
          <Button onClick={savePassword} loading={pwSaving} disabled={!pw.current || !pw.next}>
            Update password
          </Button>
        </div>
      </Card>

      {/* Session + danger zone */}
      <Card className="p-6">
        <h3 className="text-h3 font-bold text-ink">Account</h3>
        <div className="mt-4 flex flex-col gap-3">
          <Button variant="secondary" icon={LogOut} onClick={doLogout} className="w-full sm:w-auto">
            Log out
          </Button>
          <div className="mt-2 rounded-card border border-critical/25 bg-critical/[0.03] p-4">
            <h4 className="font-semibold text-critical">Delete account</h4>
            <p className="mt-1 text-sm text-slate">
              This permanently deletes your account. Reports you've submitted remain part of the public
              record but will no longer be linked to you.
            </p>
            <Button variant="danger" icon={Trash2} onClick={() => setConfirmDelete(true)} className="mt-3">
              Delete my account
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={doDelete}
        loading={deleting}
        title="Delete your account?"
        description="This can't be undone. You'll be signed out immediately."
        confirmLabel="Delete account"
      />
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-civic focus-visible:ring-offset-2',
        checked ? 'bg-civic-500' : 'bg-line',
      )}
    >
      <span
        className={cn(
          'inline-block size-6 rounded-full bg-white shadow-e1 transition-transform duration-200 ease-out',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
