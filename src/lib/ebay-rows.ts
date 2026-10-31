// Which stored eBay rows the site shows (data/ebay.json, written by scripts/ebay.ts). Pure; read by lib/data.ts.
import type { Market } from "./regions";
import type { EbayItem } from "./types";

/** Postage a local seller plausibly charges, per eBay site, in cents: the ceiling for rows from the older worldwide search. */
export const LOCAL_POSTAGE_MAX: Partial<Record<Market, number>> = { UK: 600, US: 1500, AU: 1500, CA: 2000 };

/**
 * May a stored row be shown? A row from the local-seller search (it carries `l`) always. An older row (worldwide search,
 * before 2026-10-31) only when its postage is known and no more than a local seller charges: an overseas seller's
 * A$30 postage, or an unknown one, is a wasted click. Those rows are searched again first (plan) and age out in 96 h.
 */
export function ebayRowShown(item: EbayItem, market: Market): boolean {
  if (item.l) return true;
  const cap = LOCAL_POSTAGE_MAX[market];
  return item.sh != null && cap != null && item.sh <= cap;
}
