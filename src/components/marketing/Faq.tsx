import { CtaButton } from "./CtaButton";
import { Section } from "./Section";

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
    a: "Keep your website. Credentials AI adds a structured profile, verification layer, and enquiry tracking/proof that most websites don't provide out of the box.",
  },
  {
    q: "What does 'verified' actually mean?",
    a: "It means we check details like ABN/business registration, licence and insurance where available, then publish what was checked and when. We are independent, not a government body.",
  },
  {
    q: "Do I need to be technical?",
    a: "No. If you can fill in a form, you're good. Founding Members get founder-assisted setup as part of onboarding.",
  },
  {
    q: "What if I already have Google Business Profile?",
    a: "Great — keep it. Google helps discovery. Credentials AI adds verification and enquiry proof reporting so you can measure this channel directly.",
  },
  {
    q: "Is this worth paying monthly for?",
    a: "If one genuine job comes through and closes, it usually covers the plan many times over. If it doesn't earn its keep, you can cancel.",
  },
];

export function Faq({ freeProfileUrl }: { freeProfileUrl: string }) {
  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">FAQ</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F1B2D] sm:text-4xl">
            Fair questions.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[#5B6472]">
            Straight answers before you spend a dollar.
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <summary className="cursor-pointer list-none text-base font-black text-[#0F1B2D]">
                <span className="inline-flex w-full items-center justify-between gap-4">
                  {faq.q}
                  <span className="text-xl text-blue-700 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[#5B6472]">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-14 rounded-[2rem] bg-[#0F1B2D] p-8 text-center text-white md:p-12">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Ten minutes now. Findable and verifiable after.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/70">
          Start free now. Add verification and proof reporting when you&apos;re ready to run the full lead engine.
          </p>
        <div className="mt-7">
          <CtaButton
            href={freeProfileUrl}
            eventName="credentials_ai_click_final_cta"
            label="Claim your free profile"
            dataCta="final-primary"
            target="_blank"
            rel="noopener noreferrer"
            variant="dark"
          >
            Claim your free profile
          </CtaButton>
        </div>
        <p className="mt-4 text-sm font-semibold text-white/60">Free forever plan · No card · Founding 50 open</p>
      </div>
    </Section>
  );
}
