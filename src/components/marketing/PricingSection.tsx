// 🔑 Keywords: Credentials AI V2 pricing comparison, AI Business Card free, AI-Ready Business Page paid, $49/month or $12.90/week, same product cancel anytime, side-by-side free vs paid

import { CtaButton } from "./CtaButton";

interface PricingSectionProps {
  freeProfileUrl: string;
  founderBundleUrl: string;
}

const FREE_TICKS = [
  "Business name, location and services",
  "Contact button",
  "AI-readable structure",
  "ABN checked — ABN Verified where applicable",
  "Public business card link",
];

const PAID_TICKS = [
  "Everything in AI Business Card",
  "Premium AI-style business page",
  "ABN-backed TrustBadge",
  "Services, about, FAQs and contact form",
  "Call, email and quote enquiry tracking",
  "Weekly enquiry summary",
  "Cancel anytime — no lock-in",
];

function FreeCardPreview() {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-cyan-300/15 bg-[#07162f]">
      <div className="border-b border-white/8 bg-gradient-to-r from-cyan-400/10 to-transparent px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">AI Business Card</p>
      </div>
      <div className="space-y-2.5 p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl border border-white/12 bg-white/10" />
          <div className="space-y-1.5">
            <div className="h-2.5 w-32 rounded-full bg-white/25" />
            <div className="h-2 w-20 rounded-full bg-white/12" />
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10" />
        <div className="h-2 w-3/4 rounded-full bg-white/10" />
        <div className="mt-1 flex gap-2">
          <div className="h-8 flex-1 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300" />
          <div className="h-8 flex-1 rounded-xl border border-white/15 bg-white/8" />
        </div>
      </div>
    </div>
  );
}

function PaidPagePreview() {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-emerald-300/25 bg-[#04120f] shadow-[0_0_40px_rgb(16_185_129/0.15)]">
      <div className="relative border-b border-emerald-300/15 bg-gradient-to-r from-emerald-400/15 via-cyan-400/10 to-transparent px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">AI-Ready Business Page</p>
        <div className="ai-shield-pulse-paid absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl border border-emerald-300/40 bg-emerald-300/12 text-emerald-100">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
            <path d="M12 3l7 3v5c0 4.6-2.9 8.8-7 10-4.1-1.2-7-5.4-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8.5 12.2l2.1 2.1 4.9-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="space-y-2.5 p-4">
        <div className="h-3 w-40 rounded-full bg-white/25" />
        <div className="grid grid-cols-3 gap-2">
          {["Service", "Service", "Service"].map((label, i) => (
            <div key={i} className="rounded-xl border border-emerald-300/15 bg-white/7 p-2">
              <p className="text-center text-[9px] font-black text-emerald-100">{label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-emerald-300/15 bg-white/7 p-2">
          <p className="text-center text-[9px] font-black text-emerald-100">Enquiry form</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["Calls", "Quotes", "Sources"].map((label) => (
            <div key={label} className="rounded-xl border border-emerald-300/15 bg-white/7 p-2">
              <p className="text-center text-[9px] font-black text-emerald-100">{label} ✓</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PricingSection({ freeProfileUrl, founderBundleUrl }: PricingSectionProps) {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">Pricing</p>
        <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl">
          Choose how AI-ready you want your business to be.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
          Start free with a clean AI Business Card. Upgrade when you want the full page, ABN-backed trust, and
          enquiry tracking.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Free — AI Business Card */}
        <div className="ai-glass-soft rounded-[2rem] p-6 sm:p-8">
          <FreeCardPreview />
          <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-cyan-200">AI Business Card</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-black text-white">Free</span>
          </div>
          <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-slate-300">
            {FREE_TICKS.map((tick) => (
              <li key={tick} className="flex gap-2.5">
                <span className="mt-0.5 font-black text-cyan-300">✓</span>
                {tick}
              </li>
            ))}
          </ul>
          <CtaButton
            href={freeProfileUrl}
            eventName="credentials_ai_click_pricing_free"
            label="Claim Free Card"
            dataCta="pricing-free"
            variant="secondary"
            className="mt-6 w-full"
          >
            Claim Free Card
          </CtaButton>
        </div>

        {/* Paid — AI-Ready Business Page */}
        <div className="ai-glass-paid rounded-[2rem] p-6 sm:p-8">
          <PaidPagePreview />
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-200">AI-Ready Business Page</p>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-100">
              Premium
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
            <span className="text-4xl font-black text-white">$49/month</span>
            <span className="pb-1 text-lg font-bold text-slate-300">or $12.90/week</span>
          </div>
          <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-slate-200">
            {PAID_TICKS.map((tick) => (
              <li key={tick} className="flex gap-2.5">
                <span className="mt-0.5 font-black text-emerald-300">✓</span>
                {tick}
              </li>
            ))}
          </ul>
          <CtaButton
            href={founderBundleUrl}
            eventName="credentials_ai_click_pricing_paid"
            label="Start AI-Ready Page"
            dataCta="pricing-paid"
            className="mt-6 w-full"
          >
            Start AI-Ready Page
          </CtaButton>
        </div>
      </div>

      <p className="mt-8 text-center text-sm font-semibold text-slate-400">
        Same product. Choose weekly or monthly. Cancel anytime.
      </p>
    </section>
  );
}
