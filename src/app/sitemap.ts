import type { MetadataRoute } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { getSiteUrl } from "@/lib/brand";
import { getServiceClient } from "@/lib/supabase";

// 🔑 Keywords: sitemap, profile URLs, /b/ slugs, findability, GSC submission
// v1.2: dynamic /b/[slug] entries for ACTIVE business profiles so Google/GSC
// can enumerate customer profiles. Test slugs are excluded; the curated
// sample paid demo page is intentionally indexable for product discovery.
// v1.3: force runtime generation (no stale build-time sitemap cache).

export const dynamic = "force-dynamic";
export const revalidate = 0;

const staticRoutes = [
  "",
  "/start",
  "/ai-readable-websites",
  "/online-credential-verification",
  "/trust-badge-for-business",
  "/b/sample-plumbing-co",
  "/badge/sample-plumbing-co",
  "/terms",
  "/refunds",
  "/privacy",
];

function isExcludedSlug(slug: string): boolean {
  const normalized = slug.trim().toLowerCase();
  if (normalized === "sample-plumbing-co") return false;
  return /(^|-)test(-|$)|^sample-|demo/.test(normalized);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  noStore();

  const siteUrl = getSiteUrl();
  const now = new Date();
  const seen = new Set<string>();

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => {
    const url = `${siteUrl}${route}`;
    seen.add(url);
    return {
      url,
      lastModified: now,
      changeFrequency: route === "" ? "weekly" : "monthly",
      priority: route === "" ? 1 : route.includes("terms") || route.includes("refunds") ? 0.3 : 0.85,
    };
  });

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
      const url = `${siteUrl}/b/${slug}`;
      if (seen.has(url)) continue;
      seen.add(url);
      entries.push({
        url,
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
