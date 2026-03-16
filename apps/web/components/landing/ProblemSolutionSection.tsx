import { PROBLEMS, SOLUTIONS } from "@/lib/constants";

export default function ProblemSolutionSection() {
  return (
    <section
      id="why"
      style={{ backgroundColor: "#FDFBF7", borderBottom: "1px solid #E4DCCF" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-24">
        {/* Label */}
        <p
          className="text-xs font-semibold uppercase mb-12"
          style={{ color: "#9C6B2E", letterSpacing: "0.22em" }}
        >
          Why it matters
        </p>

        {/* Two-column editorial table */}
        <div className="grid md:grid-cols-2 gap-0">
          {/* Without */}
          <div style={{ paddingRight: "clamp(24px, 5vw, 64px)", borderRight: "1px solid #E4DCCF" }}>
            <h3
              className="font-display font-semibold mb-8"
              style={{ fontSize: "clamp(18px, 2.5vw, 24px)", color: "#8B7B6E", letterSpacing: "-0.02em" }}
            >
              Without structured mentorship
            </h3>
            <ul className="space-y-5">
              {PROBLEMS.map((p) => (
                <li key={p} className="flex items-start gap-4">
                  <span
                    className="shrink-0 mt-1 font-semibold text-xs"
                    style={{ color: "#C4B8AA", minWidth: "16px" }}
                  >
                    ✕
                  </span>
                  <span className="text-base leading-snug" style={{ color: "#8B7B6E" }}>
                    {p}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* With MentorSir */}
          <div
            className="mt-12 md:mt-0"
            style={{ paddingLeft: "clamp(24px, 5vw, 64px)" }}
          >
            <h3
              className="font-display font-semibold mb-8"
              style={{ fontSize: "clamp(18px, 2.5vw, 24px)", color: "#1C1710", letterSpacing: "-0.02em" }}
            >
              With MentorSir PTP 2.0
            </h3>
            <ul className="space-y-5">
              {SOLUTIONS.map((s) => (
                <li key={s} className="flex items-start gap-4">
                  <span
                    className="shrink-0 mt-1 font-semibold text-xs"
                    style={{ color: "#9C6B2E", minWidth: "16px" }}
                  >
                    →
                  </span>
                  <span className="text-base leading-snug" style={{ color: "#1C1710" }}>
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
