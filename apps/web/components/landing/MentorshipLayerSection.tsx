import { MENTORSHIP_FEATURES } from "@/lib/constants";

export default function MentorshipLayerSection() {
  return (
    <section id="mentorship" className="bg-[#12231f] px-5 py-20 text-white sm:px-6 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">Mentorship layer</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.3rem)] font-bold leading-[1.02] tracking-tight text-white">
              Content is important. Supervision is decisive.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
            Daily direction, honest accountability, and fast correction loops are what
            turn effort into exam-day performance.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {MENTORSHIP_FEATURES.map((feature, idx) => (
            <article key={feature.title} className="rounded-3xl border border-white/15 bg-white/5 p-7 sm:p-8">
              <p className="font-display text-4xl font-bold tracking-tight text-emerald-300/50">
                {String(idx + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">{feature.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
