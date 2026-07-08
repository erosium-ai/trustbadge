import { CtaButton } from "./CtaButton";
import { Section } from "./Section";

export const faqs = [
  {
    q: "Will this get me to #1 on Google or ChatGPT?",
    a: "No. Nobody honest can guarantee rankings in Google or AI tools. Credentials AI helps by making your business details clearer, structured and easier to verify.",
  },
  {
    q: "Do I need a website already?",
    a: "No. You can start with a free AI-readable profile. If you already have a website, you can link to your profile and TrustBadge from it.",
  },
  {
    q: "What credentials can you verify?",
    a: "Business registration, ABN details, licences, insurance, safety and compliance documents, depending on what your business has and what can be checked.",
  },
  {
    q: "How does verification actually work?",
    a: "You submit your credentials, we review them, and approved details appear on a public verification page your customers can click and check.",
  },
  {
    q: "I'm not technical. How much work is this?",
    a: "The free profile is built from a form. If you can fill in your services, locations, phone and website, you can use it.",
  },
  {
    q: "What happens if I cancel?",
    a: "You can cancel paid features and keep the free profile. Paid verification and Pro features depend on the active plan.",
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
          Start with the free profile. Upgrade when you want richer AI presence and verified customer trust.
        </p>
        <div className="mt-7">
          <CtaButton
            href={freeProfileUrl}
            eventName="credentials_ai_click_final_cta"
            label="Claim your free AI profile"
            dataCta="final-primary"
            target="_blank"
            rel="noopener noreferrer"
            variant="dark"
          >
            Claim your free AI profile
          </CtaButton>
        </div>
        <p className="mt-4 text-sm font-semibold text-white/60">Free plan · No credit card · Built for Aussie local businesses</p>
      </div>
    </Section>
  );
}
