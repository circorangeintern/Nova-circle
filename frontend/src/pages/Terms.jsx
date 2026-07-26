import { LegalPage } from './Privacy'

const SECTIONS = [
  ['1. Introduction', 'Welcome to PublicEye. By registering an account, accessing, or utilizing any portion of this platform, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, you must refrain from accessing or using the PublicEye platform.'],
  ['2. Purpose of the Platform', 'PublicEye is a civic infrastructure accountability platform designed to empower citizens to report public infrastructure defects and enable verified government officials to track, manage, and update the status of submitted reports.'],
  ['3. User Accounts', 'Citizen accounts require accurate, current, and complete registration information. Users are solely responsible for safeguarding account credentials and maintaining login confidentiality. Multiple accounts for fraudulent, duplicate, or abusive activity are strictly prohibited.', ['Administrative and official access is restricted to pre-authorized credentials provisioned through out-of-band protocols.', 'Administrative access controls remain outside the operational scope of the current Minimum Viable Product (MVP).', 'Authorized officials are responsible for maintaining credential security.']],
  ['4. Reporting Guidelines', 'Users agree to submit truthful, accurate infrastructure reports accompanied by relevant photographic evidence and precise geo-location metadata where available. Submitting duplicate reports or using profane, defamatory, or abusive language in report descriptions is strictly prohibited.'],
  ['5. Prohibited Activities', 'Users shall not submit false, misleading, or malicious reports; upload illegal, defamatory, or offensive content; attempt unauthorized system access, security tampering, or reverse-engineering; disrupt platform operations; or deploy automated bots.'],
  ['6. Government Official Responsibilities', 'Authorized government officials must review submitted reports responsibly, update report statuses accurately, use credentials strictly for official duties, and maintain strict confidentiality regarding non-public infrastructure data.'],
  ['7. Intellectual Property', 'All proprietary software, source code, UI designs, logos, and branding assets associated with PublicEye remain the exclusive intellectual property of the project team. Users are granted a limited, non-exclusive, non-transferable license for personal, non-commercial use.'],
  ['8. Limitation of Liability', 'PublicEye operates as an intermediary reporting platform. While reasonable efforts are made to ensure platform reliability, PublicEye does not guarantee that reported issues will be resolved by public authorities. PublicEye accepts no liability for direct or indirect damages resulting from platform use or third-party non-performance.'],
  ['9. Modifications & Governing Law', 'These Terms & Conditions may be updated periodically. Continued platform use following published updates constitutes binding acceptance. These terms shall be governed by and construed in accordance with applicable civic technology regulations.'],
  ['10. Contact Information', 'For inquiries, legal notices, or support regarding these Terms & Conditions, please contact the PublicEye support team at support@publiceye.org.'],
]

export default function Terms() {
  return <LegalPage title="Terms & Conditions" intro="The rules for using the PublicEye platform responsibly." sections={SECTIONS} />
}
