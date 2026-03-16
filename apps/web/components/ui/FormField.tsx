interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormField({
  label,
  error,
  required,
  hint,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-semibold text-text">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-text-muted -mt-1">{hint}</p>}
      {children}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

// Shared input/select/textarea class strings for consistent styling
export const inputClass =
  "w-full border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all";

export const selectClass =
  "w-full border border-border rounded-xl px-4 py-3 text-sm text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer";
