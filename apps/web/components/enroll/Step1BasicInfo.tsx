import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { IntakeFormData } from "@/lib/types";
import FormField, { inputClass, selectClass } from "@/components/ui/FormField";
import { MEDIUM_OPTIONS, GRADUATION_STREAMS } from "@/lib/constants";

interface Props {
  register: UseFormRegister<IntakeFormData>;
  errors: FieldErrors<IntakeFormData>;
}

export default function Step1BasicInfo({ register, errors }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text mb-1">Basic Information</h2>
        <p className="text-sm text-text-muted">This helps us address you correctly and reach you.</p>
      </div>

      <FormField label="Full Name" required error={errors.fullName?.message}>
        <input
          {...register("fullName")}
          className={inputClass}
          placeholder="Eg. Rahul Sharma"
        />
      </FormField>

      <FormField label="Mobile Number" required error={errors.mobile?.message}>
        <input
          {...register("mobile")}
          className={inputClass}
          placeholder="10-digit Indian mobile number"
          inputMode="numeric"
          maxLength={10}
        />
      </FormField>

      <FormField label="Email Address" error={errors.email?.message}>
        <input
          {...register("email")}
          className={inputClass}
          placeholder="your@email.com"
          type="email"
        />
      </FormField>

      <div className="grid sm:grid-cols-2 gap-5">
        <FormField label="Medium in UPSC" required error={errors.medium?.message}>
          <select {...register("medium")} className={selectClass}>
            <option value="">Select medium</option>
            {MEDIUM_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Graduation Stream" required error={errors.graduationStream?.message}>
          <select {...register("graduationStream")} className={selectClass}>
            <option value="">Select stream</option>
            {GRADUATION_STREAMS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField
        label="Anything you'd like us to know? (optional)"
        hint="Personal circumstances, health issues, job constraints — share what's relevant."
      >
        <textarea
          {...register("notes")}
          className={`${inputClass} resize-none`}
          rows={3}
          placeholder="Optional — share any context that will help us guide you better."
        />
      </FormField>
    </div>
  );
}
