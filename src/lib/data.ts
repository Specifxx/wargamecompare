// The site's only data source: the public JSON files under data/, committed by the daily import and bundled with every
// server function (next.config.js outputFileTracingIncludes). Read once per function instance and kept in memory: no
// database, no fetch, nothing per request. Server-only.
import fs from "node:fs";
import path from "node:path";
import { REGIONS, type Market, type Region } from "./regions";
import { median } from "./deals";
import { ebayRowShown } from "./ebay-rows";
import { STORE_BY_KEY } from "./stores";
import type { EbayFile, Meta, Offer, OffersFile, Product, RrpFile } from "./types";

const DIR = path.join(process.cwd(), "data");
function load<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8")) as T;
  } catch {
    return fallback;
  }
}

interface Loaded {
  products: Product[];
  byId: Map<string, Product>;
  offers: OffersFile;
  rrp: RrpFile;
  ebay: EbayFile;
  meta: Meta;
}
let cache: Loaded | null = null;
function data(): Loaded {
  if (cache) return cache;
  const products = load<Product[]>("products.json", []);
  cache = {
    products,
    byId: new Map(products.map((p) => [p.id, p])),
    offers: load<OffersFile>("offers.json", {}),
    rrp: load<RrpFile>("rrp.json", {}),
    ebay: load<EbayFile>("ebay.json", { updatedAt: null, items: {} }),
    meta: load<Meta>("meta.json", { updatedAt: "", stores: {}, products: 0 }),
  };
  return cache;
}

export function meta(): Meta {
  return data().meta;
}
export function allProducts(): Product[] {
  return data().products;
}
export function product(id: string): Product | null {
  return data().byId.get(id) ?? null;
}

/** A product's offers in a market, in stock first, then cheapest; only stores still in the registry. */
/** A market's offers for a product, from registered stores only, with each URL made absolute (the file stores the path). */
export function offersFor(id: string, region: Region): Offer[] {
  return (data().offers[REGIONS[region].market]?.[id] ?? [])
    .filter((o) => STORE_BY_KEY.has(o.s))
    .map((o) => (o.u.startsWith("/") ? { ...o, u: `${STORE_BY_KEY.get(o.s)!.base}${o.u}` } : o));
}
export function rrpFor(id: string, region: Region): number | null {
  return data().rrp[REGIONS[region].market]?.[id] ?? null;
}
export function ebayFor(id: string, region: Region) {
  // NZ has no eBay site of its own in EPN: NZ buyers are shown eBay Australia's listing, labelled in A$.
  const market = region === "nz" ? "AU" : REGIONS[region].market;
  const item = data().ebay.items[market]?.[id] ?? null;
  return item && ebayRowShown(item, market) ? item : null;
}
export function ebayUpdatedAt(): string | null {
  return data().ebay.updatedAt;
}

export interface Summary {
  product: Product;
  best: number | null; // cheapest IN-STOCK price, cents
  bestStore: string | null;
  inStock: number; // stores with it in stock
  stores: number; // stores listing it at all
  rrp: number | null;
  /** Saving of the best price under the stated RRP, 0..1. */
  off: number | null;
}

const summaries = new Map<Region, Summary[]>();
/** Every product a market lists, with its headline numbers. Computed once per instance per region. */
export function summariesFor(region: Region): Summary[] {
  const hit = summaries.get(region);
  if (hit) return hit;
  const market: Market = REGIONS[region].market;
  const offers = data().offers[market] ?? {};
  const rrps = data().rrp[market] ?? {};
  const out: Summary[] = [];
  for (const [id, list0] of Object.entries(offers)) {
    const p = data().byId.get(id);
    if (!p) continue;
    const list = list0.filter((o) => STORE_BY_KEY.has(o.s));
    if (!list.length) continue;
    const open = list.filter((o) => o.in);
    const best = open.length ? open.reduce((a, b) => (b.p < a.p ? b : a)) : null;
    const rrp = rrps[id] ?? null;
    out.push({
      product: p,
      best: best?.p ?? null,
      bestStore: best?.s ?? null,
      inStock: new Set(open.map((o) => o.s)).size,
      stores: new Set(list.map((o) => o.s)).size,
      rrp,
      off: best && rrp && rrp > best.p ? (rrp - best.p) / rrp : null,
    });
  }
  out.sort((a, b) => b.stores - a.stores || b.inStock - a.inStock || a.product.name.localeCompare(b.product.name));
  summaries.set(region, out);
  return out;
}

const medians = new Map<Region, Map<string, number>>();
/** Median in-stock store price per product, where three or more stores have it in stock. */
export function mediansFor(region: Region): Map<string, number> {
  const hit = medians.get(region);
  if (hit) return hit;
  const out = new Map<string, number>();
  for (const [id, list] of Object.entries(data().offers[REGIONS[region].market] ?? {})) {
    const open = list.filter((o) => o.in && STORE_BY_KEY.has(o.s)).map((o) => o.p);
    if (open.length >= 3) out.set(id, median(open)!);
  }
  medians.set(region, out);
  return out;
}

export function summaryOf(id: string, region: Region): Summary | null {
  return summariesFor(region).find((s) => s.product.id === id) ?? null;
}

/** Which regions list a product at all (for hreflang and the "other countries" line). */
export function regionsListing(id: string): Region[] {
  return (Object.keys(REGIONS) as Region[]).filter((r) => (data().offers[REGIONS[r].market]?.[id]?.length ?? 0) > 0);
}
