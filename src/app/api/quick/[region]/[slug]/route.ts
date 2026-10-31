import { product, summaryOf } from "@/lib/data";
import { priceRows } from "@/lib/price-rows";
import { thumb } from "@/lib/images";
import { isRegion } from "@/lib/regions";

// The quick view's prices for one kit in one region (components/QuickView.tsx): the same rows as the product page
// (lib/price-rows.ts). Kept by Vercel's CDN for a day like every page (the data only changes with a release, and a
// release empties the CDN), so a second open of the same kit never reaches a function.
export const dynamic = "force-dynamic";

export function GET(_req: Request, { params }: { params: { region: string; slug: string } }) {
  const p = isRegion(params.region) ? product(params.slug) : null;
  if (!p || !isRegion(params.region)) return new Response("Not found", { status: 404 });
  const s = summaryOf(p.id, params.region);
  const body = { id: p.id, stores: s?.stores ?? 0, inStock: s?.inStock ?? 0, rows: priceRows(p, params.region, "quickview"), name: p.name, img: thumb(p.image, 400) ?? null };
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600",
      "vercel-cdn-cache-control": "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
