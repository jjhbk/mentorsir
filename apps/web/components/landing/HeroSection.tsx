const stats = [
  ["118+", "Top faculty score"],
  ["3", "Selected mentors"],
  ["12 Weeks", "Structured sprint"],
  ["₹6,999", "Complete package"],
] as const;

const BROCHURE_URL =
  "https://kkuualsrlsqxdizu.public.blob.vercel-storage.com/brochure.pdf";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-36 sm:px-6 sm:pb-24 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(31,122,103,0.22),transparent_28%),radial-gradient(circle_at_88%_0%,rgba(192,109,46,0.2),transparent_30%)]" />

      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-end">
        <div>
          <p className="anim-fade-up text-xs font-bold uppercase tracking-[0.24em] text-primary">
            PTP 2.0 · UPSC Prelims 2026
          </p>

          <h1 className="anim-fade-up d-100 mt-6 max-w-[14ch] font-display text-[clamp(2.7rem,8vw,6.1rem)] font-bold leading-[0.98] tracking-[-0.03em] text-text">
            Build the momentum to clear Prelims.
          </h1>

          <p className="anim-fade-up d-200 mt-7 max-w-[56ch] text-base leading-relaxed text-text-muted sm:text-lg">
            A guided system for GS, CSAT, and Current Affairs with daily accountability,
            tight feedback loops, and mentors who have actually cleared high bars.
          </p>

          <div className="anim-fade-up d-300 mt-10 flex flex-wrap items-center gap-4">
            <a
              href="/enroll"
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#1f7a67,#2c9f86)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/35"
            >
              Start Enrollment <span aria-hidden>→</span>
            </a>
            <a
              href="#program"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-7 py-3.5 text-sm font-semibold text-text transition-colors hover:border-primary"
            >
              Explore Program
            </a>
            <a
              href={BROCHURE_URL}
              target="_blank"
              rel="noreferrer"
              download
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-7 py-3.5 text-sm font-semibold text-text transition-colors hover:border-primary"
            >
              Download Brochure
            </a>
          </div>
        </div>

        <div className="anim-fade-up d-400 glass rounded-3xl p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
            This batch includes
          </p>
          <ul className="mt-5 space-y-4 text-sm text-text-muted sm:text-base">
            <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-primary" />Daily study accountability and mentor review</li>
            <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-primary" />GS + CSAT + current affairs in one pace-controlled track</li>
            <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-primary" />Test-based corrections with pattern-focused guidance</li>
          </ul>

          <div className="mt-7 grid grid-cols-2 gap-3 border-t border-border/70 pt-6">
            {stats.map(([value, label]) => (
              <div key={value} className="rounded-2xl bg-surface-soft/80 p-4">
                <p className="font-display text-3xl font-bold tracking-tight text-text">{value}</p>
                <p className="mt-1 text-xs text-text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
