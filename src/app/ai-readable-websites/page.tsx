/* 🔑 Keywords: AI-readable websites, AI readable website, make website AI readable, AI-readable business profile, AI search visibility, ChatGPT website readability, Gemini search, local business AI SEO */

import { Metadata } from "next";
import Link from "next/link";
import { getFreeProfileUrl } from "@/components/marketing/urls";

export const metadata: Metadata = {
  title: "AI-Readable Websites for Local Businesses",
  description:
    "Learn what AI-readable websites are and how Credentials AI helps local businesses structure services, locations, FAQs, contact details, and proof for ChatGPT, Gemini, Claude, Grok, and Google.",
  alternates: {
    canonical: "/ai-readable-websites",
  },
};

const CHECKLIST = [
  "Clear business name, category, and service areas",
  "Plain-language service descriptions",
  "Frequently asked questions with direct answers",
  "Contact details that are easy to find",
  "ABN, licence, insurance, and trust proof where relevant",
  "Structured data that search engines and AI systems can parse",
  "A stable URL that can be shared, cited, and crawled",
];

const FAQS = [
  {
    question: "What is an AI-readable website?",
    answer:
      "An AI-readable website is organised so AI search systems can clearly understand what a business does, where it operates, how customers contact it, and what proof supports its claims.",
  },
  {
    question: "Why are normal websites hard for AI to read?",
    answer:
      "Many websites hide important details in sliders, images, vague copy, old pages, or messy navigation. AI systems need clear text, structured headings, consistent business details, FAQs, and machine-readable markup.",
  },
  {
    question: "Does an AI-readable website replace SEO?",
    answer:
      "No. It supports SEO. Traditional SEO helps search engines understand and rank pages, while AI-readable profiles make business details and proof easier for AI answer engines to extract and cite.",
  },
  {
    question: "Can Credentials AI guarantee AI search rankings?",
    answer:
      "No. Credentials AI does not guarantee rankings. It gives local businesses a stronger foundation by making their services, areas, credentials, and trust proof easier for AI systems and customers to understand.",
  },
];

export default function AIReadableWebsitesPage() {
  const topCtaUrl = getFreeProfileUrl("ai_readable_websites_page");
  const bottomCtaUrl = getFreeProfileUrl("ai_readable_websites_page_bottom");

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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <article className="mx-auto max-w-4xl px-6">
        <div className="rounded-[2rem] border border-sky-100 bg-white p-8 shadow-sm md:p-12">
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
            AI-readable websites
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
            AI-readable websites for local businesses
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-700">
            Customers are starting to search with ChatGPT, Gemini, Grok, Claude,
            and Google AI answers. An AI-readable website gives those systems a
            cleaner way to understand your business, services, locations,
            contact details, FAQs, and trust proof.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={topCtaUrl}
              className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Create free AI profile
            </Link>
            <Link
              href="/online-credential-verification"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Learn credential verification
            </Link>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-950">
            What makes a website AI-readable?
          </h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            AI-readable websites use clear text, structured headings, direct
            answers, consistent business details, and schema-style markup. The
            goal is simple: remove guesswork. If a customer asks an AI tool for
            a local plumber, electrician, cleaner, builder, consultant, or other
            service provider, your business information should be easy to parse.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            Credentials AI packages this into an AI-readable business profile so
            local businesses do not need to learn technical SEO, schema markup,
            or AI search optimisation from scratch.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-sky-200 bg-sky-50 p-7">
            <h2 className="text-xl font-extrabold text-slate-950">
              Why normal websites struggle
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
              <li>• Services are vague or buried across multiple pages.</li>
              <li>• Locations and service areas are unclear.</li>
              <li>• Credentials, licences, and insurance are not visible.</li>
              <li>• Important text is locked inside images or design elements.</li>
              <li>• FAQ answers are missing or too thin.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-teal-200 bg-teal-50 p-7">
            <h2 className="text-xl font-extrabold text-slate-950">
              What AI systems need
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
              <li>• Business identity and category.</li>
              <li>• Service list and plain-English explanations.</li>
              <li>• Service areas and contact pathways.</li>
              <li>• Proof signals such as ABN, licence, and insurance.</li>
              <li>• Structured, crawlable, stable page content.</li>
            </ul>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-950">
            AI-readable website checklist
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {CHECKLIST.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-800">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-indigo-200 bg-indigo-50 p-8">
          <h2 className="text-2xl font-extrabold text-slate-950">
            How Credentials AI helps
          </h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            Credentials AI gives your business an AI-readable profile with your
            services, service areas, FAQs, contact details, and trust proof in a
            format built for customers and AI systems to understand quickly.
            Upgrade to Pro AI Presence for stronger structured data, service
            area optimisation, and conversion tracking.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700">
            Add TrustBadge verification when you want to show proof like ABN,
            licences, insurance, compliance documents, first aid, or safety
            credentials.
          </p>
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

        <section className="mt-8 rounded-3xl border border-teal-200 bg-teal-600 p-8 text-white shadow-sm">
          <h2 className="text-2xl font-extrabold">
            Make your business easier for AI and customers to understand.
          </h2>
          <p className="mt-3 leading-relaxed text-teal-50">
            Start with a free AI Profile, then upgrade when you want stronger AI
            presence and verified credential proof.
          </p>
          <Link
            href={bottomCtaUrl}
            className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
          >
            Create free AI profile
          </Link>
        </section>
      </article>
    </div>
  );
}
