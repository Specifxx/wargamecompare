export type StockState = "open" | "soldout" | "pre";

// Short classes from globals.css (.sp-*, site review X1 2026-11-10): a price table draws a pill on every row, so the utility lists
// were repeated on every row. The dot is the pill's ::before (pulsing when open), not a child span.
const STYLE: Record<StockState, string> = {
  open: "sp-open",
  pre: "sp-pre",
  soldout: "sp-sold",
};

const SIZE = {
  md: "sp",
  // A product card's: one 20px line that fits a 2-up phone card ("In stock · 12 stores").
  sm: "sp sp-sm",
};

/** The engine's stock pill (from MTG Compare): a dot and the words, green in stock, violet on pre-order, grey sold out. */
export function StockPill({ state, size = "md", className = "", children }: { state: StockState; size?: keyof typeof SIZE; className?: string; children: React.ReactNode }) {
  return <span className={className ? `${SIZE[size]} ${STYLE[state]} ${className}` : `${SIZE[size]} ${STYLE[state]}`}>{children}</span>;
}
