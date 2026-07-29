import { notFound } from "next/navigation";
import { getBusinessProfileBySlug } from "@/lib/trustbadge";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const profile = await getBusinessProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  const businessName = profile.business_name || "Business";
  const displayName =
    businessName.length > 40
      ? businessName.slice(0, 37) + "..."
      : businessName;
  const abn = profile.abn || null;
  const isVerified = profile.abn_status === "verified";
  const profileUrl = `https://credentialsai.com.au/b/${slug}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(displayName)} — Verified by Credentials AI</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  body { background: transparent; display: flex; justify-content: center; align-items: center; min-height: 100px; }
  .badge {
    display: inline-flex; flex-direction: column; gap: 8px;
    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;
    padding: 16px 20px; max-width: 320px; min-width: 240px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    text-decoration: none; color: inherit;
  }
  .badge:hover { border-color: #cbd5e1; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
  .row { display: flex; align-items: center; gap: 8px; }
  .check {
    width: 20px; height: 20px; border-radius: 50%; display: flex;
    align-items: center; justify-content: center; flex-shrink: 0;
  }
  .check.verified { background: #16a34a; }
  .check.pending { background: #d97706; }
  .check svg { width: 12px; height: 12px; color: #ffffff; }
  .name { font-weight: 700; font-size: 15px; color: #0f172a; line-height: 1.3; }
  .status { font-size: 13px; font-weight: 600; }
  .status.verified { color: #16a34a; }
  .status.pending { color: #d97706; }
  .abn-line { font-size: 12px; color: #64748b; }
  .abn-line span { font-weight: 500; color: #475569; }
  .footer {
    font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9;
    padding-top: 8px; display: flex; align-items: center; gap: 4px;
  }
  .footer a { color: #F97316; text-decoration: none; font-weight: 500; }
  .footer a:hover { text-decoration: underline; }
</style>
</head>
<body>
<a class="badge" href="${escapeHtml(profileUrl)}" target="_blank" rel="noopener" title="View verified profile on Credentials AI">
  <div class="row">
    <div class="check ${isVerified ? "verified" : "pending"}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
    <div>
      <div class="name">${escapeHtml(displayName)}</div>
      <div class="status ${isVerified ? "verified" : "pending"}">${
        isVerified ? "Verified Business" : "Verification Pending"
      }</div>
    </div>
  </div>
  <div class="abn-line">${
    abn
      ? `ABN <span>${escapeHtml(abn)}</span>`
      : "ABN not provided"
  }</div>
  <div class="footer">
    <span>Powered by</span>
    <a href="${escapeHtml(profileUrl)}" target="_blank" rel="noopener">Credentials AI</a>
  </div>
</a>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
