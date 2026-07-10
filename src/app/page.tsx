import { BRAND_NAME, getSiteUrl } from "@/lib/brand";
import { Hero } from "@/components/marketing/Hero";
import { AiReadableSection } from "@/components/marketing/AiReadableSection";
import { ProblemCards } from "@/components/marketing/ProblemCards";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { LeadProfileSection } from "@/components/marketing/LeadProfileSection";
import { ProofDashboardSection } from "@/components/marketing/ProofDashboardSection";
import { TrustBadgeShowcase } from "@/components/marketing/TrustBadgeShowcase";
import { AudienceGrid } from "@/components/marketing/AudienceGrid";
import { HonestyBlock } from "@/components/marketing/HonestyBlock";
import { PricingSection } from "@/components/marketing/PricingSection";
import { FounderBundleBanner } from "@/components/marketing/FounderBundleBanner";
import { Faq, faqs } from "@/components/marketing/Faq";
import { StickyMobileCta } from "@/components/marketing/StickyMobileCta";
import { getFounderBundleUrl, getFreeProfileUrl, getSampleProfileUrl } from "@/components/marketing/urls";

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
          "Credentials AI helps local businesses get found, get trusted, and track enquiries with verification and proof reporting.",
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
        name: "Verified lead engine for local businesses",
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: "Australia",
        serviceType: [
          "Verified lead profile for local businesses",
          "online credential verification",
          "tracked enquiries and source attribution",
          "weekly proof reporting",
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
            name: "Founding Member — Verified Lead Engine",
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
    <div className="bg-[#F7F6F3] pb-20 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero freeProfileUrl={freeProfileUrl} sampleProfileUrl={sampleProfileUrl} />
      <AiReadableSection />
      <ProblemCards freeProfileUrl={freeProfileUrl} />
      <HowItWorks freeProfileUrl={freeProfileUrl} />
      <LeadProfileSection sampleProfileUrl={sampleProfileUrl} />
      <ProofDashboardSection />
      <TrustBadgeShowcase freeProfileUrl={freeProfileUrl} />
      <HonestyBlock />
      <AudienceGrid />
      <PricingSection
        freeProfileUrl={freeProfileUrl}
        founderBundleUrl={founderBundleUrl}
      />
      <FounderBundleBanner founderBundleUrl={founderBundleUrl} />
      <Faq freeProfileUrl={freeProfileUrl} />
      <StickyMobileCta freeProfileUrl={freeProfileUrl} />
    </div>
  );
}
