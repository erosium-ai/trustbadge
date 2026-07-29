import type { Metadata } from "next";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { LegalFooter } from "@/components/LegalFooter";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL("https://credentialsai.com.au"),
  title: {
    default: `${BRAND_NAME} — AI-Readable Business Profiles`,
    template: `%s — ${BRAND_NAME}`,
  },
  description:
    "Credentials AI builds AI-readable business profiles with best-effort ABN/business-registration check wording, source/date details, and enquiry tracking for Australian local businesses.",
  keywords: [
    "AI Business Card",
    "AI-Ready Business Page",
    "AI-readable business profile",
    "ABN business registration check",
    "trust badge for local business",
    "AI visibility",
    "tracked enquiries",
    "weekly enquiry summary",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${BRAND_NAME} — Your Business, Seen by AI`,
    description:
      "AI-readable profiles with checked business details and measured enquiries.",
    url: "https://credentialsai.com.au",
    siteName: BRAND_NAME,
    locale: "en_AU",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Credentials AI — AI-Ready Business Profiles with ABN Check Wording, Enquiry Tracking, and QR Codes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} — AI-Readable Business Profiles`,
    description:
      "AI-readable profiles with checked business details and measured enquiries.",
    images: ["/og-image.png"],
  },
  // Tells Google & AI crawlers content is fresh — Perplexity heavily weights <3mo content
  other: {
    "dc.date.modified": "2026-07-29",
    "last-modified": "2026-07-29",
    "revised": "2026-07-29",
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Plausible analytics — same site hash as the builder app so the whole
            funnel (homepage + builder) reports into one dashboard. */}
        <script async src="https://plausible.io/js/pa-zAPjMspHIa_4gs877_g6N.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <TopBar />
        <main className="flex-1">{children}</main>
        <LegalFooter />
      </body>
    </html>
  );
}
