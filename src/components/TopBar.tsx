"use client";

import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BADGE_FEATURE_NAME, BRAND_NAME } from "@/lib/brand";
import { trackCtaClick } from "@/lib/tracking";
import { getFreeProfileUrl } from "@/components/marketing/urls";

function CheckMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function TopBar() {
  const router = useRouter();
  const freeProfileUrl = getFreeProfileUrl("topbar_free_ai_profile");
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const supabase = getBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white">
            <CheckMark className="h-4 w-4" />
          </span>
          {BRAND_NAME}
        </Link>

        <nav className="flex items-center gap-4">
          {loading ? null : user ? (
            <>
              <span className="hidden text-sm text-slate-500 sm:inline">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/#how-it-works"
                onClick={() =>
                  trackCtaClick({
                    eventName: "credentials_ai_click_how_it_works_nav",
                    source: "credentialsai",
                    campaign: "topbar_nav",
                    targetUrl: "/#how-it-works",
                    label: "How it works",
                  })
                }
                className="hidden text-sm font-medium text-slate-500 hover:text-slate-900 sm:inline"
              >
                How it works
              </Link>
              <Link
                href="/#pricing"
                onClick={() =>
                  trackCtaClick({
                    eventName: "credentials_ai_click_pricing_nav",
                    source: "credentialsai",
                    campaign: "topbar_nav",
                    targetUrl: "/#pricing",
                    label: "Pricing",
                  })
                }
                className="hidden text-sm font-medium text-slate-500 hover:text-slate-900 sm:inline"
              >
                Pricing
              </Link>
              <Link
                href="/auth/login"
                onClick={() =>
                  trackCtaClick({
                    eventName: "credentials_ai_click_login",
                    source: "credentialsai",
                    campaign: "topbar_auth",
                    targetUrl: "/auth/login",
                    label: "Log in",
                  })
                }
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Log in
              </Link>
              <Link
                href={freeProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackCtaClick({
                    eventName: "credentials_ai_click_free_profile_topbar",
                    source: "credentialsai",
                    campaign: "topbar_free_ai_profile",
                    targetUrl: freeProfileUrl,
                    label: "Claim free profile",
                  })
                }
                className="rounded-md bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                Claim free profile
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
