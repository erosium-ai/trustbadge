"use client";

/* 🔑 Keywords: homepage view tracking, Credentials AI homepage analytics, conversion_events pageview */

import { useEffect } from "react";
import { trackCtaClick } from "@/lib/tracking";

const STORAGE_KEY = "credentials_ai_homepage_view_tracked";

export function HomepageViewTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const viewKey = `${window.location.pathname}${window.location.search}`;
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === viewKey) return;
      window.sessionStorage.setItem(STORAGE_KEY, viewKey);
    } catch {
      // If storage is unavailable, still send one best-effort event for this render.
    }

    trackCtaClick({
      eventName: "credentials_ai_homepage_view",
      targetUrl: window.location.href,
      label: "Credentials AI homepage",
      metadata: {
        event_type: "page_view",
      },
    });
  }, []);

  return null;
}
