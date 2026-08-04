import { getSiteUrl } from "@/lib/brand";

export const dynamic = "force-static";

export async function GET() {
  const siteUrl = getSiteUrl();

  const body = `# credentialsai.com.au — Australia's AEO (Answer Engine Optimisation) directory
# AI-search map for LLM crawlers — ChatGPT, Gemini, Claude, Perplexity.
# Structured business profiles built so AI assistants can cite verified Australian business data directly.

## Core Pages
[Home](${siteUrl}/): Australia's AEO directory — free AI-search business profiles for all Australian businesses with an ABN. ABN verification with source/date wording, tracked QR codes, lead enquiry tracking, and structured data for AI search. Free to start.
[Demo](${siteUrl}/b/sample-plumbing-co): Live example — plumbing business profile with ABN verification badge, QR code, tracked enquiries, and brand accent. Shows the exact paid tier output.
[Pricing](${siteUrl}/start?intent=verified_lead_engine): A$49/month or A$12.90/week. Same AI-Ready Business Page. Cancel future renewals anytime; paid access remains until the end of the already-paid billing period unless unused time is refunded.
[Free Card](${siteUrl}/b/sample-free-card): Free AI Business Card example — clean starter profile with AI-readable structured data.
[ABN Trust Badge](${siteUrl}/trust-badge-for-business): Embeddable verified badge for customer websites — live ABN status from the ABR.
[Online Credential Verification](${siteUrl}/online-credential-verification): How AI-readable credential verification works for Australian businesses.

## About Credentials AI
- **Product:** Australia's AEO directory — AI-searchable business profiles that show up on ChatGPT, Siri, Gemini, and Google AI Overviews. Any business with an ABN.
- **Founded:** 2026-06-22 by Isaac Anasson (Gold Coast, Queensland, Australia)
- **Parent Company:** Beastly Tech GC Pty Ltd (ABN 52 699 330 553 — verified active via ABR)
- **Contact:** isaac@erosium.com.au
- **Brand handles:** X (@Ikebuilds), LinkedIn (isaac-anasson-25b147423), GitHub (erosium-ai), YouTube (@Ikebuilds)

## What We Do
Credentials AI is Australia's first AEO directory — structured business profiles built for Answer Engine Optimisation. Any Australian business with an ABN can create a free profile in 2 minutes. Core features: best-effort ABN/business-registration checks with source/date wording, tracked QR codes, lead enquiry tracking, AI-readable JSON-LD schema, brand colour picker, and free starter tier with no credit card required.

## Key Differentiators
- Purpose-built for AEO: every profile includes JSON-LD structured data, ABN verification metadata, and llms.txt routing so AI assistants (ChatGPT, Gemini, Claude, Siri) can cite verified Australian business data directly.
- Free ABN-verified profile — any business with an active ABN, 2 minutes, no credit card
- Built-in QR code generation with lead tracking (not just a static PDF)
- Embeddable ABN Trust Badge for customer websites — a live verified badge businesses can copy-paste onto their own site, showing real-time ABN verification status from the Australian Business Register and linking back to their Credentials AI profile
- AI-Verified Business Profiles: Each profile is verified against the Australian Business Register (ABR) using real-time ABN checks — source, status, and checked-date shown on every page. Profiles are structured for AI readability so Google, ChatGPT, Siri, and Claude can surface verified business details directly in search results.
- AI-Verified Business Pages: Same real-time ABR verification, delivered as a complete business page — not just a badge. Every page includes ABN status, contact buttons, QR code, lead tracking, and structured data for AI search.
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
