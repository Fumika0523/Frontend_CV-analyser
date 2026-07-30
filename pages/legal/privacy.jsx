import Layout from "../../components/Layout/Layout";

const sections = [
  { id: "intro", title: "1. Introduction" },
  { id: "data-we-collect", title: "2. Data We Collect" },
  { id: "how-we-use-data", title: "3. How We Use Your Data" },
  { id: "ai-processing", title: "4. AI & CV Analysis" },
  { id: "legal-basis", title: "5. Legal Basis for Processing" },
  { id: "sharing", title: "6. Sharing Your Data" },
  { id: "retention", title: "7. Data Retention" },
  { id: "your-rights", title: "8. Your Rights" },
  { id: "cookies", title: "9. Cookies & Tracking" },
  { id: "security", title: "10. Data Security" },
  { id: "international", title: "11. International Data Transfers" },
  { id: "children", title: "12. Children's Privacy" },
  { id: "changes", title: "13. Changes to This Policy" },
  { id: "contact", title: "14. Contact Us" },
];

export default function Privacy() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 mb-10">
          Last updated: 8 July 2026
        </p>

        <p className="text-slate-700 leading-8 mb-10">
          This Privacy Policy explains how SkillfulJobs.ai ("we", "us", "our")
          collects, uses, and protects your personal data when you use our
          platform, including our AI-powered CV Analyser. It should be read
          alongside our{" "}
          <a href="/terms" className="text-blue-600 hover:underline">
            Terms & Conditions
          </a>.
        </p>

        {/* Table of contents */}
        <nav className="mb-12 p-6 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-900 mb-3">
            On this page
          </p>
          <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                
               <a   href={`#${s.id}`}
                  className="text-slate-600 hover:text-slate-900 hover:underline"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-12 text-slate-700 leading-8">

          <section id="intro" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              1. Introduction
            </h2>
            <p>
              SkillfulJobs.ai is committed to protecting your privacy. This
              policy applies to Candidates, Employers, and visitors to our
              platform, and describes what data we collect, why we collect
              it, and the choices you have. We are the data controller for
              the personal data described in this policy.
            </p>
          </section>

          <section id="data-we-collect" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              2. Data We Collect
            </h2>
            <p className="mb-3">We collect the following categories of data:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><span className="font-medium">Account data:</span> name, email address, password (hashed), account type.</li>
              <li><span className="font-medium">CV & profile data:</span> uploaded CVs, work history, education, skills, and any content you add to your profile.</li>
              <li><span className="font-medium">Employer data:</span> company name, job postings, hiring preferences.</li>
              <li><span className="font-medium">Usage data:</span> pages visited, features used, timestamps, and general interaction with the Platform.</li>
              <li><span className="font-medium">Device & technical data:</span> IP address, browser type, and device identifiers, collected automatically.</li>
              <li><span className="font-medium">Communications:</span> messages you send us via support channels.</li>
            </ul>
          </section>

          <section id="how-we-use-data" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              3. How We Use Your Data
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>To create and manage your account.</li>
              <li>To match Candidates with relevant job opportunities and vice versa.</li>
              <li>To generate AI-assisted CV analysis, scoring, and summaries.</li>
              <li>To communicate with you about your account, applications, or platform updates.</li>
              <li>To maintain the security and integrity of the Platform.</li>
              <li>To improve our services, including training and evaluating our AI models on an aggregated or anonymized basis where possible.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section id="ai-processing" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              4. AI & CV Analysis
            </h2>
            <p className="mb-3">
              Our CV Analyser uses automated processing, including AI models,
              to parse and evaluate CVs. Specifically:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Uploaded CVs are processed to extract structured information such as skills, experience, and qualifications.</li>
              <li>This information may be used to generate scores, summaries, or recommendations shown to Employers or Candidates.</li>
              <li>We take reasonable steps to monitor our AI systems for bias and inaccuracy, but outputs are not guaranteed to be error-free.</li>
              <li>You may request human review of any significant decision made solely through automated processing, in line with your rights under applicable data protection law.</li>
              <li>We do not use your CV data to make final hiring decisions on behalf of Employers — those decisions remain with the Employer.</li>
            </ul>
          </section>

          <section id="legal-basis" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              5. Legal Basis for Processing
            </h2>
            <p className="mb-3">
              Where UK/EU data protection law applies, we rely on the
              following legal bases:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li><span className="font-medium">Contract:</span> to provide the Platform and services you've signed up for.</li>
              <li><span className="font-medium">Consent:</span> for optional features such as marketing communications or certain AI processing.</li>
              <li><span className="font-medium">Legitimate interests:</span> to improve our services, prevent fraud, and maintain platform security.</li>
              <li><span className="font-medium">Legal obligation:</span> where we are required to retain or disclose data by law.</li>
            </ul>
          </section>

          <section id="sharing" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              6. Sharing Your Data
            </h2>
            <p className="mb-3">We may share your data with:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><span className="font-medium">Employers</span>, if you are a Candidate applying to or matched with their roles.</li>
              <li><span className="font-medium">Service providers</span> who help us operate the Platform (e.g., hosting, analytics, AI infrastructure providers), under contractual confidentiality obligations.</li>
              <li><span className="font-medium">Legal or regulatory authorities</span>, where required by law.</li>
              <li><span className="font-medium">A buyer or successor</span>, in the event of a merger, acquisition, or asset sale, subject to equivalent privacy protections.</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal data to third parties.
            </p>
          </section>

          <section id="retention" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              7. Data Retention
            </h2>
            <p>
              We retain your data for as long as your account is active, or
              as needed to provide our services. If you delete your account,
              we will delete or anonymize your personal data within a
              reasonable period, except where we are required to retain it
              for legal, tax, or dispute-resolution purposes.
            </p>
          </section>

          <section id="your-rights" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              8. Your Rights
            </h2>
            <p className="mb-3">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate or incomplete data.</li>
              <li>Request deletion of your data ("right to be forgotten").</li>
              <li>Object to or restrict certain processing, including profiling.</li>
              <li>Request a copy of your data in a portable format.</li>
              <li>Withdraw consent at any time, where processing is based on consent.</li>
              <li>Lodge a complaint with your local data protection authority (e.g., the ICO in the UK).</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              
              <a  href="mailto:privacy@skillfuljobs.ai"
                className="text-blue-600 hover:underline"
              >
                privacy@skillfuljobs.ai
              </a>.
            </p>
          </section>

          <section id="cookies" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              9. Cookies & Tracking
            </h2>
            <p>
              We use cookies and similar technologies to keep you signed in,
              remember your preferences, and understand how the Platform is
              used. You can control cookies through your browser settings or
              our cookie preference tool. Disabling certain cookies may affect
              Platform functionality.
            </p>
          </section>

          <section id="security" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              10. Data Security
            </h2>
            <p>
              We use industry-standard technical and organizational measures,
              including encryption in transit and at rest, access controls,
              and regular security reviews, to protect your data. No system
              is completely secure, and we cannot guarantee absolute security
              of information transmitted to the Platform.
            </p>
          </section>

          <section id="international" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              11. International Data Transfers
            </h2>
            <p>
              Your data may be processed in countries outside your own,
              including where our service providers operate. Where this
              involves a transfer outside the UK/EEA, we ensure appropriate
              safeguards are in place, such as Standard Contractual Clauses
              or equivalent mechanisms.
            </p>
          </section>

          <section id="children" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              12. Children's Privacy
            </h2>
            <p>
              The Platform is not intended for individuals under 16 years of
              age, and we do not knowingly collect personal data from
              children. If you believe a child has provided us with personal
              data, please contact us so we can delete it.
            </p>
          </section>

          <section id="changes" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              13. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Material
              changes will be communicated via the Platform or by email.
              Continued use of the Platform after changes take effect
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section id="contact" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              14. Contact Us
            </h2>
            <p>
              For questions about this Privacy Policy or to exercise your
              data rights, contact us at{" "}
              
              <a  href="mailto:privacy@skillfuljobs.ai"
                className="text-blue-600 hover:underline"
              >
                privacy@skillfuljobs.ai
              </a>.
            </p>
          </section>

        </div>
      </div>
    </Layout>
  );
}