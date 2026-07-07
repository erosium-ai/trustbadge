"use client";

/* 🔑 Keywords: tracked link, CTA tracking wrapper, conversion click tracking */

import Link from "next/link";
import type { ReactNode, MouseEventHandler } from "react";
import { trackCtaClick } from "@/lib/tracking";

interface TrackedLinkProps {
  href: string;
  eventName: string;
  source?: string;
  campaign?: string;
  label?: string;
  className?: string;
  target?: string;
  rel?: string;
  children: ReactNode;
}

export function TrackedLink({
  href,
  eventName,
  source,
  campaign,
  label,
  className,
  target,
  rel,
  children,
}: TrackedLinkProps) {
  const onClick: MouseEventHandler<HTMLAnchorElement> = () => {
    trackCtaClick({
      eventName,
      source,
      campaign,
      targetUrl: href,
      label,
    });
  };

  return (
    <Link href={href} onClick={onClick} className={className} target={target} rel={rel}>
      {children}
    </Link>
  );
}

