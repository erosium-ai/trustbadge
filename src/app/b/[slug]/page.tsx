/* 🔑 Keywords: Credentials AI V2 public business profile, /b/[slug], AI Business Card (free), AI-Ready Business Page (paid), emerald verified accent, ABN-only verification, glassmorphism */

import { notFound } from "next/navigation";
import { LeadCapturePanel } from "@/components/profiles/LeadCapturePanel";
import { getBusinessProfileBySlug, getPublicBadgeData } from "@/lib/trustbadge";
import { getSiteUrl, BRAND_NAME } from "@/lib/brand";
import { schemaTypeFor } from "@/lib/business-types";
import { getFounderBundleUrl } from "@/components/marketing/urls";
import { AiParticles } from "@/components/AiParticles";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

function getSampleProfile() {
  return {
    slug: "sample-plumbing-co",
    business_name: "Coastal Plumbing Co",
    description:
      "Proudly servicing the Gold Coast. Emergency repairs, hot water systems and gas fitting — fast, tidy and measured.",
    phone: "0400 000 000",
    email: "hello@coastalplumbingco.com.au",
    website: "https://credentialsai.com.au",
    suburb: "Burleigh Heads",
    state: "QLD",
    postcode: "4220",
    service_areas: ["Burleigh Heads", "Varsity Lakes", "Mermaid Beach", "Robina"],
    services: [
      { name: "Emergency Repairs", description: "Burst pipes, leaks and urgent callouts — same-day where possible." },
      { name: "Hot Water", description: "Electric and gas hot water troubleshooting, repairs and replacement." },
      { name: "Gas Fitting", description: "Safe gas installs and repairs for homes and small business." },
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
          question: "What does ABN Verified mean here?",
          answer: "Sample wording only. Real Credentials AI pages show the ABN check against the Australian Business Register and when it was done.",
        },
      ],
    },
  };
}

