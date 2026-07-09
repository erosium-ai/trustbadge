import { getSiteUrl } from "@/lib/brand";

export const dynamic = "force-static";

export async function GET() {
  const siteUrl = getSiteUrl();

  const body = `# Credentials AI

> AI-readable websites and online credential verification for local businesses.

Credentials AI helps local businesses create structured AI-readable business profiles and verified TrustBadge pages so customers and AI systems can understand services, service areas, contact details, ABN/business registration, licences, insurance, and other trust proof.

## Core pages

- Homepage: ${siteUrl}/
- AI-readable websites: ${siteUrl}/ai-readable-websites
- Online credential verification: ${siteUrl}/online-credential-verification
- Trust badge for business: ${siteUrl}/trust-badge-for-business

## Products

- Free AI Profile: an AI-readable business profile for local businesses.
- Founding Member Verified Lead Engine: paid Credentials AI subscription for verified business lead profiles, TrustBadge verification, tracked calls, quote requests, source attribution, and weekly proof reporting.
- TrustBadge Verification: customer-facing online credential verification for ABN/business registration, licences, insurance, compliance documents, first aid, and safety credentials where applicable.

## Main topics

- AI-readable websites
- AI-readable business profiles
- AI search visibility for local business
- Online credential verification
- Verified business credentials
- Business trust badges
- ABN verification
- Licence and insurance verification for tradies
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
