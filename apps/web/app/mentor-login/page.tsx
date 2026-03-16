"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function MentorLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMentorSignIn = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const next = encodeURIComponent("/dashboard?intent=mentor");
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    });

    if (authError) {
      setError("Could not start sign-in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Mentor Access</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-text">
          Mentor Sign In
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          Sign in with your Google account to request mentor dashboard access. Admin
          approval is required before you can enter mentor tools.
        </p>

        <button
          type="button"
          onClick={handleMentorSignIn}
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>

        {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}

        <Link href="/" className="mt-5 block text-sm font-medium text-primary hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
