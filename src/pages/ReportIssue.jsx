import { ComingSoon } from '@/components/common/ComingSoon'

export default function ReportIssue() {
  return (
    <ComingSoon
      title="Report an Infrastructure Issue"
      description="The guided 3-step reporting flow — Photo → Describe → Confirm Location — with GPS auto-detection, React Hook Form + Zod validation and a success screen. This is the first feature scheduled right after MVP sign-off."
      roadmap={['Camera / photo upload', 'Category & severity', 'GPS location picker', 'Review & submit', 'Success + report ID']}
    />
  )
}
