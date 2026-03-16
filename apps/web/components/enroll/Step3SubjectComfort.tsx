"use client";

import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { useController } from "react-hook-form";
import type { IntakeFormData } from "@/lib/types";
import FormField, { selectClass } from "@/components/ui/FormField";
import MultiSelect from "@/components/ui/MultiSelect";
import {
  GS_SUBJECTS,
  CA_SOURCE_OPTIONS,
  CSAT_AREAS,
  CSAT_SCORE_BANDS,
} from "@/lib/constants";

interface Props {
  register: UseFormRegister<IntakeFormData>;
  control: Control<IntakeFormData>;
  errors: FieldErrors<IntakeFormData>;
}

export default function Step3SubjectComfort({ register, control, errors }: Props) {
  const strongGS = useController({ name: "strongGSSubjects", control });
  const weakGS = useController({ name: "weakGSSubjects", control });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text mb-1">Subject Comfort</h2>
        <p className="text-sm text-text-muted">
          Identifies your strong and weak GS areas to plan focused study and revision.
        </p>
      </div>

      <FormField
        label="GS Strong Subjects"
        required
        hint="Select all that feel comfortable to you."
        error={errors.strongGSSubjects?.message}
      >
        <MultiSelect
          options={GS_SUBJECTS}
          value={strongGS.field.value ?? []}
          onChange={strongGS.field.onChange}
        />
      </FormField>

      <FormField
        label="GS Weak Subjects"
        required
        hint="Select all that need the most work."
        error={errors.weakGSSubjects?.message}
      >
        <MultiSelect
          options={GS_SUBJECTS}
          value={weakGS.field.value ?? []}
          onChange={weakGS.field.onChange}
        />
      </FormField>

      <FormField
        label="Current Affairs — How do you follow it?"
        required
        error={errors.currentAffairsSource?.message}
      >
        <select {...register("currentAffairsSource")} className={selectClass}>
          <option value="">Select your approach</option>
          {CA_SOURCE_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid sm:grid-cols-2 gap-5">
        <FormField
          label="CSAT Strong Area"
          required
          error={errors.csatStrongArea?.message}
        >
          <select {...register("csatStrongArea")} className={selectClass}>
            <option value="">Select area</option>
            {CSAT_AREAS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="CSAT Weak Area" required error={errors.csatWeakArea?.message}>
          <select {...register("csatWeakArea")} className={selectClass}>
            <option value="">Select area</option>
            {CSAT_AREAS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField
        label="CSAT Score in Mocks"
        required
        error={errors.csatScoreBand?.message}
      >
        <select {...register("csatScoreBand")} className={selectClass}>
          <option value="">Select score band</option>
          {CSAT_SCORE_BANDS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </FormField>
    </div>
  );
}
