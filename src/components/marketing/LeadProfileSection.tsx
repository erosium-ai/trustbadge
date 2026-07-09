/* 🔑 Keywords: lead profile section, sample profile CTA, homepage conversion section, /b/sample-plumbing-co */

import { Section } from "./Section";
import { CtaButton } from "./CtaButton";

interface LeadProfileSectionProps {
  sampleProfileUrl: string;
}

export function LeadProfileSection({ sampleProfileUrl }: LeadProfileSectionProps) {
  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">The lead profile</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F1B2D] sm:text-4xl">
            A profile built to be contacted, not just found.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[#5B6472]">
            Your Credentials AI profile is a conversion page: call now, request quote, services and suburbs laid out
            clearly, with trust details customers can verify before they ring.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#5B6472]">
            It doesn&apos;t replace your website or Google Business Profile. It sits beside them as the structured,
            verified, measurable layer.
          </p>
          <div className="mt-7">
            <CtaButton
              href={sampleProfileUrl}
              eventName="credentials_ai_click_lead_profile_sample"
              label="See sample profile"
              dataCta="lead-profile-sample"
            >
              See a sample profile
            </CtaButton>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/8">
          <div className="rounded-3xl border border-slate-200 bg-[#F7F6F3] p-4 sm:p-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Verified</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Gold Coast plumbing</span>
              </div>
              <h3 className="mt-3 text-xl font-black text-[#0F1B2D]">Gold Coast Flow Plumbing</h3>
              <p className="mt-2 text-sm text-slate-600">
                Fast plumbing fixes across Burleigh, Varsity Lakes, Mermaid Beach and nearby suburbs.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Call now</button>
                <button className="rounded-lg bg-[#F97316] px-3 py-2 text-xs font-semibold text-white">Request quote</button>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                "Verified tick",
                "Clear services",
                "Suburbs served",
                "Tap-to-call and quote",
                "Trust details customers can check",
              ].map((item) => (
                <div key={item} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">Sample profile layout preview.</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
