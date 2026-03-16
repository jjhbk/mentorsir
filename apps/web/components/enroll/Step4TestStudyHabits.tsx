import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { IntakeFormData } from "@/lib/types";
import FormField, { selectClass } from "@/components/ui/FormField";
import {
  MOCK_FREQUENCY_OPTIONS,
  TEST_ANALYSIS_OPTIONS,
  WRONG_Q_REVISION_OPTIONS,
  PYQ_PRACTICE_OPTIONS,
  PLAN_CONSISTENCY_OPTIONS,
  DAILY_STUDY_HOURS_OPTIONS,
  REVISION_COUNT_OPTIONS,
  SOURCES_PER_SUBJECT_OPTIONS,
} from "@/lib/constants";

interface Props {
  register: UseFormRegister<IntakeFormData>;
  errors: FieldErrors<IntakeFormData>;
}

function Select({
  label,
  name,
  register,
  options,
  error,
  required,
  hint,
}: {
  label: string;
  name: keyof IntakeFormData;
  register: UseFormRegister<IntakeFormData>;
  options: readonly string[];
  error?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <FormField label={label} required={required} hint={hint} error={error}>
      <select {...register(name)} className={selectClass}>
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </FormField>
  );
}

export default function Step4TestStudyHabits({ register, errors }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text mb-1">Test & Study Habits</h2>
        <p className="text-sm text-text-muted">
          Shows how you approach tests and revision — this directly impacts your Prelims
          performance and how we guide you.
        </p>
      </div>

      <div className="bg-primary-light rounded-2xl p-4 text-sm text-primary font-medium">
        📊 Test & Practice Behaviour
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Select
          label="How often do you attempt mock tests?"
          name="mockFrequency"
          register={register}
          options={MOCK_FREQUENCY_OPTIONS}
          error={errors.mockFrequency?.message}
          required
        />
        <Select
          label="What do you do after a mock test?"
          name="testAnalysis"
          register={register}
          options={TEST_ANALYSIS_OPTIONS}
          error={errors.testAnalysis?.message}
          required
        />
        <Select
          label="Do you revise wrong questions?"
          name="wrongQuestionRevision"
          register={register}
          options={WRONG_Q_REVISION_OPTIONS}
          error={errors.wrongQuestionRevision?.message}
          required
        />
        <Select
          label="PYQ practice style"
          name="pyqPractice"
          register={register}
          options={PYQ_PRACTICE_OPTIONS}
          error={errors.pyqPractice?.message}
          required
        />
      </div>

      <div className="bg-primary-light rounded-2xl p-4 text-sm text-primary font-medium mt-2">
        📅 Study Discipline & Planning
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Select
          label="Do you follow a fixed daily study plan?"
          name="planConsistency"
          register={register}
          options={PLAN_CONSISTENCY_OPTIONS}
          error={errors.planConsistency?.message}
          required
        />
        <Select
          label="Average daily study hours"
          name="dailyStudyHours"
          register={register}
          options={DAILY_STUDY_HOURS_OPTIONS}
          error={errors.dailyStudyHours?.message}
          required
        />
        <Select
          label="How many times have you revised core subjects?"
          name="revisionCount"
          register={register}
          options={REVISION_COUNT_OPTIONS}
          error={errors.revisionCount?.message}
          required
        />
        <Select
          label="How many sources per subject?"
          name="sourcesPerSubject"
          register={register}
          options={SOURCES_PER_SUBJECT_OPTIONS}
          error={errors.sourcesPerSubject?.message}
          required
        />
      </div>
    </div>
  );
}
