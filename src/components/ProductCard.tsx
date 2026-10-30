import Link from "next/link";
import type { Summary } from "@/lib/data";
import { thumb } from "@/lib/images";
import { formatPrice, type Region } from "@/lib/regions";

/** A product tile: the store's photo (hotlinked), name, best in-stock price, how many stores, and the saving on RRP. */
export function ProductCard({ s, region }: { s: Summary; region: Region }) {
  const p = s.product;
  return (
    <Link
      href={`/${region}/p/${p.id}`}
      // A plain click opens the quick view (QuickView.tsx); the link itself stays for crawlers and new tabs.
      data-qv={p.id}
      data-qv-region={region}
      data-qv-name={p.name}
      data-qv-img={thumb(p.image, 400) ?? undefined}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
      <div className="plate m-2 aspect-square">
        {p.image ? (
          <img src={thumb(p.image, 400) ?? undefined} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain p-2" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-sold">No photo</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 px-3 pb-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-brand">{p.name}</p>
        <div className="mt-auto flex items-baseline justify-between gap-2 pt-1">
          {s.best != null ? (
            <span className="tabular text-base font-bold">{formatPrice(s.best, region)}</span>
          ) : (
            <span className="text-sm font-semibold text-sold">Sold out</span>
          )}
          {s.off != null && s.off >= 0.05 && <span className="rounded bg-open-soft px-1.5 text-xs font-bold text-open">−{Math.round(s.off * 100)}%</span>}
        </div>
        <p className="text-xs text-faint">
          {s.inStock} of {s.stores} {s.stores === 1 ? "store" : "stores"} in stock
        </p>
      </div>
    </Link>
  );
}

export function ProductGrid({ items, region }: { items: Summary[]; region: Region }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((s) => (
        <ProductCard key={s.product.id} s={s} region={region} />
      ))}
    </div>
  );
}
