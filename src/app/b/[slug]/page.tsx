/* 🔑 Keywords: public business profile route, /b/[slug], credential certificate design, Ink and Sunset, verified seal, mobile CTA */

// v1.1 "credential certificate" redesign (2026-07-10):
// - Ink gradient letterhead band with embossed TrustBadge seal (top-right)
// - Seal state is DRIVEN BY verification_status — pending profiles get a grey
//   seal, never a fake verified look (no-overclaim rule applies to pixels)
// - Cream certificate body, hairline dividers, floating cards
// - Footer signature line: "Verified by Credentials AI" + link
// - JSON-LD escaped against </script> injection

import { notFound } from "next/navigation";
import { LeadCapturePanel } from "@/components/profiles/LeadCapturePanel";
import { getBusinessProfileBySlug, getPublicBadgeData } from "@/lib/trustbadge";
import { getSiteUrl, BRAND_NAME } from "@/lib/brand";
import { schemaTypeFor, textureFor } from "@/lib/business-types";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

function getSampleProfile() {
  return {
    slug: "sample-plumbing-co",
    business_name: "Sample Plumbing Co",
    description:
      "Sample profile for Credentials AI demo. Fast plumbing repairs across Burleigh and nearby suburbs.",
    phone: "0400 000 000",
    email: "hello@sampleplumbingco.com.au",
    website: "https://credentialsai.com.au",
    suburb: "Burleigh Heads",
    state: "QLD",
    postcode: "4220",
    service_areas: ["Burleigh Heads", "Varsity Lakes", "Mermaid Beach", "Robina"],
    services: [
      { name: "Blocked drains", description: "Jet blasting, camera inspections, same-day service." },
      { name: "Hot water repairs", description: "Electric and gas hot water troubleshooting and replacement." },
      { name: "Emergency plumbing", description: "Burst pipes, leaks and urgent callouts." },
    ],
    plan: "founding_member",
    abn: "12 345 678 901",
    status: "active",
    verification_status: "verified",
    metadata: {
      sample_profile: true,
      business_type: "plumber",
      faqs: [
        {
          question: "Which areas do you service?",
          answer: "Burleigh Heads, Varsity Lakes, Mermaid Beach and Robina — same-day where possible.",
        },
        {
          question: "Are you licensed and insured?",
          answer: "Yes — QBCC licensed and fully insured for residential and commercial work.",
        },
      ],
    },
  };
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function toServiceList(value: unknown): Array<{ name: string; description?: string | null; price?: string | null }> {
  if (!Array.isArray(value)) return [];

  const services: Array<{ name: string; description?: string | null; price?: string | null }> = [];

  for (const item of value) {
    if (typeof item === "string") {
      const name = item.trim();
      if (name) services.push({ name });
      continue;
    }

    if (!item || typeof item !== "object") {
      continue;
    }

    const row = item as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name.trim() : "";
    if (!name) continue;

    services.push({
      name,
      description: typeof row.description === "string" ? row.description : null,
      price: typeof row.price === "string" ? row.price : null,
    });
  }

  return services;
}

/** Escape JSON-LD so user content can never break out of the script tag. */
function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const second = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + second).toUpperCase() || "?";
}

// ---------------------------------------------------------------------------
// Verification seal — state driven by verification_status. Grey when pending.
// ---------------------------------------------------------------------------

