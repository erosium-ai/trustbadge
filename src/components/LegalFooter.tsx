/* 🔑 Keywords: Credentials AI legal footer, privacy link, terms link, Beastly Tech GC Pty Ltd, ABN */

import Link from "next/link";
import { SupportEmailLink } from "@/components/SupportEmailLink";

export function LegalFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-8 text-center text-xs leading-6 text-slate-500 md:py-8">
      <p>
        Credentials AI is a product of{" "}
        <a
          href="https://erosium.com.au"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-slate-700 underline-offset-4 hover:underline"
        >
          Erosium
        </a>
        .
      </p>
      <p className="mt-1">Credentials AI is operated by Beastly Tech GC Pty Ltd · ABN 52 699 330 553 · Trading as Erosium</p>
      <nav className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1" aria-label="Legal">
        <Link href="/privacy" className="font-medium text-slate-700 underline-offset-4 hover:underline">
          Privacy
        </Link>
        <Link href="/terms" className="font-medium text-slate-700 underline-offset-4 hover:underline">
          Terms
        </Link>
        <SupportEmailLink className="cursor-pointer border-0 bg-transparent p-0 font-medium text-slate-700 underline-offset-4 hover:underline" />
      </nav>
    </footer>
  );
}
