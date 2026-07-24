// 🔑 Keywords: Credentials AI V2 hero, Your Business Seen by AI, AI-verified profiles, measured leads, readable by ChatGPT Google Claude Siri, Gold Coast Flow Plumbing preview

import { CtaButton } from "./CtaButton";
import { AiParticles } from "@/components/AiParticles";

interface HeroProps {
  freeProfileUrl: string;
  sampleProfileUrl: string;
}

const TRUST_PILLS = ["AI-Optimised", "ABN Verified", "Performance Measured"];
const READABLE_BY = ["ChatGPT", "Google", "Claude", "Siri"];

export function Hero({ freeProfileUrl, sampleProfileUrl }: HeroProps) {
  return (
    <section className="ai-v2-bg relative isolate overflow-hidden text-white">
      <div className="ai-trust-horizon" />
      <div className="ai-horizon-line" />
      <div className="ai-aurora-ribbons" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
      <AiParticles tone="home" count={20} placement="absolute" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-10 h-80 w-80 rounded-full bg-violet-500/24 blur-3xl" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.02fr_0.98fr] md:items-center md:pb-24 md:pt-20">
        <div className="relative z-10">
          <div className="flex flex-wrap gap-2">
            {TRUST_PILLS.map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200 backdrop-blur"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                {pill}
              </span>
            ))}
          </div>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl">
            Your Business, Seen by AI
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-300 sm:text-xl">
            AI-verified profiles that bring you measured leads.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaButton
              href={freeProfileUrl}
              eventName="credentials_ai_click_free_profile"
              label="Claim Your Free Profile"
              dataCta="hero-primary"
              className="w-full sm:w-auto"
            >
              Claim Your Free Profile
            </CtaButton>
            <CtaButton
              href={sampleProfileUrl}
              eventName="credentials_ai_click_sample_profile"
              label="See a full AI-Ready Business Page"
              dataCta="hero-secondary"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              See the paid page demo
            </CtaButton>
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-400">
            Free AI Business Card, no card needed · Upgrade when you want the full page · Built in Australia
          </p>

          <div className="mt-8 border-t border-white/10 pt-5">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
              Readable by
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
              {READABLE_BY.map((name) => (
                <span key={name} className="text-base font-black tracking-tight text-slate-300">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="ai-glass rounded-[2rem] p-4">
            <div className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-slate-950/72">
              <div className="relative px-5 pb-5 pt-6">
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-cyan-400/22 via-violet-500/18 to-transparent" />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Example business profile</p>
                    <p className="mt-2 text-2xl font-black text-white">Gold Coast Flow Plumbing</p>
                    <p className="mt-1 text-sm text-slate-300">Burleigh · Varsity Lakes · Mermaid Beach</p>
                  </div>
                  <div className="ai-shield-pulse flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/35 bg-cyan-300/12 text-cyan-100">
                    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden>
                      <path d="M12 3l7 3v5c0 4.6-2.9 8.8-7 10-4.1-1.2-7-5.4-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M8.5 12.2l2.1 2.1 4.9-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                <div className="relative mt-5 grid grid-cols-2 gap-3">
                  <button className="rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-300 px-4 py-3 text-sm font-black text-slate-950">Call now</button>
                  <button className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white">Request quote</button>
                </div>

                <div className="relative mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm font-bold text-emerald-100">
                  New quote request · Source: Google · 2 min ago
                </div>

                <div className="relative mt-4 grid gap-3 sm:grid-cols-3">
                  {["9 calls", "4 quotes", "Top: Google"].map((stat) => (
                    <div key={stat} className="rounded-2xl border border-white/10 bg-white/7 p-3 text-center">
                      <p className="text-sm font-black text-white">{stat}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">7-day proof</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Sample data</p>
          </div>
        </div>
      </div>
    </section>
  );
}
