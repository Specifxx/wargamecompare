import { summariesFor } from "@/lib/data";
import { thumb } from "@/lib/images";
import { isRegion } from "@/lib/regions";

// The search index for one region: every product it lists, compact. One response per region per day, kept by Vercel's
// CDN (the data only changes with a release, and a release empties the CDN), so a keystroke never reaches a function.
export const dynamic = "force-dynamic";

export function GET(_req: Request, { params }: { params: { region: string } }) {
  if (!isRegion(params.region)) return new Response("Not found", { status: 404 });
  const rows = summariesFor(params.region).map((s) => [
    s.product.id,
    s.product.name,
    s.product.system ?? "",
    s.product.faction ?? "",
    s.product.type,
    s.best,
    s.inStock,
    s.stores,
    s.off != null ? Math.round(s.off * 100) : null,
    thumb(s.product.image, 300),
  ]);
  return new Response(JSON.stringify(rows), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600",
      "vercel-cdn-cache-control": "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
