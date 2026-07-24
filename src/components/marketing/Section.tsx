import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  dark?: boolean;
}

export function Section({ children, id, className = "", dark = false }: SectionProps) {
  return (
    <section id={id} className={`relative overflow-hidden px-4 py-10 sm:px-6 sm:py-12 ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.08),transparent_24rem),radial-gradient(circle_at_82%_10%,rgba(139,92,246,0.10),transparent_26rem)]" />
      <div
        className={`relative mx-auto max-w-6xl rounded-[2rem] p-6 shadow-2xl sm:p-8 lg:p-10 ${
          dark
            ? "ai-glass text-white"
            : "border border-white/55 bg-white/94 text-slate-950 backdrop-blur-xl"
        }`}
      >
        {children}
      </div>
    </section>
  );
}
