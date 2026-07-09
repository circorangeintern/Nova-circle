import { ComingSoon } from '@/components/common/ComingSoon'

export default function OfficialLogin() {
  return (
    <ComingSoon
      title="Official Login"
      description="Secure, login-gated portal for LGA officials to acknowledge reports and update statuses publicly. Requires the backend auth contract (RBAC) before implementation."
      roadmap={['Email + password', '2FA', 'Government verification badge', 'Official dashboard']}
    />
  )
}
