import { meta, offersFor, summariesFor } from "@/lib/data";
import { median } from "@/lib/deals";
import { linkPath, normaliseHost, variantOf, type CheckOffer, type CheckProduct, type StoreCheck } from "@/lib/link-check";
import { regionOfMarket } from "@/lib/regions";
import { STORES, type StoreConfig } from "@/lib/stores";

// GET /api/check/<host>: one store's listings, for the "Is this a good price?" checker (components/LinkChecker.tsx). The visitor
// pastes a product link; the browser asks for that store's listings here, each with the product's cheapest and median in-stock
// store price in the store's region, and finds the pasted one. Only a store in src/data/stores.json answers; any other host is a
// 404. Never fetches the store: these are the committed data files (lib/data.ts); eBay, Amazon and Wayland never count.
//
// A plain function kept by Vercel's CDN for a day (data only changes with a release, which empties it), never ISR.
// /api/ is disallowed in robots.txt.
export const dynamic = "force-dynamic";

const CDN = "public, s-maxage=86400, stale-while-revalidate=86400";
const headers = { "Cache-Control": "public, max-age=3600", "CDN-Cache-Control": CDN, "Vercel-CDN-Cache-Control": CDN };

const BY_HOST = new Map<string, StoreConfig>(STORES.map((s) => [normaliseHost(new URL(s.base).hostname), s]));

export function GET(_req: Request, { params }: { params: { host: string } }) {
  const store = BY_HOST.get(normaliseHost(decodeURIComponent(params.host)));
  const info = store ? regionOfMarket(store.market) : null;
  if (!store || !info) return Response.json({ error: "not a store we read" }, { status: 404, headers });
  const offers: CheckOffer[] = [];
  const products: Record<string, CheckProduct> = {};
  for (const s of summariesFor(info.region)) {
    const list = offersFor(s.product.id, info.region);
    const mine = list.filter((o) => o.s === store.key);
    if (!mine.length) continue;
    const open = list.filter((o) => o.in).map((o) => o.p);
    products[s.product.id] = {
      name: s.product.name,
      href: `/${info.region}/p/${s.product.id}`,
      cheapestCents: s.best,
      medianCents: open.length >= 2 ? median(open) : null,
      inStockStores: s.inStock,
      listedStores: s.stores,
    };
    for (const o of mine) {
      let path = "";
      try {
        path = linkPath(new URL(o.u).pathname);
      } catch {
        continue;
      }
      offers.push([path, s.product.id, o.p, o.in ? 1 : 0, variantOf(o.u)]);
    }
  }
  const body: StoreCheck = {
    v: 1,
    store: store.key,
    name: store.name,
    region: info.region,
    currency: info.currency,
    checkedAt: meta().stores[store.key]?.lastOkAt ?? null,
    offers,
    products,
  };
  return Response.json(body, { headers });
}
