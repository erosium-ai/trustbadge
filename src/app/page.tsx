import { BRAND_NAME, getSiteUrl } from "@/lib/brand";
import { ProblemIntro } from "@/components/marketing/ProblemIntro";
import { Hero } from "@/components/marketing/Hero";
import { FeatureCards } from "@/components/marketing/FeatureCards";
import { PricingSection } from "@/components/marketing/PricingSection";
import { QrCodeSection } from "@/components/marketing/QrCodeSection";
import { UnderTheHoodSection } from "@/components/marketing/UnderTheHoodSection";
import { Faq, faqs } from "@/components/marketing/Faq";
import { ClosingCta } from "@/components/marketing/ClosingCta";
import { StickyMobileCta } from "@/components/marketing/StickyMobileCta";
import { HomepageViewTracker } from "@/components/marketing/HomepageViewTracker";
import { getPaidProfileUrl, getFreeProfileUrl, getSampleProfileUrl } from "@/components/marketing/urls";
import { AiParticles } from "@/components/AiParticles";

export default function HomePage() {
  const siteUrl = getSiteUrl();
  const freeProfileUrl = getFreeProfileUrl();
  const paidProfileUrl = getPaidProfileUrl();
  const sampleProfileUrl = getSampleProfileUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: BRAND_NAME,
        url: siteUrl,
        description:
          "Credentials AI builds AI-readable business profiles with best-effort ABN/business-registration check wording, source/date details, and enquiry tracking for Australian local businesses.",
        dateModified: "2026-07-29",
        knowsAbout: [
          "AI Business Profiles",
          "Automated ABN Verification",
          "Australian Business Register",
          "Small Business Marketing",
          "QR Code Lead Tracking",
          "ABN Lookup",
          "Local SEO for Tradies",
          "AI Search Visibility",
          "Structured Data SEO",
          "Voice Search Optimization",
          "ChatGPT Local Business Discovery",
        ],
        sameAs: [
          "https://x.com/Ikebuilds",
          "https://www.linkedin.com/in/isaac-anasson-25b147423/",
          "https://github.com/erosium-ai",
          "https://www.youtube.com/@Ikebuilds",
        ],
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
        name: "AI-readable business profiles for local businesses",
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: "Australia",
        serviceType: [
          "AI-readable business profile",
          "automated ABN verification against Australian Business Register data",
          "source and checked-date displayed on every check",
          "tracked enquiries and source attribution",
          "weekly enquiry summary",
        ],
        offers: [
          {
            "@type": "Offer",
            name: "AI Business Card",
            price: "0",
            priceCurrency: "AUD",
          },
          {
            "@type": "Offer",
            name: "AI-Ready Business Page",
            price: "49",
            priceCurrency: "AUD",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "49",
              priceCurrency: "AUD",
              billingIncrement: "P1M",
            },
          },
          {
            "@type": "Offer",
            name: "AI-Ready Business Page Weekly",
            price: "12.90",
            priceCurrency: "AUD",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "12.90",
              priceCurrency: "AUD",
              billingIncrement: "P1W",
            },
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="ai-v2-bg relative min-h-screen overflow-hidden pb-20 text-white md:pb-0">
      <div className="ai-trust-horizon fixed inset-0" />
      <div className="ai-horizon-line fixed" />
      <div className="ai-aurora-ribbons fixed" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
      <AiParticles tone="home" />
      <HomepageViewTracker />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProblemIntro />
      <Hero freeProfileUrl={freeProfileUrl} sampleProfileUrl={sampleProfileUrl} />
      <FeatureCards />
      <QrCodeSection />
      <PricingSection
        freeProfileUrl={freeProfileUrl}
        paidProfileUrl={paidProfileUrl}
      />

      {/* TrustBadge embed section */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="ai-glass-soft overflow-hidden rounded-[2rem]">
          <div className="p-6 sm:p-8 lg:p-10">
            <h2 className="text-balance text-center text-3xl font-black tracking-tight text-white sm:text-4xl">
              Put your badge on your own website
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              Your Credentials AI profile comes with a snippet you can paste into
              your existing website. A live verification badge that sits on your
              current pages — updating automatically as your status changes. It
              proves you&rsquo;re verified wherever customers find you, without
              changing a thing about your current site.
            </p>
          </div>
        </div>
      </section>

      <UnderTheHoodSection />
      <Faq freeProfileUrl={freeProfileUrl} />
      <ClosingCta />
      <StickyMobileCta freeProfileUrl={freeProfileUrl} />
    </div>
  );
}
