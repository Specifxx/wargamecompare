import type { Summary } from "@/lib/data";
import type { Region } from "@/lib/regions";
import { ProductCard } from "./ProductCard";

/** A product grid: two columns on a phone, three from md, four from lg (the engine's widths; the sidebar takes the rest). */
export function ProductGrid({ items, region, eager = 0 }: { items: Summary[]; region: Region; eager?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.map((s, i) => (
        <ProductCard key={s.product.id} s={s} region={region} priority={i < eager} />
      ))}
    </div>
  );
}
