import { PROBLEMS, SOLUTIONS } from "@/lib/constants";

function Card({
  title,
  items,
  bad,
}: {
  title: string;
  items: readonly string[];
  bad?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-border bg-white/90 p-7 sm:p-8">
      <h3 className="font-display text-2xl font-bold tracking-tight text-text">{title}</h3>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-text-muted sm:text-base">
            <span
              className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                bad
                  ? "bg-red-50 text-red-600"
                  : "bg-primary-light text-primary"
              }`}
            >
              {bad ? "×" : "✓"}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ProblemSolutionSection() {
  return (
    <section id="why" className="px-5 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Why students switch</p>
        <h2 className="mt-4 max-w-[18ch] font-display text-[clamp(2rem,5vw,3.3rem)] font-bold leading-[1.02] tracking-tight text-text">
          From random prep to guided preparation.
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Card title="Without structured mentorship" items={PROBLEMS} bad />
          <Card title="With MentorSir PTP 2.0" items={SOLUTIONS} />
        </div>
      </div>
    </section>
  );
}
