/* 🔑 Keywords: terms of service, Credentials AI terms, TrustBadge terms, Pro AI Presence terms, founder offer terms */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Credentials AI",
  description: "Terms of Service for Credentials AI, SchemaPage, and TrustBadge services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <article className="prose prose-sm mx-auto max-w-3xl rounded-2xl border bg-white p-8 shadow-sm md:prose-base md:p-12">
        <h1>Terms of Service</h1>
        <p className="text-slate-500">Last updated: 8 July 2026</p>

        <h2>1. Acceptance</h2>
        <p>
          By using Credentials AI, SchemaPage, or TrustBadge, you agree to these
          Terms. If you do not agree, do not use the service.
        </p>

        <h2>2. Service overview</h2>
        <p>
          Credentials AI provides AI-readable business profiles and trust
          verification tools for local businesses. This includes:
        </p>
        <ul>
          <li>SchemaPage AI-readable business pages</li>
          <li>Pro AI Presence upgrades</li>
          <li>TrustBadge verification profiles and credential display</li>
        </ul>

        <h2>3. Your responsibilities</h2>
        <p>
          You must submit accurate business information and only upload documents
          you are legally allowed to use. You are responsible for keeping your
          data and credentials current.
        </p>

        <h2>4. Verification boundaries</h2>
        <p>
          TrustBadge verification reflects information and documents available at
          the time of review. It is not a guarantee of future performance,
          licensing status, or legal compliance outside the submitted evidence.
        </p>

        <h2>5. Billing, subscriptions, and cancellation</h2>
        <p>
          Paid plans are billed in advance on a recurring basis (usually
          monthly) via Stripe. You can cancel future renewals at any time.
          Cancellation stops future billing but does not retroactively cancel a
          past billing period.
        </p>

        <h2>6. Refunds</h2>
        <p>
          We offer a 30-day money-back policy for eligible new purchases. See
          our <a href="/refunds">Refund Policy</a> for full details and
          exclusions.
        </p>

        <h2>7. Acceptable use</h2>
        <p>
          You may not use the service for unlawful, deceptive, abusive, or
          fraudulent activity. We may suspend or remove accounts that violate
          these terms.
        </p>

        <h2>8. Limitation of liability</h2>
        <p>
          The service is provided "as is". To the maximum extent permitted by
          law, we are not liable for indirect, incidental, special, or
          consequential damages arising from your use of the service.
        </p>

        <h2>9. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the
          service after updates means you accept the revised terms.
        </p>

        <h2>10. Contact</h2>
        <p>
          Questions about these terms can be sent to{" "}
          <a href="mailto:support@credentialsai.com.au">
            support@credentialsai.com.au
          </a>
          .
        </p>
      </article>
    </div>
  );
}
