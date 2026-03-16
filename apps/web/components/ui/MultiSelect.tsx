"use client";

interface MultiSelectProps {
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  max?: number;
  columns?: 2 | 3 | 4;
  error?: string;
}

export default function MultiSelect({
  options,
  value,
  onChange,
  max,
  columns = 2,
  error,
}: MultiSelectProps) {
  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
      return;
    }

    if (max && value.length >= max) return;
    onChange([...value, option]);
  };

  const colClass =
    columns === 3 ? "sm:grid-cols-3" : columns === 4 ? "sm:grid-cols-4" : "sm:grid-cols-2";

  return (
    <div>
      <div className={`grid grid-cols-1 gap-2 ${colClass}`}>
        {options.map((option) => {
          const selected = value.includes(option);
          const disabled = !selected && !!max && value.length >= max;

          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => toggle(option)}
              className={`rounded-2xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                selected
                  ? "border-primary bg-primary text-white shadow-sm"
                  : disabled
                    ? "cursor-not-allowed border-border bg-surface-soft/50 text-text-muted/60"
                    : "cursor-pointer border-border bg-white text-text hover:border-primary hover:bg-primary-light/45"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {max && (
        <p className="mt-2 text-xs text-text-muted">
          Select up to {max} · {value.length}/{max} chosen
        </p>
      )}

      {error && <p className="mt-1 text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}
