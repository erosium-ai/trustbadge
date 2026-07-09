"use client";

/* 🔑 Keywords: admin leads dashboard, tracked lead events, lead engine reporting, quote_form readout */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Lead {
  id: string;
  slug: string;
  business_name: string;
  tagline?: string | null;
  description?: string | null;
  creator_email?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  website_url?: string | null;
  location_address?: string | null;
  brand_color?: string | null;
  created_at: string;
  updated_at?: string | null;
  services?: Array<{ name: string; price?: string; description?: string }> | null;
  social_links?: {
    facebook?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
  } | null;
}

interface TrackedLead {
  id: string;
  type: string;
  status: string;
  source?: string | null;
  referrer?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  suburb?: string | null;
  service_needed?: string | null;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
  business_profile?: {
    slug?: string | null;
    business_name?: string | null;
    plan?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
}

interface TrackedLeadSummary {
  total: number;
  quoteForm: number;
  callClick: number;
  emailClick: number;
  newStatus: number;
}

type HasEmailFilter = "all" | "yes" | "no";
type LeadTypeFilter =
  | "all"
  | "quote_form"
  | "call_click"
  | "email_click"
  | "quote_form_open"
  | "booking_click"
  | "qr_scan"
  | "badge_click";
type LeadStatusFilter = "all" | "new" | "contacted" | "quoted" | "won" | "lost" | "spam";

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const dt = new Date(iso);
  return `${dt.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  })} ${dt.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function toCellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [trackedLeads, setTrackedLeads] = useState<TrackedLead[]>([]);
  const [trackedSummary, setTrackedSummary] = useState<TrackedLeadSummary>({
    total: 0,
    quoteForm: 0,
    callClick: 0,
    emailClick: 0,
    newStatus: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [hasEmail, setHasEmail] = useState<HasEmailFilter>("all");
  const [daysBack, setDaysBack] = useState<string>("9999");
  const [leadType, setLeadType] = useState<LeadTypeFilter>("all");
  const [leadStatus, setLeadStatus] = useState<LeadStatusFilter>("all");

  useEffect(() => {
    void fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchLeads() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        search,
        hasEmail,
        daysBack,
        leadType,
        leadStatus,
        limit: "1000",
      });

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load leads");

      setLeads((json.leads ?? []) as Lead[]);
      setTrackedLeads((json.trackedLeads ?? []) as TrackedLead[]);
      setTrackedSummary(
        (json.trackedLeadSummary ?? {
          total: 0,
          quoteForm: 0,
          callClick: 0,
          emailClick: 0,
          newStatus: 0,
        }) as TrackedLeadSummary
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const filteredSchemaLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (q) {
        const hay = `${lead.business_name} ${lead.slug} ${lead.location_address || ""} ${lead.creator_email || ""} ${lead.contact_email || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (hasEmail === "yes" && !lead.creator_email) return false;
      if (hasEmail === "no" && lead.creator_email) return false;
      return true;
    });
  }, [leads, search, hasEmail]);

  const filteredTrackedLeads = useMemo(() => {
    return trackedLeads.filter((lead) => {
      if (leadType !== "all" && lead.type !== leadType) return false;
      if (leadStatus !== "all" && lead.status !== leadStatus) return false;
      return true;
    });
  }, [trackedLeads, leadType, leadStatus]);

  function exportSchemaCSV() {
    const rows = filteredSchemaLeads.map((l) => ({
      business_name: l.business_name,
      slug: l.slug,
      creator_email: l.creator_email || "",
      contact_email: l.contact_email || "",
      contact_phone: l.contact_phone || "",
      website_url: l.website_url || "",
      location_address: l.location_address || "",
      created_at: l.created_at,
      num_services: l.services?.length ?? 0,
    }));

    const headers = [
      "business_name",
      "slug",
      "creator_email",
      "contact_email",
      "contact_phone",
      "website_url",
      "location_address",
      "created_at",
      "num_services",
    ];

    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => {
            const val = toCellText((r as Record<string, unknown>)[h]);
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schema-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportTrackedCSV() {
    const rows = filteredTrackedLeads.map((lead) => ({
      created_at: lead.created_at,
      business_name: lead.business_profile?.business_name || "",
      profile_slug: lead.business_profile?.slug || "",
      type: lead.type,
      status: lead.status,
      source: lead.source || "",
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      suburb: lead.suburb || "",
      service_needed: lead.service_needed || "",
      message: lead.message || "",
    }));

    const headers = [
      "created_at",
      "business_name",
      "profile_slug",
      "type",
      "status",
      "source",
      "name",
      "email",
      "phone",
      "suburb",
      "service_needed",
      "message",
    ];

    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => {
            const val = toCellText((r as Record<string, unknown>)[h]);
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tracked-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // ignore
    }
  }

  const stats = useMemo(() => {
    const withEmail = leads.filter((l) => l.creator_email).length;
    const withoutEmail = leads.length - withEmail;

    return {
      schemaTotal: leads.length,
      withEmail,
      withoutEmail,
      trackedTotal: trackedSummary.total,
      trackedQuote: trackedSummary.quoteForm,
      trackedCalls: trackedSummary.callClick,
      trackedEmails: trackedSummary.emailClick,
      trackedNew: trackedSummary.newStatus,
    };
  }, [leads, trackedSummary]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lead Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            SchemaPage creators + Credentials AI tracked lead events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/review/history"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Review history
          </Link>
          <button
            onClick={exportSchemaCSV}
            disabled={filteredSchemaLeads.length === 0}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Export schema leads ({filteredSchemaLeads.length})
          </button>
          <button
            onClick={exportTrackedCSV}
            disabled={filteredTrackedLeads.length === 0}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Export tracked events ({filteredTrackedLeads.length})
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Schema leads</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.schemaTotal}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">With email</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{stats.withEmail}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Missing email</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{stats.withoutEmail}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tracked total</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.trackedTotal}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quote forms</p>
          <p className="mt-1 text-2xl font-bold text-brand-700">{stats.trackedQuote}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Call clicks</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.trackedCalls}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email clicks</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.trackedEmails}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">New status</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{stats.trackedNew}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="min-w-[16rem] flex-1">
          <label className="mb-1 block text-xs font-semibold text-slate-700">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Business, slug, location, email, lead message..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Has email</label>
          <select
            value={hasEmail}
            onChange={(e) => setHasEmail(e.target.value as HasEmailFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All</option>
            <option value="yes">Yes — with email</option>
            <option value="no">No — missing email</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Lead type</label>
          <select
            value={leadType}
            onChange={(e) => setLeadType(e.target.value as LeadTypeFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All types</option>
            <option value="quote_form">Quote form</option>
            <option value="call_click">Call click</option>
            <option value="email_click">Email click</option>
            <option value="quote_form_open">Quote form open</option>
            <option value="booking_click">Booking click</option>
            <option value="qr_scan">QR scan</option>
            <option value="badge_click">Badge click</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Lead status</label>
          <select
            value={leadStatus}
            onChange={(e) => setLeadStatus(e.target.value as LeadStatusFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
            <option value="spam">Spam</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Last</label>
          <select
            value={daysBack}
            onChange={(e) => setDaysBack(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="9999">All time</option>
            <option value="1">24 hours</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => void fetchLeads()}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading leads...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">SchemaPage creator leads</h2>

            {filteredSchemaLeads.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                No SchemaPage leads match your filters.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Business</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Creator email</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Contact</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Location</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Created</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSchemaLeads.map((lead) => {
                      const schemaPageUrl = `https://schemapage-production.up.railway.app/${lead.slug}`;
                      return (
                        <tr key={lead.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{lead.business_name}</div>
                            <div className="text-xs text-slate-500">/{lead.slug}</div>
                          </td>
                          <td className="px-4 py-3">
                            {lead.creator_email ? (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-700">{lead.creator_email}</span>
                                <button
                                  onClick={() => void copyEmail(lead.creator_email!)}
                                  className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600 hover:bg-slate-300"
                                  title="Copy"
                                >
                                  Copy
                                </button>
                              </div>
                            ) : (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                No email
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-0.5">
                              {lead.contact_phone && <div className="text-slate-700">{lead.contact_phone}</div>}
                              {lead.website_url && (
                                <a
                                  href={lead.website_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-brand-600 hover:underline"
                                >
                                  website
                                </a>
                              )}
                              {lead.contact_email && lead.contact_email !== lead.creator_email && (
                                <div className="text-xs text-slate-500">biz: {lead.contact_email}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {lead.location_address || <span className="text-slate-400">—</span>}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDateTime(lead.created_at)}</td>
                          <td className="px-4 py-3">
                            <a
                              href={schemaPageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              View page
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Tracked lead events (Lead Engine v1)</h2>

            {filteredTrackedLeads.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                No tracked lead events match current filters.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">When</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Business</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Contact</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Details</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTrackedLeads.map((lead) => {
                      const profileSlug = lead.business_profile?.slug || null;
                      const profileUrl = profileSlug ? `/b/${profileSlug}` : null;

                      return (
                        <tr key={lead.id} className="hover:bg-slate-50/60">
                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDateTime(lead.created_at)}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">
                              {lead.business_profile?.business_name || "Unknown business"}
                            </div>
                            {profileSlug && <div className="text-xs text-slate-500">/{profileSlug}</div>}
                            {profileUrl && (
                              <a
                                href={profileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 inline-block text-xs text-brand-600 hover:underline"
                              >
                                View profile
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                              {lead.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                lead.status === "new"
                                  ? "bg-red-100 text-red-700"
                                  : lead.status === "won"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            <div className="space-y-0.5">
                              {lead.name && <div>{lead.name}</div>}
                              {lead.phone && <div className="text-xs">{lead.phone}</div>}
                              {lead.email && <div className="text-xs">{lead.email}</div>}
                              {lead.suburb && <div className="text-xs text-slate-500">{lead.suburb}</div>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            <div className="max-w-[20rem] space-y-1">
                              {lead.service_needed && <div className="text-xs">Service: {lead.service_needed}</div>}
                              {lead.message && <div className="line-clamp-3 text-xs text-slate-600">{lead.message}</div>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            <div>{lead.source || "(unknown)"}</div>
                            {lead.referrer && <div className="line-clamp-2 text-slate-500">{lead.referrer}</div>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="mt-4 text-xs text-slate-500">
            Showing {filteredSchemaLeads.length} schema leads and {filteredTrackedLeads.length} tracked lead events.
          </div>
        </>
      )}
    </div>
  );
}
