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
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-semibold text-text">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      {hint && <p className="-mt-0.5 text-xs leading-relaxed text-text-muted">{hint}</p>}
      {children}
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}

const controlBase =
  "w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text placeholder:text-text-muted/90 transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10";

export const inputClass = controlBase;

export const selectClass =
  `${controlBase} appearance-none cursor-pointer bg-[linear-gradient(135deg,#ffffff,#fbfaf4)]`;
