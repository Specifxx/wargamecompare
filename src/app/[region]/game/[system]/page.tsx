import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HubPage } from "@/components/HubPage";
import { FACTIONS, SYSTEM_BY_SLUG, TYPES } from "@/lib/catalog";
import { summariesFor } from "@/lib/data";
import { hubIndexable } from "@/lib/index-tiers";
import { regionOr404 } from "@/lib/page";
import { REGION_LIST } from "@/lib/regions";
import { ogFor, regionAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

function load(params: { region: string; system: string }) {
  const r = regionOr404(params.region);
  const s = SYSTEM_BY_SLUG.get(params.system);
  if (!s) notFound();
  return { r, s, items: summariesFor(r.region).filter((x) => x.product.system === s.slug) };
}

export function generateMetadata({ params }: { params: { region: string; system: string } }): Metadata {
  const { r, s, items } = load(params);
  const title = `${s.name} prices in ${r.inName}: compare stores`;
  const description = `${items.length} ${s.name} products compared across independent stores in ${r.inName}, cheapest in-stock price first, with the saving on RRP.`;
  return {
    title: { absolute: title },
    description,
    alternates: regionAlternates(r.region, `/game/${s.slug}`, REGION_LIST.map((x) => x.region).filter((x) => hubIndexable(summariesFor(x).filter((y) => y.product.system === s.slug)))),
    robots: hubIndexable(items) ? undefined : { index: false, follow: true },
    openGraph: ogFor(`/${r.region}/game/${s.slug}`, title, description, `/${r.region}/game/${s.slug}/opengraph-image`),
  };
}

export default function GamePage({ params }: { params: { region: string; system: string } }) {
  const { r, s, items } = load(params);
  const chips = [
    ...FACTIONS.filter((f) => f.system === s.slug || (s.slug === "kill-team" && f.system === "warhammer-40k"))
      .map((f) => ({ href: `/${r.region}/faction/${f.slug}`, label: f.name, n: items.filter((x) => x.product.faction === f.slug).length }))
      .filter((c) => c.n > 0),
    ...(s.slug === "citadel" ? TYPES.filter((t) => ["paints", "paint-sets", "tools"].includes(t.slug)).map((t) => ({ href: `/${r.region}/type/${t.slug}`, label: t.name, n: items.filter((x) => x.product.type === t.slug).length })) : []),
  ];
  return (
    <HubPage
      r={r}
      title={`${s.name} prices in ${r.inName}`}
      intro={`Every ${s.name} product the stores we compare list in ${r.inName}, matched by box code and sorted by how many stores stock it. Prices are the stores' own, in ${r.currency}.`}
      items={items}
      searchHref={`/${r.region}/search?system=${s.slug}`}
      ebayQuery={s.slug === "citadel" ? "Citadel paint" : `Warhammer ${s.short}`}
      placement="category-ebay"
      chips={chips}
    />
  );
}
