import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/brand";
import { getServiceClient } from "@/lib/supabase";

// 🔑 Keywords: sitemap, profile URLs, /b/ slugs, findability, GSC submission
// v1.1: dynamic /b/[slug] entries for ACTIVE business profiles so Google/GSC
// can enumerate customer profiles. Test/demo slugs are excluded.

const staticRoutes = [
  "",
  "/start",
  "/ai-readable-websites",
  "/online-credential-verification",
  "/trust-badge-for-business",
  "/terms",
  "/refunds",
];

function isExcludedSlug(slug: string): boolean {
  return /(^|-)test(-|$)|^sample-|demo/.test(slug);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.includes("terms") || route.includes("refunds") ? 0.3 : 0.85,
  }));

  try {
    const client = getServiceClient();
    const { data } = await client
      .from("business_profiles")
      .select("slug, updated_at")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(1000);

    for (const row of data ?? []) {
      const slug = typeof row.slug === "string" ? row.slug : "";
      if (!slug || isExcludedSlug(slug)) continue;
      entries.push({
        url: `${siteUrl}/b/${slug}`,
        lastModified: row.updated_at ? new Date(row.updated_at as string) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Best-effort: static routes still ship if the DB is unreachable.
  }

  return entries;
}
