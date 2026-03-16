import { MENTORS } from "@/lib/constants";

export default function MentorProfilesSection() {
  return (
    <section id="mentors" className="px-5 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Meet your mentors</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.3rem)] font-bold leading-[1.02] tracking-tight text-text">
              Guided by people who know the terrain.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-text-muted sm:text-base">
            Each mentor blends exam strategy with practical accountability so your
            daily work maps to actual prelims outcomes.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {MENTORS.map((mentor) => (
            <article key={mentor.name} className="glass rounded-3xl p-7 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{mentor.role}</p>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-text">{mentor.name}</h3>
              <p className="mt-1 text-xs text-text-muted">{mentor.credentials}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {mentor.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="rounded-full border border-border bg-white/90 px-3 py-1 text-xs font-semibold text-text-muted"
                  >
                    {subject}
                  </span>
                ))}
              </div>

              <p className="mt-5 text-sm leading-relaxed text-text-muted sm:text-base">{mentor.bio}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
