const SECTIONS = [
  ['1. Introduction', 'PublicEye is committed to protecting the privacy and personal information of all users. This Privacy Policy explains how personal data is collected, processed, stored, disclosed, and protected when you access or use the PublicEye platform. By registering an account or using the platform, you acknowledge and consent to the data practices described in this Privacy Policy.'],
  ['2. Information We Collect', 'To provide the services offered by PublicEye, the platform may collect the following categories of information:', ['Personal information: full name, email address, and account authentication credentials (stored in encrypted form).', 'Infrastructure report information: infrastructure category, report description, uploaded photographs, GPS coordinates or location data, and report status and history.', 'Technical and usage information: browser and device information, IP address, session information, platform usage analytics, and event tracking data.']],
  ['3. Purpose of Data Collection', 'Information collected through the platform is processed solely for legitimate operational purposes, including:', ['Creating and managing user accounts.', 'Authenticating user identity.', 'Enabling citizens to submit and track infrastructure reports.', 'Allowing authorized government officials to review and update report statuses.', 'Generating platform analytics and performance metrics.', 'Improving system functionality, usability, and service delivery.', 'Detecting, preventing, and investigating fraudulent or unauthorized activities.']],
  ['4. Information Sharing & Disclosure', 'PublicEye does not sell, lease, or commercially distribute users’ personal information. Infrastructure reports submitted through the platform may be publicly accessible to promote transparency and civic accountability. Publicly displayed information may include:', ['Infrastructure category.', 'Description.', 'Uploaded photograph.', 'Report location.', 'Report status.', 'Personally identifiable information—including users’ names, email addresses, and authentication credentials—will not be publicly disclosed except where required by applicable law or authorized by the user.']],
  ['5. Data Security', 'PublicEye implements reasonable administrative, technical, and organizational safeguards designed to protect personal information against unauthorized access, alteration, disclosure, or destruction. While reasonable efforts are made to secure user information, no internet-based service can guarantee absolute security. Users acknowledge and accept the inherent risks associated with electronic data transmission.'],
  ['6. Data Retention', 'Personal information and infrastructure reports are retained only for as long as necessary to provide platform services, comply with legal obligations, resolve disputes, or enforce platform policies. Data may be securely deleted or anonymized when no longer required.'],
  ['7. User Rights', 'Subject to applicable laws and platform limitations, users may request to:', ['Access their personal information.', 'Correct inaccurate or incomplete information.', 'Update account details.', 'Request deletion of their account and associated personal information, where applicable.']],
  ['8. Cookies & Analytics', 'PublicEye may use cookies, session technologies, and analytics tools to improve platform performance, understand user interactions, and enhance the overall user experience. These technologies do not intentionally collect unnecessary personal information beyond what is required for platform functionality and analytics.'],
  ['9. Changes to this Privacy Policy', 'PublicEye reserves the right to modify this Privacy Policy periodically. Continued use of the platform following publication of any revisions constitutes acceptance of the updated Privacy Policy.'],
  ['10. Contact Information', 'For questions, requests, or concerns regarding this Privacy Policy or the handling of personal information, please contact the PublicEye support team at support@publiceye.org.'],
]

export default function Privacy() {
  return <LegalPage title="Privacy Policy" intro="How PublicEye collects, uses, and protects your information." sections={SECTIONS} />
}

export function LegalPage({ title, intro, sections }) {
  return (
    <main className="container-page py-12 sm:py-16">
      <article className="mx-auto max-w-3xl rounded-panel border border-line bg-white px-6 py-8 shadow-e1 sm:px-10 sm:py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-civic-600">PublicEye legal</p>
        <h1 className="mt-3 text-h1 font-bold text-ink">{title}</h1>
        <p className="mt-3 text-lg text-slate">{intro}</p>
        <p className="mt-5 border-b border-line pb-6 font-data text-sm text-muted">Effective date: 23 July 2026</p>
        <div className="mt-8 space-y-8">
          {sections.map(([heading, body, items]) => (
            <section key={heading}>
              <h2 className="text-h3 font-bold text-ink">{heading}</h2>
              <p className="mt-2 leading-relaxed text-slate">{body}</p>
              {items && <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-slate">{items.map((item) => <li key={item}>{item}</li>)}</ul>}
            </section>
          ))}
        </div>
      </article>
    </main>
  )
}
