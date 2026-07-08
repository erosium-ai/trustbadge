import { BRAND_NAME, getSiteUrl } from "@/lib/brand";
import { Hero } from "@/components/marketing/Hero";
import { ProblemCards } from "@/components/marketing/ProblemCards";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { TrustBadgeShowcase } from "@/components/marketing/TrustBadgeShowcase";
import { AudienceGrid } from "@/components/marketing/AudienceGrid";
import { HonestyBlock } from "@/components/marketing/HonestyBlock";
import { PricingSection } from "@/components/marketing/PricingSection";
import { FounderBundleBanner } from "@/components/marketing/FounderBundleBanner";
import { Faq, faqs } from "@/components/marketing/Faq";
import { StickyMobileCta } from "@/components/marketing/StickyMobileCta";
import { getFounderBundleUrl, getFreeProfileUrl, getProPresenceUrl } from "@/components/marketing/urls";

export default function HomePage() {
  const siteUrl = getSiteUrl();
  const freeProfileUrl = getFreeProfileUrl();
  const founderBundleUrl = getFounderBundleUrl();
  const proPresenceUrl = getProPresenceUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: BRAND_NAME,
        url: siteUrl,
        description:
          "Credentials AI creates AI-readable business profiles and online credential verification pages for local Australian businesses.",
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
        name: "AI-readable business profiles and online credential verification",
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
            name: "Founder Bundle",
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
      <Hero freeProfileUrl={freeProfileUrl} />
      <ProblemCards freeProfileUrl={freeProfileUrl} />
      <HowItWorks freeProfileUrl={freeProfileUrl} />
      <TrustBadgeShowcase freeProfileUrl={freeProfileUrl} />
      <AudienceGrid />
      <HonestyBlock />
      <PricingSection
        freeProfileUrl={freeProfileUrl}
        founderBundleUrl={founderBundleUrl}
        proPresenceUrl={proPresenceUrl}
      />
      <FounderBundleBanner founderBundleUrl={founderBundleUrl} />
      <Faq freeProfileUrl={freeProfileUrl} />
      <StickyMobileCta freeProfileUrl={freeProfileUrl} />
    </div>
  );
}
