// Region guides (2026-11-01): written around the day's prices, so every number is a real store price. Each answers one
// question no hub page answers: how to start for the least money, and how much the discount stores really save.
import type { Summary } from "./data";

export type GuideSlug = "cheapest-way-to-start" | "discount-stores-vs-rrp";

export interface GuideInfo {
  slug: GuideSlug;
  /** `{in}` → "the UK" */
  title: string;
  h1: string;
  description: string;
}

export const GUIDES: GuideInfo[] = [
  {
    slug: "cheapest-way-to-start",
    title: "Cheapest way to start Warhammer in {in}: starter sets and Combat Patrols priced",
    h1: "The cheapest way to start Warhammer in {in}",
    description: "Starter sets, Combat Patrols, Spearheads and paint sets at today's lowest in-stock prices in {in}, and which one to buy first.",
  },
  {
    slug: "discount-stores-vs-rrp",
    title: "How much do Warhammer discount stores save in {in}? Every store vs RRP",
    h1: "How much Warhammer discount stores save in {in}",
    description: "Each independent store in {in} measured against RRP today: the typical saving, how many kits it beats RRP on, and the biggest savings.",
  },
];
export const GUIDE_BY_SLUG = new Map(GUIDES.map((g) => [g.slug as string, g]));
export const fill = (s: string, inName: string) => s.replaceAll("{in}", inName);

/** Median of fractions (deals.ts median rounds to whole cents). */
function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * Not a box to start with, though its type says so: roleplaying starter sets (Soulbound, Wrath & Glory), the Combat
 * Patrol companion book and Spearhead gaming packs (rules and terrain, no models).
 */
const NOT_A_STARTER = /\bsoulbound\b|\bwrath\s*(&|and)\s*glory\b|\broleplay|\bcompanion\b|\bgaming pack\b|\bbattlezone\b/i;
/** A whole Combat Patrol, Spearhead or Vanguard box ("Combat Patrol: Necrons"), not a unit sold "(Combat Patrol)". */
export const PATROL_BOX = /^(warhammer[^:]*:\s*)?(combat patrol|spearhead|vanguard)\s*[:\-\u2013]/i;

/** The cheapest in-stock boxes of a type, optionally of one game, at `minStores` or more stores (a real comparison). */
export function cheapestOfType(all: Summary[], type: string, n: number, system?: string, minStores = 2): Summary[] {
  return all
    .filter((s) => s.product.type === type && (type !== "combat-patrols" || PATROL_BOX.test(s.product.name)) && s.best != null && s.stores >= minStores && (!system || s.product.system === system) && !NOT_A_STARTER.test(s.product.name))
    .sort((a, b) => a.best! - b.best!)
    .slice(0, n);
}

export interface StoreSaving {
  store: string;
  /** In-stock products of this store that have a stated RRP. */
  compared: number;
  /** Median saving under RRP across them, 0..1 (negative = over RRP). */
  typical: number;
  /** Share of them priced under RRP. */
  under: number;
}

/**
 * Each store's in-stock prices against the RRP two or more stores state. `offers` is every product's store list for the
 * market; a store with fewer than `min` products compared is left out (a handful of kits is not a typical saving).
 */
export function storeSavings(all: Summary[], offers: (id: string) => { s: string; p: number; in: boolean }[], min = 20): StoreSaving[] {
  const by = new Map<string, number[]>();
  for (const s of all) {
    if (!s.rrp) continue;
    for (const o of offers(s.product.id)) {
      if (!o.in) continue;
      const list = by.get(o.s) ?? [];
      list.push((s.rrp - o.p) / s.rrp);
      by.set(o.s, list);
    }
  }
  return [...by]
    .filter(([, xs]) => xs.length >= min)
    .map(([store, xs]) => ({ store, compared: xs.length, typical: median(xs)!, under: xs.filter((x) => x > 0.005).length / xs.length }))
    .sort((a, b) => b.typical - a.typical || b.compared - a.compared);
}
