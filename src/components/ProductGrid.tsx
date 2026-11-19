import type { Summary } from "@/lib/data";
import type { Region } from "@/lib/regions";
import { ProductCard } from "./ProductCard";

/** A product grid: two columns on a phone, three from md, four from lg (the engine's widths; the sidebar takes the rest). */
/** `rail`: one sideways row on a phone (the home page's savings, 2026-11-19), the usual grid from sm up. */
export function ProductGrid({ items, region, eager = 0, rail }: { items: Summary[]; region: Region; eager?: number; rail?: boolean }) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4${rail ? " phone-rail" : ""}`}>
      {items.map((s, i) => (
        <ProductCard key={s.product.id} s={s} region={region} priority={i < eager} />
      ))}
    </div>
  );
}
