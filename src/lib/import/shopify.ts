// Reading a Shopify store's public catalogue: /collections/<handle>/products.json (or /products.json for the whole
// store), 250 a page, with ?country= so a Markets-enabled store prices in its own currency. The storefronts' own
// unauthenticated read endpoint, checked against robots.txt first; one store at a time per runner slot, politely.
import type { StoreConfig } from "@/lib/stores";
import { get, robotsAllows, sleep } from "./http";

export interface ShopifyVariant {
  id: number;
  title: string;
  price: string;
  compare_at_price?: string | null;
  available: boolean;
  sku?: string | null;
}
export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  vendor?: string;
  product_type?: string;
  tags?: string[] | string;
  variants?: ShopifyVariant[];
  images?: { src?: string }[];
}

export interface StoreRead {
  ok: boolean;
  products: ShopifyProduct[];
  error?: string;
}

const PAGE = 250;
const MAX_PAGES = 80; // 20,000 products: the biggest whole-catalogue store seen was ~15k

export async function readStore(store: StoreConfig): Promise<StoreRead> {
  const paths = store.collections.length ? store.collections.map((h) => `/collections/${h}/products.json`) : ["/products.json"];
  const allowed = await robotsAllows(store.base);
  const seen = new Set<number>();
  const products: ShopifyProduct[] = [];
  for (const path of paths) {
    if (!allowed(path)) return { ok: false, products: [], error: "robots.txt disallows the feed" };
    for (let page = 1; page <= MAX_PAGES; page++) {
      if (page > 1) await sleep(900);
      const url = `${store.base}${path}?limit=${PAGE}&page=${page}&country=${store.country}`;
      let data: { products?: ShopifyProduct[] } | null;
      try {
        data = (await get(url)) as { products?: ShopifyProduct[] } | null;
      } catch (e) {
        return { ok: false, products: [], error: (e as Error).message };
      }
      // A page after the first failing means we hold only part of the catalogue: refuse the whole read, so the
      // store's previous rows stay instead of most of them vanishing.
      if (!data || !Array.isArray(data.products)) return { ok: false, products: [], error: `page ${page} of ${path} unreadable` };
      for (const p of data.products) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        products.push(p);
      }
      if (data.products.length < PAGE) break;
    }
  }
  return { ok: true, products };
}

/** The currency the store charges for its own country (cart.js, else meta.json), or null. */
export async function storeCurrency(store: StoreConfig): Promise<string | null> {
  for (const path of ["/cart.js", "/meta.json"]) {
    const d = (await get(`${store.base}${path}?country=${store.country}`).catch(() => null)) as { currency?: string } | null;
    if (d?.currency) return d.currency;
  }
  return null;
}
