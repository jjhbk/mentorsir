interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showLabel?: boolean;
}

export default function ProgressBar({
  current,
  total,
  className = "",
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-sm text-text-muted">
          <span>
            Step {current} of {total}
          </span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-primary-light/80">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-primary),#3aa084)] transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
