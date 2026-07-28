"use client";

// 🔑 Keywords: Credentials AI TopBar, logged-in nav, dashboard nav, avatar menu, Fable Five §4
// Logged-in nav shows: Dashboard / Leads / ABN check / View my profile
// with an avatar menu holding email + Billing + Help + Log out. Logged-out
// nav keeps the marketing links + Login + Claim free profile CTA.

import Link from "next/link";
import Image from "next/image";
import { getBrowserClient } from "@/lib/supabase-browser";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BRAND_BYLINE, BRAND_NAME } from "@/lib/brand";
import { trackCtaClick } from "@/lib/tracking";
import { getFreeProfileUrl } from "@/components/marketing/urls";

type PrimarySlug = { slug: string | null };

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const freeProfileUrl = getFreeProfileUrl("topbar_free_ai_profile");
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [primary, setPrimary] = useState<PrimarySlug>({ slug: null });
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const nextUser = data.session?.user ?? null;
      setUser(nextUser as { id: string; email?: string } | null);
      if (nextUser) {
        try {
          const res = await fetch("/api/me/primary-business", { cache: "no-store" });
          if (res.ok) {
            const body = await res.json();
            setPrimary({ slug: body?.slug ?? null });
          }
        } catch {
          /* noop */
        }
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const nextUser = (session?.user ?? null) as
          | { id: string; email?: string }
          | null;
        setUser(nextUser);
        if (!nextUser) setPrimary({ slug: null });
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Close menu on outside click / escape
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function handleLogout() {
    const supabase = getBrowserClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
  }

  // Primary slug from API, with pathname fallback so mobile dashboard
  // users see Leads/Verification links even when the fetch races after
  // a fresh claim/login.
  const slugFromPath =
    (pathname.match(/^\/dashboard\/([^/?#]+)/) ?? [])[1] ?? null;
  const slug = primary.slug ?? slugFromPath;
  const inDashboard = pathname.startsWith("/dashboard");

  return (
    <header className="ai-glass-chrome border-b">
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex min-w-0 items-center gap-2.5 sm:gap-3"
            aria-label={`${BRAND_NAME} ${BRAND_BYLINE}`}
          >
            <Image
              src="/brand/credentials-ai-v7-card-mark.svg"
              alt=""
              width={690}
              height={404}
              priority
              // Mobile-only: clip the bottom sliver of the card mark so the
              // "AI-READABLE PROFILES · 2026" tagline bleed under the card
              // doesn't render as blurry clutter at small sizes. Desktop
              // (sm and up) renders the full asset unchanged.
              className="h-10 w-auto shrink-0 [clip-path:inset(0_0_4%_0)] sm:h-11 sm:[clip-path:none]"
            />
            <span className="flex min-w-0 flex-col leading-none">
              <span className="truncate text-base font-extrabold tracking-tight text-white sm:text-lg">
                {BRAND_NAME}
              </span>
              <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 min-[380px]:block">
                {BRAND_BYLINE}
              </span>
            </span>
          </Link>

          <nav className="flex shrink-0 items-center justify-end gap-2 sm:gap-3 md:gap-4">
            {loading ? null : user ? (
              <>
                {slug ? (
                  <>
                    <Link
                      href={`/dashboard/${slug}`}
                      className={`hidden text-sm font-medium sm:inline ${
                        inDashboard &&
                        (pathname === `/dashboard/${slug}` ||
                          pathname === "/dashboard")
                          ? "text-white"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={`/dashboard/${slug}/leads`}
                      className={`hidden text-sm font-medium sm:inline ${
                        pathname === `/dashboard/${slug}/leads`
                          ? "text-white"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      Leads
                    </Link>
                    <Link
                      href={`/dashboard/${slug}/verification`}
                      className={`hidden text-sm font-medium sm:inline ${
                        pathname === `/dashboard/${slug}/verification`
                          ? "text-white"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      ABN check
                    </Link>
                    <Link
                      href={`/b/${slug}`}
                      target="_blank"
                      className="hidden text-sm font-medium text-slate-300 hover:text-white sm:inline"
                    >
                      View my profile &rarr;
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/dashboard"
                    className="hidden text-sm font-medium text-slate-300 hover:text-white sm:inline"
                  >
                    Dashboard
                  </Link>
                )}

                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-white hover:bg-white/20"
                    title={user.email}
                  >
                    {(user.email?.[0] ?? "?").toUpperCase()}
                  </button>
                  {menuOpen ? (
                    <div
                      role="menu"
                      className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-white/10 bg-[#0a142e]/95 p-2 shadow-xl backdrop-blur-xl"
                    >
                      <div className="border-b border-white/10 px-3 py-2 text-xs text-slate-400">
                        Signed in as
                        <div className="mt-0.5 truncate text-sm font-medium text-slate-100">
                          {user.email ?? "\u2014"}
                        </div>
                      </div>
                      {/* Nav links — essential on mobile where the inline
                          Dashboard/Leads/ABN check links are hidden. */}
                      <div className="border-b border-white/10 pb-1">
                        <Link
                          href={slug ? `/dashboard/${slug}` : "/dashboard"}
                          onClick={() => setMenuOpen(false)}
                          className="block rounded-md px-3 py-2 text-sm font-medium text-slate-100 hover:bg-white/5"
                        >
                          Dashboard
                        </Link>
                        {slug ? (
                          <>
                            <Link
                              href={`/dashboard/${slug}/leads`}
                              onClick={() => setMenuOpen(false)}
                              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-100 hover:bg-white/5"
                            >
                              Leads
                            </Link>
                            <Link
                              href={`/dashboard/${slug}/verification`}
                              onClick={() => setMenuOpen(false)}
                              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-100 hover:bg-white/5"
                            >
                              ABN check
                            </Link>
                            <Link
                              href={`/b/${slug}`}
                              target="_blank"
                              onClick={() => setMenuOpen(false)}
                              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-100 hover:bg-white/5"
                            >
                              View my profile →
                            </Link>
                          </>
                        ) : null}
                      </div>
                      <a
                        href="mailto:support@erosium.ai"
                        className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                      >
                        Billing & support
                      </a>
                      <a
                        href="mailto:support@erosium.ai"
                        className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                      >
                        Help
                      </a>
                      <button
                        onClick={handleLogout}
                        className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5"
                      >
                        Log out
                      </button>
                    </div>
                  ) : null}
                </div>
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
                  className="hidden text-sm font-medium text-slate-300 hover:text-white sm:inline"
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
                  className="hidden text-sm font-medium text-slate-300 hover:text-white sm:inline"
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
                  className="text-xs font-medium text-slate-200 hover:text-white sm:text-sm"
                >
                  Log in
                </Link>
                <Link
                  href={freeProfileUrl}
                  onClick={() =>
                    trackCtaClick({
                      eventName: "credentials_ai_click_free_profile_topbar",
                      source: "credentialsai",
                      campaign: "topbar_free_ai_profile",
                      targetUrl: freeProfileUrl,
                      label: "Claim free profile",
                    })
                  }
                  className="rounded-md bg-[#F97316] px-2.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#EA580C] sm:px-3 sm:text-sm"
                >
                  <span className="sm:hidden">Start free</span>
                  <span className="hidden sm:inline">Claim free profile</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
