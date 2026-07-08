import { CtaButton } from "./CtaButton";
import { Section } from "./Section";

interface PricingSectionProps {
  freeProfileUrl: string;
  founderBundleUrl: string;
  proPresenceUrl: string;
}

export function PricingSection({ freeProfileUrl, founderBundleUrl, proPresenceUrl }: PricingSectionProps) {
  return (
    <Section id="pricing">
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Pricing</p>
        <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-tight text-[#0F1B2D] sm:text-4xl">
          Simple pricing. Start free, upgrade when it's earning its keep.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[#5B6472]">No contracts. No lock-in. Cancel anytime.</p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-blue-700">Free AI Profile</p>
          <div className="mt-3 flex items-end gap-1">
            <span className="text-4xl font-black text-[#0F1B2D]">$0</span>
            <span className="pb-1 text-sm font-semibold text-slate-500">forever</span>
          </div>
          <p className="mt-4 text-lg font-black text-[#0F1B2D]">Get on the map.</p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#5B6472]">
            <li>✓ AI-readable business profile</li>
            <li>✓ Services, areas and hours structured for AI tools</li>
            <li>✓ Hosted profile page you can link anywhere</li>
          </ul>
          <p className="mt-5 text-sm font-semibold text-slate-700">Just want to exist properly online? Start here.</p>
          <CtaButton
            href={freeProfileUrl}
            eventName="credentials_ai_click_pricing_free"
            label="Claim your free profile"
            dataCta="pricing-free"
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            className="mt-6 w-full"
          >
            Claim your free profile
          </CtaButton>
        </div>

        <div className="order-first rounded-2xl border border-blue-500 bg-white p-6 shadow-xl shadow-blue-900/10 ring-2 ring-blue-500 lg:order-none lg:-mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-[#D97706]">Founder Bundle</p>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-800">Founder offer</span>
          </div>
          <div className="mt-3 flex items-end gap-1">
            <span className="text-4xl font-black text-[#0F1B2D]">$39</span>
            <span className="pb-1 text-sm font-semibold text-slate-500">/mo</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500"><span className="line-through">$48/mo separately</span> · locked while subscribed</p>
          <p className="mt-4 text-lg font-black text-[#0F1B2D]">Everything. One founding price.</p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#5B6472]">
            <li>✓ Everything in Free</li>
            <li>✓ Pro AI Presence ($19 value)</li>
            <li>✓ TrustBadge Verification ($29 value)</li>
            <li>✓ Direct line to the founder</li>
            <li>✓ Price locked while subscribed</li>
          </ul>
          <p className="mt-5 text-sm font-semibold text-slate-700">Want to be findable and provable? This is the one.</p>
          <CtaButton
            href={founderBundleUrl}
            eventName="credentials_ai_click_pricing_founder"
            label="Claim a founding spot"
            dataCta="pricing-founder"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full"
          >
            Claim a founding spot
          </CtaButton>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-blue-700">Build your own</p>
          <div className="mt-3 flex items-end gap-1">
            <span className="text-4xl font-black text-[#0F1B2D]">From $19</span>
            <span className="pb-1 text-sm font-semibold text-slate-500">/mo</span>
          </div>
          <p className="mt-4 text-lg font-black text-[#0F1B2D]">Prefer one piece at a time?</p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#5B6472]">
            <li>✓ Pro AI Presence — $19/mo</li>
            <li>✓ TrustBadge Verification — from $29/mo</li>
            <li>✓ Upgrade from free when you're ready</li>
          </ul>
          <p className="mt-5 text-sm font-semibold text-slate-700">Only need one thing? No worries.</p>
          <CtaButton
            href={proPresenceUrl}
            eventName="credentials_ai_click_pricing_build_your_own"
            label="Compare options"
            dataCta="pricing-build-your-own"
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            className="mt-6 w-full"
          >
            Compare options
          </CtaButton>
        </div>
      </div>
      <p className="mt-8 text-center text-sm font-semibold text-slate-600">
        Not sure? Start free. You can upgrade whenever you're ready.
      </p>
    </Section>
  );
}
