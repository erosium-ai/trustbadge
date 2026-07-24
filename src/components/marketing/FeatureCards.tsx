// 🔑 Keywords: Credentials AI V2 feature cards, AI-Readable Profile, Verified Trust Signals, Measured Enquiries, dark glass

const FEATURES = [
  {
    title: "AI-Readable Profile",
    body: "Your business details are structured so AI tools and search engines can read, understand and repeat them accurately.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden>
        <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M17.5 16.5l1.5 1.5 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Verified Trust Signals",
    body: "ABN checked against the Australian Business Register, with a public badge that shows what was checked and when.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden>
        <path d="M12 3l7 3v5c0 4.6-2.9 8.8-7 10-4.1-1.2-7-5.4-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8.5 12.2l2.1 2.1 4.9-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Measured Enquiries",
    body: "Calls, email clicks and quote requests are tracked with source attribution, so you see proof — not just hope.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden>
        <path d="M4 20V10m6 10V4m6 16v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M2 20h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function FeatureCards() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid gap-5 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="ai-glass-soft rounded-[1.75rem] p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/12 text-cyan-100">
              {feature.icon}
            </div>
            <h2 className="mt-4 text-xl font-black text-white">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{feature.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
