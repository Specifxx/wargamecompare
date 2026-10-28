import { TYPE_BY_SLUG } from "@/lib/catalog";
import { summariesFor } from "@/lib/data";
import { hubImage, HUB_IMAGE_SIZE } from "@/lib/og/hub-image";
import { isRegion } from "@/lib/regions";

// Drawn per request but held by Vercel's CDN for a day (next.config.js CDN_PAGES), like the pages: no ISR.
export const dynamic = "force-dynamic";
export const alt = "Store prices compared with RRP";
export const size = HUB_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image({ params }: { params: { region: string; type: string } }) {
  const region = isRegion(params.region) ? params.region : "uk";
  const t = TYPE_BY_SLUG.get(params.type);
  return hubImage(region, t ? t.name : "Warhammer prices", t ? summariesFor(region).filter((x) => x.product.type === t.slug) : []);
}
