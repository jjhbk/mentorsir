const footerLinks = [
  ["YouTube", "https://www.youtube.com/@mentorsir.official"],
  ["Telegram", "https://t.me/mentorsir"],
  ["Instagram", "https://www.instagram.com/mentorsir.official"],
  ["Privacy Policy", "/privacy-policy"],
  ["FAQ", "#faq"],
] as const;

export default function CTAFooterSection() {
  return (
    <footer className="bg-text px-5 pb-8 pt-20 text-white sm:px-6 sm:pt-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-[2rem] bg-[linear-gradient(140deg,#1f7a67,#164b40)] p-8 sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200">Enrollment open</p>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-[15ch] font-display text-[clamp(2rem,6vw,4.8rem)] font-bold leading-[0.96] tracking-tight">
              Ready to join the 118+ club?
            </h2>
            <div className="max-w-sm">
              <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                Seats are intentionally limited for personalized attention. Enrollment
                takes about five minutes.
              </p>
<a
  href="/enroll"
  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold border border-blue-600 transition-all hover:-translate-y-0.5"
  style={{ color: "black" }}
>
  Begin Enrollment <span aria-hidden style={{ color: "black" }}>→</span>
</a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-white/60">
          <p className="font-display text-sm font-bold tracking-tight text-white/80">MentorSir</p>
          <div className="flex flex-wrap items-center gap-4">
            {footerLinks.map(([label, href]) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="transition-colors hover:text-white"
              >
                {label}
              </a>
            ))}
          </div>
          <p>© 2026 MentorSir · Smart Structure. Right Guidance. Confident Prelims.</p>
        </div>
      </div>
    </footer>
  );
}
