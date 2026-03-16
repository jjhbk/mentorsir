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
  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      if (max && value.length >= max) return;
      onChange([...value, opt]);
    }
  };

  const colClass =
    columns === 3 ? "grid-cols-3" : columns === 4 ? "grid-cols-4" : "grid-cols-2";

  return (
    <div>
      <div className={`grid ${colClass} gap-2`}>
        {options.map((opt) => {
          const selected = value.includes(opt);
          const disabled = !selected && !!max && value.length >= max;
          return (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              onClick={() => toggle(opt)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left border transition-all duration-150 cursor-pointer
                ${
                  selected
                    ? "bg-primary border-primary text-white shadow-sm"
                    : disabled
                    ? "border-border text-text-muted opacity-40 cursor-not-allowed"
                    : "border-border text-text hover:border-primary hover:bg-primary-light"
                }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {max && (
        <p className="text-xs text-text-muted mt-2">
          Select up to {max} · {value.length}/{max} chosen
        </p>
      )}
      {error && <p className="text-sm text-danger mt-1">{error}</p>}
    </div>
  );
}
