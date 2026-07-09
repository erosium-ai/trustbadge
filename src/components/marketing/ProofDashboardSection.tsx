/* 🔑 Keywords: proof dashboard section, weekly proof summary preview, sample lead feed, homepage proof block */

import { Section } from "./Section";

export function ProofDashboardSection() {
  return (
    <Section className="border-y border-slate-200">
      <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">The proof dashboard</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F1B2D] sm:text-4xl">
            No more guessing whether it&apos;s working.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[#5B6472]">
            Every call tap, email click and quote request through your profile is logged with source and timestamp.
            Track leads from new to won, and get a simple weekly summary with export.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#5B6472]">
            Straight up: this tracks what happens through your Credentials AI profile. It won&apos;t claim word-of-mouth
            jobs or off-platform enquiries.
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-[#0F1B2D] p-5 text-white shadow-xl shadow-slate-900/20">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-200">Weekly proof summary · sample data</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-[11px] uppercase tracking-wide text-white/70">Calls</p>
                <p className="mt-1 text-2xl font-black">9</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-[11px] uppercase tracking-wide text-white/70">Quotes</p>
                <p className="mt-1 text-2xl font-black">4</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-[11px] uppercase tracking-wide text-white/70">Top source</p>
                <p className="mt-1 text-sm font-black">Google</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/15 bg-white p-4 text-slate-900">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Lead feed · sample data</p>
            <ul className="mt-3 space-y-2 text-xs">
              <li className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>quote_form · Burleigh bathroom leak</span>
                <span className="font-semibold text-slate-500">new</span>
              </li>
              <li className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>call_click · emergency hot water</span>
                <span className="font-semibold text-blue-600">contacted</span>
              </li>
              <li className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>email_click · quote follow-up</span>
                <span className="font-semibold text-emerald-700">won</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
