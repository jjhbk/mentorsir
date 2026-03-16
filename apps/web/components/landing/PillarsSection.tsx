import { PILLARS } from "@/lib/constants";

const NUMBERS = ["01", "02", "03"];
const ACCENT_LINES = ["#9C6B2E", "#3A6B4F", "#4A6B8A"];

export default function PillarsSection() {
  return (
    <section
      id="program"
      style={{ backgroundColor: "#F6F2EB", borderBottom: "1px solid #E4DCCF" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-24">
        {/* Header row */}
        <div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 pb-8"
          style={{ borderBottom: "1px solid #E4DCCF" }}
        >
          <div>
            <p
              className="text-xs font-semibold uppercase mb-4"
              style={{ color: "#9C6B2E", letterSpacing: "0.22em" }}
            >
              What&apos;s inside PTP 2.0
            </p>
            <h2
              className="font-display font-bold"
              style={{ fontSize: "clamp(32px, 5vw, 60px)", color: "#1C1710", letterSpacing: "-0.03em", lineHeight: 1.08 }}
            >
              Three pillars.<br />
              One programme.
            </h2>
          </div>
          <p
            className="text-base leading-relaxed max-w-xs"
            style={{ color: "#8B7B6E" }}
          >
            Everything a Prelims aspirant needs — integrated, not scattered across five different platforms.
          </p>
        </div>

        {/* Pillar grid */}
        <div className="grid md:grid-cols-3 gap-0">
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.id}
              className="py-8"
              style={{
                paddingRight: i < 2 ? "clamp(20px, 4vw, 48px)" : 0,
                paddingLeft: i > 0 ? "clamp(20px, 4vw, 48px)" : 0,
                borderRight: i < 2 ? "1px solid #E4DCCF" : "none",
              }}
            >
              {/* Number */}
              <p
                className="font-display font-bold mb-5"
                style={{
                  fontSize: "clamp(36px, 5vw, 56px)",
                  color: ACCENT_LINES[i],
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  opacity: 0.3,
                }}
              >
                {NUMBERS[i]}
              </p>

              <h3
                className="font-display font-bold mb-1"
                style={{ fontSize: "22px", color: "#1C1710", letterSpacing: "-0.02em" }}
              >
                {pillar.title}
              </h3>
              <p
                className="text-xs font-semibold uppercase mb-5"
                style={{ color: "#8B7B6E", letterSpacing: "0.12em" }}
              >
                {pillar.subtitle}
              </p>

              <ul className="space-y-3">
                {pillar.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-3">
                    <span
                      className="shrink-0 mt-0.5 text-xs font-semibold"
                      style={{ color: ACCENT_LINES[i] }}
                    >
                      —
                    </span>
                    <span className="text-sm leading-relaxed" style={{ color: "#3D3529" }}>
                      {pt}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
