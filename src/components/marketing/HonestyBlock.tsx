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
          AI search is moving fast. The honest play is to make your business clearer, more structured and easier to verify — not pretend anyone can control every search result.
        </p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/8 p-6">
          <h3 className="text-xl font-black text-white">What we do</h3>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-white/78">
            <li>✓ Structure your business info so AI tools and search engines can read it.</li>
            <li>✓ Verify your credentials and business details.</li>
            <li>✓ Give you trust details customers can click and check.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/8 p-6">
          <h3 className="text-xl font-black text-white">What we don't do</h3>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-white/78">
            <li>✕ We don't guarantee rankings — nobody honestly can.</li>
            <li>✕ We don't promise every AI tool will show your business.</li>
            <li>✕ We don't sell fake urgency or magic SEO buttons.</li>
          </ul>
        </div>
      </div>
      <p className="mt-8 text-sm font-semibold text-white/70">
        — Ike, founder, Credentials AI
      </p>
    </Section>
  );
}
