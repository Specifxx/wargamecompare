// The store registry (src/data/stores.json): every store WargameCompare reads. A store is listed only after a probe
// read it live and found Games Workshop product priced in its market's own currency (DEPLOY.md, "Adding a store").
import raw from "@/data/stores.json";
import type { Market } from "./regions";

export interface StoreConfig {
  key: string; // stable URL key: /<region>/stores/<key>
  name: string;
  base: string; // https origin, no trailing slash
  market: Market;
  /** ISO country sent as Shopify's ?country= so a Markets-enabled store prices in its own currency. */
  country: string;
  /** Shopify collection handles holding its Games Workshop stock; [] = the whole catalogue (/products.json). */
  collections: string[];
}

export const STORES: StoreConfig[] = (raw as StoreConfig[]).slice().sort((a, b) => a.name.localeCompare(b.name));
export const STORE_BY_KEY = new Map(STORES.map((s) => [s.key, s]));

export function storesInMarket(market: string): StoreConfig[] {
  return STORES.filter((s) => s.market === market);
}

export function storeHost(s: Pick<StoreConfig, "base">): string {
  return s.base.replace(/^https?:\/\/(www\.)?/, "");
}
