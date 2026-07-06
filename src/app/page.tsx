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
    source: "credentialsai",
    campaign: "pro_ai_presence_card",
    utm_source: "credentialsai",
    utm_medium: "website_card",
    utm_campaign: "pro_ai_presence_card",
    utm_content: "landing_funnel",
  });

  const funnelProducts = [
    {
      title: "Free AI Profile",
      description:
        "Get your own AI-readable business website. Add your business details once and we publish the structured page for you.",
      cta: "Create free AI profile",
      href: freeProfileUrl,
      accent: "border-teal-200 bg-teal-50/40",
    },
    {
      title: "Pro AI Presence — $19/month",
      description:
        "Start by creating your AI profile, then unlock stronger presentation, premium positioning, and ongoing visibility features.",
      cta: "Start Pro AI Presence",
      href: proSignupUrl,
      accent: "border-slate-200 bg-white",
    },
    {
      title: "TrustBadge Verification",
      description:
        "Add verified trust signals for licences, insurance, and compliance so customers can book with confidence.",
      cta: `Create your ${BADGE_FEATURE_NAME}`,
      href: "/auth/register",
      accent: "border-slate-200 bg-white",
    },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.15),transparent_70%)]" />

      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-14 sm:pb-24 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            Credentials AI
            <span className="h-1 w-1 rounded-full bg-brand-500" />
            Trust signals that convert
          </p>

          <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Get your own AI-readable business website.
          </h1>

          <p className="mt-5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-900 sm:text-base">
            Help get your business to the top of AI searches like ChatGPT,
            Gemini, Grok, and Claude.
            <span className="block mt-1 text-slate-800">
              So customers find you first — not your competitors.
            </span>
          </p>

          <p className="mt-5 text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">
            Click create, answer a few details, and {BRAND_NAME} handles the
            rest. Your page is structured so AI tools can understand your
            business, and you can add {BADGE_FEATURE_NAME} verification when
            you're ready.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={schemaPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-700"
            >
              Create your free AI-readable page
            </Link>
            <Link
              href="/auth/login"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-10 grid w-full max-w-6xl gap-4 md:grid-cols-3">
          {funnelProducts.map((product) => (
            <div
              key={product.title}
              className={`rounded-2xl border p-5 shadow-sm ${product.accent}`}
            >
              <h3 className="text-base font-semibold text-slate-900">
                {product.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {product.description}
              </p>
              <Link
                href={product.href}
                target={product.href.startsWith("http") ? "_blank" : undefined}
                rel={product.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="mt-4 inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {product.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 grid w-full max-w-5xl gap-4 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <div
              key={point}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">{point}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Publicly visible, easy to share, and ready for customer checks.
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-teal-200 bg-teal-50/40 p-6 text-center shadow-sm">
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
