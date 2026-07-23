import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Lock } from 'lucide-react'
import { PhotoStep } from '@/components/report/PhotoStep'
import { DetailsStep } from '@/components/report/DetailsStep'
import { LocationStep } from '@/components/report/LocationStep'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/common/PageLoader'
import { DESCRIPTION_MIN } from '@/lib/constants'
import { getCitizenReportById, updateReport } from '@/services/api'
import { useCitizenAuthStore } from '@/store/citizenAuthStore'

/** EditReport — a citizen edits their OWN report while it's still Open. */
export default function EditReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useCitizenAuthStore((s) => s.user)
  const [form, setForm] = useState(null)
  const [state, setState] = useState('loading') // loading | ok | forbidden | notfound
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getCitizenReportById(id)
      .then((report) => {
        if (!report) return setState('notfound')
        if (report.ownerId !== user?.id) return setState('forbidden')
        if (report.status !== 'open') return setState('forbidden')
        setForm({
          photo: report.photo,
          category: report.category,
          severity: report.severity,
          description: report.description,
          coordinates: report.coordinates,
          lga: report.lga,
          state: report.state,
          address: report.address,
        })
        setState('ok')
      })
      .catch(() => setState('notfound'))
  }, [id, user])

  const update = (partial) => setForm((f) => ({ ...f, ...partial }))

  const validate = () => {
    const e = {}
    if (!form.photo) e.photo = 'A photo is required.'
    if (!form.category) e.category = 'Choose a category.'
    if (!form.severity) e.severity = 'Choose a severity.'
    if (!form.description || form.description.trim().length < DESCRIPTION_MIN)
      e.description = `Please write at least ${DESCRIPTION_MIN} characters.`
    if (!form.coordinates) e.coordinates = 'Set the location on the map.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) {
      toast.error('Please fix the highlighted fields.')
      return
    }
    setSaving(true)
    const res = await updateReport(id, user.id, {
      photo: form.photo,
      category: form.category,
      severity: form.severity,
      description: form.description.trim(),
      coordinates: form.coordinates,
      lga: form.lga,
      state: form.state,
    })
    setSaving(false)
    if (res.ok) {
      toast.success('Your report was updated.')
      navigate('/account')
    } else {
      toast.error(res.error)
    }
  }

  if (state === 'loading') return <PageLoader />
  if (state !== 'ok') {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-full bg-slate/[0.06] text-muted">
          <Lock className="size-7" />
        </span>
        <h1 className="mt-4 text-h2 font-bold text-ink">
          {state === 'notfound' ? 'Report not found' : "This report can't be edited"}
        </h1>
        <p className="mt-2 max-w-md text-slate">
          {state === 'forbidden'
            ? 'You can only edit your own reports, and only while they are still open (before an official responds).'
            : 'The report you are trying to edit does not exist.'}
        </p>
        <Button as={Link} to="/account" variant="secondary" icon={ArrowLeft} className="mt-6">
          Back to my account
        </Button>
      </div>
    )
  }

  return (
    <div className="container-page max-w-3xl py-8">
      <Link to="/account" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate hover:text-civic-600">
        <ArrowLeft className="size-4" /> Back to my account
      </Link>

      <h1 className="mt-4 text-h2 font-bold text-ink">Edit report</h1>
      <p className="mt-1 text-slate">Update your report while it's still open. Changes are published immediately.</p>

      <div className="mt-8 space-y-10">
        <PhotoStep value={form.photo} onChange={(photo) => update({ photo })} error={errors.photo} />
        <DetailsStep value={form} onChange={update} errors={errors} />
        <LocationStep value={form} onChange={update} error={errors.coordinates} />
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
        <Button as={Link} to="/account" variant="ghost">
          Cancel
        </Button>
        <Button size="lg" icon={Save} loading={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}
