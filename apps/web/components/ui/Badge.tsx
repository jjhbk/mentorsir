type BadgeVariant = "primary" | "accent" | "success" | "danger" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  primary: "bg-primary-light text-primary",
  accent: "bg-accent text-white",
  success: "bg-emerald-100 text-emerald-700",
  danger: "bg-red-100 text-red-700",
  outline: "border border-primary text-primary bg-transparent",
};

export default function Badge({
  children,
  variant = "primary",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
