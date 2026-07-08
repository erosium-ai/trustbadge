import Link from "next/link";
import {
  BADGE_FEATURE_NAME,
  BRAND_NAME,
  getSchemaPageUrl,
  getSiteUrl,
} from "@/lib/brand";
import { TrackedLink } from "@/components/TrackedLink";

const TRUST_POINTS = [
  "Licences and registrations",
  "Insurance and compliance docs",
  "First aid and safety credentials",
];

const FAQS = [
  {
    question: "What is an AI-readable website?",
    answer:
      "An AI-readable website is structured so AI search tools can clearly understand what your business does, where you operate, how customers contact you, and what proof makes you trustworthy.",
  },
  {
    question: "What is online credential verification for a business?",
    answer:
      "Online credential verification gives customers a public way to review business proof such as ABN details, licences, insurance, compliance documents, first aid, or safety credentials before they contact or book you.",
  },
  {
    question: "Does Credentials AI guarantee rankings in ChatGPT or Google?",
    answer:
      "No honest service can guarantee AI or Google rankings. Credentials AI gives your business a stronger foundation by making your profile, services, locations, FAQs, and verification proof easier for customers and AI systems to understand.",
  },
  {
    question: "Is Credentials AI a replacement for my website or SEO agency?",
    answer:
      "No. Credentials AI supports your current website and SEO by adding a clean AI-readable business profile and TrustBadge verification layer that customers and AI systems can read quickly.",
  },
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
  const siteUrl = getSiteUrl();
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: BRAND_NAME,
        url: siteUrl,
        description:
          "Credentials AI creates AI-readable business profiles and online credential verification pages for local businesses.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: BRAND_NAME,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "Service",
        "@id": `${siteUrl}/#service`,
        name: "AI-readable websites and online credential verification",
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: "Australia",
        serviceType: [
          "AI-readable business profiles",
          "online credential verification",
          "business trust badge verification",
          "AI search visibility for local businesses",
        ],
        offers: [
          {
            "@type": "Offer",
            name: "Free AI Profile",
            price: "0",
            priceCurrency: "AUD",
          },
          {
            "@type": "Offer",
            name: "Pro AI Presence",
            price: "19",
            priceCurrency: "AUD",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "19",
              priceCurrency: "AUD",
              billingIncrement: "P1M",
            },
          },
          {
            "@type": "Offer",
            name: "Founder bundle",
            price: "39",
            priceCurrency: "AUD",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "39",
              priceCurrency: "AUD",
              billingIncrement: "P1M",
            },
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-sky-100 via-cyan-50 to-teal-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

            <p className="mx-auto mt-4 max-w-3xl text-pretty text-base font-semibold leading-relaxed text-slate-800">
              AI-readable websites and online credential verification for local businesses.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <TrackedLink
                href={freeProfileUrl}
                eventName="credentials_ai_click_free_profile"
                source="credentialsai"
                campaign="free_ai_profile_card"
                label="Create free AI profile"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-700"
              >
                Create free AI profile
              </TrackedLink>
              <Link
                href="#trust-lane"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                View TrustBadge pricing
              </Link>
              <Link
                href="/ai-readable-websites"
                className="rounded-xl border border-sky-200 bg-white/80 px-6 py-3 text-sm font-semibold text-sky-800 transition hover:-translate-y-0.5 hover:bg-white"
              >
                Learn AI-readable websites
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

        <div className="mt-10 space-y-6">
          <div className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 p-6 shadow-sm">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                Package lane 1
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
                SchemaPage package
              </h2>
              <p className="mt-1 text-sm text-slate-700">
                Start free, then upgrade your visibility package when you want stronger AI discovery.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-sky-200 bg-sky-100/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                  SchemaPage foundation
                </p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-900">
                  AI can&apos;t read most websites. Our AI-readable pages format your website so AI can find it, read it, and recommend it.
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-200 bg-cyan-100/70 p-5">
                <h3 className="text-base font-extrabold text-slate-950">
                  Free AI Profile — $0
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  Get your own AI-readable business website. Add your business details once and we publish the structured page for you.
                </p>
                <TrackedLink
                  href={freeProfileUrl}
                  eventName="credentials_ai_click_free_profile"
                  source="credentialsai"
                  campaign="free_ai_profile_card"
                  label="Create free AI profile (card)"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex rounded-lg border border-cyan-300 bg-white px-4 py-2 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-50"
                >
                  Create free AI profile
                </TrackedLink>
              </div>

              <div className="rounded-2xl border border-teal-200 bg-teal-100/70 p-5">
                <h3 className="text-base font-extrabold text-slate-950">
                  Pro AI Presence — $19/month
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  Enhanced AI-readable business page with structured data built for ChatGPT, Gemini, Grok, Claude, and Google, plus service area optimisation and conversion tracking.
                </p>
                <TrackedLink
                  href={proSignupUrl}
                  eventName="credentials_ai_click_pro_ai_presence"
                  source="credentialsai"
                  campaign="pro_ai_presence_card"
                  label="Start Pro AI Presence"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex rounded-lg border border-teal-300 bg-white px-4 py-2 text-xs font-semibold text-teal-800 transition hover:bg-teal-50"
                >
                  Start Pro AI Presence
                </TrackedLink>
              </div>
            </div>
          </div>

          <div
            id="trust-lane"
            className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 p-6 shadow-sm"
          >
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">
                Package lane 2
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
                TrustBadge package
              </h2>
              <p className="mt-1 text-sm text-slate-700">
                Add verified trust proof so both customers and AI can trust your business before contact.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-indigo-200 bg-indigo-100/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  AI readable credentials
                </p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-900">
                  Your {BADGE_FEATURE_NAME} uses trusted proof like business registration details (ABN) plus uploaded licences, insurance, and compliance documents so AI can confirm your qualifications and recommend your services.
                </p>
              </div>

              <div className="rounded-2xl border border-violet-200 bg-violet-100/70 p-5">
                <h3 className="text-base font-extrabold text-slate-950">
                  TrustBadge Verification — From $29/month
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  Verify your business and credentials. Show customers proof before they call. Help AI recommend you as a trusted provider.
                </p>
                <TrackedLink
                  href={trustBadgeStarterUrl}
                  eventName="credentials_ai_click_trustbadge_starter"
                  source="credentialsai"
                  campaign="trustbadge_starter_card"
                  label="Start TrustBadge verification"
                  className="mt-4 inline-flex rounded-lg border border-violet-300 bg-white px-4 py-2 text-xs font-semibold text-violet-800 transition hover:bg-violet-50"
                >
                  Start {BADGE_FEATURE_NAME} verification
                </TrackedLink>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-indigo-300 bg-white/80 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">
                Founder offer: first 100 businesses
              </p>
              <h3 className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">
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
              <TrackedLink
                href={founderOfferUrl}
                eventName="credentials_ai_click_founder_offer"
                source="credentialsai"
                campaign="founder_offer_first_100"
                label="Claim founder offer"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex rounded-lg border border-indigo-300 bg-white px-4 py-2 text-xs font-semibold text-indigo-900 transition hover:bg-indigo-50"
              >
                Claim founder offer
              </TrackedLink>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 grid w-full max-w-5xl gap-4 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <div
              key={point}
              className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5 text-sm text-slate-700 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">{point}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Publicly visible, easy to share, and ready for customer checks.
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-indigo-200 bg-indigo-50/70 p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-900">
            Built for fast trust decisions
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Your {BADGE_FEATURE_NAME} page gives customers one clean place to
            verify business credentials before they book.
          </p>
        </div>

        <section className="mx-auto mt-8 max-w-5xl rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
              AI-readable websites + credential verification
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Built for the searches customers are starting to make now.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
              Credentials AI creates AI-readable websites and online credential
              verification pages for local businesses, helping customers and AI
              systems understand your services, service areas, ABN, licences,
              insurance, and trust proof before contact.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link
              href="/ai-readable-websites"
              className="rounded-2xl border border-sky-200 bg-sky-50 p-5 transition hover:-translate-y-0.5 hover:bg-sky-100"
            >
              <h3 className="text-sm font-extrabold text-slate-950">
                AI-readable websites
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Learn how structured business profiles help ChatGPT, Gemini,
                Grok, Claude, and Google understand local services.
              </p>
            </Link>
            <Link
              href="/online-credential-verification"
              className="rounded-2xl border border-violet-200 bg-violet-50 p-5 transition hover:-translate-y-0.5 hover:bg-violet-100"
            >
              <h3 className="text-sm font-extrabold text-slate-950">
                Online credential verification
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Show public proof for ABN, licences, insurance, compliance docs,
                and other business credentials.
              </p>
            </Link>
            <Link
              href="/trust-badge-for-business"
              className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition hover:-translate-y-0.5 hover:bg-emerald-100"
            >
              <h3 className="text-sm font-extrabold text-slate-950">
                Trust badge for business
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Give customers a fast, visible trust signal before they call,
                quote, or book.
              </p>
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-5xl rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Common questions
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
            AI-readable websites and credential verification FAQ
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {FAQS.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-sm font-extrabold text-slate-950">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
