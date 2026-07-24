import { BRAND_NAME, getSiteUrl } from "@/lib/brand";
import { Hero } from "@/components/marketing/Hero";
import { FeatureCards } from "@/components/marketing/FeatureCards";
import { PricingSection } from "@/components/marketing/PricingSection";
import { Faq, faqs } from "@/components/marketing/Faq";
import { StickyMobileCta } from "@/components/marketing/StickyMobileCta";
import { HomepageViewTracker } from "@/components/marketing/HomepageViewTracker";
import { getFounderBundleUrl, getFreeProfileUrl, getSampleProfileUrl } from "@/components/marketing/urls";
import { AiParticles } from "@/components/AiParticles";

export default function HomePage() {
  const siteUrl = getSiteUrl();
  const freeProfileUrl = getFreeProfileUrl();
  const founderBundleUrl = getFounderBundleUrl();
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
          "Credentials AI builds AI-verified business profiles that bring local businesses measured leads — ABN-checked, AI-readable, and enquiry-tracked.",
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
        name: "AI-verified business profiles for local businesses",
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: "Australia",
        serviceType: [
          "AI-readable business profile",
          "ABN-backed trust signals",
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
      <Hero freeProfileUrl={freeProfileUrl} sampleProfileUrl={sampleProfileUrl} />
      <FeatureCards />
      <PricingSection
        freeProfileUrl={freeProfileUrl}
        founderBundleUrl={founderBundleUrl}
      />
      <Faq freeProfileUrl={freeProfileUrl} />
      <StickyMobileCta freeProfileUrl={freeProfileUrl} />
    </div>
  );
}
