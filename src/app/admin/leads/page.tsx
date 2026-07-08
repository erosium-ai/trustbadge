"use client";

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
  social_links?: { facebook?: string | null; instagram?: string | null; linkedin?: string | null; twitter?: string | null } | null;
}

type HasEmailFilter = "all" | "yes" | "no";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [hasEmail, setHasEmail] = useState<HasEmailFilter>("all");
  const [daysBack, setDaysBack] = useState<string>("9999");

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load leads");
      setLeads(json.leads ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
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

  function exportCSV() {
    const rows = filtered.map((l) => ({
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

    const headers = ["business_name", "slug", "creator_email", "contact_email", "contact_phone", "website_url", "location_address", "created_at", "num_services"];
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => {
            const val = String((r as Record<string, string | number>)[h] ?? "");
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
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
    return { total: leads.length, withEmail, withoutEmail };
  }, [leads]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lead Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            SchemaPage free page creators — track, filter, and export leads.
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
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Export CSV ({filtered.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total leads</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">With email</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{stats.withEmail}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Missing email</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{stats.withoutEmail}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex-1 min-w-[16rem]">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Business name, slug, location, email..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Has email</label>
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
          <label className="block text-xs font-semibold text-slate-700 mb-1">Last</label>
          <select
            value={daysBack}
            onChange={(e) => {
              setDaysBack(e.target.value);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            title="Filter on API. Click refresh to apply."
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
            onClick={fetchLeads}
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

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No leads match your filters.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
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
              {filtered.map((lead) => {
                const schemaPageUrl = `https://schemapage-production.up.railway.app/${lead.slug}`;
                return (
                  <tr key={lead.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{lead.business_name}</div>
                      <div className="text-xs text-slate-500">/{lead.slug}</div>
                      {lead.services && lead.services.length > 0 && (
                        <div className="mt-1 text-xs text-slate-500">
                          {lead.services.length} service{lead.services.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {lead.creator_email ? (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700">{lead.creator_email}</span>
                          <button
                            onClick={() => copyEmail(lead.creator_email!)}
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
                        {lead.contact_phone && (
                          <div className="text-slate-700">{lead.contact_phone}</div>
                        )}
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
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {new Date(lead.created_at).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                      })}{" "}
                      <span className="text-xs text-slate-400">
                        {new Date(lead.created_at).toLocaleTimeString("en-AU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={schemaPageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View page
                        </a>
                        {lead.social_links?.facebook && (
                          <a
                            href={lead.social_links.facebook}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            FB
                          </a>
                        )}
                        {lead.social_links?.instagram && (
                          <a
                            href={lead.social_links.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-pink-600 hover:underline"
                          >
                            IG
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-xs text-slate-500">
        Showing {filtered.length} of {leads.length} total leads. Data refreshes every page load (not live).
      </div>
    </div>
  );
}
