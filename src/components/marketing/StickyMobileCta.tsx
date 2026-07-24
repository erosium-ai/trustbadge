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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/92 p-3 shadow-2xl backdrop-blur md:hidden">
      <CtaButton
        href={freeProfileUrl}
        eventName="credentials_ai_click_sticky_mobile"
        label="Claim Your Free Profile"
        dataCta="sticky-mobile"
        className="w-full"
      >
        Claim Your Free Profile
      </CtaButton>
    </div>
  );
}
