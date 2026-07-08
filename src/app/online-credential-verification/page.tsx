/* 🔑 Keywords: online credential verification, business credential verification, verified business credentials, ABN verification, licence verification, insurance verification, TrustBadge, customer-facing verification */

import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Online Credential Verification for Businesses",
  description:
    "Credentials AI helps businesses show online credential verification with ABN checks, licences, insurance, compliance documents, and TrustBadge proof customers can review before they call.",
  alternates: {
    canonical: "/online-credential-verification",
  },
};

const CREDENTIALS = [
  "ABN and business registration details",
  "Trade licences and registrations",
  "Insurance certificates",
  "Compliance documents",
  "First aid certificates",
  "Safety tickets and site-readiness proof",
];

const FAQS = [
  {
    question: "What is online credential verification?",
    answer:
      "Online credential verification is a way to show customers and other systems that business details or documents have been checked, such as ABN details, licences, insurance, compliance documents, or safety credentials.",
  },
  {
    question: "What credentials can a local business verify?",
    answer:
      "Common examples include ABN or business registration, trade licences, insurance certificates, compliance documents, first aid certificates, safety tickets, and other proof relevant to the service being offered.",
  },
  {
    question: "Is TrustBadge the same as a background check platform?",
    answer:
      "No. Background check platforms are usually built for hiring and internal compliance. TrustBadge is customer-facing proof designed to help local businesses show verified business credentials before a customer contacts or books them.",
  },
  {
    question: "Does Credentials AI verify everything automatically?",
    answer:
      "Some checks, such as ABN validation, can be automated. Other credentials may require document upload, review, and clear verification states so customers can see what is verified, pending, uploaded, or expired.",
  },
];

export default function OnlineCredentialVerificationPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <article className="mx-auto max-w-4xl px-6">
        <div className="rounded-[2rem] border border-violet-100 bg-white p-8 shadow-sm md:p-12">
          <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
            Online credential verification
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
            Online credential verification for businesses
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-700">
            Customers want proof before they call, quote, or book. Credentials
            AI TrustBadge gives businesses a customer-facing way to show online
            credential verification for ABN details, licences, insurance,
            compliance documents, and other trust proof.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/auth/register?intent=trustbadge&utm_source=seo&utm_medium=online_credential_verification_page&utm_campaign=trustbadge_cta"
              className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Start TrustBadge verification
            </Link>
            <Link
              href="/ai-readable-websites"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Learn AI-readable websites
            </Link>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-950">
            What is online credential verification?
          </h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            Online credential verification gives customers a clear place to
            review business proof. Instead of hiding licences, insurance, ABN
            details, and compliance documents across emails, PDFs, or old web
            pages, a TrustBadge profile can show what has been checked and what
            is still pending.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            For local services like plumbers, electricians, builders, cleaners,
            pest control, HVAC, maintenance, and mobile trades, verified proof is
            a trust signal. Customers are letting someone into their home or
            business. Clear credentials help reduce doubt before contact.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-violet-200 bg-violet-50 p-8">
          <h2 className="text-2xl font-extrabold text-slate-950">
            Credential types a business can show
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {CREDENTIALS.map((credential) => (
              <div key={credential} className="rounded-2xl border border-violet-200 bg-white p-4 text-sm font-semibold text-slate-800">
                {credential}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-950">
              Internal compliance vs customer-facing proof
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Many credential systems are built for HR teams, onboarding,
              background checks, or site access. Those are useful internally,
              but customers rarely see them before deciding who to call.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              TrustBadge is designed as a public trust layer: a clear page or
              badge customers can review before they contact your business.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-950">
              Verification states matter
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Good verification should not overclaim. A credential should be
              labelled clearly as verified, pending, uploaded, expired, or not
              supplied. That protects the business and gives customers a more
              honest trust signal.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-indigo-200 bg-indigo-50 p-8">
          <h2 className="text-2xl font-extrabold text-slate-950">
            How Credentials AI TrustBadge works
          </h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
            <li>
              <strong>1. Register your business.</strong> Add business details and contact information.
            </li>
            <li>
              <strong>2. Verify business identity.</strong> ABN or business registration details can be checked where available.
            </li>
            <li>
              <strong>3. Upload credentials.</strong> Add licences, insurance, compliance documents, or other relevant proof.
            </li>
            <li>
              <strong>4. Show your TrustBadge.</strong> Share your verification page with customers, on your website, in quotes, and in your AI-readable profile.
            </li>
          </ol>
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

        <section className="mt-8 rounded-3xl border border-violet-200 bg-violet-600 p-8 text-white shadow-sm">
          <h2 className="text-2xl font-extrabold">
            Give customers proof before they call.
          </h2>
          <p className="mt-3 leading-relaxed text-violet-50">
            Start TrustBadge verification and show clear business credential
            proof alongside your AI-readable business profile.
          </p>
          <Link
            href="/auth/register?intent=trustbadge&utm_source=seo&utm_medium=online_credential_verification_page&utm_campaign=bottom_cta"
            className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-violet-800 transition hover:bg-violet-50"
          >
            Start TrustBadge verification
          </Link>
        </section>
      </article>
    </div>
  );
}
