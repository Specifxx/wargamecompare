"use client";

import type { ReactNode } from "react";
import type { Placement } from "@/lib/affiliate";
import { track } from "@/lib/track";

// Every outbound buy link (a store, eBay, Amazon, Wayland) is one of these: a plain <a target="_blank">, no redirect hop,
// so the affiliate networks see the click untouched. It records one Vercel event, buy_click {retailer, placement}: exactly
// two properties (Vercel keeps two per event). Middle-click is caught through auxclick.
export function OutboundLink({
  href,
  rel,
  retailer,
  placement,
  className,
  children,
  "aria-label": ariaLabel,
}: {
  href: string;
  rel: string;
  retailer: string;
  placement: Placement;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}) {
  const record = () => track("buy_click", { retailer: retailer.slice(0, 255), placement });
  return (
    <a
      href={href}
      target="_blank"
      rel={rel}
      className={className}
      aria-label={ariaLabel}
      onClick={(e) => e.button === 0 && record()}
      onAuxClick={(e) => e.button === 1 && record()}
    >
      {children}
    </a>
  );
}
