// 🔑 Keywords: Credentials AI homepage closing CTA, bottom of page paid button, final conversion band

import { CtaButton } from "./CtaButton";
import { getPaidProfileUrl, getFreeProfileUrl, getSampleProfileUrl } from "./urls";

export function ClosingCta() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20">
      <div className="ai-glass-soft relative overflow-hidden rounded-[2rem] p-6 text-center sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-cyan-400/12 blur-3xl"
        />
        <p className="relative text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
          Ready when you are
        </p>
        <h2 className="relative mx-auto mt-3 max-w-2xl text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
          Make your business easier for AI and customers to understand.
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-slate-300">
          ABN/business-registration trust wording with source/date, tracked
          calls and quote enquiries, and a page built for AI tools to read.
        </p>
        <div className="relative mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CtaButton
            href={getPaidProfileUrl("homepage_closing_cta")}
            eventName="credentials_ai_click_closing_paid"
            label="Get the AI-Ready Business Page"
            dataCta="closing-paid"
            variant="paid"
            className="w-full sm:w-auto"
          >
            Get the AI-Ready Business Page — $12.90/week
          </CtaButton>
          <CtaButton
            href={getSampleProfileUrl()}
            eventName="credentials_ai_click_closing_demo"
            label="See the paid page demo"
            dataCta="closing-demo"
            variant="demo"
            className="w-full sm:w-auto"
          >
            ▶ See the paid page demo
          </CtaButton>
          <CtaButton
            href={getFreeProfileUrl("homepage_closing_free")}
            eventName="credentials_ai_click_closing_free"
            label="Start with the free AI Business Card"
            dataCta="closing-free"
            variant="ghost"
            className="w-full sm:w-auto"
          >
            Or start free — no card
          </CtaButton>
        </div>
        <p className="relative mt-4 text-sm font-semibold text-slate-500">
          Cancel future renewals anytime · Built in Australia 🇦🇺
        </p>
      </div>
    </section>
  );
}
