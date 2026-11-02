import { product, summaryOf } from "@/lib/data";
import { thumb } from "@/lib/images";
import { formatPrice, REGIONS } from "@/lib/regions";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { STORE_BY_KEY } from "@/lib/stores";
import { badgeHtml, regionParam } from "@/lib/embed";

// The embeddable price badge (DECISIONS.md, "Free price widgets", 2026-11-02). A route handler, so it escapes the root
// layout and can be framed (next.config.js, /embed/:path+). Reads only the committed data through src/lib/data.ts;
// it reads ?region, so its only cache is the CDN header (a day, like every page here).
export const dynamic = "force-dynamic";

const ID = /^[a-z0-9-]{1,160}$/;

export function GET(req: Request, { params }: { params: { id: string } }) {
  const region = regionParam(new URL(req.url).searchParams.get("region"));
  const r = REGIONS[region];
  const headers = { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" };
  const p = ID.test(params.id) ? product(params.id) : null;
  if (!p) {
    const body = badgeHtml({ site: SITE_NAME, name: "Not found", meta: "Search every kit we compare", price: null, sub: "", href: `${SITE_URL}/?utm_source=embed`, image: null });
    return new Response(body, { status: 404, headers: { ...headers, "Cache-Control": "public, s-maxage=86400" } });
  }
  const s = summaryOf(p.id, region);
  const store = s?.bestStore ? STORE_BY_KEY.get(s.bestStore)?.name ?? s.bestStore : null;
  const body = badgeHtml({
    site: SITE_NAME,
    name: p.name,
    meta: s?.rrp ? `RRP ${formatPrice(s.rrp, region)}` : r.name,
    price: s?.best != null ? `from ${formatPrice(s.best, region)}` : null,
    sub: s?.best != null ? `${store ? `at ${store} · ` : ""}${s.inStock} ${s.inStock === 1 ? "store" : "stores"} in stock` : `not in stock at a store in ${r.inName}`,
    href: `${SITE_URL}/${region}/p/${p.id}?utm_source=embed&utm_medium=widget`,
    image: thumb(p.image, 120),
  });
  return new Response(body, { headers: { ...headers, "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400" } });
}
