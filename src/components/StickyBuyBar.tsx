import { REL_STORE } from "@/lib/affiliate";
import { OutboundLink } from "./OutboundLink";

/**
 * A phone's sticky buy bar (the engine's, from MTG Compare): the best price and the store's button pinned to the bottom of the
 * screen while the visitor reads the page, so the price table is never scrolled away from. Hidden from lg, where the best-price
 * card is always in view. Server markup, no hooks.
 */
export function StickyBuyBar({ price, store, href, note }: { price: string; store: string; href: string; note?: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 py-2.5 shadow-lift backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }} data-sticky-buy="">
      <div className="mx-auto flex max-w-page items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium leading-4 text-muted">{note ?? `Cheapest in stock · ${store}`}</p>
          <p className="tabular font-display text-lg font-bold leading-6">{price}</p>
        </div>
        <OutboundLink href={href} rel={REL_STORE} retailer={store} placement="product-sticky" className="btn-primary min-h-11 shrink-0 px-5">
          View deal <span aria-hidden="true">↗</span>
        </OutboundLink>
      </div>
    </div>
  );
}
