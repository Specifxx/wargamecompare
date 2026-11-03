export type StockState = "open" | "soldout" | "pre";

const STYLE: Record<StockState, string> = {
  open: "bg-open-soft text-open",
  pre: "bg-pre-soft text-pre",
  soldout: "bg-sold-soft text-sold",
};

const SIZE = {
  md: "gap-1.5 px-2.5 py-1 text-xs",
  // A product card's: one 20px line that fits a 2-up phone card ("In stock · 12 stores").
  sm: "gap-1 px-2 py-0.5 text-[11px] leading-4",
};

/** The engine's stock pill (from MTG Compare): a dot and the words, green in stock, violet on pre-order, grey sold out. */
export function StockPill({ state, size = "md", className = "", children }: { state: StockState; size?: keyof typeof SIZE; className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full font-semibold ${SIZE[size]} ${STYLE[state]} ${className}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full bg-current ${state === "open" ? "animate-pulse" : ""}`} aria-hidden="true" />
      {children}
    </span>
  );
}
