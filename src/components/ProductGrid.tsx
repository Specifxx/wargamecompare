import type { ReactNode } from "react";
import type { Summary } from "@/lib/data";
import type { Region } from "@/lib/regions";
import { ProductCard } from "./ProductCard";

/**
 * A product grid: two columns on a phone, three from md, four from lg (the engine's widths; the sidebar takes the rest). With
 * `strip` (an EbayStrip), the strip sits on a row of its own after the first `stripAfter` products (4: one row on a desktop, two on a
 * phone) instead of above the list, so the products the visitor came for are the first thing on the page. `grid-flow-dense` lets the
 * products after it fill the gaps a 3-column row would leave before it.
 */
export function ProductGrid({ items, region, eager = 0, strip, stripAfter = 4 }: { items: Summary[]; region: Region; eager?: number; strip?: ReactNode; stripAfter?: number }) {
  const at = strip ? Math.min(stripAfter, items.length) : -1;
  return (
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 ${strip ? "grid-flow-dense" : ""}`}>
      {items.flatMap((s, i) => {
        const cell = <ProductCard key={s.product.id} s={s} region={region} priority={i < eager} />;
        return i + 1 === at
          ? [
              cell,
              <div key="ebay-strip" className="col-span-full">
                {strip}
              </div>,
            ]
          : [cell];
      })}
    </div>
  );
}
