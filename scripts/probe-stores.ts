// Research probe (never run by the import): reads candidate shops in probe/candidates.txt
// ("REGION host Name") the way the import would and writes probe/results.json: platform
// (Shopify / WooCommerce / other), currency, the Games Workshop collections found and how many
// listings each would compare. Run by .github/workflows/probe-stores.yml on a claude/* branch.
import fs from "node:fs";
import { get, robotsAllows, sleep } from "@/lib/import/http";
import { codesOf } from "@/lib/identify";
import { refuse } from "@/lib/listing-filter";
import type { ShopifyProduct } from "@/lib/import/shopify";

const MARKET: Record<string, { market: string; country: string }> = {
  GBP: { market: "UK", country: "GB" }, AUD: { market: "AU", country: "AU" }, NZD: { market: "NZ", country: "NZ" },
  CAD: { market: "CA", country: "CA" }, USD: { market: "US", country: "US" },
};
const GW_HANDLE = /games-?workshop|warhammer|40k|40000|sigmar|citadel|kill-?team|necromunda|horus|blood-?bowl|underworlds|warcry|old-?world|middle-?earth|black-?library|\bgw\b|wargam/i;
const NOT = /used|second|pre-?owned|bits|painted|magic|mtg|pokemon|tcg|card|funko|paint-?rack|3d/i;
const SHARD = Number(process.env.SHARD ?? 0);
const SHARDS = Number(process.env.SHARDS ?? 1);

interface Row { region: string; host: string; name: string; platform: string; currency?: string; market?: string; error?: string;
  collections?: { handle: string; title: string; listings: number; gw: number }[]; whole?: { listings: number; gw: number }; suggested?: unknown }

function countGw(products: ShopifyProduct[], gwCollection: boolean): number {
  let n = 0;
  for (const p of products) {
    const skus = (p.variants ?? []).map((v) => v.sku);
    const tags = Array.isArray(p.tags) ? p.tags : String(p.tags ?? "").split(",").map((t) => t.trim());
    const codes = codesOf(p.title, skus);
    if (!refuse({ title: p.title, vendor: p.vendor ?? "", productType: p.product_type ?? "", tags, hasCode: codes.length > 0, gwCollection })) n++;
  }
  return n;
}

async function probe(region: string, host: string, name: string): Promise<Row> {
  const base = `https://${host}`;
  const row: Row = { region, host, name, platform: "other" };
  let meta: { currency?: string } | null = null;
  try { meta = (await get(`${base}/meta.json`)) as { currency?: string }; } catch (e) { row.error = (e as Error).message; }
  if (!meta?.currency) {
    try {
      const woo = (await get(`${base}/wp-json/wc/store/v1/products?search=warhammer&per_page=20`)) as { name: string; prices?: { currency_code?: string; price?: string } }[];
      if (Array.isArray(woo)) {
        row.platform = "woocommerce"; row.currency = woo[0]?.prices?.currency_code;
        row.whole = { listings: woo.length, gw: woo.filter((p) => /warhammer|citadel|40k|sigmar|kill team|necromunda|horus|blood bowl/i.test(p.name)).length };
        return row;
      }
    } catch { /* not Woo */ }
    return row;
  }
  row.platform = "shopify"; row.currency = meta.currency; row.market = MARKET[meta.currency]?.market;
  const allowed = await robotsAllows(base);
  if (!allowed("/products.json") || !allowed("/collections/x/products.json")) { row.error = "robots.txt disallows the feed"; return row; }
  const country = MARKET[meta.currency]?.country ?? "GB";
  const cols: { handle: string; title: string; products_count?: number }[] = [];
  for (let page = 1; page <= 8; page++) {
    await sleep(900);
    try {
      const d = (await get(`${base}/collections.json?limit=250&page=${page}`)) as { collections: typeof cols };
      cols.push(...d.collections);
      if (d.collections.length < 250) break;
    } catch { break; }
  }
  const cands = cols.filter((c) => GW_HANDLE.test(`${c.handle} ${c.title}`) && !NOT.test(`${c.handle} ${c.title}`))
    .sort((a, b) => (b.products_count ?? 0) - (a.products_count ?? 0)).slice(0, 14);
  row.collections = [];
  for (const c of cands) {
    await sleep(900);
    try {
      const d = (await get(`${base}/collections/${c.handle}/products.json?limit=250&country=${country}`)) as { products: ShopifyProduct[] };
      row.collections.push({ handle: c.handle, title: c.title, listings: d.products.length, gw: countGw(d.products, true) });
    } catch (e) { row.collections.push({ handle: c.handle, title: c.title, listings: -1, gw: 0 }); }
  }
  await sleep(900);
  try {
    const d = (await get(`${base}/products.json?limit=250&country=${country}`)) as { products: ShopifyProduct[] };
    row.whole = { listings: d.products.length, gw: countGw(d.products, false) };
  } catch (e) { row.error = (e as Error).message; }
  const good = row.collections.filter((c) => c.gw >= 3 && c.gw / Math.max(1, c.listings) >= 0.5).sort((a, b) => b.gw - a.gw);
  if (good.length && row.market) {
    row.suggested = { key: host.replace(/^(www|shop|store)\./, "").replace(/\..*$/, "").replace(/[^a-z0-9]/g, ""), name, base, market: row.market, country, collections: good.slice(0, 6).map((c) => c.handle) };
  }
  return row;
}

async function main() {
  const lines = fs.readFileSync("probe/candidates.txt", "utf8").split("\n").map((l) => l.replace(/#.*/, "").trim()).filter(Boolean);
  const mine = lines.filter((_, i) => i % SHARDS === SHARD);
  const out: Row[] = [];
  for (const line of mine) {
    const [region, host, ...rest] = line.split(/\s+/);
    try { out.push(await probe(region, host, rest.join(" ") || host)); }
    catch (e) { out.push({ region, host, name: rest.join(" "), platform: "error", error: (e as Error).message }); }
    console.log(JSON.stringify(out[out.length - 1]));
  }
  fs.mkdirSync("probe", { recursive: true });
  fs.writeFileSync(`probe/out-${SHARD}.json`, JSON.stringify(out, null, 1));
}
main();
