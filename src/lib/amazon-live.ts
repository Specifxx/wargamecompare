// Amazon's own price of a product, per Amazon store: what scripts/fetch-amazon-prices.ts fetched from the
// Creators API at the start of this build (data/amazon-live/<store>.json, git-ignored, never committed:
// Amazon's licence lets a price be kept 24 hours and shown with its time). Read by the product page's Amazon
// row alone (lib/price-rows.ts, product surface): never by a sort, the cheapest badge, deals, the feed,
// metadata or the quick view. A price older than 24 hours is not read, and the browser hides it again after
// 24 hours (components/AmazonPrice.tsx), since the CDN may serve the page for a day.
import fs from "node:fs";
import path from "node:path";
import type { Region } from "./regions";

/** The Amazon stores this site has a tag for. NZ has no Amazon of its own: it reads Amazon AU's prices, in A$. */
export type AmazonStore = Exclude<Region, "nz">;
export const storeFor = (region: Region): AmazonStore => (region === "nz" ? "au" : region);

export interface AmazonLive {
  /** Amazon's own item, for a /dp/ link instead of a search */
  asin: string;
  /** new, in stock, in the store's currency, in minor units */
  p: number;
  /** ISO time the price was fetched */
  at: string;
}
export interface AmazonLiveFile { fetchedAt: string; prices: Record<string, { asin: string; p: number }> }

/** The clock an Amazon price's "as of" time is shown in: the Amazon store's own (NZ reads Amazon AU). */
export const AMAZON_CLOCK: Record<AmazonStore, { timeZone: string; label: string }> = {
  us: { timeZone: "America/New_York", label: "New York time" },
  ca: { timeZone: "America/Toronto", label: "Toronto time" },
  uk: { timeZone: "Europe/London", label: "London time" },
  au: { timeZone: "Australia/Sydney", label: "Sydney time" },
};

export const AMAZON_LIVE_DIR = path.resolve(process.cwd(), process.env.WGC_AMAZON_LIVE_DIR || "data/amazon-live");
export const AMAZON_MAX_AGE_H = 24;

/** Whether a price fetched at `at` may still be shown at `now`. */
export const isFreshAmazonPrice = (at: string | undefined, now = Date.now()) =>
  !!at && Number.isFinite(Date.parse(at)) && now - Date.parse(at) < AMAZON_MAX_AGE_H * 3600_000 && Date.parse(at) <= now + 60_000;

const cache = new Map<string, AmazonLiveFile | null>();
function fileFor(store: AmazonStore): AmazonLiveFile | null {
  if (!cache.has(store)) {
    let v: AmazonLiveFile | null = null;
    try {
      const f = path.join(AMAZON_LIVE_DIR, `${store}.json`);
      if (fs.existsSync(f)) v = JSON.parse(fs.readFileSync(f, "utf8")) as AmazonLiveFile;
    } catch {
      v = null;
    }
    cache.set(store, v);
  }
  const v = cache.get(store) ?? null;
  return v && isFreshAmazonPrice(v.fetchedAt) ? v : null;
}

/** The product's Amazon price in the region's Amazon store, if the build fetched one under 24 hours ago. */
export function amazonLive(ean: string | null, region: Region): AmazonLive | null {
  if (!ean) return null;
  const f = fileFor(storeFor(region));
  const e = f?.prices[ean];
  return e ? { asin: e.asin, p: e.p, at: f!.fetchedAt } : null;
}
