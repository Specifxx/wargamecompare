// The daily price import (GitHub Actions, .github/workflows/refresh-prices.yml): read every store in
// src/data/stores.json, group the listings into products (src/lib/import/build.ts) and write the public data files
// the site reads. No database anywhere: the files are committed to main, and that commit is the day's release.
//
//   data/products.json   every product (name, system, faction, type, codes, photo URL)
//   data/offers.json     per market, per product: each store's current listing
//   data/rrp.json        per market, per product: the RRP two or more stores state
//   data/meta.json       when, and how each store read went (the ops monitor reads it)
//   data/cache/<store>.json.gz   each store's last GOOD read, so a store that fails today keeps yesterday's listings
//                                (for 72 hours) instead of vanishing. Git-ignored: kept between runs in
//                                the Actions cache (refresh-prices.yml). Never bundled with the site.
//
// Usage: tsx scripts/import.ts [--only key1,key2] [--concurrency 2]
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { STORES, type StoreConfig } from "@/lib/stores";
import { regionOfMarket } from "@/lib/regions";
import { readStore, storeCurrency, type ShopifyProduct } from "@/lib/import/shopify";
import { build, type StoreListing } from "@/lib/import/build";
import type { Meta, Product, StoreHealth } from "@/lib/types";

const DATA = path.join(process.cwd(), "data");
const CACHE = path.join(DATA, "cache");
const STALE_HOURS = 72;

function arg(name: string): string | null {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] ?? null : null;
}

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA, file), "utf8")) as T;
  } catch {
    return fallback;
  }
}

interface CacheFile {
  at: string;
  listings: StoreListing[];
}

function toListings(store: StoreConfig, products: ShopifyProduct[]): StoreListing[] {
  const out: StoreListing[] = [];
  for (const p of products) {
    const tags = Array.isArray(p.tags) ? p.tags : String(p.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);
    const variants = (p.variants ?? []).filter((v) => Number(v.price) > 0);
    // A product whose variants are different things ("Base / Layer / Shade") becomes one listing per variant;
    // a single "Default Title" variant is the product itself.
    const multi = variants.length > 1;
    for (const v of variants) {
      const cents = Math.round(Number(v.price) * 100);
      const was = v.compare_at_price ? Math.round(Number(v.compare_at_price) * 100) : null;
      out.push({
        store: store.key,
        market: store.market,
        title: (multi && v.title && v.title !== "Default Title" ? `${p.title} ${v.title}` : p.title).slice(0, 160),
        url: `${store.base}/products/${p.handle}${multi ? `?variant=${v.id}` : ""}`,
        cents,
        wasCents: was && Number.isFinite(was) ? was : null,
        inStock: v.available === true,
        image: p.images?.[0]?.src ?? null,
        skus: [v.sku ?? ""],
        vendor: p.vendor ?? "",
        productType: p.product_type ?? "",
        tags,
        gwCollection: store.collections.length > 0,
      });
    }
  }
  return out;
}

async function readOne(store: StoreConfig, prev: StoreHealth | undefined): Promise<{ health: StoreHealth; listings: StoreListing[] | null }> {
  const want = regionOfMarket(store.market)!.currency;
  const currency = await storeCurrency(store);
  if (currency && currency !== want) {
    return { health: { ok: false, lastOkAt: prev?.lastOkAt ?? null, listed: 0, inStock: 0, error: `prices in ${currency}, not ${want}` }, listings: null };
  }
  const read = await readStore(store);
  if (!read.ok) return { health: { ok: false, lastOkAt: prev?.lastOkAt ?? null, listed: 0, inStock: 0, error: read.error }, listings: null };
  const listings = toListings(store, read.products);
  return { health: { ok: true, lastOkAt: new Date().toISOString(), listed: listings.length, inStock: listings.filter((l) => l.inStock).length }, listings };
}

