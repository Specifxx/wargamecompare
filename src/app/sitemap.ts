import type { MetadataRoute } from "next";
import { FACTIONS, SYSTEMS, TYPES } from "@/lib/catalog";
import { meta, summariesFor } from "@/lib/data";
import { hubIndexable, productIndexable } from "@/lib/index-tiers";
import { REGION_LIST } from "@/lib/regions";
import { SITE_URL } from "@/lib/site";
import { storesInMarket } from "@/lib/stores";

// Only pages that pass their index tier (lib/index-tiers.ts): a new domain should spend Google's crawl on real comparisons.
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = meta().updatedAt || undefined;
  const out: MetadataRoute.Sitemap = [{ url: SITE_URL, lastModified }];
  for (const r of REGION_LIST) {
    const all = summariesFor(r.region);
    const at = (p: string) => out.push({ url: `${SITE_URL}/${r.region}${p}`, lastModified });
    at("");
    at("/deals");
    at("/stores");
    for (const s of storesInMarket(r.market)) if (all.filter((x) => x.bestStore === s.key && x.stores >= 2).length >= 6) at(`/stores/${s.key}`);
    for (const s of SYSTEMS) if (hubIndexable(all.filter((x) => x.product.system === s.slug))) at(`/game/${s.slug}`);
    for (const f of FACTIONS) if (hubIndexable(all.filter((x) => x.product.faction === f.slug))) at(`/faction/${f.slug}`);
    for (const t of TYPES) if (hubIndexable(all.filter((x) => x.product.type === t.slug))) at(`/type/${t.slug}`);
    for (const s of all) if (productIndexable(s)) at(`/p/${s.product.id}`);
  }
  for (const p of ["/about", "/affiliate-disclosure"]) out.push({ url: `${SITE_URL}${p}` });
  return out;
}
