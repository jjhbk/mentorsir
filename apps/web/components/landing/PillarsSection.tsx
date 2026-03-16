import { PILLARS } from "@/lib/constants";

const accents = ["bg-primary", "bg-accent", "bg-emerald-600"] as const;

export default function PillarsSection() {
  return (
    <section id="program" className="px-5 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Program blueprint</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.3rem)] font-bold leading-[1.02] tracking-tight text-text">
              Three pillars. One integrated system.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-text-muted sm:text-base">
            You get one coherent workflow instead of juggling disconnected classes,
            tests, and guidance from multiple places.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {PILLARS.map((pillar, idx) => (
            <article key={pillar.id} className="glass rounded-3xl p-7 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-display text-4xl font-bold tracking-tight text-text/35">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className={`h-2 w-10 rounded-full ${accents[idx]}`} />
              </div>
              <h3 className="font-display text-2xl font-bold tracking-tight text-text">{pillar.title}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                {pillar.subtitle}
              </p>
              <ul className="mt-6 space-y-3">
                {pillar.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-text-muted">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
