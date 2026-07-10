import type { Metadata } from "next";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { LegalFooter } from "@/components/LegalFooter";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL("https://credentialsai.com.au"),
  title: {
    default: `${BRAND_NAME} — Verified Lead Engine for Local Businesses`,
    template: `%s — ${BRAND_NAME}`,
  },
  description:
    "Credentials AI helps local businesses get found, get trusted, and track enquiries with verification, source attribution, and weekly proof reporting.",
  keywords: [
    "verified lead engine",
    "tracked enquiries",
    "business profile verification",
    "trust badge for local business",
    "AI visibility",
    "source attribution",
    "weekly proof reporting",
    "local business lead tracking",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${BRAND_NAME} — Get found. Get trusted. Get enquiries.`,
    description:
      "Verified lead engine for local businesses: clear profile, trust verification, tracked enquiries, and weekly proof.",
    url: "https://credentialsai.com.au",
    siteName: BRAND_NAME,
    locale: "en_AU",
    type: "website",
    images: [
      {
        url: "/brand/credentials-ai-logo-tile.png",
        width: 1400,
        height: 900,
        alt: "Credentials AI — AI visibility. Verified trust.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} — Verified Lead Engine for Local Businesses`,
    description:
      "Get found, get trusted, and track enquiries with proof reporting.",
    images: ["/brand/credentials-ai-logo-tile.png"],
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
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <TopBar />
        <main className="flex-1">{children}</main>
        <LegalFooter />
      </body>
    </html>
  );
}
