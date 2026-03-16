import Link from "next/link";

const links = [
  ["Program", "#program"],
  ["Mentors", "#mentors"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
] as const;

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight">
          MentorSir
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            Dashboard
          </Link>
          <Link
            href="/mentor-login"
            className="text-sm font-semibold text-accent transition-colors hover:text-accent-dark"
          >
            Mentor Login
          </Link>
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium text-text-muted transition-colors hover:text-text"
            >
              {label}
            </a>
          ))}
        </nav>

        <Link
          href="/enroll"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          Sign up
        </Link>
      </div>
    </header>
  );
}
