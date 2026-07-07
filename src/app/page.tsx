import Link from "next/link";
import { BADGE_FEATURE_NAME, BRAND_NAME, getSchemaPageUrl } from "@/lib/brand";

const TRUST_POINTS = [
  "Licences and registrations",
  "Insurance and compliance docs",
  "First aid and safety credentials",
];

function withTracking(baseUrl: string, params: Record<string, string>): string {
  try {
    const url = new URL(baseUrl);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export default function HomePage() {
  const schemaPageUrl = getSchemaPageUrl();
  const freeProfileUrl = withTracking(schemaPageUrl, {
    source: "credentialsai",
    campaign: "free_ai_profile_card",
    utm_source: "credentialsai",
    utm_medium: "website_card",
    utm_campaign: "free_ai_profile_card",
    utm_content: "landing_funnel",
  });
  const proSignupUrl = withTracking(schemaPageUrl, {
    intent: "pro",
    source: "credentialsai",
    campaign: "pro_ai_presence_card",
    utm_source: "credentialsai",
    utm_medium: "website_card",
    utm_campaign: "pro_ai_presence_card",
    utm_content: "landing_funnel",
  });
  const founderOfferUrl = withTracking(schemaPageUrl, {
    intent: "founder_bundle",
    source: "credentialsai",
    campaign: "founder_offer_first_100",
    utm_source: "credentialsai",
    utm_medium: "website_card",
    utm_campaign: "founder_offer_first_100",
    utm_content: "landing_funnel",
  });
  const trustBadgeStarterUrl = `/auth/register?${new URLSearchParams({
    intent: "trustbadge",
    source: "credentialsai",
    campaign: "trustbadge_starter_card",
    utm_source: "credentialsai",
    utm_medium: "website_card",
    utm_campaign: "trustbadge_starter_card",
    utm_content: "landing_funnel",
  }).toString()}`;

  const funnelProducts = [
    {
      title: "Free AI Profile — $0",
      description:
        "Get your own AI-readable business website. Add your business details once and we publish the structured page for you.",
      cta: "Create free AI profile",
      href: freeProfileUrl,
      accent: "border-sky-200 bg-sky-50/90",
      button: "border-sky-300 bg-white text-sky-800 hover:bg-sky-100",
    },
    {
      title: "Pro AI Presence — $19/month",
      description:
        "Enhanced AI-readable business page with structured data built for ChatGPT, Gemini, Grok, Claude, and Google, plus service area optimisation, FAQ support, click-to-call links, and conversion tracking.",
      cta: "Start Pro AI Presence",
      href: proSignupUrl,
      accent: "border-emerald-200 bg-emerald-50/90",
      button: "border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100",
    },
    {
      title: "TrustBadge Verification — From $29/month",
      description:
        "Verify your business and credentials. Show customers proof before they call. Help AI recommend you as a trusted provider.",
      cta: `Start ${BADGE_FEATURE_NAME} verification`,
      href: trustBadgeStarterUrl,
      accent: "border-indigo-200 bg-indigo-50/90",
      button: "border-indigo-300 bg-white text-indigo-800 hover:bg-indigo-100",
    },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-sky-100 via-cyan-50 to-teal-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.22),transparent_70%)]" />
      <div className="pointer-events-none absolute -right-32 top-32 h-80 w-80 rounded-full bg-teal-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-96 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />

      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-8 sm:pb-24 sm:pt-12">
        <div className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-xl shadow-sky-900/5 backdrop-blur sm:p-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-sky-200 bg-white/90 px-4 py-2 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-teal-500 text-sm font-black text-white">
                CA
              </span>
              <span className="text-sm font-extrabold tracking-tight text-slate-900">
                Credentials AI
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-sky-500 sm:block" />
              <span className="hidden text-xs font-semibold uppercase tracking-wide text-sky-700 sm:block">
                AI-readable trust system
              </span>
            </div>

            <h1 className="mt-7 text-balance text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
              Get found by customers searching with ChatGPT, Gemini, Grok, Claude, and Google.
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-slate-700 sm:text-xl">
              Create an AI-readable business profile, upgrade your AI presence,
              and verify your credentials so customers and AI know you&apos;re trustworthy.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={freeProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-700"
              >
                Create free AI profile
              </Link>
              <Link
                href="#pricing"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                View TrustBadge pricing
              </Link>
              <Link
                href="/auth/login"
                className="rounded-xl border border-slate-200 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white"
              >
                Log in
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-700">
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1">
                AI-readable pages
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
                ABN verification
              </span>
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1">
                Built for local businesses
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-2xl border border-sky-200 bg-sky-50/90 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              SchemaPage
            </p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-900 sm:text-base">
              AI can&apos;t read most websites. Our AI-readable pages format your
              website so AI can find it, read it, and recommend it.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              AI readable credentials
            </p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-900 sm:text-base">
              Your {BADGE_FEATURE_NAME} uses trusted proof like business
              registration details (ABN) plus uploaded licences, insurance, and
              compliance documents so AI can confirm your qualifications and
              recommend your services.
            </p>
          </div>
        </div>

        <div id="pricing" className="mx-auto mt-10 grid w-full max-w-6xl gap-4 md:grid-cols-3">
          {funnelProducts.map((product) => (
            <div
              key={product.title}
              className={`rounded-2xl border p-5 shadow-sm ${product.accent}`}
            >
              <h3 className="text-base font-extrabold text-slate-950">
                {product.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {product.description}
              </p>
              <Link
                href={product.href}
                target={product.href.startsWith("http") ? "_blank" : undefined}
                rel={product.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`mt-4 inline-flex rounded-lg border px-4 py-2 text-xs font-semibold transition ${product.button}`}
              >
                {product.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 w-full max-w-4xl rounded-2xl border border-amber-300 bg-amber-100/90 p-6 shadow-sm shadow-amber-900/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Founder Offer: first 100 businesses
          </p>
          <h3 className="mt-2 text-xl font-extrabold text-slate-950 sm:text-2xl">
            Pro AI Presence + TrustBadge Verification — $39/month
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Get both products together while we launch Credentials AI across the Gold Coast.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
            <li>• Pro AI Presence</li>
            <li>• 1 TrustBadge</li>
            <li>• Up to 3 verified credentials</li>
            <li>• Extra credentials +$5/month each</li>
          </ul>
          <Link
            href={founderOfferUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-lg border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-50"
          >
            Claim founder offer
          </Link>
        </div>

        <div className="mx-auto mt-10 grid w-full max-w-5xl gap-4 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <div
              key={point}
              className="rounded-2xl border border-white/80 bg-white/80 p-5 text-sm text-slate-700 shadow-sm backdrop-blur"
            >
              <p className="text-sm font-semibold text-slate-900">{point}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Publicly visible, easy to share, and ready for customer checks.
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-teal-200 bg-teal-50/80 p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-900">
            Built for fast trust decisions
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Your {BADGE_FEATURE_NAME} page gives customers one clean place to
            verify business credentials before they book.
          </p>
        </div>
      </section>
    </div>
  );
}
