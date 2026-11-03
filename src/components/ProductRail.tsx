import type { Summary } from "@/lib/data";
import type { Region } from "@/lib/regions";
import { ProductCard } from "./ProductCard";

/**
 * A short row of product cards (4 to 8). On a phone it is ONE row that scrolls sideways (globals.css .scroller: snap, no scrollbar, a
 * fade at the right edge that says there is more), so a rail costs one card's height instead of a grid's four rows; from sm it is a
 * grid of four columns. Never an ad unit. `bleed` (default): on a phone the row runs to the screen's edges (-mx-4 cancels .page's px-4).
 */
export function ProductRail({ items, region, eager = 0, label, bleed = true, className = "" }: { items: Summary[]; region: Region; eager?: number; label?: string; bleed?: boolean; className?: string }) {
  if (!items.length) return null;
  return (
    <ul role="list" aria-label={label} className={`scroller gap-3 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:[-webkit-mask-image:none] sm:[mask-image:none] ${bleed ? "-mx-4 px-4 scroll-px-4 sm:mx-0 sm:px-0" : ""} ${className}`}>
      {items.map((s, i) => (
        <li key={s.product.id} className="flex w-[42%] min-w-[9.5rem] max-w-[13rem] flex-col sm:w-auto sm:min-w-0 sm:max-w-none [&>div]:flex-1">
          <ProductCard s={s} region={region} priority={i < eager} />
        </li>
      ))}
    </ul>
  );
}
