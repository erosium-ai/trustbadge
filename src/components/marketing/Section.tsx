import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  id?: string;
  dark?: boolean;
  className?: string;
}

export function Section({ children, id, dark = false, className = "" }: SectionProps) {
  return (
    <section id={id} className={`${dark ? "bg-[#0F1B2D] text-white" : "bg-[#F7F6F3] text-slate-950"} ${className}`}>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        {children}
      </div>
    </section>
  );
}
