import type { Metadata } from "next";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { LegalFooter } from "@/components/LegalFooter";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL("https://credentialsai.com.au"),
  title: {
    default: `${BRAND_NAME} — AI-Verified Business Profiles`,
    template: `%s — ${BRAND_NAME}`,
  },
  description:
    "Credentials AI builds AI-verified business profiles that bring local businesses measured leads — ABN-checked, AI-readable, and enquiry-tracked.",
  keywords: [
    "AI Business Card",
    "AI-Ready Business Page",
    "AI-readable business profile",
    "ABN verified business profile",
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
      "AI-verified profiles that bring you measured leads. ABN-checked, AI-readable, enquiry-tracked.",
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
    title: `${BRAND_NAME} — AI-Verified Business Profiles`,
    description:
      "AI-verified profiles that bring you measured leads.",
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