async function main() {
  const only = arg("only")?.split(",").map((s) => s.trim()).filter(Boolean) ?? null;
  const concurrency = Math.max(1, Number(arg("concurrency") ?? 2));
  const prevMeta = readJson<Meta>("meta.json", { updatedAt: "", stores: {}, products: 0 });
  const previous = readJson<Product[]>("products.json", []);
  fs.mkdirSync(CACHE, { recursive: true });

  const todo = STORES.filter((s) => !only || only.includes(s.key) || only.includes(s.market));
  const health: Record<string, StoreHealth> = { ...prevMeta.stores };
  let next = 0;
  async function worker() {
    while (next < todo.length) {
      const store = todo[next++];
      const t0 = Date.now();
      const { health: h, listings } = await readOne(store, prevMeta.stores[store.key]).catch((e) => ({
        health: { ok: false, lastOkAt: prevMeta.stores[store.key]?.lastOkAt ?? null, listed: 0, inStock: 0, error: String(e?.message ?? e) } as StoreHealth,
        listings: null,
      }));
      health[store.key] = h;
      if (listings) fs.writeFileSync(path.join(CACHE, `${store.key}.json.gz`), zlib.gzipSync(JSON.stringify({ at: h.lastOkAt ?? new Date().toISOString(), listings } satisfies CacheFile)));
      console.log(`${store.market} ${store.key}: ${h.ok ? `${h.listed} listings, ${h.inStock} in stock` : `FAILED ${h.error}`} (${Math.round((Date.now() - t0) / 1000)}s)`);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));

  // Every store's last good read, if it is fresh enough.
  const all: StoreListing[] = [];
  const now = Date.now();
  for (const s of STORES) {
    const f = path.join(CACHE, `${s.key}.json.gz`);
    if (!fs.existsSync(f)) continue;
    const c = JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString("utf8")) as CacheFile;
    if (now - Date.parse(c.at) > STALE_HOURS * 3_600_000) continue;
    all.push(...c.listings);
  }
  // Registry entries that were removed leave their cache behind: delete it.
  const keys = new Set(STORES.map((s) => s.key));
  for (const f of fs.readdirSync(CACHE)) if (!keys.has(f.replace(/\.json\.gz$/, ""))) fs.rmSync(path.join(CACHE, f));
  for (const k of Object.keys(health)) if (!keys.has(k)) delete health[k];

  const today = new Date().toISOString().slice(0, 10);
  const res = build(all, previous, today);
  // A run that would lose most of the catalogue is a broken read, not a market change: keep yesterday's files.
  if (previous.length > 200 && res.products.length < previous.length * 0.6) {
    console.error(`Refusing to write: ${res.products.length} products, yesterday ${previous.length}.`);
    process.exit(1);
  }
  fs.writeFileSync(path.join(DATA, "products.json"), JSON.stringify(res.products));
  fs.writeFileSync(path.join(DATA, "offers.json"), JSON.stringify(res.offers));
  fs.writeFileSync(path.join(DATA, "rrp.json"), JSON.stringify(res.rrp));
  const meta: Meta = { updatedAt: new Date().toISOString(), stores: health, products: res.products.length };
  fs.writeFileSync(path.join(DATA, "meta.json"), JSON.stringify(meta, null, 1));

  const perMarket = Object.entries(res.offers).map(([m, o]) => `${m} ${Object.keys(o ?? {}).length}`).join(", ");
  const multi = Object.entries(res.offers)
    .map(([m, o]) => `${m} ${Object.values(o ?? {}).filter((x) => new Set(x.map((y) => y.s)).size >= 2).length}`)
    .join(", ");
  console.log(`\n${res.products.length} products from ${all.length} listings (${res.unmatched} unmatched). Refused: ${JSON.stringify(res.refused)}`);
  console.log(`Products with an offer per market: ${perMarket}`);
  console.log(`Products with 2+ stores per market: ${multi}`);
  const failed = Object.entries(health).filter(([, h]) => !h.ok);
  if (failed.length) console.log(`Failed stores: ${failed.map(([k, h]) => `${k} (${h.error})`).join("; ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
