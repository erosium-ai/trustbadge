import { CtaButton } from "./CtaButton";
import { Section } from "./Section";

interface PricingSectionProps {
  freeProfileUrl: string;
  founderBundleUrl: string;
}

export function PricingSection({ freeProfileUrl, founderBundleUrl }: PricingSectionProps) {
  return (
    <Section id="pricing">
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Pricing</p>
        <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-tight text-[#0F1B2D] sm:text-4xl">
          One decision. Start free, or run the full engine.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[#5B6472]">
          No lock-in contracts. Direct founder access included for Founding Members. Cancel anytime.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-blue-700">Free AI Profile</p>
          <div className="mt-3 flex items-end gap-1">
            <span className="text-4xl font-black text-[#0F1B2D]">$0</span>
            <span className="pb-1 text-sm font-semibold text-slate-500">forever</span>
          </div>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#5B6472]">
            <li>✓ AI-readable business profile</li>
            <li>✓ Live public page (/b/your-business)</li>
            <li>✓ Services, suburbs, hours and contact details</li>
            <li>✓ Quote requests forwarded to your email</li>
          </ul>
          <p className="mt-5 text-sm font-semibold text-slate-700">
            Start here if you want your business clear and contactable online.
          </p>
          <CtaButton
            href={freeProfileUrl}
            eventName="credentials_ai_click_pricing_free"
            label="Start free"
            dataCta="pricing-free"
            variant="secondary"
            className="mt-6 w-full"
          >
            Start free
          </CtaButton>
        </div>

        <div className="rounded-2xl border border-[#F97316] bg-white p-6 shadow-xl shadow-orange-900/10 ring-2 ring-[#F97316]">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-[#D97706]">Founding Member — Verified Lead Engine</p>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-orange-800">
              First 50
            </span>
          </div>
          <div className="mt-3 flex items-end gap-1">
            <span className="text-4xl font-black text-[#0F1B2D]">$49</span>
            <span className="pb-1 text-sm font-semibold text-slate-500">/mo</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">Founder access included · price locked while subscribed</p>

          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#5B6472]">
            <li>✓ Everything in Free</li>
            <li>✓ TrustBadge verification (up to 3 credentials)</li>
            <li>✓ Public verification page customers can check</li>
            <li>✓ Tracked calls, email clicks and quote requests</li>
            <li>✓ Source tracking + instant lead alerts</li>
            <li>✓ Lead status tracking (new → contacted → quoted → won)</li>
            <li>✓ Weekly proof summary + CSV export</li>
            <li>✓ Direct founder access (call, text, or coffee if Gold Coast local) — normally $149, yours free</li>
          </ul>
          <p className="mt-5 text-sm font-semibold text-slate-700">
            This is the full verified lead engine. One plan, no confusion.
          </p>
          <CtaButton
            href={founderBundleUrl}
            eventName="credentials_ai_click_pricing_founder"
            label="Claim a Founding 50 spot"
            dataCta="pricing-founder"
            className="mt-6 w-full"
          >
            Claim a Founding 50 spot
          </CtaButton>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700">
        <p className="font-semibold text-slate-900">
          After the Founding 50: $99/mo, with founder access charged separately. Founding Members keep $49/mo for as
          long as they stay subscribed.
        </p>
        <p className="mt-2 text-slate-600">
          Extra verified credentials +$5/mo each. Multiple locations? Talk to us. Verification is independent — we
          check credentials against official sources where available; we are not a government body and a badge is not
          an endorsement.
        </p>
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          Rolling out next to Founding Members: QR kit, embeddable badge, owner dashboard improvements.
        </p>
      </div>
    </Section>
  );
}
