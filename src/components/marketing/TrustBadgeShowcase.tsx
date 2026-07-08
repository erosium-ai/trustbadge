import Link from "next/link";
import { Section } from "./Section";
import { CtaButton } from "./CtaButton";

interface TrustBadgeShowcaseProps {
  freeProfileUrl: string;
}

export function TrustBadgeShowcase({ freeProfileUrl }: TrustBadgeShowcaseProps) {
  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#0E9F6E]">TrustBadge</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F1B2D] sm:text-4xl">
            Proof beats promises.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[#5B6472]">
            The Credentials AI TrustBadge shows customers your credentials have actually been checked — and lets them verify it themselves in one click.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#5B6472]">
            Every badge links to a verification page showing what's been verified — licence, insurance, business registration — and when. No fine print. No “trust us.” Customers see the proof.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <CtaButton
              href={freeProfileUrl}
              eventName="credentials_ai_click_trustbadge_showcase"
              label="Claim your free AI profile"
              dataCta="trustbadge-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Claim your free AI profile
            </CtaButton>
            <Link
              href="/trust-badge-for-business"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-[#0F1B2D] transition-colors hover:bg-slate-50"
            >
              See how TrustBadge works
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/8">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-[#F7F6F3]">
            <div className="bg-[#0F1B2D] px-5 py-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Example local business site</p>
              <h3 className="mt-1 text-xl font-black">Coastal Spark Electrical</h3>
              <p className="mt-1 text-sm text-white/70">Residential and commercial electrical work · Gold Coast</p>
            </div>
            <div className="p-5">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-[#0F1B2D]">Need a licensed electrician?</p>
                    <p className="mt-1 text-sm text-slate-600">Fast quotes, tidy work, verified credentials.</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Verified by</p>
                    <p className="mt-1 text-lg font-black text-emerald-800">Credentials AI</p>
                    <p className="mt-1 text-xs font-semibold text-emerald-700">Click to verify proof →</p>
                  </div>
                </div>
              </div>
              <div className="mx-auto my-5 h-10 w-px bg-slate-300" />
              <div className="rounded-2xl border border-emerald-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Live verification page</p>
                <h4 className="mt-2 text-xl font-black text-[#0F1B2D]">Coastal Spark Electrical</h4>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {['ABN checked', 'Licence uploaded', 'Insurance checked'].map((item) => (
                    <div key={item} className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">✓ {item}</div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-500">Example only. Real pages show the specific proof submitted and review status.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
