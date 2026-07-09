import { Section } from "./Section";
import { CtaButton } from "./CtaButton";

const steps = [
  {
    step: "01",
    title: "Claim your free profile",
    body: "Tell us your services, suburbs, hours and contact details. About 10 minutes — if you can fill in a form, you're qualified.",
  },
  {
    step: "02",
    title: "Get verified",
    body: "Send your ABN, licence and insurance details. We check what we can against official sources and publish your verification page.",
  },
  {
    step: "03",
    title: "See every enquiry — with receipts",
    body: "Calls, email clicks and quote requests through your profile are counted, tracked by source, and summarised weekly.",
  },
];

export function HowItWorks({ freeProfileUrl }: { freeProfileUrl: string }) {
  return (
    <Section id="how-it-works" className="border-y border-slate-200">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">How it works</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F1B2D] sm:text-4xl">
            Three steps. No tech skills needed.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[#5B6472]">
            You don&apos;t need to be technical. The setup is founder-guided and built for local businesses.
          </p>
          <div className="mt-7">
            <CtaButton
              href={freeProfileUrl}
              eventName="credentials_ai_click_how_it_works"
              label="Start step one free"
              dataCta="how-it-works-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start step one — it's free
            </CtaButton>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
          {steps.map((item) => (
            <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F1B2D] text-sm font-black text-white">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-lg font-black text-[#0F1B2D]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5B6472]">{item.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
