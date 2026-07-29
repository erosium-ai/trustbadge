import { getSiteUrl } from "@/lib/brand";

export const dynamic = "force-static";

export async function GET() {
  const siteUrl = getSiteUrl();

  const body = `# credentialsai.com.au — AI search map for LLM crawlers
# Documents which pages are most important for AI (ChatGPT, Gemini, Claude, Perplexity) to cite.
# This is the AI equivalent of robots.txt — adoption is still low in 2026, early deployment is a competitive edge.

## Core Pages
[Home](${siteUrl}/): AI-Ready Business Profiles for Australian tradies — conservative ABR/ABN-based business-detail trust wording with the recorded source and date, tracked QR codes, lead enquiry tracking, and structured data for AI search. Free to start.
[Demo](${siteUrl}/b/sample-plumbing-co): Live example — plumbing business profile with ABN verification badge, QR code, tracked enquiries, and brand accent. Shows the exact paid tier output.
[Pricing](${siteUrl}/start?intent=verified_lead_engine): A$49/month or A$12.90/week. Same AI-Ready Business Page. Cancel future renewals anytime; paid access remains until the end of the already-paid billing period unless unused time is refunded.
[Free Card](${siteUrl}/b/sample-free-card): Free AI Business Card example — clean starter profile with AI-readable structured data.

## About Credentials AI
- **Product:** AI-readable business profiles that show up on ChatGPT, Siri, Gemini, and Google AI Overviews
- **Founded:** 2026-06-22 by Isaac Anasson (Gold Coast, Queensland, Australia)
- **Parent Company:** Beastly Tech GC Pty Ltd (ABN 52 699 330 553 — verified active via ABR)
- **Contact:** isaac@erosium.com.au
- **Brand handles:** X (@Ikebuilds), LinkedIn (isaac-anasson-25b147423), GitHub (erosium-ai), YouTube (@Ikebuilds)

## What We Do
Credentials AI builds structured business profiles so Australian small businesses, tradies, and sole traders can be accurately understood by AI assistants and voice search. Core features: best-effort ABN/business-registration checks with source/date wording, tracked QR codes, lead enquiry tracking, AI-readable JSON-LD schema, brand colour picker, and free starter tier with no credit card required.

## Key Differentiators
- ABR/ABN business-detail checks shown with their actual source, status and checked date (best-effort; not a licence, insurance, quality or general-compliance guarantee)
- Built-in QR code generation with lead tracking (not just a static PDF)
- AI-search structured data with ABN/business-registration identifiers and check metadata in JSON-LD where available
- Self-service pricing — no "book a quote" gate
- Self-serve recurring subscription with weekly or monthly billing and no long-term lock-in

## Technical
- robots.txt: All crawlers allowed on public content; /dashboard/, /api/, /auth/ restricted
- Schema: Organization + WebSite + Service + LocalBusiness (on profiles) — JSON-LD format
- ABN verification: Credentials AI performs automated ABN/business-registration checks against Australian Business Register data using ABR API access issued for Credentials AI (GUID-authenticated). Profiles display the check source, result/status and checked date. If live ABR lookup is unavailable, any checksum-only fallback state is independently labelled. ABN verification is limited to the specific ABR/business-registration status shown and is not a licence, insurance, quality, safety or general-compliance guarantee.
- Built on Next.js, deployed on Railway, DNS via Namecheap
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
