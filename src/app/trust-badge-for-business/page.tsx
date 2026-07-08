/* 🔑 Keywords: trust badge for business, business trust badge, verified business badge, TrustBadge, customer trust, verified business credentials, AI-readable trust proof */

import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trust Badge for Business Websites & AI Profiles",
  description:
    "Credentials AI TrustBadge gives local businesses a visible trust badge and verification page for ABN details, licences, insurance, and customer-facing proof.",
  alternates: {
    canonical: "/trust-badge-for-business",
  },
};

const TRUST_SIGNALS = [
  "Business registration or ABN details",
  "Trade licences and registrations",
  "Insurance certificates",
  "Compliance documents",
  "First aid and safety credentials",
  "A public verification page customers can review",
];

const FAQS = [
  {
    question: "What is a trust badge for business?",
    answer:
      "A trust badge is a visible signal that helps customers quickly understand that a business has supplied or verified important proof such as business registration, licences, insurance, or other credentials.",
  },
  {
    question: "How is TrustBadge different from a generic website seal?",
    answer:
      "TrustBadge is designed to connect visible customer trust with an AI-readable business profile and clear verification states, rather than just displaying a generic seal with no useful proof behind it.",
  },
  {
    question: "Where can a business use a TrustBadge?",
    answer:
      "A business can use its TrustBadge on its website, AI-readable profile, quote emails, social profiles, QR codes, and customer-facing pages where trust matters before contact.",
  },
];

export default function TrustBadgeForBusinessPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <article className="mx-auto max-w-4xl px-6">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm md:p-12">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Trust badge for business
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
            A trust badge for business websites and AI profiles
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-700">
            TrustBadge gives local businesses a visible trust signal and public
            verification page for business proof like ABN details, licences,
            insurance, compliance documents, first aid, and safety credentials.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/auth/register?intent=trustbadge&utm_source=seo&utm_medium=trust_badge_for_business_page&utm_campaign=trustbadge_cta"
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Start TrustBadge verification
            </Link>
            <Link
              href="/online-credential-verification"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Learn online credential verification
            </Link>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-950">
            Why local businesses need visible trust proof
          </h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            Customers are cautious. Before they call a plumber, electrician,
            builder, cleaner, pest controller, or other local service provider,
            they want to know the business looks real and credible. A trust
            badge gives them a fast proof point without forcing them to hunt
            through PDFs, old websites, or scattered social posts.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            Credentials AI connects that trust proof to an AI-readable business
            profile, so customers and AI systems can understand both what you do
            and why your business can be trusted.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-8">
          <h2 className="text-2xl font-extrabold text-slate-950">
            Trust signals a business can show
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {TRUST_SIGNALS.map((signal) => (
              <div key={signal} className="rounded-2xl border border-emerald-200 bg-white p-4 text-sm font-semibold text-slate-800">
                {signal}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-950">FAQ</h2>
          <div className="mt-5 space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-extrabold text-slate-950">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-600 p-8 text-white shadow-sm">
          <h2 className="text-2xl font-extrabold">
            Show customers proof before they call.
          </h2>
          <p className="mt-3 leading-relaxed text-emerald-50">
            Add a TrustBadge verification page to your AI-readable business
            profile and give customers a clearer reason to trust you.
          </p>
          <Link
            href="/auth/register?intent=trustbadge&utm_source=seo&utm_medium=trust_badge_for_business_page&utm_campaign=bottom_cta"
            className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
          >
            Start TrustBadge verification
          </Link>
        </section>
      </article>
    </div>
  );
}
