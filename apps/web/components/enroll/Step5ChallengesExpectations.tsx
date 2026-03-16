"use client";

import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { useController } from "react-hook-form";
import type { IntakeFormData } from "@/lib/types";
import FormField, { selectClass } from "@/components/ui/FormField";
import MultiSelect from "@/components/ui/MultiSelect";
import { CORE_CHALLENGES, MENTORSHIP_EXPECTATIONS, DISCOVERY_PLATFORMS } from "@/lib/constants";

interface Props {
  register: UseFormRegister<IntakeFormData>;
  control: Control<IntakeFormData>;
  errors: FieldErrors<IntakeFormData>;
}

export default function Step5ChallengesExpectations({ register, control, errors }: Props) {
  const challenges = useController({ name: "coreChallenges", control });
  const expectations = useController({ name: "mentorshipExpectations", control });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text mb-1">Challenges & Goals</h2>
        <p className="text-sm text-text-muted">
          Captures the main obstacles holding back your Prelims performance and what you expect
          from this program.
        </p>
      </div>

      <FormField
        label="Your Core Prelims Challenges"
        required
        hint="Select all that apply — be honest."
        error={errors.coreChallenges?.message}
      >
        <MultiSelect
          options={CORE_CHALLENGES}
          value={challenges.field.value ?? []}
          onChange={challenges.field.onChange}
        />
      </FormField>

      <FormField
        label="What do you expect MOST from this program?"
        required
        hint="Select up to 3 expectations."
        error={errors.mentorshipExpectations?.message}
      >
        <MultiSelect
          options={MENTORSHIP_EXPECTATIONS}
          value={expectations.field.value ?? []}
          onChange={expectations.field.onChange}
          max={3}
          columns={2}
        />
      </FormField>

      <FormField
        label="How did you find MentorSir?"
        required
        error={errors.discoveryPlatform?.message}
      >
        <select {...register("discoveryPlatform")} className={selectClass}>
          <option value="">Select platform</option>
          {DISCOVERY_PLATFORMS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </FormField>
    </div>
  );
}
