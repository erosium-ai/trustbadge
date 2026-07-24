// 🔑 Keywords: Credentials AI V2 FAQ, ABN-only verification wording, dark theme

import { CtaButton } from "./CtaButton";

export const faqs = [
  {
    q: "Will this guarantee me leads?",
    a: "No — and be wary of anyone who says yes. What we do is make your business easier to understand, easier to trust, and track enquiries through your profile so you can see what happened.",
  },
  {
    q: "Will this make ChatGPT recommend my business?",
    a: "No one can control that. We make your business details clearer, structured and verifiable so AI tools and search engines have accurate information to read.",
  },
  {
    q: "Why not just use my website?",
    a: "Keep your website. Credentials AI adds a structured, AI-readable profile, an ABN-backed trust layer, and enquiry tracking that most websites don't provide out of the box.",
  },
  {
    q: "What does 'ABN Verified' actually mean?",
    a: "It means we check the business ABN and details against the Australian Business Register, then publish what was checked and when. We are independent — a badge is not a government endorsement.",
  },
  {
    q: "Do I need to be technical?",
    a: "No. If you can fill in a form, you're good. Claim your free AI Business Card in minutes — no card required.",
  },
  {
    q: "What if I already have Google Business Profile?",
    a: "Great — keep it. Google helps discovery. Credentials AI adds the verified, AI-readable layer and enquiry proof reporting so you can measure this channel directly.",
  },
  {
    q: "Is the paid page worth it?",
    a: "If one genuine job comes through and closes, it usually covers the plan many times over. It's $49/month or $12.90/week — same product, cancel anytime. If it doesn't earn its keep, you can leave cleanly.",
  },
];

export function Faq({ freeProfileUrl }: { freeProfileUrl: string }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">FAQ</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Straight answers, no theatre.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Start with a free AI Business Card. Upgrade to the full AI-Ready Business Page when you want the
            premium design, ABN-backed trust and enquiry tracking.
          </p>
          <CtaButton
            href={freeProfileUrl}
            eventName="credentials_ai_click_faq_free"
            label="Claim Your Free Profile"
            dataCta="faq-free"
            className="mt-6"
          >
            Claim Your Free Profile
          </CtaButton>
          <p className="mt-4 text-sm font-semibold text-slate-500">Free plan · No card · Cancel anytime on paid</p>

          <div className="ai-glass-soft mt-8 rounded-[1.5rem] p-5 sm:p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
              What AI can read
            </p>
            <h3 className="mt-2 text-lg font-black text-white">
              Your profile, in a format AI tools actually understand.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Behind the clean design is a structured data layer. When ChatGPT,
              Google, Claude or Siri look at your business, this is what they
              can pick up:
            </p>
            <ul className="mt-4 space-y-2">
              {[
                "Business name, suburb and service areas",
                "Services in structured, machine-readable data",
                "ABN-checked trust status",
                "Call, email and quote actions",
                "A plain-language summary of what you do",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                  <span className="h-1.5 w-1.5 flex-none rounded-full bg-cyan-300" />
                  {item}
                </li>
              ))}
            </ul>
            <pre className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/72 p-4 text-[11px] leading-relaxed text-cyan-100/90">
{`{
  "@type": "LocalBusiness",
  "areaServed": "Gold Coast",
  "hasOfferCatalog": "Services",
  "identifier": "ABN checked"
}`}
            </pre>
            <p className="mt-3 text-xs font-semibold text-slate-500">
              This is the layer AI tools can actually read — built for you automatically.
            </p>
          </div>
        </div>
        <dl className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="ai-glass-soft rounded-[1.5rem] p-5">
              <dt className="text-base font-black text-white">{faq.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-slate-300">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
