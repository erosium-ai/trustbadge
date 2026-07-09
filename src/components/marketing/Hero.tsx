import { CtaButton } from "./CtaButton";

interface HeroProps {
  freeProfileUrl: string;
  sampleProfileUrl: string;
}

export function Hero({ freeProfileUrl, sampleProfileUrl }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#F7F6F3]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.16),transparent_70%)]" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.02fr_0.98fr] md:items-center md:pb-24 md:pt-20">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-orange-700 shadow-sm">
            AI visibility. Verified trust. Measured enquiries.
          </div>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-black tracking-tight text-[#0F1B2D] sm:text-5xl lg:text-6xl">
            Get found. Get trusted. Get enquiries — and see the proof.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-[#5B6472] sm:text-xl">
            Credentials AI gives your business a profile AI tools and search engines can actually read, credentials
            customers can verify, and a count of every call, email and quote request that comes through it. No
            guaranteed rankings, no mystery marketing — a clearer, more trusted presence, measured.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaButton
              href={freeProfileUrl}
              eventName="credentials_ai_click_free_profile"
              label="Claim your free profile"
              dataCta="hero-primary"
              className="w-full sm:w-auto"
            >
              Claim your free profile
            </CtaButton>
            <CtaButton
              href={sampleProfileUrl}
              eventName="credentials_ai_click_sample_profile"
              label="See a sample profile"
              dataCta="hero-secondary"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              See a sample profile
            </CtaButton>
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Free plan, no card needed · Founding 50 pricing now open · Built in Australia for local businesses
          </p>
        </div>

        <div className="relative z-10">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10">
            <div className="rounded-3xl border border-slate-200 bg-[#F7F6F3] p-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Sample profile</p>
                    <p className="mt-1 text-lg font-black text-[#0F1B2D]">Gold Coast Flow Plumbing</p>
                    <p className="mt-1 text-xs text-slate-600">Burleigh · Varsity Lakes · Mermaid Beach</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Verified</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Call</button>
                  <button className="rounded-lg bg-[#F97316] px-3 py-2 text-xs font-semibold text-white">Request quote</button>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                New quote request — 2 min ago · Source: Google
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-[#0F1B2D] p-3 text-xs text-white">
                <p className="font-bold uppercase tracking-wide text-blue-200">Weekly proof · sample data</p>
                <p className="mt-2 font-semibold">This week: 9 calls · 4 quote requests · Top source: Google</p>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] font-medium uppercase tracking-wide text-slate-500">Sample data</p>
          </div>
        </div>
      </div>
    </section>
  );
}
