import type { Metadata } from "next";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL("https://credentialsai.com.au"),
  title: {
    default: `${BRAND_NAME} — AI-Readable Websites & Online Credential Verification`,
    template: `%s — ${BRAND_NAME}`,
  },
  description:
    "Credentials AI helps local businesses get found by AI search and trusted by customers with AI-readable business profiles, ABN checks, TrustBadge verification, and online credential proof.",
  keywords: [
    "AI-readable websites",
    "AI readable business profile",
    "online credential verification",
    "business credential verification",
    "verified business credentials",
    "TrustBadge",
    "business trust badge",
    "AI search visibility for local business",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${BRAND_NAME} — AI-Readable Websites & Online Credential Verification`,
    description:
      "Create an AI-readable business profile and verified TrustBadge so customers and AI systems can understand and trust your business.",
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
    title: `${BRAND_NAME} — AI-Readable Websites & Online Credential Verification`,
    description:
      "AI-readable business profiles and online credential verification for local businesses.",
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
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <TopBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
