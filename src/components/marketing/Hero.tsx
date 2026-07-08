import Link from "next/link";
import { CtaButton } from "./CtaButton";

interface HeroProps {
  freeProfileUrl: string;
}

export function Hero({ freeProfileUrl }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#F7F6F3]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(29,111,224,0.16),transparent_70%)]" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.02fr_0.98fr] md:items-center md:pb-24 md:pt-20">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-700 shadow-sm">
            AI-readable profiles + verified trust
          </div>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-black tracking-tight text-[#0F1B2D] sm:text-5xl lg:text-6xl">
            Customers are asking AI who to hire. Make sure it can find you.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-[#5B6472] sm:text-xl">
            Credentials AI gives your business a profile that search engines and AI assistants can actually read — plus trust signals your customers can verify. Free to start. Built for Aussie trades and local businesses.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaButton
              href={freeProfileUrl}
              eventName="credentials_ai_click_free_profile"
              label="Claim your free AI profile"
              dataCta="hero-primary"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              Claim your free AI profile
            </CtaButton>
            <Link
              href="#how-it-works"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-[#0F1B2D] transition-colors hover:bg-slate-50"
            >
              See how it works
            </Link>
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Free forever plan · No credit card · Set up in under 10 minutes
          </p>
        </div>

        <div className="relative z-10">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10">
            <div className="rounded-3xl bg-[#0F1B2D] p-4 text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <p className="text-xs font-semibold text-blue-200">AI assistant result</p>
                  <p className="text-sm font-bold">“Who’s a reliable plumber near Burleigh?”</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Example</span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-emerald-400/40 bg-white p-4 text-slate-900">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black">Gold Coast Flow Plumbing</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        Local plumbing services in Bundall, Burleigh and nearby suburbs. Business details are structured and easy to verify.
                      </p>
                    </div>
                    <div className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      Verified
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                    ✓ TrustBadge checked · ABN and uploaded credentials available
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
                  <p className="text-sm font-bold">Another local provider</p>
                  <p className="mt-1 text-xs">Website found, but business credentials and service details are unclear.</p>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-3xl border border-slate-200 bg-[#F7F6F3] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#0E9F6E]">Clickable customer trust</p>
              <div className="mt-3 rounded-2xl border border-emerald-200 bg-white p-4">
                <p className="text-lg font-black text-[#0F1B2D]">Verified by Credentials AI</p>
                <p className="mt-1 text-sm text-slate-600">Licence · Insurance · Business registration</p>
                <p className="mt-3 text-xs font-semibold text-[#0E9F6E]">Customers can click to check the verification details.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
