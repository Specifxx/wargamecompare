// Reading a WooCommerce store's public catalogue through the Store API (/wp-json/wc/store/v1/products), the
// storefront's own unauthenticated read endpoint, checked against robots.txt first. Products are returned in the
// Shopify product shape so the import treats both platforms alike (scripts/import.ts toListings).
//
// `collections` are Store API category slugs; [] means a keyword search per Games Workshop range (SEARCH_TERMS),
// which is how a chain whose categories mix brands (Mind Games) is read. Prices come in minor units with
// `currency_minor_unit`; a variable product reports its lowest variation price.
import type { StoreConfig } from "@/lib/stores";
import type { ShopifyProduct, StoreRead } from "./shopify";
import { get, robotsAllows, sleep } from "./http";

export const WOO_API = "/wp-json/wc/store/v1";
const PAGE = 100;
const MAX_PAGES = 30;
export const SEARCH_TERMS = ["warhammer", "citadel", "games workshop", "kill team", "necromunda", "horus heresy", "age of sigmar", "blood bowl", "black library", "warcry", "underworlds"];

export interface WooProductRaw {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  sku?: string;
  is_in_stock?: boolean;
  is_purchasable?: boolean;
  type?: string;
  images?: { src?: string }[];
  categories?: { id: number; name: string; slug: string }[];
  brands?: { name: string }[];
  tags?: { name: string }[];
  prices?: { price?: string; regular_price?: string; sale_price?: string; currency_code?: string; currency_minor_unit?: number };
}

const money = (v: string | undefined, unit: number): string | null => {
  if (!v || !/^\d+$/.test(v)) return null;
  return (Number(v) / 10 ** unit).toFixed(2);
};

/** A Woo product in the Shopify shape the import reads, or null when it has no price. */
export function wooToShopify(p: WooProductRaw): ShopifyProduct | null {
  const unit = p.prices?.currency_minor_unit ?? 2;
  const price = money(p.prices?.price, unit);
  if (!price) return null;
  const regular = money(p.prices?.regular_price, unit);
  return {
    id: p.id,
    title: p.name,
    handle: p.slug,
    url: p.permalink,
    vendor: p.brands?.[0]?.name ?? "",
    product_type: (p.categories ?? []).map((c) => c.name).join(" / "),
    tags: (p.tags ?? []).map((t) => t.name),
    variants: [{ id: p.id, title: "", price, compare_at_price: regular && regular !== price ? regular : null, available: p.is_in_stock !== false && p.is_purchasable !== false, sku: p.sku ?? null }],
    images: p.images?.length ? [{ src: p.images[0].src }] : [],
  };
}

export async function readWooStore(store: StoreConfig): Promise<StoreRead> {
  const allowed = await robotsAllows(store.base);
  if (!allowed(`${WOO_API}/products`)) return { ok: false, products: [], error: "robots.txt disallows the Store API" };
  let filters: string[];
  if (store.collections.length) {
    const cats = (await get(`${store.base}${WOO_API}/products/categories?per_page=100`)) as { id: number; slug: string }[] | null;
    if (!Array.isArray(cats)) return { ok: false, products: [], error: "categories unreadable" };
    const ids = new Map(cats.map((c) => [c.slug, c.id]));
    filters = store.collections.map((slug) => (ids.has(slug) ? `category=${ids.get(slug)}` : `search=${encodeURIComponent(slug)}`));
  } else {
    filters = SEARCH_TERMS.map((t) => `search=${encodeURIComponent(t)}`);
  }
  const seen = new Set<number>();
  const products: ShopifyProduct[] = [];
  for (const filter of filters) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      await sleep(900);
      const data = (await get(`${store.base}${WOO_API}/products?per_page=${PAGE}&page=${page}&${filter}`)) as WooProductRaw[] | null;
      if (!Array.isArray(data)) {
        if (page === 1) return { ok: false, products: [], error: `${filter} unreadable` };
        return { ok: false, products: [], error: `page ${page} of ${filter} unreadable` };
      }
      for (const p of data) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        const sp = wooToShopify(p);
        if (sp) products.push(sp);
      }
      if (data.length < PAGE) break;
    }
  }
  return { ok: true, products };
}

/** The currency the store's first searched product is priced in, or null. */
export async function wooCurrency(store: StoreConfig): Promise<string | null> {
  const data = (await get(`${store.base}${WOO_API}/products?per_page=1&search=warhammer`).catch(() => null)) as WooProductRaw[] | null;
  return data?.[0]?.prices?.currency_code ?? null;
}
