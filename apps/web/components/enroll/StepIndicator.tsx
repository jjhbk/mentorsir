import { STEP_LABELS } from "@/lib/constants";
import ProgressBar from "@/components/ui/ProgressBar";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-primary">
          Step {currentStep} of {totalSteps}
        </p>
        <p className="text-sm font-bold text-text">{STEP_LABELS[currentStep - 1]}</p>
      </div>
      <ProgressBar current={currentStep} total={totalSteps} />

      {/* Step dots */}
      <div className="flex justify-between mt-3">
        {STEP_LABELS.map((label, i) => {
          const step = i + 1;
          const done = step < currentStep;
          const active = step === currentStep;
          return (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done
                    ? "bg-primary text-white"
                    : active
                    ? "bg-primary text-white ring-4 ring-primary-light"
                    : "bg-border text-text-muted"
                }`}
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
