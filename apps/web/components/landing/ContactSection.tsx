"use client";

import { FormEvent, useState } from "react";

export default function ContactSection() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    setSubmitting(true);
    setSubmitted(false);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Unable to submit form");
      }

      form.reset();
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not submit your message right now."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="px-5 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-border bg-text p-7 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">Contact</p>
          <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.02] tracking-tight">
            Let&apos;s plan your next attempt.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
            Share your prep context and our team will get back within 24 hours.
          </p>

          <div className="mt-8 space-y-4 border-t border-white/20 pt-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/60">Email</p>
              <a href="mailto:hello@mentorsir.in" className="text-base font-medium text-white hover:text-emerald-200">
                hello@mentorsir.in
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/60">Phone</p>
              <a href="tel:+918826629459" className="text-base font-medium text-white hover:text-emerald-200">
                +91 88266 29459
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/60">Hours</p>
              <p className="text-sm text-white/80">Mon-Sat · 9:00 AM to 8:00 PM IST</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-7 sm:p-8">
          <h3 className="font-display text-3xl font-bold tracking-tight text-text">Send us a message</h3>
          <p className="mt-2 text-sm text-text-muted">Tell us your goal, attempt year, and biggest challenge.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                name="name"
                placeholder="Your name"
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
              <input
                required
                name="phone"
                placeholder="Phone number"
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <input
              required
              type="email"
              name="email"
              placeholder="Email address"
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            />

            <textarea
              required
              name="message"
              rows={5}
              placeholder="How can we help you?"
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            />

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Enquiry"} <span aria-hidden>→</span>
            </button>

            {submitted && (
              <p className="text-sm font-medium text-success">
                Thanks. We received your message and will contact you shortly.
              </p>
            )}
            {error && <p className="text-sm font-medium text-danger">{error}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
