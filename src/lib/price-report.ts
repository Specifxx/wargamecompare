// The self-updating monthly price report (DECISIONS.md, "Self-updating price report", 2026-11-02): the page outreach
// offers hobby writers to quote, rebuilt from the day's committed prices, so nobody writes it. Pure:
// tests/price-report.test.ts.
import type { Summary } from "./data";

export interface RegionStats {
  /** Products with an in-stock store price. */
  inStock: number;
  /** Of those with a stated RRP, how many a store sells under it, and the median saving (0..1). */
  withRrp: number;
  underRrp: number;
  medianOff: number | null;
  /** Distinct stores with something in stock. */
  stores: number;
}

function medianOf(xs: number[]): number | null {
  if (!xs.length) return null;
  const v = xs.slice().sort((a, b) => a - b);
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

export function regionStats(rows: Summary[], storesInStock: number): RegionStats {
  const open = rows.filter((s) => s.best != null);
  const withRrp = open.filter((s) => s.rrp != null);
  const offs = withRrp.map((s) => s.off).filter((o): o is number => o != null && o > 0);
  return { inStock: open.length, withRrp: withRrp.length, underRrp: offs.length, medianOff: medianOf(offs), stores: storesInStock };
}

/** The most widely stocked products (the ones every army needs), cheapest first among equals: the "basket" table. */
export function widelyStocked(rows: Summary[], n = 10): Summary[] {
  return rows
    .filter((s) => s.best != null && s.inStock >= 3)
    .sort((a, b) => b.inStock - a.inStock || (b.off ?? 0) - (a.off ?? 0) || a.product.name.localeCompare(b.product.name))
    .slice(0, n);
}

/** "November 2026" for the report's title, from the data's own date. */
export function reportMonth(iso: string | null | undefined): string {
  const d = iso ? new Date(iso) : new Date();
  return (Number.isNaN(d.getTime()) ? new Date() : d).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

export const pctText = (x: number | null) => (x == null ? "—" : `${Math.round(x * 100)}%`);
