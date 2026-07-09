/* 🔑 Keywords: public business profile route, /b/[slug], Credentials AI lead profile page, mobile CTA */

import { notFound } from "next/navigation";
import { LeadCapturePanel } from "@/components/profiles/LeadCapturePanel";
import { getBusinessProfileBySlug } from "@/lib/trustbadge";
import { getSiteUrl, BRAND_NAME } from "@/lib/brand";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
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

export default async function PublicBusinessProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const profile = await getBusinessProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  const serviceAreas = toStringArray(profile.service_areas);
  const services = toServiceList(profile.services);
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/b/${profile.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
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
    <div className="mx-auto max-w-4xl px-4 pb-28 pt-8 sm:px-6 sm:pt-12 md:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{BRAND_NAME} profile</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{profile.business_name}</h1>

        {profile.description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{profile.description}</p>
        )}

        <div className="mt-5 flex flex-wrap gap-2 text-xs sm:text-sm">
          <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">Verified profile</span>
          {profile.plan && (
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium capitalize text-slate-700">
              Plan: {profile.plan.replace("_", " ")}
            </span>
          )}
          {profile.abn && (
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">ABN: {profile.abn}</span>
          )}
          {profile.suburb && (
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              {profile.suburb}
              {profile.state ? `, ${profile.state}` : ""}
            </span>
          )}
        </div>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <LeadCapturePanel
            profileSlug={profile.slug}
            businessName={profile.business_name}
            phone={profile.phone}
            email={profile.email}
          />

          {services.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Services</h2>
              <ul className="mt-3 grid gap-3">
                {services.map((service) => (
                  <li key={`${service.name}-${service.price ?? ""}`} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{service.name}</p>
                      {service.price && <span className="text-xs font-medium text-slate-600">{service.price}</span>}
                    </div>
                    {service.description && <p className="mt-1 text-xs text-slate-600">{service.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Contact</h3>
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Service areas</h3>
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
    </div>
  );
}
