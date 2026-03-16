import { MENTORS } from "@/lib/constants";

const INITIALS = ["AT", "AG", "RP"];

export default function MentorProfilesSection() {
  return (
    <section
      id="mentors"
      style={{ backgroundColor: "#FDFBF7", borderBottom: "1px solid #E4DCCF" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-24">
        {/* Header */}
        <div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 pb-8"
          style={{ borderBottom: "1px solid #E4DCCF" }}
        >
          <div>
            <p
              className="text-xs font-semibold uppercase mb-4"
              style={{ color: "#9C6B2E", letterSpacing: "0.22em" }}
            >
              Your mentors
            </p>
            <h2
              className="font-display font-bold"
              style={{
                fontSize: "clamp(32px, 5vw, 60px)",
                color: "#1C1710",
                letterSpacing: "-0.03em",
                lineHeight: 1.08,
              }}
            >
              Mentored by people<br />
              who&apos;ve been there.
            </h2>
          </div>
          <p className="text-base leading-relaxed max-w-xs" style={{ color: "#8B7B6E" }}>
            Not theoretical coaches — selected candidates and IIT/IIM graduates who understand the exam from the inside.
          </p>
        </div>

        {/* Mentor cards */}
        <div className="grid md:grid-cols-3 gap-0">
          {MENTORS.map((mentor, i) => (
            <div
              key={mentor.name}
              className="py-8"
              style={{
                paddingRight: i < 2 ? "clamp(20px, 4vw, 48px)" : 0,
                paddingLeft: i > 0 ? "clamp(20px, 4vw, 48px)" : 0,
                borderRight: i < 2 ? "1px solid #E4DCCF" : "none",
              }}
            >
              {/* Large initial as design element */}
              <div
                className="font-display font-black mb-6 leading-none"
                style={{
                  fontSize: "72px",
                  color: "#F6F2EB",
                  letterSpacing: "-0.04em",
                  position: "relative",
                }}
              >
                {INITIALS[i]}
              </div>

              <h3
                className="font-display font-bold mb-1"
                style={{ fontSize: "20px", color: "#1C1710", letterSpacing: "-0.02em" }}
              >
                {mentor.name}
              </h3>
              <p className="text-xs font-semibold mb-1" style={{ color: "#9C6B2E", letterSpacing: "0.06em" }}>
                {mentor.role}
              </p>
              <p className="text-xs mb-5" style={{ color: "#8B7B6E" }}>
                {mentor.credentials}
              </p>

              {/* Subject tags — text only, no pills */}
              <p className="text-xs font-semibold uppercase mb-4" style={{ color: "#C4B8AA", letterSpacing: "0.14em" }}>
                {mentor.subjects.join(" · ")}
              </p>

              <p className="text-sm leading-relaxed" style={{ color: "#3D3529" }}>
                {mentor.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
