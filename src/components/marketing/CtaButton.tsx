import type { ReactNode } from "react";
import { TrackedLink } from "@/components/TrackedLink";

interface CtaButtonProps {
  href: string;
  children: ReactNode;
  eventName: string;
  label: string;
  dataCta: string;
  variant?: "primary" | "secondary" | "dark" | "amber" | "paid" | "ghost";
  className?: string;
  target?: string;
  rel?: string;
}

const variants = {
  primary:
    "ai-glow-button border border-cyan-300/35 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-300 hover:via-teal-300 hover:to-emerald-300 focus-visible:ring-cyan-300",
  secondary:
    "border border-white/15 bg-white/8 text-white shadow-sm backdrop-blur hover:bg-white/14 focus-visible:ring-cyan-300",
  dark:
    "border border-cyan-300/25 bg-white text-slate-950 shadow-sm hover:bg-cyan-50 focus-visible:ring-cyan-300",
  amber:
    "border border-violet-300/30 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 text-white shadow-lg shadow-violet-500/20 hover:from-violet-400 hover:via-fuchsia-400 hover:to-cyan-300 focus-visible:ring-violet-300",
  // Paid tier CTA — emerald-led to match the verified/paid accent system.
  paid:
    "ai-glow-button-paid border border-emerald-300/45 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 text-slate-950 hover:from-emerald-300 hover:via-teal-200 hover:to-cyan-200 focus-visible:ring-emerald-300",
  // Recessed CTA for the deliberately secondary free card.
  ghost:
    "border border-white/14 bg-transparent text-slate-300 hover:border-white/28 hover:bg-white/6 hover:text-white focus-visible:ring-slate-300",
};

export function CtaButton({
  href,
  children,
  eventName,
  label,
  dataCta,
  variant = "primary",
  className = "",
  target,
  rel,
}: CtaButtonProps) {
  return (
    <TrackedLink
      href={href}
      eventName={eventName}
      source="credentialsai"
      campaign="homepage_v2_ai_microsite"
      label={label}
      target={target}
      rel={rel}
      dataCta={dataCta}
      className={`inline-flex min-h-12 items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-black transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${variants[variant]} ${className}`}
    >
      {children}
    </TrackedLink>
  );
}
