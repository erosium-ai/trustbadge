// 🔑 Keywords: Credentials AI under the hood section, Schema.org JSON-LD, LLMs.txt, robots.txt, XML sitemap, Open Graph, AI-readable profiles

const TECH_ITEMS = [
  {
    title: "Schema.org JSON-LD structured data",
    body: "The standard Google, Bing and major AI crawlers use to understand what your business is, where you serve and what you offer.",
  },
  {
    title: "LLMs.txt",
    body: "A machine-readable summary file built for large language models like ChatGPT and Claude, so AI tools can read your business clearly.",
  },
  {
    title: "Robots.txt",
    body: "Properly configured to invite the right crawlers while keeping the wrong ones out.",
  },
  {
    title: "XML Sitemap",
    body: "Tells search engines exactly what pages exist and when they were last updated.",
  },
  {
    title: "Open Graph & Twitter Card metadata",
    body: "So your profile link shows a proper preview on Facebook, LinkedIn, WhatsApp and X instead of a blank link.",
  },
  {
    title: "Semantic HTML5",
    body: "Clean markup that screen readers, search engines and AI parsers can navigate without confusion.",
  },
  {
    title: "Mobile-first responsive",
    body: "Google indexes mobile first, so every profile is built to work cleanly on the phone in your customer's hand.",
  },
  {
    title: "Google indexing-ready",
    body: "Eligible public profiles sit on the Credentials AI sitemap and can be submitted for Google indexing. Indexing and ranking are controlled by Google and are not guaranteed.",
  },
];

export function UnderTheHoodSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="ai-glass-soft overflow-hidden rounded-[2rem]">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
              Under the hood
            </span>
            <h2 className="mt-5 text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
              Built for how the internet actually works now
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
              Every Credentials AI profile ships with a structured-data layer built so search engines and AI systems
              can parse your business clearly if they crawl the page — not just guess from a screenshot of your
              website.
            </p>
            <pre className="mt-6 overflow-x-auto rounded-2xl border border-cyan-300/15 bg-slate-950/80 p-4 text-[11px] leading-relaxed text-cyan-100/90 shadow-inner">
{`{
  "@type": "LocalBusiness",
  "areaServed": "Gold Coast",
  "hasOfferCatalog": "Services",
  "identifier": "ABN check source/date"
}`}
            </pre>
            <p className="mt-3 text-xs font-semibold text-slate-500">
              That is the layer AI tools can actually read — generated for you automatically.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {TECH_ITEMS.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <h3 className="text-sm font-black text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-transparent" aria-hidden />
      </div>
    </section>
  );
}
