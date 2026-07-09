// 🔑 Keywords: Credentials AI stripe server client, subscription retrieve, checkout session verify
import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  cached = new Stripe(key);
  return cached;
}
