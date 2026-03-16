interface Props {
  searchParams: Promise<{ name?: string }>;
}

export default async function EnrollSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const name = params.name ?? "there";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: "linear-gradient(135deg, #0F0A1E 0%, #1A1033 100%)" }}
    >
      <div className="max-w-lg w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Welcome, {decodeURIComponent(name)}!
        </h1>
        <p className="text-white/70 text-lg mb-8 leading-relaxed">
          Your application has been received. We&apos;re reviewing your intake form and will
          reach out on WhatsApp within 24 hours with your payment link and program access
          details.
        </p>

        {/* Steps */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 text-left space-y-4">
          {[
            { step: "1", text: "We review your intake form (within 24h)" },
            { step: "2", text: "You receive a WhatsApp message with payment link" },
            { step: "3", text: "Complete payment to get program access" },
            { step: "4", text: "Join your personalised study plan on the app" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-accent text-white text-sm font-bold flex items-center justify-center shrink-0">
                {item.step}
              </div>
              <p className="text-white/80 text-sm pt-1">{item.text}</p>
            </div>
          ))}
        </div>

        {/* WhatsApp CTA */}
        <a
          href="https://wa.me/919999999999?text=Hi%2C%20I%20just%20filled%20the%20PTP%202.0%20enrollment%20form%20for%20MentorSir!"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg mb-4"
        >
          <span>💬</span> Message us on WhatsApp
        </a>

        <p className="text-white/40 text-sm mt-6">
          You can also check your email for a confirmation message.
        </p>

        <a href="/" className="block mt-8 text-white/50 hover:text-white text-sm transition-colors">
          ← Back to MentorSir
        </a>
      </div>
    </div>
  );
}
