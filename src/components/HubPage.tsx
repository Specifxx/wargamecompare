import Link from "next/link";
import type { Summary } from "@/lib/data";
import type { Placement } from "@/lib/affiliate";
import type { RegionInfo } from "@/lib/regions";
import { EbayBox } from "./EbayBox";
import { ProductGrid } from "./ProductCard";

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
}: {
  r: RegionInfo;
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
    <div className="page py-8">
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-faint">
        <Link href={`/${r.region}`} className="hover:text-ink">{r.name}</Link>
      </nav>
      <h1 className="font-display text-3xl font-extrabold leading-tight">{title}</h1>
      <p className="mt-2 max-w-3xl text-muted">{intro}</p>
      {chips && chips.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((c) => (
            <Link key={c.href} href={c.href} className="chip">
              {c.label} <span className="text-faint">{c.n}</span>
            </Link>
          ))}
        </div>
      )}
      <section className="mt-8">
        <h2 className="mb-4 font-display text-xl font-bold">In stock ({inStock.length.toLocaleString("en")})</h2>
        {inStock.length ? <ProductGrid items={inStock.slice(0, SHOWN)} region={r.region} /> : <p className="text-muted">Nothing in stock at the stores we compare today.</p>}
        {inStock.length > SHOWN && (
          <p className="mt-4">
            <Link href={searchHref} className="btn-ghost">See all {inStock.length.toLocaleString("en")} in stock</Link>
          </p>
        )}
      </section>
      <div className="my-10">
        <EbayBox region={r.region} query={ebayQuery} heading={`${ebayQuery} on eBay`} placement={placement} />
      </div>
      {sold.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold">Sold out everywhere today ({sold.length.toLocaleString("en")})</h2>
          <ProductGrid items={sold.slice(0, 24)} region={r.region} />
        </section>
      )}
    </div>
  );
}
