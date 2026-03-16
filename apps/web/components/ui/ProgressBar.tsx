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
        <div className="flex justify-between text-sm text-text-muted mb-1">
          <span>
            Step {current} of {total}
          </span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-2 bg-primary-light rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
