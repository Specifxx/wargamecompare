// Every data page is rendered on request and kept by Vercel's CDN for a day (next.config.js CDN headers), never ISR:
// an ISR write is billed per 8 KB and every release empties it, so on the sister sites it cost about twenty times the
// render (DECISIONS.md, "Pages are CDN-cached, not ISR"). Safe because no page reads a cookie, a header or the session.
import { notFound } from "next/navigation";
import { isRegion, REGIONS, type Region, type RegionInfo } from "./regions";

export function regionOr404(v: string): RegionInfo {
  if (!isRegion(v)) notFound();
  return REGIONS[v as Region];
}
