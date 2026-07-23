import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { ProgressStepper } from '@/components/report/ProgressStepper'
import { PhotoStep } from '@/components/report/PhotoStep'
import { DetailsStep } from '@/components/report/DetailsStep'
import { LocationStep } from '@/components/report/LocationStep'
import { ReviewStep } from '@/components/report/ReviewStep'
import { SuccessStep } from '@/components/report/SuccessStep'
import { Button } from '@/components/ui/Button'
import { createReport } from '@/services/api'
import { useCitizenAuthStore } from '@/store/citizenAuthStore'
import { CORE_CATEGORY_KEYS, SEVERITIES, DESCRIPTION_MIN, DESCRIPTION_MAX } from '@/lib/constants'

const DRAFT_KEY = 'publiceye-report-draft'

// Per-step validation (Zod). Returns a field->message map, empty if valid.
const stepSchemas = [
  z.object({ photo: z.string().min(1, 'Please add a photo of the issue.') }),
  z.object({
    category: z.enum(CORE_CATEGORY_KEYS, { errorMap: () => ({ message: 'Choose a category.' }) }),
    severity: z.enum(Object.keys(SEVERITIES), { errorMap: () => ({ message: 'Choose a severity.' }) }),
    description: z
      .string()
      .min(DESCRIPTION_MIN, `Please write at least ${DESCRIPTION_MIN} characters.`)
      .max(DESCRIPTION_MAX),
  }),
  z.object({
    coordinates: z.object({ lat: z.number(), lng: z.number() }, { message: 'Set the location on the map.' }),
  }),
]

const EMPTY = {
  photo: '',
  category: '',
  severity: '',
  description: '',
  coordinates: null,
  lga: '',
  state: '',
  address: '',
  reporterName: '',
  reporterContact: '',
}

export default function ReportIssue() {
  const navigate = useNavigate()
  const citizen = useCitizenAuthStore((s) => s.user)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      return saved ? { ...EMPTY, ...JSON.parse(saved) } : EMPTY
    } catch {
      return EMPTY
    }
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [reportId, setReportId] = useState(null)

  // Persist draft after every change (Master PRD: never lose work).
  useEffect(() => {
    if (!reportId) localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
  }, [form, reportId])

  const update = (partial) => setForm((f) => ({ ...f, ...partial }))

  const validateStep = (i) => {
    const schema = stepSchemas[i]
    if (!schema) return true
    const result = schema.safeParse(form)
    if (result.success) {
      setErrors({})
      return true
    }
    const map = {}
    for (const issue of result.error.issues) map[issue.path[0]] = issue.message
    setErrors(map)
    return false
  }

  const next = () => {
    if (step < 3 && !validateStep(step)) return
    setErrors({})
    setStep((s) => Math.min(s + 1, 3))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const back = () => {
    setErrors({})
    setStep((s) => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const goto = (i) => {
    setErrors({})
    setStep(i)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async () => {
    // Re-validate all data steps before submitting.
    for (let i = 0; i < 3; i++) {
      if (!validateStep(i)) {
        setStep(i)
        return
      }
    }
    if (!citizen) {
      toast.error('Sign in or create an account to publish this report.')
      navigate('/login', { state: { from: '/report' } })
      return
    }
    setSubmitting(true)
    try {
      const { id } = await createReport({
        photo: form.photo,
        category: form.category,
        severity: form.severity,
        description: form.description.trim(),
        coordinates: form.coordinates,
        lga: form.lga,
        state: form.state,
        address: form.address,
        reporter:
          form.reporterName || form.reporterContact
            ? { name: form.reporterName, contact: form.reporterContact }
            : null,
      })
      localStorage.removeItem(DRAFT_KEY)
      setReportId(id)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setForm(EMPTY)
    setReportId(null)
    setStep(0)
  }

  if (reportId) {
    return (
      <div className="container-page py-10">
        <SuccessStep reportId={reportId} onReportAnother={reset} />
      </div>
    )
  }

  return (
    <div className="container-page max-w-3xl py-8">
      <button
        onClick={() => (step === 0 ? navigate(-1) : back())}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate hover:text-civic-600"
      >
        <ArrowLeft className="size-4" /> {step === 0 ? 'Cancel' : 'Back'}
      </button>

      <div className="mt-4">
        <ProgressStepper current={step} />
      </div>

      <div className="mt-8">
        {step === 0 && <PhotoStep value={form.photo} onChange={(photo) => update({ photo })} error={errors.photo} />}
        {step === 1 && <DetailsStep value={form} onChange={update} errors={errors} />}
        {step === 2 && <LocationStep value={form} onChange={update} error={errors.coordinates} />}
        {step === 3 && <ReviewStep value={form} onEdit={goto} />}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
        {step > 0 ? (
          <Button variant="ghost" icon={ArrowLeft} onClick={back}>
            Back
          </Button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <Button size="lg" iconRight={ArrowRight} onClick={next}>
            Continue
          </Button>
        ) : (
          <Button size="lg" icon={Send} loading={submitting} onClick={submit}>
            {submitting ? 'Publishing…' : 'Submit report'}
          </Button>
        )}
      </div>
    </div>
  )
}
