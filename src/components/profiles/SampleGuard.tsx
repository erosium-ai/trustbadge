"use client";

import { useState } from "react";

interface SampleGuardProps {
  isSample: boolean;
  children: React.ReactNode;
  label?: string;
}

/**
 * Wraps action buttons on public profile pages.
 * On sample/demo profiles, clicks show a toast instead of firing real actions.
 * On real profiles, passes through normally.
 */
export function SampleGuard({ isSample, children, label = "contact" }: SampleGuardProps) {
  const [showToast, setShowToast] = useState(false);

  if (!isSample) {
    return <>{children}</>;
  }

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  }

  return (
    <div className="relative" onClick={handleClick}>
      {children}
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/15 bg-slate-900/95 px-4 py-2.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md"
        >
          This is a demo — {label} buttons are for display only.
          <span className="ml-2 text-cyan-300">Claim your free profile →</span>
        </div>
      )}
    </div>
  );
}
