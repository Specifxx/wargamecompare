import { regionBootScript } from "./region-boot";
// The markets WargameCompare compares within. A market is a region whose stores all charge in ONE currency, so
// "cheapest" is always a like-for-like number a buyer there is offered. Prices are never converted.
// Launch scope (owner, 2026-10-28): UK, Australia, New Zealand and Canada first, the US second, no EU.
// Pure module: safe in client components.
export type Region = "uk" | "au" | "nz" | "ca" | "us";
export type Market = Uppercase<Region>;

export interface RegionInfo {
  region: Region;
  market: Market;
  name: string;
  inName: string; // after "in": "in the UK"
  short: string;
  currency: string;
  locale: string;
  shopifyCountry: string; // Shopify Markets ?country=
  hreflang: string;
  taxNote: string;
}

export const REGIONS: Record<Region, RegionInfo> = {
  uk: { region: "uk", market: "UK", name: "United Kingdom", inName: "the UK", short: "UK", currency: "GBP", locale: "en-GB", shopifyCountry: "GB", hreflang: "en-GB", taxNote: "UK stores list prices including VAT." },
  au: { region: "au", market: "AU", name: "Australia", inName: "Australia", short: "AU", currency: "AUD", locale: "en-AU", shopifyCountry: "AU", hreflang: "en-AU", taxNote: "Australian stores list prices including GST." },
  nz: { region: "nz", market: "NZ", name: "New Zealand", inName: "New Zealand", short: "NZ", currency: "NZD", locale: "en-NZ", shopifyCountry: "NZ", hreflang: "en-NZ", taxNote: "New Zealand stores list prices including GST." },
  ca: { region: "ca", market: "CA", name: "Canada", inName: "Canada", short: "CA", currency: "CAD", locale: "en-CA", shopifyCountry: "CA", hreflang: "en-CA", taxNote: "Canadian prices exclude GST/HST and provincial sales tax, added at checkout." },
  us: { region: "us", market: "US", name: "United States", inName: "the US", short: "US", currency: "USD", locale: "en-US", shopifyCountry: "US", hreflang: "en-US", taxNote: "US prices exclude sales tax, added at checkout." },
};

export const REGION_LIST: RegionInfo[] = (["uk", "au", "nz", "ca", "us"] as Region[]).map((r) => REGIONS[r]);
/** The region of pages that have none (landing, About, legal) and the hreflang x-default: the US (owner, 2026-11-01). */
export const X_DEFAULT_REGION: Region = "us";

export function isRegion(v: string | null | undefined): v is Region {
  return !!v && Object.prototype.hasOwnProperty.call(REGIONS, v);
}

export function regionOfMarket(market: string): RegionInfo | null {
  const r = market.toLowerCase();
  return isRegion(r) ? REGIONS[r] : null;
}

export function formatPrice(cents: number, region: Region): string {
  const info = REGIONS[region];
  const s = new Intl.NumberFormat(info.locale, { style: "currency", currency: info.currency, currencyDisplay: "narrowSymbol" }).format(cents / 100);
  // "$" alone is ambiguous across AU, NZ, CA and US: prefix the market.
  return info.currency === "GBP" ? s : `${info.short === "US" ? "US" : info.short === "AU" ? "A" : info.short === "NZ" ? "NZ" : "C"}${s}`;
}

/** The visitor's region from a country code (Vercel's x-vercel-ip-country), for the landing page's suggestion only. */
export function regionFromCountry(code: string | null | undefined): Region | null {
  const c = (code ?? "").trim().toUpperCase();
  if (c === "GB" || c === "UK" || c === "IM" || c === "JE" || c === "GG") return "uk";
  if (c === "AU") return "au";
  if (c === "NZ") return "nz";
  if (c === "CA") return "ca";
  if (c === "US" || c === "PR") return "us";
  return null;
}

export function regionFromTimeZone(tz: string | undefined | null): Region | null {
  if (!tz) return null;
  if (/^Australia\//.test(tz)) return "au";
  if (/^Pacific\/(Auckland|Chatham)$/.test(tz)) return "nz";
  if (/^Europe\/(London|Belfast|Guernsey|Jersey|Isle_of_Man)$/.test(tz)) return "uk";
  if (/^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Montreal|Moncton|Whitehorse|Yellowknife)$/.test(tz)) return "ca";
  if (/^America\//.test(tz) || /^US\//.test(tz) || tz === "Pacific/Honolulu") return "us";
  return null;
}

/** The visitor's own region on every regional page (lib/region-boot.ts); a time zone we don't cover is the US. */
export const REGION_KEY = "wgc-region";
export const REGION_BOOT_SCRIPT = regionBootScript({
  key: REGION_KEY,
  hreflang: Object.fromEntries(REGION_LIST.map((r) => [r.region, r.hreflang])),
  zones: [
    ["au", "^Australia/"],
    ["nz", "^Pacific/(Auckland|Chatham)$"],
    ["uk", "^Europe/(London|Belfast|Guernsey|Jersey|Isle_of_Man)$"],
    ["ca", "^America/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Montreal|Moncton|Whitehorse|Yellowknife)$"],
    ["us", "^(America/|US/|Pacific/Honolulu$)"],
  ],
  fallback: "us",
  pageRegion: `C.indexOf(s)>=0?s:null`,
});
