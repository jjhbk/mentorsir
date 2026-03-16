"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { intakeFormSchema, STEP_FIELDS, type IntakeFormData } from "@/lib/types";
import {
  saveEnrollmentDraft,
  loadEnrollmentDraft,
  clearEnrollmentDraft,
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

// ── Google Sign-In Gate ──────────────────────────────────────────────────────
function GoogleSignInGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/enroll`,
      },
    });
    if (error) {
      setError("Sign-in failed. Please try again.");
      setLoading(false);
    }
    // On success the page redirects — no need to set loading=false
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <a href="/" className="text-sm text-primary hover:underline">
            ← Back to MentorSir
          </a>
          <div className="mt-6 w-16 h-16 mx-auto rounded-2xl bg-primary-light flex items-center justify-center">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-2xl font-bold text-text mt-4">Start Your PTP 2.0 Application</h1>
          <p className="text-text-muted text-sm mt-2">
            Sign in to save your progress and submit your enrollment form.
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm text-center">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-3 border border-border rounded-xl px-6 py-4 font-semibold text-text hover:bg-gray-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.1 33.5 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l6-6C34.5 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-7.9 19.7-20 0-1.3-.1-2.7-.2-4z"/>
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.8 1.1 8 2.9l6-6C34.5 6.1 29.6 4 24 4c-8 0-14.9 4.7-17.7 10.7z"/>
              <path fill="#FBBC05" d="M24 44c5.5 0 10.5-1.9 14.3-5l-6.6-5.4C29.7 35.4 27 36 24 36c-5.7 0-10.1-2.5-11.7-7.5l-7 5.4C8.9 40.1 15.9 44 24 44z"/>
              <path fill="#EA4335" d="M43.6 20H24v8.5h11.7c-.8 2.3-2.3 4.2-4.2 5.6l6.6 5.4C42 36.2 44 30.5 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
            {loading ? "Redirecting…" : "Continue with Google"}
          </button>

          {error && (
            <p className="text-danger text-sm mt-4">{error}</p>
          )}

          <p className="text-xs text-text-muted mt-6 leading-relaxed">
            By continuing you agree to our terms of service. We&apos;ll only use your
            email to manage your enrollment and send program updates.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Form ────────────────────────────────────────────────────────────────
export default function EnrollForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check auth on mount
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

  // Rehydrate from localStorage draft
  useEffect(() => {
    if (!isAuthenticated) return;
    const draft = loadEnrollmentDraft();
    if (draft) reset(draft as IntakeFormData);
  }, [isAuthenticated, reset]);

  // Auto-save draft to localStorage (debounced 800ms)
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
    if (valid) setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const authRes = await supabase.auth.getUser();
      const user = authRes.data.user;
      if (!user) throw new Error("Not authenticated");

      const values = getValues();

      // Save intake form to Supabase
      const { error: intakeError } = await supabase.from("intake_forms").upsert({
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
      });

      if (intakeError) throw intakeError;

      // Update profile name + mobile
      await supabase
        .from("profiles")
        .update({ name: values.fullName, mobile: values.mobile })
        .eq("id", user.id);

      clearEnrollmentDraft();
      router.push(`/enroll/success?name=${encodeURIComponent(values.fullName)}`);
    } catch {
      setIsSubmitting(false);
      alert("Something went wrong. Please try again.");
    }
  };

  // Loading state while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not signed in — show Google gate
  if (!isAuthenticated) {
    return <GoogleSignInGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const formData = getValues();

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="text-sm text-primary hover:underline">
            ← Back to MentorSir
          </a>
          <h1 className="text-2xl font-bold text-text mt-3">PTP 2.0 Enrollment</h1>
          <p className="text-sm text-text-muted mt-1">
            Takes 5–7 minutes · Your answers shape your personalised mentorship
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

          {currentStep === 1 && (
            <Step1BasicInfo register={register} errors={errors} />
          )}
          {currentStep === 2 && (
            <Step2PrelimsBackground register={register} errors={errors} />
          )}
          {currentStep === 3 && (
            <Step3SubjectComfort register={register} control={control} errors={errors} />
          )}
          {currentStep === 4 && (
            <Step4TestStudyHabits register={register} errors={errors} />
          )}
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
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="text-sm font-semibold text-text-muted hover:text-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-xl transition-all cursor-pointer"
              >
                {currentStep === 5 ? "Review Application →" : "Continue →"}
              </button>
            </div>
          )}

          {currentStep === 6 && (
            <div className="mt-6 pt-4 border-t border-border text-center">
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                ← Edit previous answers
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          Your progress is auto-saved. You can safely close and return.
        </p>
      </div>
    </div>
  );
}
