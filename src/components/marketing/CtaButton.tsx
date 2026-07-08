import type { ReactNode } from "react";
import { TrackedLink } from "@/components/TrackedLink";

interface CtaButtonProps {
  href: string;
  children: ReactNode;
  eventName: string;
  label: string;
  dataCta: string;
  variant?: "primary" | "secondary" | "dark" | "amber";
  className?: string;
  target?: string;
  rel?: string;
}

const variants = {
  primary:
    "bg-[#1D6FE0] text-white shadow-sm hover:bg-[#1758B5] focus-visible:ring-[#1D6FE0]",
  secondary:
    "border border-slate-300 bg-white text-[#0F1B2D] hover:bg-slate-50 focus-visible:ring-[#1D6FE0]",
  dark:
    "bg-white text-[#0F1B2D] shadow-sm hover:bg-slate-100 focus-visible:ring-white",
  amber:
    "bg-[#D97706] text-white shadow-sm hover:bg-[#B45309] focus-visible:ring-[#D97706]",
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
      campaign="homepage_redesign"
      label={label}
      target={target}
      rel={rel}
      dataCta={dataCta}
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variants[variant]} ${className}`}
    >
      {children}
    </TrackedLink>
  );
}
