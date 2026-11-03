import { FACTIONS, SYSTEMS, TYPES } from "@/lib/catalog";
import { meta, summariesFor } from "@/lib/data";
import { GUIDES } from "@/lib/guides";
import { hubIndexable, productIndexable } from "@/lib/index-tiers";
import { REGION_LIST, isRegion, type Region } from "@/lib/regions";
import { SITE_URL } from "@/lib/site";
import { storesInMarket } from "@/lib/stores";

// Only pages that pass their index tier (lib/index-tiers.ts): a new domain should spend Google's crawl on real comparisons.
// One file per region plus one for the site pages, listed by the index at /sitemap.xml (SEO audit 2026-11-03: the single
// file had 14,000+ URLs; every part stays well under 10,000 and Google's 50,000 limit).

export interface SitemapUrl {
  url: string;
  lastModified?: string;
}

/** The parts the index lists: `site`, then one per region. */
export function sitemapParts(): string[] {
  return ["site", ...REGION_LIST.map((r) => r.region)];
}

export function sitemapPart(part: string): SitemapUrl[] | null {
  const lastModified = meta().updatedAt || undefined;
  if (part === "site") {
    return [
      { url: SITE_URL, lastModified },
      ...["/about", "/creators", "/embed", "/price-report", "/affiliate-disclosure", "/how-we-pick-stores"].map((p) => ({ url: `${SITE_URL}${p}` })),
    ];
  }
  if (!isRegion(part)) return null;
  const region: Region = part;
  const r = REGION_LIST.find((x) => x.region === region)!;
  const out: SitemapUrl[] = [];
  const all = summariesFor(region);
  const at = (p: string) => out.push({ url: `${SITE_URL}/${region}${p}`, lastModified });
  at("");
  at("/deals");
  at("/new-releases");
  at("/black-friday");
  for (const p of ["/boxing-day", "/january-sales", "/lunar-new-year"]) at(p);
  at("/stores");
  at("/guides");
  for (const g of GUIDES) at(`/guides/${g.slug}`);
  for (const s of storesInMarket(r.market)) if (all.filter((x) => x.bestStore === s.key && x.stores >= 2).length >= 6) at(`/stores/${s.key}`);
  for (const s of SYSTEMS) if (hubIndexable(all.filter((x) => x.product.system === s.slug))) at(`/game/${s.slug}`);
  for (const f of FACTIONS) if (hubIndexable(all.filter((x) => x.product.faction === f.slug))) at(`/faction/${f.slug}`);
  for (const t of TYPES) if (hubIndexable(all.filter((x) => x.product.type === t.slug))) at(`/type/${t.slug}`);
  for (const s of all) if (productIndexable(s)) at(`/p/${s.product.id}`);
  return out;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function urlsetXml(urls: SitemapUrl[]): string {
  const rows = urls.map((u) => `<url><loc>${esc(u.url)}</loc>${u.lastModified ? `<lastmod>${esc(u.lastModified)}</lastmod>` : ""}</url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</urlset>\n`;
}

export function sitemapIndexXml(): string {
  const lastModified = meta().updatedAt || undefined;
  const rows = sitemapParts().map((p) => `<sitemap><loc>${SITE_URL}/sitemaps/${p}.xml</loc>${lastModified ? `<lastmod>${esc(lastModified)}</lastmod>` : ""}</sitemap>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</sitemapindex>\n`;
}
