import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MentorSir",
  description: "Privacy Policy for MentorSir web and mobile products.",
};

const effectiveDate = "March 21, 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white px-5 py-12 text-text sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-text-muted">Effective date: {effectiveDate}</p>
        <p className="mt-6 text-sm leading-relaxed text-text-muted sm:text-base">
          This Privacy Policy describes how MentorSir collects, uses, stores, and shares personal information when you
          use our website, student dashboard, mentor dashboard, and companion mobile app.
        </p>

        <section className="mt-10 space-y-3">
          <h2 className="font-display text-2xl font-semibold">1. Information We Collect</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-text-muted sm:text-base">
            <li>Account data: name, email, role, phone number, Telegram ID, mentor assignment details.</li>
            <li>Learning data: schedule entries, yearly plans, study sessions, daily logs, sleep/study tracking, and test records.</li>
            <li>Communication data: private/group chat messages, meeting details, and meeting notes.</li>
            <li>Audio data: voice notes you record for mentor meetings (uploaded/stored only when you choose to record).</li>
            <li>Payment/enrollment data: transaction references and enrollment details for paid services.</li>
            <li>Technical data: device/app logs required for security, debugging, and service reliability.</li>
          </ul>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="font-display text-2xl font-semibold">2. How We Use Your Information</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-text-muted sm:text-base">
            <li>Provide mentorship services, chat, meeting scheduling, and learning dashboards.</li>
            <li>Track learning progress, accountability, and performance insights.</li>
            <li>Enable support, fraud prevention, platform security, and issue resolution.</li>
            <li>Process payments and enrollment requests.</li>
            <li>Comply with legal obligations and enforce platform policies.</li>
          </ul>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="font-display text-2xl font-semibold">3. Permissions and Sensitive Data</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-text-muted sm:text-base">
            <li>Microphone permission is requested only for recording voice notes inside the app.</li>
            <li>We do not request precise location permission for core mentorship features.</li>
            <li>You can control many data fields by editing your profile or contacting support for deletion requests.</li>
          </ul>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="font-display text-2xl font-semibold">4. Sharing of Information</h2>
          <p className="text-sm leading-relaxed text-text-muted sm:text-base">
            We do not sell personal information. We may share limited data with trusted service providers required to operate
            the platform, such as cloud database/auth providers, payment processors, and communication infrastructure. Data may
            also be disclosed if legally required.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="font-display text-2xl font-semibold">5. Data Retention</h2>
          <p className="text-sm leading-relaxed text-text-muted sm:text-base">
            We retain personal data only for as long as needed to provide services, maintain records, resolve disputes, or
            comply with legal obligations. Retention periods may vary by data type.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="font-display text-2xl font-semibold">6. Security</h2>
          <p className="text-sm leading-relaxed text-text-muted sm:text-base">
            We use reasonable technical and organizational safeguards to protect personal information. No internet transmission
            or storage system can be guaranteed as fully secure, but we continuously improve our controls.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="font-display text-2xl font-semibold">7. Children&apos;s Privacy</h2>
          <p className="text-sm leading-relaxed text-text-muted sm:text-base">
            Our services are intended for students preparing for competitive exams and are not directed to children under 13.
            If you believe a child under 13 has provided personal data, contact us and we will review and remove it as required.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="font-display text-2xl font-semibold">8. Your Rights and Choices</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-text-muted sm:text-base">
            <li>Access and update key profile information in your account.</li>
            <li>Request deletion or correction of personal data, subject to legal/operational limits.</li>
            <li>Request account closure by contacting support.</li>
          </ul>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="font-display text-2xl font-semibold">9. Changes to This Policy</h2>
          <p className="text-sm leading-relaxed text-text-muted sm:text-base">
            We may update this Privacy Policy from time to time. The latest version will always be posted on this page with
            the updated effective date.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="font-display text-2xl font-semibold">10. Contact Us</h2>
          <p className="text-sm leading-relaxed text-text-muted sm:text-base">
            If you have questions or requests about privacy, contact us at{" "}
            <a className="text-primary underline-offset-2 hover:underline" href="mailto:hello@mentorsir.in">
              hello@mentorsir.in
            </a>{" "}
            or{" "}
            <a className="text-primary underline-offset-2 hover:underline" href="tel:+918826629459">
              +91 88266 29459
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
