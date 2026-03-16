import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { IntakeFormData } from "@/lib/types";
import FormField, { inputClass, selectClass } from "@/components/ui/FormField";
import {
  PRELIMS_EXPERIENCE_OPTIONS,
  GS_SCORE_BANDS,
} from "@/lib/constants";

interface Props {
  register: UseFormRegister<IntakeFormData>;
  errors: FieldErrors<IntakeFormData>;
}

export default function Step2PrelimsBackground({ register, errors }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text mb-1">Prelims Background</h2>
        <p className="text-sm text-text-muted">
          Helps us understand where you are in your UPSC journey so we can guide you appropriately.
        </p>
      </div>

      <FormField
        label="Prelims Experience"
        required
        error={errors.prelimsExperience?.message}
      >
        <select {...register("prelimsExperience")} className={selectClass}>
          <option value="">Select experience</option>
          {PRELIMS_EXPERIENCE_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Prelims Attempt Count"
        hint="If this is your first attempt, enter 0."
        error={errors.attemptCount?.message}
      >
        <input
          {...register("attemptCount")}
          type="number"
          min={0}
          max={20}
          className={inputClass}
          placeholder="0"
        />
      </FormField>

      <FormField
        label="Previous GS Score"
        required
        hint="Your approximate GS Paper 1 score in the last attempt."
        error={errors.gsScoreBand?.message}
      >
        <select {...register("gsScoreBand")} className={selectClass}>
          <option value="">Select score band</option>
          {GS_SCORE_BANDS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Any specific difficulty, confusion, or situation affecting your preparation?"
        hint="This is shared only with your mentor. Be honest — it helps us guide you better."
      >
        <textarea
          {...register("personalDifficulties")}
          className={`${inputClass} resize-none`}
          rows={4}
          placeholder="Eg. I struggle with Environment, haven't been consistent since January, dealing with job stress..."
        />
      </FormField>
    </div>
  );
}
