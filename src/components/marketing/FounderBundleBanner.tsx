import { Section } from "./Section";
import { CtaButton } from "./CtaButton";

export function FounderBundleBanner({ founderBundleUrl }: { founderBundleUrl: string }) {
  return (
    <Section className="border-y border-slate-200">
      <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 sm:p-8">
        <p className="text-sm font-black uppercase tracking-wide text-amber-700">Founder note</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#0F1B2D] sm:text-4xl">Why the first 50 get it for $49.</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-700">
              Simple trade. Credentials AI is new, and I need real proof stories more than margin right now. So the
              first 50 businesses get the full Verified Lead Engine at $49/mo with direct access to me — the founder —
              at no charge. Call, text, or grab a coffee if you&apos;re Gold Coast local. Zero obligation, no appointment
              needed. Most people set it up themselves in 4 minutes.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              In return, I get honest feedback and real outcomes to improve the product. When spot 50 is gone,
              standard pricing applies.
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-600">
              No fake countdowns. No “extended by popular demand.” Fifty means fifty.
            </p>
            <p className="mt-5 text-sm font-semibold text-slate-700">— Ike, Founder, Credentials AI</p>
          </div>

          <div className="rounded-2xl border border-amber-300 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-[#0F1B2D]">Founding 50 includes</h3>
            <ul className="mt-5 space-y-3 text-sm font-semibold leading-relaxed text-slate-700">
              <li>✓ Verified Lead Engine at $49/mo</li>
              <li>✓ Direct founder access, yours no charge (normally $149)</li>
              <li>✓ Call, text, or coffee (Gold Coast local) — or self-serve</li>
              <li>✓ Price lock while subscribed</li>
            </ul>
            <CtaButton
              href={founderBundleUrl}
              eventName="credentials_ai_click_founder_banner"
              label="Claim a Founding 50 spot"
              dataCta="founder-note-primary"
              variant="amber"
              className="mt-6 w-full"
            >
              Claim a Founding 50 spot
            </CtaButton>
          </div>
        </div>
      </div>
    </Section>
  );
}
