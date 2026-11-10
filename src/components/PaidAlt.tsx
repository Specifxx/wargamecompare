"use client";
// The nearest paid price under the cheapest store (lib/price-rows.ts paidAlternativeFor): a real row of the list below,
// its real price, how much more it is and an "Ad" pill. Amazon's price is shown only for 24 hours after it was fetched
// (its licence), so the browser checks the age again, as AmazonPrice does.
import { useEffect, useState } from "react";
import { REL_PAID, type Placement } from "@/lib/affiliate";
import { OutboundLink } from "./OutboundLink";

const MAX_AGE_MS = 24 * 3600_000;

export function PaidAlt({
  price,
  name,
  note,
  pctMore,
  href,
  at,
  placement,
  className = "",
}: {
  price: string;
  name: string;
  note?: string;
  pctMore: number;
  href: string;
  at?: string;
  placement: Placement;
  className?: string;
}) {
  const [fresh, setFresh] = useState(true);
  useEffect(() => setFresh(!at || Date.now() - Date.parse(at) < MAX_AGE_MS), [at]);
  if (!fresh) return null;
  return (
    <p className={`flex min-w-0 items-center gap-2 ${className}`}>
      <OutboundLink href={href} rel={REL_PAID} retailer={name} placement={placement} className="min-w-0 truncate font-semibold text-brand hover:underline">
        or <span className="tabular">{price}</span>
        {note ? ` ${note}` : ""} on {name}
        {pctMore > 0 ? <span className="font-normal text-muted"> +{pctMore}%</span> : null} <span aria-hidden="true">↗</span>
      </OutboundLink>
      <span className="ad-pill shrink-0">Ad</span>
    </p>
  );
}
