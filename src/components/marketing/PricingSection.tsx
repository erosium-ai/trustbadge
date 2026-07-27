// 🔑 Keywords: Credentials AI V2 pricing comparison, AI Business Card free, AI-Ready Business Page paid, $12.90/week price anchor, $49/month secondary, money moment band, asymmetric pricing grid, most popular badge, ghost free card, side-by-side free vs paid, no Founding 50

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
  "QR code for magnets, flyers, invoices and vehicles",
  "Weekly enquiry summary",
  "Cancel anytime — no lock-in",
];

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
    <section id="pricing" className="ai-money-band relative isolate mt-6 border-y border-white/8 py-14 sm:py-20">
      {/* Top/bottom hairlines make the band read as a distinct place on the page. */}
      <div className="ai-money-band-edge pointer-events-none absolute inset-x-0 top-0 h-px" />
      <div className="ai-money-band-edge pointer-events-none absolute inset-x-0 bottom-0 h-px" />
      {/* Halo bleeding past the band edges — catches the eye mid-scroll. */}
      <div className="ai-money-band-halo pointer-events-none absolute inset-x-0 -top-16 h-32" aria-hidden />
      <div className="ai-money-band-halo pointer-events-none absolute inset-x-0 -bottom-16 h-32" aria-hidden />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-200 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Pricing
          </span>
          <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            Choose how AI-ready you want your business to be.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
            Start free with a clean AI Business Card. Upgrade when you want the full page, ABN-backed trust, and
            enquiry tracking.
          </p>
        </div>

        {/* Asymmetric grid: paid side is wider so the eye lands on it first. */}
        <div className="mt-12 grid items-start gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8">
          {/* ── Free — AI Business Card (ghost / secondary) ──────────────────── */}
          <div className="ai-glass-ghost rounded-[2rem] p-6 sm:p-7 lg:mt-10">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">AI Business Card</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-black text-slate-200">Free</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-500">Good place to start. No card needed.</p>
            <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-slate-400">
              {FREE_TICKS.map((tick) => (
                <li key={tick} className="flex gap-2.5">
                  <span className="mt-0.5 font-black text-slate-500">✓</span>
                  {tick}
                </li>
              ))}
            </ul>
            <CtaButton
              href={freeProfileUrl}
              eventName="credentials_ai_click_pricing_free"
              label="Claim Free Card"
              dataCta="pricing-free"
              variant="ghost"
              className="mt-6 w-full"
            >
              Claim Free Card
            </CtaButton>

            {/* Quiet upgrade nudge — fills the height gap and points at the paid
                card without pressure language. */}
            <p className="mt-6 border-t border-white/8 pt-5 text-sm leading-relaxed text-slate-500">
              Want the full page, ABN-backed TrustBadge and tracked enquiries? That&apos;s the AI-Ready Business Page
              — you can upgrade any time.
            </p>
          </div>

          {/* ── Paid — AI-Ready Business Page (hero of the section) ──────────── */}
          <div className="relative">
            {/* Badge overhangs the card's top edge. */}
            <div className="absolute -top-3.5 left-6 z-10 sm:left-8">
              <span className="ai-popular-badge inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-950">
                Most popular
              </span>
            </div>

            <div className="ai-glass-paid-strong rounded-[2rem] p-6 pt-9 sm:p-9 sm:pt-11">
              <PaidPagePreview />

              <div className="mt-7 flex flex-wrap items-center gap-2">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-200">AI-Ready Business Page</p>
              </div>

              {/* Price anchor flipped: weekly leads, monthly demoted. */}
              <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="text-5xl font-black tracking-tight text-white sm:text-6xl">$12.90</span>
                <span className="pb-1.5 text-xl font-black text-emerald-200">/week</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-400">
                Billed as $49/month if you prefer. Same product, cancel anytime.
              </p>

              <ul className="mt-6 space-y-2.5 text-sm leading-relaxed text-slate-200">
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
                variant="paid"
                className="mt-7 w-full text-base"
              >
                Start AI-Ready Page
              </CtaButton>

              <p className="mt-4 text-center text-xs font-semibold text-slate-400">
                Live in about 15 minutes. No lock-in contract.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-sm font-semibold text-slate-400">
          Same product. Choose weekly or monthly. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
