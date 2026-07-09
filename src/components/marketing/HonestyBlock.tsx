import { Section } from "./Section";

export function HonestyBlock() {
  return (
    <Section dark>
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-200">Straight answers</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          No guarantees we can't keep.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-white/70">
          We won&apos;t sell ranking promises or AI magic. We focus on what can be done honestly: clearer business details,
          verified trust, and measurable enquiries through your profile.
        </p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/8 p-6">
          <h3 className="text-xl font-black text-white">What we do</h3>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-white/78">
            <li>✓ Structure your business info so AI tools and search engines can read it.</li>
            <li>✓ Verify your credentials and publish customer-checkable trust pages.</li>
            <li>✓ Track calls, email clicks and quote requests that come through your profile.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/8 p-6">
          <h3 className="text-xl font-black text-white">What we don't do</h3>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-white/78">
            <li>✕ We don&apos;t guarantee leads — no honest company can.</li>
            <li>✕ We don&apos;t guarantee rankings or promise ChatGPT will recommend you.</li>
            <li>✕ We don&apos;t lock you into contracts to hide weak results.</li>
          </ul>
        </div>
      </div>
      <p className="mt-8 text-sm font-semibold text-white/70">
        If someone promises guaranteed AI leads, hold onto your wallet. — Ike, founder
      </p>
    </Section>
  );
}
