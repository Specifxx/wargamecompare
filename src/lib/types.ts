// The public data files under data/ (written by scripts/import.ts in GitHub Actions, committed to main, read by the
// site at render time). Nothing private is ever written there: the directory is public with the source.
import type { Market } from "./regions";

export interface Product {
  id: string; // the URL slug
  name: string;
  system: string | null;
  faction: string | null;
  type: string;
  /** GTIN/EAN when the stores' SKUs agree on one (the identity key); null for a title-matched product. */
  ean: string | null;
  /** Every product code its listings carry ("short:48-75", "item:99120101498", "ean:5011921…"): keeps the slug stable between imports. */
  codes: string[];
  /** The box code ("48-75") when known, shown on the page. */
  code: string | null;
  image: string | null; // a store's own photo, hotlinked
  firstSeen: string; // ISO date
}

/** One store's current listing of a product, in that store's market currency. */
export interface Offer {
  s: string; // store key
  p: number; // price, cents
  in: boolean; // orderable now
  u: string; // product path at the store ("/products/…"; offersFor() adds the store's base), or a full URL
  t: string; // the store's own title (up to 100 characters)
  w?: number; // the store's own "was" (compare-at) price, cents, when it shows one
}

/** The RRP stores state (their compare-at price), per market, in cents: only when two or more stores agree. */
export type RrpFile = Partial<Record<Market, Record<string, number>>>;

export interface StoreHealth {
  ok: boolean;
  lastOkAt: string | null;
  listed: number;
  inStock: number;
  error?: string;
}

export interface Meta {
  updatedAt: string;
  stores: Record<string, StoreHealth>;
  products: number;
}

export type OffersFile = Partial<Record<Market, Record<string, Offer[]>>>;

/** The cheapest matching NEW Buy It Now eBay listing per market and product (scripts/ebay.ts). Display only: never a store. */
export interface EbayItem {
  p: number; // item price, cents, in the eBay site's currency
  sh: number | null; // first shipping option, cents; null = unknown
  u: string; // eBay's affiliate URL as returned
  t: string; // listing title
  i: string | null; // listing photo
  at: string; // when it was checked
}
export interface EbayFile {
  updatedAt: string | null;
  items: Partial<Record<Market, Record<string, EbayItem>>>;
  /** When a product was last searched without a match (so it is not searched again until it is due). */
  checked?: Partial<Record<Market, Record<string, string>>>;
  /** Calls spent per Pacific-time day (eBay's quota day), for the ops monitor. */
  calls?: Record<string, number>;
}
