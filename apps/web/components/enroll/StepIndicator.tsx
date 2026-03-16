import { STEP_LABELS } from "@/lib/constants";
import ProgressBar from "@/components/ui/ProgressBar";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps) {
  return (
    <div className="mb-8 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <p className="text-sm font-semibold text-primary">
          Step {currentStep} of {totalSteps}
        </p>
        <p className="text-sm font-semibold text-text">{STEP_LABELS[currentStep - 1]}</p>
      </div>
      <ProgressBar current={currentStep} total={totalSteps} />

      <div className="mt-4 grid grid-cols-6 gap-2">
        {STEP_LABELS.map((label, idx) => {
          const step = idx + 1;
          const done = step < currentStep;
          const active = step === currentStep;

          return (
            <div key={label} className="flex items-center justify-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                  done
                    ? "bg-primary text-white"
                    : active
                      ? "bg-white text-primary ring-2 ring-primary"
                      : "bg-surface-soft text-text-muted"
                }`}
                aria-label={label}
                title={label}
              >
                {done ? "✓" : step}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
