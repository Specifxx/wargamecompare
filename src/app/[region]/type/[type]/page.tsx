import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HubPage } from "@/components/HubPage";
import { TYPE_BY_SLUG } from "@/lib/catalog";
import { summariesFor } from "@/lib/data";
import { hubIndexable } from "@/lib/index-tiers";
import { regionOr404 } from "@/lib/page";
import { REGION_LIST } from "@/lib/regions";
import { ogFor, regionAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

function load(params: { region: string; type: string }) {
  const r = regionOr404(params.region);
  const t = TYPE_BY_SLUG.get(params.type);
  if (!t) notFound();
  return { r, t, items: summariesFor(r.region).filter((x) => x.product.type === t.slug) };
}

export function generateMetadata({ params }: { params: { region: string; type: string } }): Metadata {
  const { r, t, items } = load(params);
  const title = `Warhammer ${t.name.toLowerCase()}: prices in ${r.inName}`;
  const description = `${items.length} ${t.name.toLowerCase()} compared across independent stores in ${r.inName}, cheapest in-stock price first.`;
  return {
    title: { absolute: title },
    description,
    alternates: regionAlternates(r.region, `/type/${t.slug}`, REGION_LIST.map((x) => x.region).filter((x) => hubIndexable(summariesFor(x).filter((y) => y.product.type === t.slug)))),
    robots: hubIndexable(items) ? undefined : { index: false, follow: true },
    openGraph: ogFor(`/${r.region}/type/${t.slug}`, title, description, `/${r.region}/type/${t.slug}/opengraph-image`),
  };
}

export default function TypePage({ params }: { params: { region: string; type: string } }) {
  const { r, t, items } = load(params);
  return (
    <HubPage
      r={r}
      title={`${t.name}: prices in ${r.inName}`}
      intro={`Every ${t.name.toLowerCase()} product the stores we compare list in ${r.inName}, in ${r.currency}, cheapest in stock first.`}
      items={items}
      searchHref={`/${r.region}/search?type=${t.slug}`}
      ebayQuery={`Warhammer ${t.name.split(/[,&]/)[0].trim()}`}
      placement="category-ebay"
    />
  );
}
