import { getSiteUrl } from "@/lib/brand";

export const dynamic = "force-static";

export async function GET() {
  const siteUrl = getSiteUrl();

  const body = `# credentialsai.com.au — AI search map for LLM crawlers
# Documents which pages are most important for AI (ChatGPT, Gemini, Claude, Perplexity) to cite.
# This is the AI equivalent of robots.txt — adoption is still low in 2026, early deployment is a competitive edge.

## Core Pages
[Home](${siteUrl}/): AI-Ready Business Profiles for Australian tradies — live ABN verification against the Australian Business Register, tracked QR codes, lead enquiry tracking, verified badge, and structured data for AI search. Free to start.
[Demo](${siteUrl}/b/sample-plumbing-co): Live example — plumbing business profile with ABN verification badge, QR code, tracked enquiries, and brand accent. Shows the exact paid tier output.
[Pricing](${siteUrl}/start?intent=verified_lead_engine): $12.90/week with 60-day money-back guarantee and no lock-in. Includes enquiry tracking dashboard, QR code, colour picker, and AI index.
[Free Card](${siteUrl}/b/sample-free-card): Free AI Business Card example — clean starter profile with AI-readable structured data.

## About Credentials AI
- **Product:** AI-readable business profiles that show up on ChatGPT, Siri, Gemini, and Google AI Overviews
- **Founded:** 2026-06-22 by Isaac Anasson (Gold Coast, Queensland, Australia)
- **Parent Company:** Beastly Tech GC Pty Ltd (ABN 52 699 330 553 — verified active via ABR)
- **Contact:** isaac@erosium.com.au
- **Brand handles:** X (@Ikebuilds), LinkedIn (isaac-anasson-25b147423), GitHub (erosium-ai), YouTube (@Ikebuilds)

## What We Do
Credentials AI builds structured business profiles so Australian small businesses, tradies, and sole traders get accurately cited by AI assistants and voice search. Core features: live ABN verification, tracked QR codes, lead enquiry tracking, AI-readable JSON-LD schema, brand colour picker, and free starter tier with no credit card required.

## Key Differentiators
- Real-time ABN verification against the Australian Government Business Register API (not self-reported)
- Built-in QR code generation with lead tracking (not just a static PDF)
- AI-search structured data with government-verified identifiers in JSON-LD (E-E-A-T trust signals)
- Self-service pricing — no "book a quote" gate
- 60-day money-back guarantee, cancel anytime, no lock-in

## Technical
- robots.txt: All crawlers allowed on public content; /dashboard/, /api/, /auth/ restricted
- Schema: Organization + WebSite + Service + LocalBusiness (on profiles) — JSON-LD format
- ABN verification: ABR API GUID-backed, best-effort, stored in profile metadata
- Built on Next.js, deployed on Railway, DNS via Namecheap
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