function VerificationSeal({ verified, href }: { verified: boolean; href?: string | null }) {
  const seal = (
    <div
      className="flex flex-col items-center gap-1.5"
      title={
        verified
          ? href
            ? "Verified by Credentials AI — click to see what was checked and when"
            : "Verified by Credentials AI"
          : "Verification pending"
      }
    >
      <div
        className={`relative flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20 ${
          verified
            ? "bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700"
            : "bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700"
        }`}
        style={{
          boxShadow: verified
            ? "var(--shadow-emboss), var(--shadow-seal-glow)"
            : "var(--shadow-emboss)",
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10 sm:h-[3.75rem] sm:w-[3.75rem]">
          {verified ? (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white sm:h-7 sm:w-7" aria-hidden>
              <path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white/80 sm:h-7 sm:w-7" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </div>
      <span
        className={`text-[10px] font-semibold uppercase tracking-widest ${
          verified ? "text-emerald-300" : "text-slate-400"
        }`}
      >
        {verified ? "Verified" : "Pending"}
      </span>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="transition-transform hover:scale-105"
        aria-label="See what was checked and when"
      >
        {seal}
      </a>
    );
  }
  return seal;
}

export default async function PublicBusinessProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const normalizedSlug = slug.trim().toLowerCase();
  const sampleProfileRequested = normalizedSlug === "sample-plumbing-co";
  const profile = (await getBusinessProfileBySlug(slug)) ?? (sampleProfileRequested ? getSampleProfile() : null);

  if (!profile) {
    notFound();
  }

  const serviceAreas = toStringArray(profile.service_areas);
  const services = toServiceList(profile.services);
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/b/${profile.slug}`;
  const isVerified =
    (profile as { verification_status?: string }).verification_status === "verified";

  // Public verification page link — only when a real badge record exists
  // (never link to a 404; the copy promises clickable proof, so the click
  // must always land on an actual verification page).
  let badgeUrl: string | null = null;
  try {
    const badge = await getPublicBadgeData(profile.slug);
    if (badge.trustbadge) {
      badgeUrl = `/badge/${profile.slug}`;
    }
  } catch {
    badgeUrl = null;
  }

  // v1.1: business type + GBP link + FAQs ride in metadata (no migration).
  const meta =
    profile.metadata && typeof profile.metadata === "object"
      ? (profile.metadata as Record<string, unknown>)
      : {};
  const businessType = typeof meta.business_type === "string" ? meta.business_type : null;
  const gbpUrl =
    typeof meta.google_business_profile_url === "string" && meta.google_business_profile_url
      ? meta.google_business_profile_url
      : null;
  const faqs = Array.isArray(meta.faqs)
    ? (meta.faqs as Array<{ question?: string; answer?: string }>)
        .map((f) => ({
          question: String(f?.question ?? "").trim().slice(0, 180),
          answer: String(f?.answer ?? "").trim().slice(0, 1000),
        }))
        .filter((f) => f.question && f.answer)
        .slice(0, 8)
    : [];
  const headerTexture = textureFor(businessType);

  const socialSource = (profile as { social_links?: unknown }).social_links;
  const socialLinks =
    socialSource && typeof socialSource === "object"
      ? Object.values(socialSource as Record<string, unknown>).filter(
          (v): v is string => typeof v === "string" && v.startsWith("http")
        )
      : [];
  const sameAs = [...(gbpUrl ? [gbpUrl] : []), ...socialLinks];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": schemaTypeFor(businessType),
    "@id": canonicalUrl,
    name: profile.business_name,
    description: profile.description || undefined,
    telephone: profile.phone || undefined,
    email: profile.email || undefined,
    url: canonicalUrl,
    areaServed: serviceAreas.length > 0 ? serviceAreas : undefined,
    address: profile.suburb
      ? {
          "@type": "PostalAddress",
          addressLocality: profile.suburb,
          addressRegion: profile.state || undefined,
          postalCode: profile.postcode || undefined,
          addressCountry: "AU",
        }
      : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    makesOffer: services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.description || undefined,
      },
      price: service.price || undefined,
      priceCurrency: service.price ? "AUD" : undefined,
    })),
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-4xl px-4 pb-28 pt-6 sm:px-6 sm:pt-10 md:pb-12">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

        {/* ── Certificate letterhead ──────────────────────────────────── */}
        <header className="ink-gradient card-float relative overflow-hidden rounded-2xl">
          {headerTexture && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.14]"
              style={{ backgroundImage: headerTexture, backgroundRepeat: "repeat" }}
            />
          )}
          <div className="relative p-6 sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {BRAND_NAME} · Business profile
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <div
                    className="hidden h-14 w-14 flex-none items-center justify-center rounded-xl bg-white/10 text-xl font-bold text-white sm:flex"
                    aria-hidden
                  >
                    {initialsOf(profile.business_name)}
                  </div>
                  <h1 className="break-words text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {profile.business_name}
                  </h1>
                </div>
                {profile.suburb && (
                  <p className="mt-2 text-sm font-medium text-slate-300">
                    {profile.suburb}
                    {profile.state ? `, ${profile.state}` : ""}
                    {serviceAreas.length > 0 ? ` · Servicing ${serviceAreas.length} areas` : ""}
                  </p>
                )}
              </div>
              <div className="flex-none">
                <VerificationSeal verified={isVerified} href={badgeUrl} />
              </div>
            </div>

            {profile.description && (
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                {profile.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              {sampleProfileRequested && (
                <span className="rounded-full bg-sunset/20 px-3 py-1 font-medium text-orange-200">Sample data</span>
              )}
              {profile.abn && (
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-medium text-slate-300">
                  ABN {profile.abn}
                </span>
              )}
              {isVerified ? (
                badgeUrl ? (
                  <a
                    href={badgeUrl}
                    className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-medium text-emerald-300 underline-offset-2 hover:underline"
                  >
                    Credentials verified — see what was checked →
                  </a>
                ) : (
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-medium text-emerald-300">
                    Credentials verified
                  </span>
                )
              ) : (
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-medium text-slate-400">
                  Verification in progress
                </span>
              )}
            </div>
          </div>
          <div className="relative h-1 w-full bg-gradient-to-r from-sunset via-sunset-deep to-transparent" aria-hidden />
        </header>

        {/* ── Certificate body ────────────────────────────────────────── */}
        <section className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <LeadCapturePanel
              profileSlug={profile.slug}
              businessName={profile.business_name}
              phone={profile.phone}
              email={profile.email}
            />

            {services.length > 0 && (
              <div className="card-float rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900">Services</h2>
                <div className="mt-1 h-px w-10 bg-sunset" aria-hidden />
                <ul className="mt-4 grid gap-3">
                  {services.map((service) => (
                    <li
                      key={`${service.name}-${service.price ?? ""}`}
                      className="rounded-xl border border-slate-100 bg-cream/60 p-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">{service.name}</p>
                        {service.price && <span className="text-xs font-medium text-slate-600">{service.price}</span>}
                      </div>
                      {service.description && <p className="mt-1 text-xs leading-relaxed text-slate-600">{service.description}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:col-span-2">
            <div className="card-float rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Contact</h3>
              <dl className="mt-3 space-y-3 text-sm">
                {profile.phone && (
                  <div>
                    <dt className="text-slate-500">Phone</dt>
                    <dd className="font-medium text-slate-900">{profile.phone}</dd>
                  </div>
                )}
                {profile.email && (
                  <div>
                    <dt className="text-slate-500">Email</dt>
                    <dd className="break-words font-medium text-slate-900">{profile.email}</dd>
                  </div>
                )}
                {profile.website && (
                  <div>
                    <dt className="text-slate-500">Website</dt>
                    <dd className="break-words font-medium text-slate-900">{profile.website}</dd>
                  </div>
                )}
              </dl>
            </div>

            {serviceAreas.length > 0 && (
              <div className="card-float rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Service areas</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {serviceAreas.map((area) => (
                    <li key={area} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </section>

        {/* ── FAQs (rendered for humans + FAQPage schema for machines) ──── */}
        {faqs.length > 0 && (
          <section className="card-float mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: safeJsonLd({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faqs.map((f) => ({
                    "@type": "Question",
                    name: f.question,
                    acceptedAnswer: { "@type": "Answer", text: f.answer },
                  })),
                }),
              }}
            />
            <h2 className="text-lg font-semibold text-slate-900">Common questions</h2>
            <div className="mt-1 h-px w-10 bg-sunset" aria-hidden />
            <dl className="mt-4 space-y-4">
              {faqs.map((f) => (
                <div key={f.question} className="rounded-xl border border-slate-100 bg-cream/60 p-4">
                  <dt className="text-sm font-semibold text-slate-900">{f.question}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-600">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* ── Certificate signature line ──────────────────────────────── */}
        <footer className="mt-8 flex flex-col items-center gap-1 border-t border-slate-200 pt-6 text-center">
          <p className="text-sm font-medium text-slate-700">
            {isVerified ? "Verified by" : "Profile powered by"}{" "}
            <a href={siteUrl} className="font-semibold text-sunset-deep hover:underline">
              {BRAND_NAME}
            </a>
          </p>
          <p className="text-xs text-slate-400">
            AI-readable business profile · credentialsai.com.au
          </p>
        </footer>
      </div>
    </div>
  );
}
