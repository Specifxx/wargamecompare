// This site's price feed for RiftCompare's shared alert service (DECISIONS.md,
// "Price alerts through RiftCompare's shared service", 2026-11-02): served as
// the static file /alert-feed.json (src/app/alert-feed.json/route.ts), built
// once per release from the same loaders the pages read. The service fetches it
// once a day; its format is pinned at the top of RiftCompare's
// src/lib/sister-alerts/feed.ts.
//
// The price is each product's Summary.best per region: the cheapest IN-STOCK
// price at one of our stores (never eBay, Amazon or Wayland, never converted).
// `u` carries "{r}", which the service replaces with the alert's region
// ("/uk/p/<id>"). Deals are the deals page's own (deals.ts), three per region.
import { mediansFor, summariesFor } from "./data";
import { deals as findDeals } from "./deals";
import { REGION_LIST } from "./regions";

export const ALERT_SITE_KEY = "wargame";

export interface AlertFeed {
  v: 1;
  site: string;
  generatedAt: string;
  items: Record<string, { n: string; u: string; p: Record<string, number> }>;
  deals: { n: string; u: string; r: string; p: number; ref?: number; refLabel?: string }[];
}

export function buildAlertFeed(now = new Date()): AlertFeed {
  const items: AlertFeed["items"] = {};
  const deals: AlertFeed["deals"] = [];
  for (const r of REGION_LIST) {
    const summaries = summariesFor(r.region);
    for (const s of summaries) {
      if (s.best == null || s.best <= 0) continue;
      (items[s.product.id] ??= { n: s.product.name, u: `/{r}/p/${s.product.id}`, p: {} }).p[r.market] = s.best;
    }
    for (const d of findDeals(summaries, mediansFor(r.region)).slice(0, 3)) {
      deals.push({ n: d.s.product.name, u: `/${r.region}/p/${d.s.product.id}`, r: r.market, p: d.s.best!, ref: d.ref, refLabel: d.basis === "rrp" ? "RRP" : "store median" });
    }
  }
  return { v: 1, site: ALERT_SITE_KEY, generatedAt: now.toISOString(), items, deals };
}
