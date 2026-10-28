import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HubPage } from "@/components/HubPage";
import { FACTION_BY_SLUG, SYSTEM_BY_SLUG, TYPES } from "@/lib/catalog";
import { summariesFor } from "@/lib/data";
import { hubIndexable } from "@/lib/index-tiers";
import { regionOr404 } from "@/lib/page";
import { REGION_LIST } from "@/lib/regions";
import { ogFor, regionAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

function load(params: { region: string; faction: string }) {
  const r = regionOr404(params.region);
  const f = FACTION_BY_SLUG.get(params.faction);
  if (!f) notFound();
  return { r, f, items: summariesFor(r.region).filter((x) => x.product.faction === f.slug) };
}

export function generateMetadata({ params }: { params: { region: string; faction: string } }): Metadata {
  const { r, f, items } = load(params);
  const title = `${f.name} prices in ${r.inName}: compare stores`;
  const description = `Compare ${items.length} ${f.name} kits, Combat Patrols, books and dice across independent stores in ${r.inName}, cheapest in stock first.`;
  return {
    title: { absolute: title },
    description,
    alternates: regionAlternates(r.region, `/faction/${f.slug}`, REGION_LIST.map((x) => x.region).filter((x) => hubIndexable(summariesFor(x).filter((y) => y.product.faction === f.slug)))),
    robots: hubIndexable(items) ? undefined : { index: false, follow: true },
    openGraph: ogFor(`/${r.region}/faction/${f.slug}`, title, description),
  };
}

export default function FactionPage({ params }: { params: { region: string; faction: string } }) {
  const { r, f, items } = load(params);
  const sys = SYSTEM_BY_SLUG.get(f.system);
  const chips = TYPES.map((t) => ({ href: `/${r.region}/search?faction=${f.slug}&type=${t.slug}`, label: t.name, n: items.filter((x) => x.product.type === t.slug).length })).filter((c) => c.n > 0);
  return (
    <HubPage
      r={r}
      title={`${f.name} prices in ${r.inName}`}
      intro={`${f.name} (${sys?.name ?? ""}) at the stores we compare in ${r.inName}: units, Combat Patrols and army sets, books and dice, matched by box code.`}
      items={items}
      searchHref={`/${r.region}/search?faction=${f.slug}`}
      ebayQuery={`Warhammer ${f.name}`}
      placement="category-ebay"
      chips={chips}
    />
  );
}
