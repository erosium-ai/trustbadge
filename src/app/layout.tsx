import type { Metadata } from "next";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { BRAND_NAME, BADGE_FEATURE_LABEL } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${BRAND_NAME} — Verified tradie credentials`,
  description: `Upload, verify, and share your trade credentials with customers using ${BADGE_FEATURE_LABEL}.`,
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
