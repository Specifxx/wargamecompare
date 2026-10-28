import { SYSTEM_BY_SLUG } from "@/lib/catalog";
import { summariesFor } from "@/lib/data";
import { hubImage, HUB_IMAGE_SIZE } from "@/lib/og/hub-image";
import { isRegion } from "@/lib/regions";

// Drawn per request but held by Vercel's CDN for a day (next.config.js CDN_PAGES), like the pages: no ISR.
export const dynamic = "force-dynamic";
export const alt = "Store prices compared with RRP";
export const size = HUB_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image({ params }: { params: { region: string; system: string } }) {
  const region = isRegion(params.region) ? params.region : "uk";
  const s = SYSTEM_BY_SLUG.get(params.system);
  return hubImage(region, s ? `${s.name} prices` : "Warhammer prices", s ? summariesFor(region).filter((x) => x.product.system === s.slug) : []);
}
