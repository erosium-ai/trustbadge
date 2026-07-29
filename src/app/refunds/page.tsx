/* 🔑 Keywords: Credentials AI Refund and Cancellation Policy V2, cancel anytime, paid-through period, ACL preserved, isaac@erosium.com.au */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — Credentials AI",
  description:
    "How cancellation, paid-through access, refunds and Australian Consumer Law rights work for Credentials AI.",
};

const POLICY_VERSION = "refunds-2026-07-29.v2";
const CONTACT_EMAIL = "isaac@erosium.com.au";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <article className="prose prose-sm mx-auto max-w-3xl rounded-2xl border bg-white p-8 shadow-sm md:prose-base md:p-12">
        <h1>Refund &amp; Cancellation Policy</h1>
        <p className="text-slate-500">
          Version 2.0 · Policy ID {POLICY_VERSION} · Last updated: 29 July 2026
        </p>

        <h2>1. Cancel future renewals anytime</h2>
        <p>
          You can cancel an AI-Ready Business Page subscription at any time
          through your dashboard. Go to <strong>Billing</strong>, choose{" "}
          <strong>Manage billing / cancel plan</strong>, and complete the Stripe
          cancellation flow.
        </p>
        <p>
          Cancellation stops future renewals. It does not rewrite a past
          payment and it is not, by itself, a refund request.
        </p>

        <h2>2. Access after cancellation</h2>
        <p>
          Unless we refund the unused period, paid features remain available
          until the end of the billing period you have already paid for. After
          that paid-through date, the paid profile downgrades and future billing
          stays stopped.
        </p>
        <p>
          Your dashboard remains available for records, invoices and support
          after cancellation.
        </p>

        <h2>3. Change-of-mind refunds</h2>
        <p>
          We do not advertise an automatic change-of-mind money-back guarantee.
          A refund may still be required by law or approved at our discretion
          depending on the circumstances.
        </p>

        <h2>4. Charge problems and service failures</h2>
        <p>
          Contact us promptly if you believe there has been a duplicate,
          incorrect or unauthorised charge, if you were charged after a
          confirmed cancellation, or if the paid service was not provided as
          described. Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with:
        </p>
        <ul>
          <li>the email used at checkout;</li>
          <li>the business name or profile URL;</li>
          <li>the charge date and amount;</li>
          <li>what went wrong and what outcome you are seeking.</li>
        </ul>

        <h2>5. Australian Consumer Law</h2>
        <p>
          Nothing in this policy excludes, restricts or modifies any consumer
          guarantee, right or remedy you may have under the Australian Consumer
          Law or another law that cannot lawfully be excluded, restricted or
          modified.
        </p>

        <h2>6. How approved refunds are returned</h2>
        <p>
          If a refund is approved or legally required, it is returned to the
          original payment method through Stripe where available. Bank and card
          processing times are outside our control, but refunds commonly appear
          within 5–10 business days after processing.
        </p>

        <h2>7. Policy updates</h2>
        <p>
          We may update this policy when the service, payment process, law or
          our practices change. The current version will be posted on this page
          with its policy ID and last-updated date. Material adverse changes
          apply prospectively and do not take away accrued legal rights.
        </p>

        <h2>8. Contact</h2>
        <p>
          Billing, cancellation and refund questions:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </article>
    </div>
  );
}
