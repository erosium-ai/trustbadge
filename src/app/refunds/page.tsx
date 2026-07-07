/* 🔑 Keywords: refund policy, Credentials AI refunds, TrustBadge refunds, Pro AI Presence refunds */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — Credentials AI",
  description:
    "Refund policy for Credentials AI, including Pro AI Presence and TrustBadge subscriptions.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <article className="prose prose-sm mx-auto max-w-3xl rounded-2xl border bg-white p-8 shadow-sm md:prose-base md:p-12">
        <h1>Refund Policy</h1>
        <p className="text-slate-500">Last updated: 8 July 2026</p>

        <h2>1. 30-day refund window</h2>
        <p>
          New customers can request a refund within 30 days of their first paid
          purchase on eligible plans.
        </p>

        <h2>2. Eligible services</h2>
        <ul>
          <li>Pro AI Presence subscription (first purchase period)</li>
          <li>TrustBadge verification subscription (first purchase period)</li>
          <li>Founder bundle (first purchase period)</li>
        </ul>

        <h2>3. Not covered</h2>
        <ul>
          <li>Renewal periods after the first paid period</li>
          <li>Usage-based or third-party pass-through costs (if introduced)</li>
          <li>Accounts suspended for fraud, abuse, or terms violations</li>
        </ul>

        <h2>4. How to request a refund</h2>
        <p>
          Email <a href="mailto:support@credentialsai.com.au">support@credentialsai.com.au</a>{" "}
          with:
        </p>
        <ul>
          <li>the account email used at checkout,</li>
          <li>business name,</li>
          <li>purchase date, and</li>
          <li>the reason for your request.</li>
        </ul>

        <h2>5. Processing timeline</h2>
        <p>
          Approved refunds are processed to the original payment method. Most
          banks show the refund in 5-10 business days after processing.
        </p>

        <h2>6. Policy updates</h2>
        <p>
          We may update this policy from time to time. The latest version on
          this page applies.
        </p>
      </article>
    </div>
  );
}
