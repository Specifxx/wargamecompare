import { offersFor, product, summariesFor, summaryOf } from "@/lib/data";
import { pickTiles } from "@/lib/ebay-tiles";
import { ebayLabel } from "@/lib/affiliate";
import { productShareText } from "@/lib/share-link";
import { STORE_BY_KEY } from "@/lib/stores";
import { priceRows } from "@/lib/price-rows";
import { thumb } from "@/lib/images";
import { formatPrice, isRegion, type Region } from "@/lib/regions";

// The quick view's prices for one kit in one region (components/QuickView.tsx): the same rows as the product page
// (lib/price-rows.ts). Kept by Vercel's CDN for a day like every page (the data only changes with a release, and a
// release empties the CDN), so a second open of the same kit never reaches a function.
export const dynamic = "force-dynamic";

export function GET(_req: Request, { params }: { params: { region: string; slug: string } }) {
  const p = isRegion(params.region) ? product(params.slug) : null;
  if (!p || !isRegion(params.region)) return new Response("Not found", { status: 404 });
  const s = summaryOf(p.id, params.region);
  const body = { id: p.id, stores: s?.stores ?? 0, inStock: s?.inStock ?? 0, rows: priceRows(p, params.region, "quickview"), name: p.name, img: thumb(p.image, 400) ?? null, path: `/${params.region}/p/${p.id}`,
    // The share message (lib/share-link.ts): the real gap between the region's cheapest and dearest in-stock store.
    share: productShareText(p.name, offersFor(p.id, params.region), (k) => STORE_BY_KEY.get(k)?.name ?? k, (c) => formatPrice(c, params.region as Region)) };
  // The quick view's eBay ads (owner, 2026-11-18: "ads can show in the quick view"): live eBay listings of other kits from the
  // same game, widest stocked first, photo and delivered price only. Read from the import's own eBay matches: no eBay call.
  const region = params.region as Region;
  const sameGame = summariesFor(region).filter((x) => x.product.id !== p.id && x.inStock > 0 && x.product.system === p.system).slice(0, 40);
  const ebayTiles = p.system ? pickTiles(region, sameGame, 40, "quickview-ebay-more").filter((t) => t.image && t.price != null).slice(0, 6) : [];
  const full = ebayTiles.length >= 3 ? { ...body, ebayAds: { label: ebayLabel(region), tiles: ebayTiles } } : body;
  return new Response(JSON.stringify(full), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600",
      "vercel-cdn-cache-control": "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
