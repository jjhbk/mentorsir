"use client";
export default function Nav() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        backgroundColor: "rgba(246, 242, 235, 0.92)",
        borderColor: "#E4DCCF",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        className="max-w-6xl mx-auto px-6 flex items-center justify-between"
        style={{ height: "56px" }}
      >
        {/* Wordmark */}
        <a
          href="/"
          className="font-display font-bold text-xl tracking-tight"
          style={{ color: "#1C1710", letterSpacing: "-0.04em" }}
        >
          MentorSir
        </a>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            ["Program", "#program"],
            ["Mentors", "#mentors"],
            ["Pricing", "#pricing"],
            ["FAQ", "#faq"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium transition-colors"
              style={{ color: "#8B7B6E" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1C1710")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8B7B6E")}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="/enroll"
          className="text-sm font-semibold px-5 py-2.5 transition-all"
          style={{
            backgroundColor: "#1C1710",
            color: "#F6F2EB",
            borderRadius: "4px",
            letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3D3529")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1C1710")}
        >
          Enroll — ₹6,999
        </a>
      </div>
    </header>
  );
}
