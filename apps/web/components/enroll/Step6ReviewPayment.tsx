import type { IntakeFormData } from "@/lib/types";
import Button from "@/components/ui/Button";

interface Props {
  data: Partial<IntakeFormData>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function Row({ label, value }: { label: string; value: string | string[] | undefined | number }) {
  if (value === undefined || value === null || value === "") return null;
  const display = Array.isArray(value) ? value.join(", ") : String(value);
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-border last:border-0">
      <span className="text-xs font-semibold text-text-muted uppercase tracking-wide sm:w-48 shrink-0">
        {label}
      </span>
      <span className="text-sm text-text">{display}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 mb-4">
      <h3 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function Step6ReviewPayment({ data, onSubmit, isSubmitting }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-text mb-1">Review Your Application</h2>
        <p className="text-sm text-text-muted">
          Check your details below. Go back to edit anything before proceeding.
        </p>
      </div>

      <Section title="Basic Information">
        <Row label="Name" value={data.fullName} />
        <Row label="Mobile" value={data.mobile} />
        <Row label="Email" value={data.email} />
        <Row label="Medium" value={data.medium} />
        <Row label="Graduation Stream" value={data.graduationStream} />
        {data.notes && <Row label="Notes" value={data.notes} />}
      </Section>

      <Section title="Prelims Background">
        <Row label="Experience" value={data.prelimsExperience} />
        <Row label="Attempt Count" value={data.attemptCount} />
        <Row label="GS Score Band" value={data.gsScoreBand} />
      </Section>

      <Section title="Subject Comfort">
        <Row label="GS Strong" value={data.strongGSSubjects} />
        <Row label="GS Weak" value={data.weakGSSubjects} />
        <Row label="CA Source" value={data.currentAffairsSource} />
        <Row label="CSAT Strong" value={data.csatStrongArea} />
        <Row label="CSAT Weak" value={data.csatWeakArea} />
        <Row label="CSAT Score" value={data.csatScoreBand} />
      </Section>

      <Section title="Test & Study Habits">
        <Row label="Mock Frequency" value={data.mockFrequency} />
        <Row label="Test Analysis" value={data.testAnalysis} />
        <Row label="Wrong Q Revision" value={data.wrongQuestionRevision} />
        <Row label="PYQ Practice" value={data.pyqPractice} />
        <Row label="Plan Consistency" value={data.planConsistency} />
        <Row label="Daily Study Hours" value={data.dailyStudyHours} />
        <Row label="Revision Count" value={data.revisionCount} />
        <Row label="Sources per Subject" value={data.sourcesPerSubject} />
      </Section>

      <Section title="Challenges & Goals">
        <Row label="Core Challenges" value={data.coreChallenges} />
        <Row label="Expectations" value={data.mentorshipExpectations} />
        <Row label="Found via" value={data.discoveryPlatform} />
      </Section>

      {/* Payment CTA */}
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: "linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)" }}
      >
        <p className="text-white/80 text-sm mb-2">You&apos;re enrolling in</p>
        <p className="text-white text-xl font-bold mb-4">PTP 2.0 — MentorSir</p>
        <p className="text-white/60 text-xs mb-6">
          After clicking below you&apos;ll be redirected to payment. Your application details will be
          sent to us automatically.
        </p>
        {/* TODO: Replace href with Razorpay/payment link once available */}
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? "Processing..." : "Confirm & Proceed to Payment →"}
        </button>
        <p className="text-white/40 text-xs mt-4">
          7-day refund window · ₹6,999 for new students
        </p>
      </div>
    </div>
  );
}
