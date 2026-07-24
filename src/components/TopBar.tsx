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
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6">
        <div className="flex items-end justify-between gap-2 md:items-center md:gap-4">
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex min-w-0 items-center"
            aria-label={`${BRAND_NAME} ${BRAND_BYLINE}`}
          >
            <Image
              src="/brand/credentials-ai-logo-primary.svg"
              alt={`${BRAND_NAME} ${BRAND_BYLINE}`}
              width={980}
              height={320}
              priority
              className="h-auto w-[60vw] max-w-[250px] sm:h-24 sm:w-auto sm:max-w-none lg:h-28"
            />
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
                          ? "text-slate-900"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={`/dashboard/${slug}/leads`}
                      className={`hidden text-sm font-medium sm:inline ${
                        pathname === `/dashboard/${slug}/leads`
                          ? "text-slate-900"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Leads
                    </Link>
                    <Link
                      href={`/dashboard/${slug}/verification`}
                      className={`hidden text-sm font-medium sm:inline ${
                        pathname === `/dashboard/${slug}/verification`
                          ? "text-slate-900"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      ABN check
                    </Link>
                    <Link
                      href={`/b/${slug}`}
                      target="_blank"
                      className="hidden text-sm font-medium text-slate-500 hover:text-slate-900 sm:inline"
                    >
                      View my profile &rarr;
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/dashboard"
                    className="hidden text-sm font-medium text-slate-500 hover:text-slate-900 sm:inline"
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
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    title={user.email}
                  >
                    {(user.email?.[0] ?? "?").toUpperCase()}
                  </button>
                  {menuOpen ? (
                    <div
                      role="menu"
                      className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
                    >
                      <div className="border-b border-slate-100 px-3 py-2 text-xs text-slate-500">
                        Signed in as
                        <div className="mt-0.5 truncate text-sm font-medium text-slate-800">
                          {user.email ?? "\u2014"}
                        </div>
                      </div>
                      {/* Nav links — essential on mobile where the inline
                          Dashboard/Leads/ABN check links are hidden. */}
                      <div className="border-b border-slate-100 pb-1">
                        <Link
                          href={slug ? `/dashboard/${slug}` : "/dashboard"}
                          onClick={() => setMenuOpen(false)}
                          className="block rounded-md px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                        >
                          Dashboard
                        </Link>
                        {slug ? (
                          <>
                            <Link
                              href={`/dashboard/${slug}/leads`}
                              onClick={() => setMenuOpen(false)}
                              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                            >
                              Leads
                            </Link>
                            <Link
                              href={`/dashboard/${slug}/verification`}
                              onClick={() => setMenuOpen(false)}
                              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                            >
                              ABN check
                            </Link>
                            <Link
                              href={`/b/${slug}`}
                              target="_blank"
                              onClick={() => setMenuOpen(false)}
                              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                            >
                              View my profile →
                            </Link>
                          </>
                        ) : null}
                      </div>
                      <a
                        href="mailto:support@erosium.ai"
                        className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Billing & support
                      </a>
                      <a
                        href="mailto:support@erosium.ai"
                        className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Help
                      </a>
                      <button
                        onClick={handleLogout}
                        className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
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
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 sm:text-sm"
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
