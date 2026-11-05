"use client";
// Amazon's price from the Creators API, with the time it was fetched, as its licence requires. The page may be
// served from the CDN for a day, so the browser checks the age again: past 24 hours the price gives way to the
// row's plain "Amazon's own price" line rather than a stale number.
import { useEffect, useState } from "react";

const MAX_AGE_MS = 24 * 3600_000;
export const AMAZON_PRICE_DISCLAIMER =
  "Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon at the time of purchase will apply to the purchase of this product.";

export function AmazonPrice({ price, at, timeZone, zoneLabel }: { price: string; at: string; timeZone: string; zoneLabel: string }) {
  const [fresh, setFresh] = useState(true);
  useEffect(() => setFresh(Date.now() - Date.parse(at) < MAX_AGE_MS), [at]);
  if (!fresh) return <span className="block truncate text-sm leading-6 text-muted sm:text-xs">Amazon&rsquo;s own price</span>;
  const when = new Date(at).toLocaleString("en-GB", { timeZone, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  return (
    <span title={AMAZON_PRICE_DISCLAIMER}>
      <span className="block text-base font-semibold tabular-nums sm:text-lg">{price}</span>
      <span className="block truncate text-[10px] leading-4 text-faint">as of {when} {zoneLabel}*</span>
    </span>
  );
}
