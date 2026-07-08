"use client";

import { useEffect, useState } from "react";
import { CtaButton } from "./CtaButton";

export function StickyMobileCta({ freeProfileUrl }: { freeProfileUrl: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 620);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
      <CtaButton
        href={freeProfileUrl}
        eventName="credentials_ai_click_sticky_mobile"
        label="Claim your free AI profile"
        dataCta="sticky-mobile"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full"
      >
        Claim your free AI profile
      </CtaButton>
    </div>
  );
}
