/**
 * Finds each product's Amazon ASIN, in every Amazon store we have a tag and a Creators API credential for
 * (US, UK, CA, AU; NZ reads AU's), in the daily refresh (GitHub Actions). The Creators API's getItems takes ASINs
 * only, so the build's price fetch needs them first. One searchItems by the EAN itself; if that finds nothing,
 * one by the product's name. A result counts ONLY when Amazon's own externalIds carry our EAN
 * (lib/amazon-creators.ts barcodeMatches): a wrong merge is worse than a missing price. Products without an EAN
 * are never searched. Products with the most in-stock stores go first. Found ASINs and misses go in
 * data/amazon/asins-<store>.json; a miss is retried after 30 days. Without credentials it does nothing; a refusal
 * (that store's account has no API access yet: 10 qualifying sales in 30 days) ends that store quietly.
 *   npx tsx scripts/amazon-asins.ts            AMAZON_SEARCH_BUDGET=300 calls a store by default
 */
import fs from "node:fs";
import path from "node:path";
import { amazonTags } from "../src/lib/affiliate";
import { AMAZON_STORES, AmazonRefused, barcodeMatches, credentialsFor, creatorsClient, type AmazonStore } from "../src/lib/amazon-creators";
import { AMAZON_DIR, asinFile, dueForSearch, readAsins, searchWords, statusFile, type AsinFile, type AsinStatus } from "../src/lib/amazon-asins";
import { REGIONS } from "../src/lib/regions";
import type { OffersFile, Product } from "../src/lib/types";

const DATA = path.resolve(process.cwd(), process.env.WGC_DATA_DIR || "data");
const RESOURCES = ["itemInfo.title", "itemInfo.externalIds"];

async function store(code: AmazonStore, products: Product[], offers: OffersFile) {
  const tag = amazonTags()[code];
  if (!tag) return;
  const status = (s: Omit<AsinStatus, "at">) => fs.writeFileSync(statusFile(code), JSON.stringify({ at: new Date().toISOString(), ...s }) + "\n");
  const creds = credentialsFor(code);
  if (!creds) {
    status({ state: "off" });
    return console.log(`Amazon ASINs ${code}: no AMAZON_CREATORS_* credentials, skipped.`);
  }
  const today = new Date().toISOString().slice(0, 10);
  const known: AsinFile = readAsins(code);
  const byId = offers[REGIONS[code].market] ?? {};
  const inStore = products
    .filter((p): p is Product & { ean: string } => !!p.ean)
    .map((p) => ({ p, n: (byId[p.id] ?? []).filter((o) => o.in).length }))
    .filter((x) => x.n)
    .sort((a, b) => b.n - a.n || a.p.ean.localeCompare(b.p.ean));
  const live = new Set(inStore.map((x) => x.p.ean));
  const todo = inStore.filter((x) => dueForSearch(known[x.p.ean], today));
  const api = await creatorsClient(code, tag, creds).catch((e) => {
    status({ state: "refused", note: (e as Error).message.slice(0, 160) });
    console.log(`Amazon ASINs ${code}: ${(e as Error).message}, skipped.`);
    return null;
  });
  if (!api) return;
  const budget = Number(process.env.AMAZON_SEARCH_BUDGET || 300);
  let found = 0, searched = 0, refused = "";
  for (const { p } of todo) {
    if (api.calls() >= budget) break;
    try {
      let hit = (await api.call("searchItems", { keywords: p.ean, resources: RESOURCES, itemCount: 10 })).find((it) => barcodeMatches(it, p.ean));
      if (!hit && api.calls() < budget)
        hit = (await api.call("searchItems", { keywords: searchWords(p), resources: RESOURCES, itemCount: 10 })).find((it) => barcodeMatches(it, p.ean));
      searched++;
      known[p.ean] = [hit?.asin ?? null, today];
      if (hit) found++;
    } catch (e) {
      console.log(`Amazon ASINs ${code}: stopped at ${p.ean}: ${(e as Error).message}`);
      if (e instanceof AmazonRefused) {
        refused = (e as Error).message.slice(0, 160);
        break;
      }
    }
  }
  // Products gone from the store drop out, so the file stays the size of the catalogue.
  const out = Object.fromEntries(Object.entries(known).filter(([e]) => live.has(e)).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(asinFile(code), JSON.stringify(out).replace(/\],"/g, '],\n"') + "\n");
  const asins = Object.values(out).filter((e) => e[0]).length;
  const waiting = Math.max(0, todo.length - searched);
  status({ state: refused && !searched ? "refused" : "ok", searched, found, known: asins, waiting, ...(refused ? { note: refused } : {}) });
  console.log(`Amazon ASINs ${code}: ${searched} searched, ${found} found, ${asins} known, ${waiting} waiting (${api.calls()} calls).`);
}

async function main() {
  const productsFile = path.join(DATA, "products.json");
  if (!fs.existsSync(productsFile)) return console.log("Amazon ASINs: no products.json, skipped.");
  fs.mkdirSync(AMAZON_DIR, { recursive: true });
  const products = JSON.parse(fs.readFileSync(productsFile, "utf8")) as Product[];
  let offers: OffersFile = {};
  try {
    offers = JSON.parse(fs.readFileSync(path.join(DATA, "offers.json"), "utf8")) as OffersFile;
  } catch {
    offers = {};
  }
  for (const s of AMAZON_STORES) await store(s, products, offers).catch((e) => console.log(`Amazon ASINs ${s} skipped: ${(e as Error).message}`));
}

main().catch((e) => console.log(`Amazon ASINs skipped: ${(e as Error).message}`));
