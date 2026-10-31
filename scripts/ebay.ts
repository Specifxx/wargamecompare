// The daily eBay pass (GitHub Actions, refresh-prices.yml after the store import): for the products worth a call, the
// cheapest new Buy It Now listing per eBay site, written to data/ebay.json. Off (a green no-op) until both
// EBAY_CLIENT_ID and EBAY_CLIENT_SECRET exist; keys that are set but refused fail the run red.
import fs from "node:fs";
import path from "node:path";
import { EBAY_CAMPAIGN_ID, affiliateSubId } from "@/lib/affiliate";
import { EBAY_SITES, endUserContext, pickBest, plan, searchFilter, searchQuery, type Candidate } from "@/lib/import/ebay";
import { REGIONS, type Market, type Region } from "@/lib/regions";
import type { EbayFile, OffersFile, Product, RrpFile } from "@/lib/types";

const DATA = path.join(process.cwd(), "data");
const read = <T>(f: string, d: T): T => {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8")) as T;
  } catch {
    return d;
  }
};

const pacificDay = (d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(d);

async function token(id: string, secret: string): Promise<string> {
  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}` },
    body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
  });
  if (!res.ok) throw new Error(`eBay refused the keys: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function remaining(tok: string): Promise<number | null> {
  try {
    const res = await fetch("https://api.ebay.com/developer/analytics/v1_beta/rate_limit/?api_name=browse&api_context=buy", { headers: { Authorization: `Bearer ${tok}` } });
    if (!res.ok) return null;
    const d = (await res.json()) as { rateLimits?: { resources?: { name: string; rates?: { remaining: number }[] }[] }[] };
    for (const rl of d.rateLimits ?? []) for (const r of rl.resources ?? []) if (/item_summary|buy\.browse$/.test(r.name)) return r.rates?.[0]?.remaining ?? null;
  } catch {
    /* unknown */
  }
  return null;
}

async function main() {
  const id = process.env.EBAY_CLIENT_ID?.trim();
  const secret = process.env.EBAY_CLIENT_SECRET?.trim();
  if (!id || !secret) {
    console.log("eBay is off: EBAY_CLIENT_ID / EBAY_CLIENT_SECRET are not set. Nothing to do.");
    return;
  }
  const campaign = EBAY_CAMPAIGN_ID;
  const cap = Math.max(0, Number(process.env.EBAY_DAILY_CAP || 2500));
  const products = read<Product[]>("products.json", []);
  const offers = read<OffersFile>("offers.json", {});
  const rrp = read<RrpFile>("rrp.json", {});
  const state = read<EbayFile>("ebay.json", { updatedAt: null, items: {} });
  state.checked ??= {};
  state.calls ??= {};
  const today = pacificDay();
  const spentToday = state.calls[today] ?? 0;

  const tok = await token(id, secret);
  const left = await remaining(tok);
  const budget = Math.max(0, Math.min(cap - spentToday, left == null ? cap - spentToday : left - 300));
  console.log(`eBay budget this run: ${budget} (cap ${cap}, spent today ${spentToday}, app remaining ${left ?? "unknown"})`);

  const byId = new Map(products.map((p) => [p.id, p]));
  const cands: Candidate[] = [];
  for (const market of Object.keys(EBAY_SITES) as Market[]) {
    // eBay Australia also serves New Zealand: AU candidates include NZ-only products.
    const lists = market === "AU" ? [offers.AU ?? {}, offers.NZ ?? {}] : [offers[market] ?? {}];
    const seen = new Set<string>();
    for (const list of lists)
      for (const [pid, os] of Object.entries(list)) {
        const p = byId.get(pid);
        if (!p || seen.has(pid) || !os.length) continue;
        seen.add(pid);
        if (market === "AU" && !(offers.AU ?? {})[pid]) continue; // NZ prices are in NZD: no A$ reference
        const open = os.filter((o) => o.in);
        const ref = rrp[market]?.[pid] ?? (open.length ? Math.min(...open.map((o) => o.p)) : Math.min(...os.map((o) => o.p)));
        cands.push({ product: p, market, ref, stores: new Set(os.map((o) => o.s)).size });
      }
  }
  const calls = plan(cands, state, budget, new Date());
  console.log(`${cands.length} candidates, ${calls.length} searches planned.`);

  let spent = 0;
  let found = 0;
  let failures = 0;
  const now = new Date().toISOString();
  try {
    for (const c of calls) {
      const site = EBAY_SITES[c.market]!;
      const q = searchQuery(c.product);
      const params = new URLSearchParams({
        q,
        filter: searchFilter(c.market, c.ref),
        sort: "price",
        limit: "30",
      });
      const ref = affiliateSubId("wgc", REGIONS[c.market.toLowerCase() as Region].region, "ebay", c.product.id);
      const res = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`, {
        headers: {
          Authorization: `Bearer ${tok}`,
          "X-EBAY-C-MARKETPLACE-ID": site.id,
          "X-EBAY-C-ENDUSERCTX": endUserContext(c.market, campaign || null, ref),
        },
      });
      spent++;
      if (res.status === 429) {
        console.log("eBay quota reached (429): stopping.");
        break;
      }
      if (!res.ok) {
        failures++;
        if (failures >= 10 && failures > spent * 0.2) throw new Error(`eBay searches failing: ${failures} of ${spent} (last HTTP ${res.status})`);
        continue;
      }
      const d = (await res.json()) as { itemSummaries?: Parameters<typeof pickBest>[1] };
      const best = pickBest(c.product, d.itemSummaries ?? [], site.currency, c.ref, now, site.country);
      const items = (state.items[c.market] ??= {});
      const checked = (state.checked[c.market] ??= {});
      if (best) {
        items[c.product.id] = best;
        delete checked[c.product.id];
        found++;
      } else {
        delete items[c.product.id];
        checked[c.product.id] = now;
      }
    }
  } finally {
    // Listings older than four days are dropped (a listing that old has likely sold), and products that are gone.
    const cutoff = Date.now() - 96 * 3_600_000;
    for (const m of Object.keys(state.items) as Market[])
      for (const [pid, it] of Object.entries(state.items[m] ?? {})) if (Date.parse(it.at) < cutoff || !byId.has(pid)) delete state.items[m]![pid];
    for (const m of Object.keys(state.checked ?? {}) as Market[])
      for (const pid of Object.keys(state.checked![m] ?? {})) if (!byId.has(pid)) delete state.checked![m]![pid];
    state.calls![today] = spentToday + spent;
    for (const d of Object.keys(state.calls!)) if (d < pacificDay(new Date(Date.now() - 14 * 86_400_000))) delete state.calls![d];
    state.updatedAt = now;
    fs.writeFileSync(path.join(DATA, "ebay.json"), JSON.stringify(state));
    console.log(`eBay: ${spent} searches, ${found} matched, ${failures} failed.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
