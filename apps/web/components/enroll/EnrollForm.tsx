"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { intakeFormSchema, STEP_FIELDS, type IntakeFormData } from "@/lib/types";
import {
  clearEnrollmentDraft,
  loadEnrollmentDraft,
  saveEnrollmentDraft,
} from "@/lib/localStorage";
import { createClient } from "@/lib/supabase/client";

import StepIndicator from "./StepIndicator";
import Step1BasicInfo from "./Step1BasicInfo";
import Step2PrelimsBackground from "./Step2PrelimsBackground";
import Step3SubjectComfort from "./Step3SubjectComfort";
import Step4TestStudyHabits from "./Step4TestStudyHabits";
import Step5ChallengesExpectations from "./Step5ChallengesExpectations";
import Step6ReviewPayment from "./Step6ReviewPayment";

const TOTAL_STEPS = 6;

function GoogleSignInGate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/enroll`,
      },
    });

    if (authError) {
      setError("Sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-5">
            <Link href="/" className="text-sm font-medium text-primary hover:underline">
              ← Back to MentorSir
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
              Go to Dashboard →
            </Link>
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-text">
            Start your PTP 2.0 application
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            Sign in once and continue anytime. Your progress is saved automatically.
          </p>
        </div>

        <div className="glass rounded-3xl p-7 text-center sm:p-8">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-border bg-white px-6 py-4 text-sm font-semibold text-text transition hover:border-primary hover:bg-primary-light/35 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.1 33.5 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l6-6C34.5 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-7.9 19.7-20 0-1.3-.1-2.7-.2-4z" />
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.8 1.1 8 2.9l6-6C34.5 6.1 29.6 4 24 4c-8 0-14.9 4.7-17.7 10.7z" />
              <path fill="#FBBC05" d="M24 44c5.5 0 10.5-1.9 14.3-5l-6.6-5.4C29.7 35.4 27 36 24 36c-5.7 0-10.1-2.5-11.7-7.5l-7 5.4C8.9 40.1 15.9 44 24 44z" />
              <path fill="#EA4335" d="M43.6 20H24v8.5h11.7c-.8 2.3-2.3 4.2-4.2 5.6l6.6 5.4C42 36.2 44 30.5 44 24c0-1.3-.1-2.7-.4-4z" />
            </svg>
            {loading ? "Redirecting..." : "Continue with Google"}
          </button>

          {error && <p className="mt-4 text-sm font-medium text-danger">{error}</p>}

          <p className="mt-5 text-xs leading-relaxed text-text-muted">
            We only use your account to secure your application, save progress, and send
            mentorship updates.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EnrollForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data.user);
      setAuthChecked(true);
    })();
  }, []);

  const {
    register,
    control,
    trigger,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    mode: "onTouched",
    defaultValues: {
      strongGSSubjects: [],
      weakGSSubjects: [],
      coreChallenges: [],
      mentorshipExpectations: [],
      attemptCount: 0,
    },
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    const draft = loadEnrollmentDraft();
    if (draft) reset(draft as IntakeFormData);
  }, [isAuthenticated, reset]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const subscription = watch((values) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveEnrollmentDraft(values as Partial<IntakeFormData>);
      }, 800);
    });

    return () => {
      subscription.unsubscribe();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [watch, isAuthenticated]);

  const handleNext = async () => {
    const fields = STEP_FIELDS[currentStep];
    const valid = fields.length === 0 || (await trigger(fields));
    if (valid) setCurrentStep((step) => Math.min(step + 1, TOTAL_STEPS));
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => setCurrentStep((step) => Math.max(step - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const authRes = await supabase.auth.getUser();
      const user = authRes.data.user;
      if (!user) throw new Error("Not authenticated");

      const values = getValues();

      // Ensure profile row exists first (intake_forms.user_id has FK -> profiles.id)
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          name: values.fullName,
          mobile: values.mobile,
          medium: values.medium,
          graduation_stream: values.graduationStream,
        },
        { onConflict: "id" }
      );

      if (profileError) throw profileError;

      const { error: intakeError } = await supabase.from("intake_forms").upsert(
        {
          user_id: user.id,
          mobile: values.mobile,
          email: values.email,
          medium: values.medium,
          graduation_stream: values.graduationStream,
          prelims_experience: values.prelimsExperience,
          attempt_count: values.attemptCount,
          gs_score_band: values.gsScoreBand,
          personal_difficulties: values.personalDifficulties,
          strong_gs_subjects: values.strongGSSubjects,
          weak_gs_subjects: values.weakGSSubjects,
          current_affairs_source: values.currentAffairsSource,
          csat_strong_area: values.csatStrongArea,
          csat_weak_area: values.csatWeakArea,
          csat_score_band: values.csatScoreBand,
          mock_frequency: values.mockFrequency,
          test_analysis: values.testAnalysis,
          wrong_question_revision: values.wrongQuestionRevision,
          pyq_practice: values.pyqPractice,
          plan_consistency: values.planConsistency,
          daily_study_hours: values.dailyStudyHours,
          revision_count: values.revisionCount,
          sources_per_subject: values.sourcesPerSubject,
          core_challenges: values.coreChallenges,
          mentorship_expectations: values.mentorshipExpectations,
          discovery_platform: values.discoveryPlatform,
          notes: values.notes,
        },
        { onConflict: "user_id" }
      );

      if (intakeError) throw intakeError;

      clearEnrollmentDraft();
      router.push(`/enroll/success?name=${encodeURIComponent(values.fullName)}`);
    } catch (error) {
      console.error("Enrollment submit failed", error);
      setIsSubmitting(false);
      alert("Could not submit your form. Please try again.");
    }
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return <GoogleSignInGate />;

  const formData = getValues();

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-7 text-center">
          <div className="flex items-center justify-center gap-5">
            <Link href="/" className="text-sm font-medium text-primary hover:underline">
              ← Back to MentorSir
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
              Go to Dashboard →
            </Link>
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-text">
            PTP 2.0 Enrollment
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted sm:text-base">
            Takes around 5-7 minutes. Your responses help us personalize your mentorship.
          </p>
        </div>

        <div className="glass rounded-3xl p-5 sm:p-8">
          <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

          {currentStep === 1 && <Step1BasicInfo register={register} errors={errors} />}
          {currentStep === 2 && <Step2PrelimsBackground register={register} errors={errors} />}
          {currentStep === 3 && (
            <Step3SubjectComfort register={register} control={control} errors={errors} />
          )}
          {currentStep === 4 && <Step4TestStudyHabits register={register} errors={errors} />}
          {currentStep === 5 && (
            <Step5ChallengesExpectations register={register} control={control} errors={errors} />
          )}
          {currentStep === 6 && (
            <Step6ReviewPayment
              data={formData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep < 6 && (
            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="cursor-pointer text-sm font-semibold text-text-muted transition hover:text-text disabled:cursor-not-allowed disabled:opacity-30"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                {currentStep === 5 ? "Review Application" : "Continue"} <span aria-hidden>→</span>
              </button>
            </div>
          )}

          {currentStep === 6 && (
            <div className="mt-6 border-t border-border pt-4 text-center">
              <button
                type="button"
                onClick={handleBack}
                className="cursor-pointer text-sm font-medium text-text-muted transition hover:text-text"
              >
                ← Edit previous answers
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-text-muted">
          Autosave is enabled, so you can close and continue later.
        </p>
      </div>
    </div>
  );
}
