import Link from "@/components/Link";
import { EbayStrip } from "@/components/EbayStrip";
import type { Summary } from "@/lib/data";
import type { Placement } from "@/lib/affiliate";
import type { RegionInfo } from "@/lib/regions";
import { Breadcrumbs } from "./Breadcrumbs";
import { EbayBox } from "./EbayBox";
import { ProductGrid } from "./ProductCard";
import { Empty, Section } from "./Section";

const SHOWN = 96;

/** A game, army or product-type page: what is in stock first, then the rest, capped, with a link to search for all. */
export function HubPage({
  r,
  title,
  intro,
  items,
  searchHref,
  ebayQuery,
  placement,
  chips,
  path,
}: {
  r: RegionInfo;
  /** This page's path, for its BreadcrumbList. */
  path: string;
  title: string;
  intro: string;
  items: Summary[];
  searchHref: string;
  ebayQuery: string;
  placement: Placement;
  chips?: { href: string; label: string; n: number }[];
}) {
  const inStock = items.filter((s) => s.inStock > 0);
  const sold = items.filter((s) => s.inStock === 0);
  return (
    <div className="page py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { path: `/${r.region}`, label: r.name },
          { path, label: title },
        ]}
      />
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-[15px] leading-7 text-muted">{intro}</p>
      {chips && chips.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((c) => (
            <Link key={c.href} href={c.href} className="chip">
              {c.label} <span className="text-faint">{c.n}</span>
            </Link>
          ))}
        </div>
      )}
      <div className="mt-8">
        <EbayStrip region={r.region} items={inStock} placement="ebay-strip-hub" heading={`${ebayQuery} on eBay`} />
      </div>
      <Section title={`In stock (${inStock.length.toLocaleString("en")})`} href={inStock.length > SHOWN ? searchHref : undefined} linkLabel={`See all ${inStock.length.toLocaleString("en")} in stock`}>
        {inStock.length ? (
          <ProductGrid items={inStock.slice(0, SHOWN)} region={r.region} eager={4} />
        ) : (
          <Empty actions={[{ href: `/${r.region}/deals`, label: "Today’s deals" }, { href: `/${r.region}/new-releases`, label: "New releases" }, { href: `/${r.region}/search`, label: "Search every kit" }]}>
            Nothing in stock at the stores we compare today.
          </Empty>
        )}
      </Section>
      <div className="mt-10">
        <EbayBox region={r.region} query={ebayQuery} heading={`${ebayQuery} on eBay`} placement={placement} />
      </div>
      {sold.length > 0 && (
        <Section title={`Sold out everywhere today (${sold.length.toLocaleString("en")})`}>
          <ProductGrid items={sold.slice(0, 24)} region={r.region} />
        </Section>
      )}
    </div>
  );
}
