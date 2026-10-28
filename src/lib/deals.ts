// Value, from today's data only (no price history): pure, tested.
//   • off RRP: the cheapest in-stock price against the RRP two or more stores state (their own "was" price);
//   • under the median: the cheapest in-stock price at least 10% under the median of three or more stores today.
// Never under half of either (that is a misfiled listing, not a deal).
import type { Summary } from "./data";

export interface Deal {
  s: Summary;
  basis: "rrp" | "median";
  ref: number; // cents
  saving: number; // 0..1
}

export function deals(summaries: Summary[], medians: Map<string, number>, minSaving = 0.1): Deal[] {
  const out: Deal[] = [];
  for (const s of summaries) {
    if (s.best == null || s.inStock < 1) continue;
    const med = medians.get(s.product.id) ?? null;
    let d: Deal | null = null;
    if (s.rrp && s.stores >= 2) {
      const saving = (s.rrp - s.best) / s.rrp;
      if (saving >= minSaving && saving <= 0.5) d = { s, basis: "rrp", ref: s.rrp, saving };
    }
    if (!d && med && med > s.best) {
      const saving = (med - s.best) / med;
      if (saving >= minSaving && saving <= 0.5) d = { s, basis: "median", ref: med, saving };
    }
    if (d) out.push(d);
  }
  // Bigger savings first, weighted by what you actually save (20% off £150 beats 25% off £4).
  return out.sort((a, b) => b.saving * Math.log10(b.ref) - a.saving * Math.log10(a.ref));
}

export function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}
