// 🔑 Keywords: Credentials AI leads tab, dashboard leads, customer-facing lead list
// Simplified customer-facing lead list. This is a filtered/simplified view
// over the same lead_events data that /admin/leads sees; customers only see
// their own leads, plain-word sources, and editable statuses. Raw UTM,
// session ids, IP, and confidence scores are NOT shown here.

import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase-server";
import { getServiceClient } from "@/lib/supabase";
import { assertOwnership, prettySource } from "@/lib/dashboard-queries";
import { formatAuDateTime } from "@/lib/date-format";

export const dynamic = "force-dynamic";

interface LeadsPageProps {
  params: Promise<{ slug: string }>;
}

type LeadRow = {
  id: string;
  type: string;
  source: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

function leadTypeLabel(type: string): string {
  switch (type) {
    case "call_click":
      return "Call tap";
    case "email_click":
      return "Email click";
    case "quote_form":
      return "Quote request";
    case "quote_form_open":
      return "Started a quote";
    default:
      return type;
  }
}

export default async function LeadsPage({ params }: LeadsPageProps) {
  const { slug } = await params;

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/dashboard/${slug}/leads`);
  }

  const ownership = await assertOwnership(slug, user.id);
  if (!ownership.ok || !ownership.record) {
    redirect("/dashboard");
  }

  const client = getServiceClient();
  const { data } = await client
    .from("lead_events")
    .select("id, type, source, name, phone, email, message, status, created_at")
    .eq("business_profile_id", ownership.record.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const leads = (data as LeadRow[] | null) ?? [];

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
            <p className="mt-1 text-sm text-slate-600">
              Every tap, click and quote request from your profile.
            </p>
          </div>
          <Link
            href={`/dashboard/${slug}`}
            className="text-sm font-medium text-[#F97316] hover:underline"
          >
            &larr; Back to dashboard
          </Link>
        </div>

        {leads.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            No enquiries yet &mdash; and we won&rsquo;t pretend otherwise.
            These counters only move when something real happens: a call tap,
            an email click, or a quote request on your profile. While
            it&rsquo;s early, put your link where customers already see you
            &mdash; your Google profile, invoices, email signature. The moment
            something lands, you&rsquo;ll know.
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    When
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-700">
                      {formatAuDateTime(lead.created_at)}
                    </td>
                    <td className="px-4 py-3 text-slate-900">
                      {leadTypeLabel(lead.type)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div>{lead.name ?? "\u2014"}</div>
                      {lead.email ? (
                        <div className="text-xs text-slate-500">
                          {lead.email}
                        </div>
                      ) : null}
                      {lead.phone ? (
                        <div className="text-xs text-slate-500">
                          {lead.phone}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {prettySource(lead.source)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {lead.status ?? "new"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
