import { FACTIONS, SYSTEMS } from "@/lib/catalog";
import { summariesFor } from "@/lib/data";
import { GUIDES, fill } from "@/lib/guides";
import { hubIndexable } from "@/lib/index-tiers";
import { REGION_LIST } from "@/lib/regions";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { storesInMarket } from "@/lib/stores";

// /llms.txt (llmstxt.org): a plain map of the site for AI answer engines, built from the same data as the pages
// (SEO audit 2026-11-03: the path answered a soft 404). Cached by Vercel's CDN (next.config.js CDN_PAGES).
export const dynamic = "force-dynamic";

export function GET() {
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION} Every listing is matched to a Games Workshop product by its box code, item number or barcode. Prices are each store's own, in its own currency, never converted, and checked daily. Independent; not affiliated with Games Workshop.`,
    "",
  ];
  for (const r of REGION_LIST) {
    const all = summariesFor(r.region);
    lines.push(`## ${r.name} (${r.currency}, ${storesInMarket(r.market).length} stores)`);
    lines.push(`- [Warhammer prices in ${r.inName}](${SITE_URL}/${r.region})`);
    lines.push(`- [Deals in ${r.inName} today](${SITE_URL}/${r.region}/deals)`);
    lines.push(`- [Stores we compare in ${r.inName}](${SITE_URL}/${r.region}/stores)`);
    for (const g of GUIDES) lines.push(`- [${fill(g.h1, r.inName)}](${SITE_URL}/${r.region}/guides/${g.slug}): ${fill(g.description, r.inName)}`);
    for (const s of SYSTEMS) if (hubIndexable(all.filter((x) => x.product.system === s.slug))) lines.push(`- [${s.name} prices in ${r.inName}](${SITE_URL}/${r.region}/game/${s.slug})`);
    for (const f of FACTIONS) if (hubIndexable(all.filter((x) => x.product.faction === f.slug))) lines.push(`- [${f.name} prices in ${r.inName}](${SITE_URL}/${r.region}/faction/${f.slug})`);
    lines.push("");
  }
  lines.push("## About", `- [About ${SITE_NAME}](${SITE_URL}/about)`, `- [How we pick stores](${SITE_URL}/how-we-pick-stores)`, `- [Affiliate disclosure](${SITE_URL}/affiliate-disclosure)`, "");
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
