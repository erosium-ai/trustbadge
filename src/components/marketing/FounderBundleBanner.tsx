import { Section } from "./Section";
import { CtaButton } from "./CtaButton";

export function FounderBundleBanner({ founderBundleUrl }: { founderBundleUrl: string }) {
  return (
    <Section dark className="border-y border-white/10">
      <div className="rounded-[2rem] border border-amber-400/30 bg-white/6 p-6 sm:p-8">
        <p className="text-sm font-black uppercase tracking-wide text-amber-300">Founding offer — first 100 businesses</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Get everything for $39 a month. Locked in while you stay.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/75">
              We're early, and we're not pretending otherwise. The first 100 businesses on Credentials AI get the full toolkit — the Pro AI profile and TrustBadge verification — for $39 a month instead of $48, with the price locked while you're subscribed.
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              Why so cheap? Because founding customers give us something money can't: real feedback from real Aussie businesses. You tell us what's confusing, what's missing, and what's worth paying for. We build it. That's the deal.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 text-[#0F1B2D]">
            <h3 className="text-xl font-black">Founding members get</h3>
            <ul className="mt-5 space-y-3 text-sm font-semibold leading-relaxed text-slate-700">
              <li>✓ Pro AI Presence + TrustBadge Verification</li>
              <li>✓ $39/mo, locked while subscribed</li>
              <li>✓ Direct email line to the founder</li>
              <li>✓ A say in what we build next</li>
            </ul>
            <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              No lock-in contract. No fake countdown timers. Founding pricing ends when 100 spots are filled.
            </div>
            <CtaButton
              href={founderBundleUrl}
              eventName="credentials_ai_click_founder_banner"
              label="Claim a founding spot — $39/mo"
              dataCta="founder-banner-primary"
              target="_blank"
              rel="noopener noreferrer"
              variant="amber"
              className="mt-6 w-full"
            >
              Claim a founding spot — $39/mo
            </CtaButton>
          </div>
        </div>
      </div>
    </Section>
  );
}
