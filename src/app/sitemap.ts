import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/brand";

const staticRoutes = [
  "",
  "/start",
  "/ai-readable-websites",
  "/online-credential-verification",
  "/trust-badge-for-business",
  "/terms",
  "/refunds",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.includes("terms") || route.includes("refunds") ? 0.3 : 0.85,
  }));
}
