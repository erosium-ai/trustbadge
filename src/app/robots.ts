import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/brand";

// 🔑 Keywords: robots.txt, AI crawler welcome mat, GPTBot, ClaudeBot, PerplexityBot
// v1.1 "welcome mat": named allow groups for the major AI crawlers so profiles
// are explicitly readable by AI systems. IMPORTANT: named groups OVERRIDE the
// wildcard for that bot, so every group must repeat the disallow list.

const DISALLOW = ["/dashboard/", "/admin/", "/welcome", "/api/"];

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Bingbot",
  "Applebot-Extended",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      // Explicit welcome mat for AI crawlers (same rules as everyone, stated
      // by name so future bot-specific defaults never lock them out).
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
