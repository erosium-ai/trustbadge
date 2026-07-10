// 🔑 Keywords: why AI can't see most businesses, proof section, under the hood chips, AI readability explainer
// v1.1 homepage proof section (Ike approved copy direction 2026-07-10):
// teaches the honest truth — AI answers can't parse old websites — then lists
// exactly how Credentials AI makes a business machine-readable. Every line is
// literally true as of 2026-07-10 (schema arrays, robots welcome mat,
// llms.txt, dynamic sitemap + GSC, TrustBadge). "Under the hood" is meant to
// be SEEN — it's the one technical flex on the page.

import { Section } from "./Section";

const READABLE_WAYS = [
  {
    title: "Structured data",
    body: "Your services, suburbs and contact details in the exact format AI systems parse.",
  },
  {
    title: "An open door for AI crawlers",
    body: "ChatGPT's, Claude's and Perplexity's readers are invited in by name.",
  },
  {
    title: "A machine-readable business summary",
    body: "A plain-language briefing file written specifically for AI systems.",
  },
  {
    title: "Listed with Google",
    body: "Every profile sits on our sitemap and is submitted to Google's index.",
  },
  {
    title: "Verified trust signals",
    body: "Machines can check you're a real, credentialed business — not a ghost listing.",
  },
];

const UNDER_THE_HOOD = [
  "schema.org structured data",
  "robots.txt with named AI-crawler access",
  "llms.txt briefing file",
  "dynamic sitemap",
  "Google Search Console indexing",
  "JSON-LD verification markup",
];

export function AiReadableSection() {
  return (
    <Section id="ai-readable">
      <div>
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#F97316]">
            Why this matters
          </p>
          <h2 className="mt-3 text-balance text-3xl font-black tracking-tight text-[#0F1B2D] sm:text-4xl">
            Why AI can&rsquo;t see most businesses
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-[#5B6472]">
            More and more customers don&rsquo;t Google — they <span className="font-semibold text-[#0F1B2D]">ask</span>.
            ChatGPT, Siri, Google&rsquo;s AI. And here&rsquo;s the problem:{" "}
            <span className="font-semibold text-[#0F1B2D]">AI can&rsquo;t properly read most business websites.</span>{" "}
            Old sites are built for human eyeballs — pretty pictures, no structure. To an AI, they&rsquo;re mush.
          </p>
          <p className="mt-3 text-lg font-semibold text-[#0F1B2D]">
            We build your profile in the language AI actually reads:
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {READABLE_WAYS.map((way) => (
            <div
              key={way.title}
              className="card-float rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-emerald-700" aria-hidden>
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="mt-3 text-base font-bold text-[#0F1B2D]">{way.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#5B6472]">{way.body}</p>
            </div>
          ))}

          {/* Honesty card — the pub pitch, in writing */}
          <div className="rounded-2xl border border-[#F97316]/30 bg-[#FFF7ED] p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-[#EA580C]">Straight up</p>
            <p className="mt-2 text-sm leading-relaxed text-[#7C2D12]">
              Nobody can guarantee AI will recommend you — anyone who says otherwise is having a lend. What we
              guarantee: your business will be in the formats AI systems actually read.{" "}
              <span className="font-semibold">Most of your competitors aren&rsquo;t.</span>
            </p>
          </div>
        </div>

        {/* Under the hood — the ONE technical flex. Meant to be seen. */}
        <div className="ink-gradient card-float mt-8 overflow-hidden rounded-2xl">
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#F97316]/50 bg-[#F97316]/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
                  <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.4 2.4-2.3-.7-.7-2.3 2.4-2.4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
                Under the hood
              </span>
              <p className="text-sm font-medium text-slate-300">
                The engineering running behind every profile:
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {UNDER_THE_HOOD.map((item) => (
                <span
                  key={item}
                  className="rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 font-mono text-[13px] font-medium text-emerald-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-[#F97316] via-[#EA580C] to-transparent" aria-hidden />
        </div>
      </div>
    </Section>
  );
}
