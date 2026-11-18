import { mediansFor, summariesFor } from "@/lib/data";
import { deals } from "@/lib/deals";
import { hubImage, HUB_IMAGE_SIZE } from "@/lib/og/hub-image";
import { isRegion, REGIONS } from "@/lib/regions";

// The deals page's link preview (owner, 2026-11-18: "we need more shareable artefacts"): the hub card's look with the
// page's own deals. Drawn per request but held by Vercel's CDN for a day (next.config.js CDN_PAGES), like the pages: no ISR.
export const dynamic = "force-dynamic";
export const alt = "Warhammer deals today: store prices under RRP";
export const size = HUB_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image({ params }: { params: { region: string } }) {
  const region = isRegion(params.region) ? params.region : "uk";
  const list = deals(summariesFor(region), mediansFor(region)).map((d) => d.s);
  return hubImage(region, `Deals in ${REGIONS[region].inName} today`, list);
}
