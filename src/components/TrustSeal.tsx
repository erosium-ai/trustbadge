import { badgeSealColor } from "@/lib/schema";
import type { TrustBadge } from "@/lib/types";

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

function statusText(status: TrustBadge["status"]) {
  switch (status) {
    case "verified":
      return "Verified";
    case "pending_review":
      return "Pending review";
    case "rejected":
    case "suspended":
      return "Not verified";
    case "draft":
    default:
      return "Unverified";
  }
}

export function TrustSeal({
  status,
  size = "md",
}: {
  status: TrustBadge["status"];
  size?: "sm" | "md" | "lg";
}) {
  const dimensions = {
    sm: { outer: "h-16 w-16", inner: "h-10 w-10", check: "h-4 w-4" },
    md: { outer: "h-24 w-24", inner: "h-14 w-14", check: "h-6 w-6" },
    lg: { outer: "h-32 w-32", inner: "h-20 w-20", check: "h-8 w-8" },
  }[size];

  const colorClass = badgeSealColor(status);

  return (
    <div className={`relative flex ${dimensions.outer} items-center justify-center`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <polygon
          points="50,5 60,35 92,35 66,55 76,88 50,68 24,88 34,55 8,35 40,35"
          className={colorClass}
          fill="currentColor"
        />
      </svg>
      <div
        className={`relative z-10 flex ${dimensions.inner} items-center justify-center rounded-full border-4 border-white bg-white text-slate-900 shadow-sm`}
      >
        <CheckMark className={`${dimensions.check} text-slate-900`} />
      </div>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
        {statusText(status)}
      </div>
    </div>
  );
}