function getSampleFreeProfile() {
  return {
    slug: "sample-free-card",
    business_name: "Gold Coast Flow Plumbing",
    description: "Blocked drains and general plumbing across the southern Gold Coast.",
    phone: "0400 111 111",
    email: "hello@gcflowplumbing.com.au",
    website: null,
    suburb: "Burleigh Heads",
    state: "QLD",
    postcode: "4220",
    service_areas: ["Burleigh Heads", "Varsity Lakes", "Palm Beach"],
    services: [
      { name: "Blocked drains" },
      { name: "Tap and toilet repairs" },
      { name: "General plumbing" },
    ],
    plan: "free",
    abn: "98 765 432 109",
    status: "active",
    verification_status: "verified",
    metadata: {
      sample_profile: true,
      business_type: "plumber",
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

    if (!item || typeof item !== "object") continue;

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

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const second = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + second).toUpperCase() || "?";
}

function isPremiumPlan(plan?: string | null): boolean {
  const normalized = String(plan ?? "").toLowerCase();
  return ["founding_member", "founding", "pro", "paid", "verified_lead_engine"].includes(normalized);
}

// ---------------------------------------------------------------------------
// TrustBadge shield — emerald accent on paid pages, cyan on free cards.
// State driven by verification_status. Never a fake verified look.
// ---------------------------------------------------------------------------

function VerificationShield({ verified, href, tone }: { verified: boolean; href?: string | null; tone: "paid" | "free" }) {
  const inner = (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-3xl border ${
          verified
            ? tone === "paid"
              ? "ai-shield-pulse-paid border-emerald-300/40 bg-emerald-300/12 text-emerald-100"
              : "ai-shield-pulse border-cyan-300/40 bg-cyan-300/12 text-cyan-100"
            : "border-slate-400/25 bg-white/7 text-slate-300"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10" aria-hidden>
          <path d="M12 3l7 3v5c0 4.6-2.9 8.8-7 10-4.1-1.2-7-5.4-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" />
          {verified ? (
            <path d="M8.5 12.2l2.1 2.1 4.9-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          )}
        </svg>
      </div>
      <span
        className={`text-[11px] font-black uppercase tracking-[0.22em] ${
          verified ? (tone === "paid" ? "text-emerald-200" : "text-cyan-200") : "text-slate-400"
        }`}
      >
        {verified ? "ABN verified" : "Verification pending"}
      </span>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="transition-transform hover:scale-105" aria-label="See what was checked and when">
        {inner}
      </a>
    );
  }
  return inner;
}

// ---------------------------------------------------------------------------
// Upgrade preview — baked into the free AI Business Card. Shows the real
// AI-Ready Business Page look (emerald accent) the owner is missing.
// ---------------------------------------------------------------------------

function UpgradePreview({ businessName }: { businessName: string }) {
  const upgradeUrl = getFounderBundleUrl("free_card_upgrade_preview");
  return (
    <section className="ai-glass mt-8 overflow-hidden rounded-[2rem] p-5 text-white sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">Upgrade preview</p>
      <div className="mt-4 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Want it to look like this?</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Upgrade {businessName} from the free AI Business Card to the full AI-Ready Business Page: premium
            AI-style design, ABN-backed TrustBadge, services and about sections, enquiry form, and call, email
            and quote tracking with a weekly summary.
          </p>
          <p className="mt-4 text-sm font-bold text-white">
            $49/month or $12.90/week
            <span className="mt-1 block text-xs font-semibold text-slate-400">
              Same product. Choose weekly or monthly. Cancel anytime.
            </span>
          </p>
          <a
            href={upgradeUrl}
            className="ai-glow-button-paid mt-5 inline-flex rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
          >
            Start AI-Ready Page
          </a>
        </div>
        <div className="overflow-hidden rounded-[1.5rem] border border-emerald-300/20 bg-[#04120f] p-4">
          <div className="relative h-24 rounded-2xl bg-gradient-to-br from-emerald-400/25 via-cyan-400/15 to-transparent">
            <div className="ai-shield-pulse-paid absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/40 bg-emerald-300/12 text-emerald-100">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                <path d="M12 3l7 3v5c0 4.6-2.9 8.8-7 10-4.1-1.2-7-5.4-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8.5 12.2l2.1 2.1 4.9-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {["Services", "About", "Enquiry form"].map((label) => (
              <div key={label} className="rounded-2xl border border-emerald-300/15 bg-white/7 p-3 text-center">
                <p className="text-[11px] font-black text-emerald-100">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-2xl border border-emerald-300/15 bg-white/7 p-3">
            <p className="text-[11px] font-black text-emerald-100">Lead proof — calls, quotes and sources tracked</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function PublicBusinessProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const normalizedSlug = slug.trim().toLowerCase();
  const samplePaidRequested = normalizedSlug === "sample-plumbing-co";
  const sampleFreeRequested = normalizedSlug === "sample-free-card";
  const profile =
    (await getBusinessProfileBySlug(slug)) ??
    (samplePaidRequested ? getSampleProfile() : sampleFreeRequested ? getSampleFreeProfile() : null);

  if (!profile) notFound();

  const serviceAreas = toStringArray(profile.service_areas);
  const services = toServiceList(profile.services);
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/b/${profile.slug}`;
  const isVerified = (profile as { verification_status?: string }).verification_status === "verified";
  const premium = isPremiumPlan(profile.plan) || samplePaidRequested;
  const isSample = samplePaidRequested || sampleFreeRequested;

  let badgeUrl: string | null = null;
  try {
    const badge = await getPublicBadgeData(profile.slug);
    if (badge.trustbadge) badgeUrl = `/badge/${profile.slug}`;
  } catch {
    badgeUrl = null;
  }

  const meta = profile.metadata && typeof profile.metadata === "object" ? (profile.metadata as Record<string, unknown>) : {};
  const businessType = typeof meta.business_type === "string" ? meta.business_type : null;
  const gbpUrl = typeof meta.google_business_profile_url === "string" && meta.google_business_profile_url ? meta.google_business_profile_url : null;
  const faqs = Array.isArray(meta.faqs)
    ? (meta.faqs as Array<{ question?: string; answer?: string }>)
        .map((f) => ({ question: String(f?.question ?? "").trim().slice(0, 180), answer: String(f?.answer ?? "").trim().slice(0, 1000) }))
        .filter((f) => f.question && f.answer)
        .slice(0, 8)
    : [];

  const socialSource = (profile as { social_links?: unknown }).social_links;
  const socialLinks = socialSource && typeof socialSource === "object"
    ? Object.values(socialSource as Record<string, unknown>).filter((v): v is string => typeof v === "string" && v.startsWith("http"))
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
    address: profile.suburb ? { "@type": "PostalAddress", addressLocality: profile.suburb, addressRegion: profile.state || undefined, postalCode: profile.postcode || undefined, addressCountry: "AU" } : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    makesOffer: services.map((service) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: service.name, description: service.description || undefined },
      price: service.price || undefined,
      priceCurrency: service.price ? "AUD" : undefined,
    })),
  };

  const locationLine = [profile.suburb, profile.state].filter(Boolean).join(", ");

  // -------------------------------------------------------------------------
  // PAID — AI-Ready Business Page. Full-screen dark environment, verified
  // emerald/cyan accent system. Distinct from homepage and free card.
  // -------------------------------------------------------------------------
  if (premium) {
    return (
      <div className="ai-v2-bg-paid relative min-h-screen overflow-hidden text-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
        <div className="ai-trust-horizon-paid fixed inset-0" />
        <div className="ai-horizon-line-paid fixed" />
        <div className="ai-aurora-ribbons ai-aurora-ribbons-paid fixed" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </div>
        <AiParticles tone="paid" />
        <main className="relative z-10 mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 sm:pt-10 md:pb-14">
          <header className="ai-glass-paid overflow-hidden rounded-[2rem]">
            <div className="relative p-6 sm:p-10 lg:p-12">
              <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-br from-emerald-400/22 via-cyan-400/14 to-transparent" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-200">
                    AI-Ready Business Page{isSample ? " · Sample data" : ""}
                  </p>
                  <p className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:block">
                    {locationLine ? `Proudly servicing ${profile.suburb ?? locationLine}` : BRAND_NAME}
                  </p>
                </div>
                <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div>
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 flex-none items-center justify-center rounded-3xl border border-emerald-300/25 bg-emerald-300/10 text-xl font-black text-emerald-100">
                        {initialsOf(profile.business_name)}
                      </div>
                      <div>
                        <h1 className="break-words text-4xl font-black tracking-tight text-white sm:text-5xl">
                          {profile.business_name}
                        </h1>
                        <p className="mt-2 text-sm font-semibold text-slate-300">
                          {locationLine}
                          {serviceAreas.length > 0 ? ` · Servicing ${serviceAreas.length} areas` : ""}
                        </p>
                      </div>
                    </div>
                    {profile.description && (
                      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">{profile.description}</p>
                    )}
                    <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
                      {isVerified && (
                        <span className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-3 py-1.5 text-emerald-100">
                          ABN Verified by {BRAND_NAME}
                        </span>
                      )}
                      {profile.abn && (
                        <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-slate-200">
                          ABN {profile.abn}
                        </span>
                      )}
                      <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-cyan-100">
                        Readable by ChatGPT, Google, Claude and Siri
                      </span>
                    </div>
                  </div>
                  <VerificationShield verified={isVerified} href={badgeUrl} tone="paid" />
                </div>
              </div>
            </div>
          </header>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <LeadCapturePanel profileSlug={profile.slug} businessName={profile.business_name} phone={profile.phone} email={profile.email} />

              {services.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {services.map((service) => (
                    <article key={`${service.name}-${service.price ?? ""}`} className="ai-glass-soft rounded-[1.5rem] border-emerald-300/12 p-5">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">Service</p>
                      <h2 className="mt-2 text-lg font-black text-white">{service.name}</h2>
                      {service.description && <p className="mt-2 text-sm leading-relaxed text-slate-300">{service.description}</p>}
                      {service.price && <p className="mt-3 text-sm font-bold text-emerald-200">{service.price}</p>}
                    </article>
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="ai-glass-soft rounded-[2rem] border-emerald-300/12 p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">Lead proof</p>
                <h2 className="mt-3 text-2xl font-black">This page is measured.</h2>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {["Calls", "Quotes", "Sources"].map((label) => (
                    <div key={label} className="rounded-2xl border border-emerald-300/15 bg-white/7 p-3 text-center">
                      <p className="text-lg font-black text-emerald-200">✓</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  Calls, email clicks and quote requests are tracked so the owner sees proof — not just hope.
                </p>
              </div>

              <div className="ai-glass-soft rounded-[2rem] p-5 sm:p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Business details</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  {profile.phone && <div><dt className="text-slate-500">Phone</dt><dd className="font-bold text-white">{profile.phone}</dd></div>}
                  {profile.email && <div><dt className="text-slate-500">Email</dt><dd className="break-words font-bold text-white">{profile.email}</dd></div>}
                  {profile.website && <div><dt className="text-slate-500">Website</dt><dd className="break-words font-bold text-white">{profile.website}</dd></div>}
                </dl>
              </div>

              {serviceAreas.length > 0 && (
                <div className="ai-glass-soft rounded-[2rem] p-5 sm:p-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Service areas</h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {serviceAreas.map((area) => (
                      <li key={area} className="rounded-full border border-emerald-300/15 bg-white/8 px-3 py-1.5 text-xs font-bold text-slate-200">{area}</li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </section>

          {faqs.length > 0 && (
            <section className="ai-glass-soft mt-6 rounded-[2rem] p-5 sm:p-6">
              <script dangerouslySetInnerHTML={{ __html: safeJsonLd({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }) }} type="application/ld+json" />
              <h2 className="text-2xl font-black">Common questions</h2>
              <dl className="mt-5 grid gap-4 md:grid-cols-2">
                {faqs.map((f) => (
                  <div key={f.question} className="rounded-2xl border border-white/10 bg-white/7 p-4">
                    <dt className="text-sm font-black text-white">{f.question}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-slate-300">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <footer className="mt-8 text-center text-sm font-semibold text-slate-400">
            {isVerified ? (
              <>
                ABN Verified by <a href={siteUrl} className="text-emerald-200 hover:underline">{BRAND_NAME}</a>
                <span className="mx-2 text-slate-600">·</span>Backed by official Australian Business Register data
              </>
            ) : (
              <>
                Profile powered by <a href={siteUrl} className="text-emerald-200 hover:underline">{BRAND_NAME}</a> · AI-readable business page
              </>
            )}
          </footer>
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // FREE — AI Business Card. Simpler navy/cyan, restrained glow, compact card
  // feel. Upgrade preview baked into the bottom.
  // -------------------------------------------------------------------------
  return (
    <div className="ai-v2-bg-card relative min-h-screen overflow-hidden text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="ai-trust-horizon-card fixed inset-0" />
      <div className="ai-aurora-ribbons ai-aurora-ribbons-card fixed" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
      <main className="relative mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
        <article className="ai-glass overflow-hidden rounded-[2rem]">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-cyan-400/16 to-transparent" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
                  AI Business Card{isSample ? " · Sample data" : ""}
                </p>
                <VerificationShield verified={isVerified} href={badgeUrl} tone="free" />
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-lg font-black text-white">
                  {initialsOf(profile.business_name)}
                </div>
                <div>
                  <h1 className="break-words text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {profile.business_name}
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-slate-300">{locationLine}</p>
                </div>
              </div>
              {profile.description && <p className="mt-5 text-base leading-relaxed text-slate-300">{profile.description}</p>}
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
                {isVerified && (
                  <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-cyan-100">
                    ABN Verified by {BRAND_NAME}
                  </span>
                )}
                <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-slate-200">
                  Readable by ChatGPT, Google, Claude and Siri
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-6 sm:p-8">
            {services.length > 0 && (
              <ul className="space-y-2">
                {services.map((service) => (
                  <li key={service.name} className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                    <span className="h-1.5 w-1.5 flex-none rounded-full bg-cyan-300" />
                    {service.name}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="ai-glow-button rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-300 px-5 py-3 text-center text-sm font-black text-slate-950 transition hover:-translate-y-0.5">
                  Call now
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="rounded-2xl border border-white/15 bg-white/8 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-white/14">
                  Email
                </a>
              )}
            </div>

            {serviceAreas.length > 0 && (
              <p className="mt-5 text-xs font-semibold text-slate-400">
                Servicing {serviceAreas.join(" · ")}
              </p>
            )}
          </div>
        </article>

        <UpgradePreview businessName={profile.business_name} />

        <footer className="mt-8 text-center text-sm font-semibold text-slate-400">
          {isVerified ? (
            <>
              ABN Verified by <a href={siteUrl} className="text-cyan-200 hover:underline">{BRAND_NAME}</a>
              <span className="mx-2 text-slate-600">·</span>Backed by official Australian Business Register data
            </>
          ) : (
            <>
              Profile powered by <a href={siteUrl} className="text-cyan-200 hover:underline">{BRAND_NAME}</a> · AI-readable business card
            </>
          )}
        </footer>
      </main>
    </div>
  );
}
