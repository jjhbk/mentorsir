import type { IntakeFormData } from "@/lib/types";

interface Props {
  data: Partial<IntakeFormData>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string | string[] | undefined | number;
}) {
  if (value === undefined || value === null || value === "") return null;
  const display = Array.isArray(value) ? value.join(", ") : String(value);

  return (
    <div className="flex flex-col gap-1 border-b border-border/70 py-3 last:border-0 sm:flex-row sm:gap-4">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted sm:w-44">
        {label}
      </span>
      <span className="text-sm leading-relaxed text-text">{display}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white/90 p-5">
      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export default function Step6ReviewPayment({ data, onSubmit, isSubmitting }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-text">Review your application</h2>
        <p className="mt-1 text-sm text-text-muted">
          Make final edits now, then submit for payment and batch onboarding.
        </p>
      </div>

      <Section title="Basic Information">
        <Row label="Name" value={data.fullName} />
        <Row label="Mobile" value={data.mobile} />
        <Row label="Email" value={data.email} />
        <Row label="Medium" value={data.medium} />
        <Row label="Graduation Stream" value={data.graduationStream} />
        <Row label="Notes" value={data.notes} />
      </Section>

      <Section title="Prelims Background">
        <Row label="Experience" value={data.prelimsExperience} />
        <Row label="Attempt Count" value={data.attemptCount} />
        <Row label="GS Score Band" value={data.gsScoreBand} />
      </Section>

      <Section title="Subject Comfort">
        <Row label="GS Strong" value={data.strongGSSubjects} />
        <Row label="GS Weak" value={data.weakGSSubjects} />
        <Row label="Current Affairs" value={data.currentAffairsSource} />
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

      <div className="rounded-3xl bg-[linear-gradient(145deg,#0f3a31,#1f7a67)] p-6 text-center text-white sm:p-7">
        <p className="text-sm text-white/75">You are enrolling in</p>
        <p className="mt-1 font-display text-2xl font-bold tracking-tight">PTP 2.0 - MentorSir</p>
        <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-white/75 sm:text-sm">
          After submitting, our team reviews your responses and shares the next onboarding
          step with payment details.
        </p>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Processing..." : "Confirm and Proceed"} <span aria-hidden>→</span>
        </button>
        <p className="mt-4 text-xs text-white/65">7-day refund window · ₹6,999 for new students</p>
      </div>
    </div>
  );
}
