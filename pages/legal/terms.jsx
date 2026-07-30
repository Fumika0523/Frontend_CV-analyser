import Link from "next/link";

export const TERMS_VERSION = "2026-07-08";
export const TERMS_LAST_UPDATED = "8 July 2026";

export const TERMS_SECTIONS = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "accounts", title: "2. User Accounts" },
  { id: "candidates", title: "3. Candidate Responsibilities" },
  { id: "employers", title: "4. Employer Responsibilities" },
  { id: "ai-disclaimer", title: "5. AI-Generated Insights & Limitations" },
  { id: "data-privacy", title: "6. Data Protection & Privacy" },
  { id: "ip", title: "7. Intellectual Property" },
  { id: "liability", title: "8. Limitation of Liability" },
  { id: "termination", title: "9. Suspension & Termination" },
  { id: "governing-law", title: "10. Governing Law" },
  { id: "changes", title: "11. Changes to These Terms" },
  { id: "contact", title: "12. Contact Us" },
];

const SectionTitle = ({ children }) => (
  <h2 className="mb-3 text-2xl font-semibold text-slate-900">{children}</h2>
);

export default function TermsContent({ showTableOfContents = false }) {
  return (
    <>
      {showTableOfContents && (
        <nav className="mb-12 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <p className="mb-3 text-sm font-semibold text-slate-900">On this page</p>
          <ol className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {TERMS_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-slate-600 hover:text-slate-900 hover:underline"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="space-y-12 leading-8 text-slate-700">
        <section id="acceptance" className="scroll-mt-24">
          <SectionTitle>1. Acceptance of Terms</SectionTitle>
          <p>
            By accessing or using SkillfulJobs.ai (the &quot;Platform&quot;), you agree
            to be bound by these Terms &amp; Conditions (&quot;Terms&quot;) and our{" "}
            <Link href="/privacy">
              <a className="text-blue-600 hover:underline">Privacy Policy</a>
            </Link>
            . If you do not agree to these Terms, you must not access or use the
            Platform. We may offer the Platform to Candidates, Employers, and
            other users, each subject to the sections below that apply to them.
          </p>
        </section>

        <section id="accounts" className="scroll-mt-24">
          <SectionTitle>2. User Accounts</SectionTitle>
          <p>
            You must provide accurate and complete information when creating an
            account and keep it up to date. You are responsible for maintaining
            the confidentiality of your login credentials and for all activity
            that occurs under your account. Notify us immediately at{" "}
            <a
              href="mailto:support@skillfuljobs.ai"
              className="text-blue-600 hover:underline"
            >
              support@skillfuljobs.ai
            </a>{" "}
            if you suspect unauthorised use of your account. You must be at least
            16 years old to create an account.
          </p>
        </section>

        <section id="candidates" className="scroll-mt-24">
          <SectionTitle>3. Candidate Responsibilities</SectionTitle>
          <p className="mb-3">As a Candidate using the Platform, you agree to:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Provide accurate, current, and complete information about yourself.</li>
            <li>
              Upload only your own CV and supporting documents, which you own or
              have the right to submit.
            </li>
            <li>Not misrepresent your qualifications, work history, or credentials.</li>
            <li>
              Not use the Platform to harass, impersonate, or defraud employers or
              other users.
            </li>
            <li>
              Understand that submitting your CV does not guarantee review,
              shortlisting, or employment.
            </li>
          </ul>
        </section>

        <section id="employers" className="scroll-mt-24">
          <SectionTitle>4. Employer Responsibilities</SectionTitle>
          <p className="mb-3">As an Employer using the Platform, you agree to:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Post genuine, currently available job opportunities.</li>
            <li>Provide accurate company and role information.</li>
            <li>Access candidate data solely for legitimate recruitment purposes.</li>
            <li>
              Handle applicant data in compliance with applicable data protection
              laws, including UK GDPR where relevant.
            </li>
            <li>
              Not use CV or candidate data obtained through the Platform for any
              purpose outside recruitment, including reselling or unsolicited
              marketing.
            </li>
          </ul>
        </section>

        <section id="ai-disclaimer" className="scroll-mt-24">
          <SectionTitle>5. AI-Generated Insights &amp; Limitations</SectionTitle>
          <p className="mb-3">
            SkillfulJobs.ai uses automated and AI-based tools (the &quot;CV Analyser&quot;)
            to parse, score, summarise, or generate insights from CVs and job data.
            You acknowledge and agree that:
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>
              AI-generated scores, summaries, and recommendations are provided for
              guidance only and may contain errors or inaccuracies.
            </li>
            <li>
              Outputs should not be treated as a substitute for independent human
              judgement in hiring or job-seeking decisions.
            </li>
            <li>
              We do not guarantee that AI-generated insights are free from bias,
              and we take reasonable steps to test and monitor for unfair or
              discriminatory outcomes.
            </li>
            <li>
              Employers remain solely responsible for final hiring decisions and
              for complying with applicable employment and anti-discrimination laws.
            </li>
          </ul>
        </section>

        <section id="data-privacy" className="scroll-mt-24">
          <SectionTitle>6. Data Protection &amp; Privacy</SectionTitle>
          <p>
            We process personal data, including CV content, in accordance with our{" "}
            <Link href="/privacy">
              <a className="text-blue-600 hover:underline">Privacy Policy</a>
            </Link>
            . By using the Platform, you acknowledge the collection, storage, and
            processing of your data as described there, including processing by our
            AI systems for analysis and matching purposes. You may request access
            to, correction of, or deletion of your data at any time by contacting
            us, subject to applicable law.
          </p>
        </section>

        <section id="ip" className="scroll-mt-24">
          <SectionTitle>7. Intellectual Property</SectionTitle>
          <p>
            All content, branding, software, and underlying technology made
            available on the Platform are owned by SkillfulJobs.ai or its licensors
            and are protected by intellectual property laws. You retain ownership
            of the content you upload, such as your CV, but grant us a limited
            licence to process, store, and display it as necessary to operate the
            Platform and provide our services to you.
          </p>
        </section>

        <section id="liability" className="scroll-mt-24">
          <SectionTitle>8. Limitation of Liability</SectionTitle>
          <p>
            SkillfulJobs.ai provides AI-assisted recruitment tools &quot;as is&quot; and
            does not guarantee employment outcomes, hiring decisions, or candidate
            suitability. To the fullest extent permitted by law, SkillfulJobs.ai
            shall not be liable for any indirect, incidental, or consequential
            damages arising from your use of the Platform, including reliance on
            AI-generated insights.
          </p>
        </section>

        <section id="termination" className="scroll-mt-24">
          <SectionTitle>9. Suspension &amp; Termination</SectionTitle>
          <p>
            We may suspend or terminate your account if you violate these Terms,
            provide false information, or misuse the Platform. You may close your
            account at any time by contacting us. Sections relating to intellectual
            property, liability, and data handling survive termination.
          </p>
        </section>

        <section id="governing-law" className="scroll-mt-24">
          <SectionTitle>10. Governing Law</SectionTitle>
          <p>
            These Terms are governed by the laws of England and Wales, without
            regard to conflict-of-law principles. Any disputes arising from these
            Terms shall be subject to the exclusive jurisdiction of the courts of
            England and Wales.
          </p>
        </section>

        <section id="changes" className="scroll-mt-24">
          <SectionTitle>11. Changes to These Terms</SectionTitle>
          <p>
            We may update these Terms from time to time. Material changes will be
            notified through the Platform or by email. Continued use of the
            Platform after changes take effect constitutes acceptance of the
            updated Terms where permitted by law. Where fresh consent is required,
            we will ask you to accept the updated Terms again.
          </p>
        </section>

        <section id="contact" className="scroll-mt-24">
          <SectionTitle>12. Contact Us</SectionTitle>
          <p>
            Questions about these Terms? Reach us at{" "}
            <a
              href="mailto:support@skillfuljobs.ai"
              className="text-blue-600 hover:underline"
            >
              support@skillfuljobs.ai
            </a>
            .
          </p>
        </section>
      </div>
    </>
  );
}
