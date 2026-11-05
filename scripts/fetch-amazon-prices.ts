// Runs first in every Vercel build: Amazon's own price of each product, in every Amazon store we have a tag
// for (US, UK, CA, AU; NZ reads AU's), looked up by EAN with the Creators API (getItems, itemIdType EAN, ten
// a call, one call a second) and written to data/amazon-live/<store>.json (git-ignored). Amazon's licence
// lets a price be kept for 24 hours and shown with its time, so prices are fetched by each build and never
// committed; the product page shows one only while under 24 hours old (lib/amazon-live.ts). Products with
// the most in-stock stores first, AMAZON_BUILD_CALLS calls a store (30 by default: 300 products, about 35
// seconds of build each). A price far from the store median (under 60% or over 160%) is dropped: a different
// product behind the barcode, or a marketplace seller's fantasy. Without credentials, or on any error, it
// writes nothing and never fails the build; a store whose account has no API access yet (403) is skipped and
// the next store still runs.
//   npx tsx scripts/fetch-amazon-prices.ts
import fs from "node:fs";
import path from "node:path";
import { amazonTags } from "../src/lib/affiliate";
import { AMAZON_STORES, AmazonRefused, credentialsFor, creatorsClient, MARKETS, pickListing, PRICE_RESOURCES, type AmazonStore } from "../src/lib/amazon-creators";
import { AMAZON_LIVE_DIR, type AmazonLiveFile } from "../src/lib/amazon-live";
import { REGIONS } from "../src/lib/regions";
import type { OffersFile, Product } from "../src/lib/types";

const DATA = path.resolve(process.cwd(), process.env.WGC_DATA_DIR || "data");

function median(xs: number[]): number | undefined {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return undefined;
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

async function store(code: AmazonStore, products: Product[], offers: OffersFile) {
  const tag = amazonTags()[code];
  const market = MARKETS[code];
  if (!tag) return;
  const creds = credentialsFor(code);
  if (!creds) return console.log(`Amazon prices ${code}: no AMAZON_CREATORS_* credentials, skipped.`);
  const byId = offers[REGIONS[code].market] ?? {};
  const inRegion = products
    .filter((p) => p.ean)
    .map((p) => ({ p, offers: (byId[p.id] ?? []).filter((o) => o.in) }))
    .filter((x) => x.offers.length)
    .sort((a, b) => b.offers.length - a.offers.length || b.offers[0].p - a.offers[0].p);
  const cap = Number(process.env.AMAZON_BUILD_CALLS || 30) * 10;
  const todo = inRegion.slice(0, cap);
  if (!todo.length) return;
  const api = await creatorsClient(code, tag, creds);
  const fetchedAt = new Date().toISOString();
  const prices: AmazonLiveFile["prices"] = {};
  for (let i = 0; i < todo.length; i += 10) {
    const batch = todo.slice(i, i + 10);
    let items;
    try {
      items = await api.call("getItems", { itemIds: batch.map((x) => x.p.ean), itemIdType: "EAN", resources: PRICE_RESOURCES });
    } catch (e) {
      console.log(`Amazon prices ${code}: ${(e as Error).message}`);
      if (e instanceof AmazonRefused) break;
      continue;
    }
    for (const x of batch) {
      const it = items.find((it) => (it.itemInfo?.externalIds?.eans?.displayValues ?? []).includes(x.p.ean!));
      const pick = it && pickListing(it, market.currency);
      if (!pick) continue;
      const cents = Math.round(pick.amount * 100);
      const ref = median(x.offers.map((o) => o.p));
      if (ref && (cents < ref * 0.6 || cents > ref * 1.6)) continue;
      prices[x.p.ean!] = { asin: it!.asin, p: cents };
    }
  }
  if (!Object.keys(prices).length) return console.log(`Amazon prices ${code}: none (${api.calls()} calls).`);
  fs.mkdirSync(AMAZON_LIVE_DIR, { recursive: true });
  fs.writeFileSync(path.join(AMAZON_LIVE_DIR, `${code}.json`), JSON.stringify({ fetchedAt, prices } satisfies AmazonLiveFile) + "\n");
  console.log(`Amazon prices ${code}: ${Object.keys(prices).length} of ${todo.length} products priced in ${api.calls()} calls.`);
}

async function main() {
  fs.rmSync(AMAZON_LIVE_DIR, { recursive: true, force: true });
  const productsFile = path.join(DATA, "products.json");
  if (!fs.existsSync(productsFile)) return console.log("Amazon prices: no products.json, skipped.");
  const products = JSON.parse(fs.readFileSync(productsFile, "utf8")) as Product[];
  let offers: OffersFile = {};
  try {
    offers = JSON.parse(fs.readFileSync(path.join(DATA, "offers.json"), "utf8")) as OffersFile;
  } catch {
    offers = {};
  }
  for (const s of AMAZON_STORES) await store(s, products, offers).catch((e) => console.log(`Amazon prices ${s} skipped: ${(e as Error).message}`));
}

main().catch((e) => console.log(`Amazon prices skipped: ${(e as Error).message}`));
