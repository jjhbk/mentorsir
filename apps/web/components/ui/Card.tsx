interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export default function Card({ children, className = "", hover = false, style }: CardProps) {
  return (
    <div
      style={style}
      className={`bg-white rounded-2xl shadow-sm border border-border p-6 ${
        hover ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
