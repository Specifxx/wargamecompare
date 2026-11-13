// Outbound links: how WargameCompare earns. Pure (no data imports), so client components can use it.
//
//   • eBay Partner Network: Buy It Now SEARCH links on each market's eBay site, tagged with the EPN
//     campaign (EBAY_CAMPAIGN_ID, hard-coded) and a per-surface customid, `wgc-<region>-<placement>`, so EPN's report
//     says which site and which surface earned.
//   • Amazon Associates: one tag per Amazon store (US, UK, CA, AU), each from env; a market whose tag is not set shows
//     no Amazon link at all (an untagged link earns nothing and only takes the click). The subtag (ascsubtag) carries
//     the same `wgc-<region>-<placement>`.
//   • Wayland Games (UK, own programme, 5% for 30 days): a search link built from WAYLAND_SEARCH_TEMPLATE, shown only
//     once that is set (Wayland's site cannot be read, so it is a labelled link, never a compared price).
//   • Store partner programmes (store-partner-deals.ts): a store's own commission parameter and exclusive code.
// Store links otherwise go out untouched except for utm_source, which is what a partner conversation starts from.
import type { Region } from "./regions";
import { shopifyCartUrl } from "./checkout-link";
import { awinUrl, clickref, isAwinLink } from "./awin";

export const PLACEMENTS = [
  "product-best", // product page: the best-price card's button
  "product-table", // product page: the store price table
  "product-ebay", // product page: the eBay row pinned first in the price list
  "product-best-ebay", // product page: the eBay button beside the best price
  "product-amazon", // product page: the Amazon row
  "product-wayland", // product page: the Wayland Games row
  "product-sticky", // product page, phones: the buy bar
  "product-best-alt", // product page: the nearest paid price under the best price (lib/price-rows.ts paidAlternativeFor)
  "product-sticky-alt", // product page, phones: the same line in the buy bar
  "product-soldout", // product page, sold out everywhere: the eBay / Amazon box
  "browse-empty", // browse with no results: eBay search
  "browse-ebay", // browse with a query: the eBay row above the results
  "deals", // deals page rows
  "header", // the eBay item in the header
  "store-page", // a store page's visit link
  "menu-ebay", // the sidebar and the phone menu: the eBay link
  "quickview-ebay", // the quick view (a tile click): the eBay row pinned first
  "quickview-amazon", // the quick view: the Amazon row, second
  "quickview-table", // the quick view: the store rows
  "quickview-wayland", // the quick view: the Wayland Games row
  "inline-ebay", // the one ad block of every page (components/InlineAds.tsx, owner 2026-11-13): popular kits
  "inline-ebay-deals", // the ad block: today's deals
  "inline-ebay-all", // the ad block: the "All on eBay" link
  "dock-ebay", // the phone dock below 1280px (components/AdDock.tsx, owner 2026-11-06): the ad block's popular kits
  "dock-ebay-deals", // the phone dock: the ad block's deals
] as const;
export type Placement = (typeof PLACEMENTS)[number];

const SUBID_MAX = 60;
/** EPN drops a click whose customid holds anything outside a conservative set: sanitise hard (from RiftCompare). */
export function affiliateSubId(...parts: (string | null | undefined)[]): string {
  const s = parts
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
  return s.slice(0, SUBID_MAX).replace(/-$/, "") || "wgc";
}
export function subId(region: Region, placement: Placement): string {
  return affiliateSubId("wgc", region, placement);
}

/** A product name as a search query: store noise out (pre-order notes, bracketed codes, "Warhammer 40k -" prefixes stay). */
export function searchTerms(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\bpre[-\s]?orders?\b|\bpresale\b|\bin[-\s]?store\s*(?:pick\s*-?\s*up\s*)?only\b|\blimit\s*\d+\b/gi, " ")
    .replace(/\b\d{2}-\d{2,3}\b/g, " ") // GW item codes like 48-75
    .replace(/[[\]|()"“”]/g, " ")
    .replace(/(^|\s)[-–—:]+(?=\s|$)/g, " ")
    .replace(/(^|\s)-+(?=\S)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── eBay ──────────────────────────────────────────────────────────────────────
// One EPN campaign for every Compare site, hard-coded (owner, 2026-10-30: "make all of them use this exact campaign");
// no variable overrides it, and the customid prefix "wgc" tells this site apart in EPN's report.
export const EBAY_CAMPAIGN_ID = "5339155912";

const EPN: Record<string, { mkrid: string; siteid: string }> = {
  "www.ebay.com.au": { mkrid: "705-53470-19255-0", siteid: "15" },
  "www.ebay.com": { mkrid: "711-53200-19255-0", siteid: "0" },
  "www.ebay.co.uk": { mkrid: "710-53481-19255-0", siteid: "3" },
  "www.ebay.ca": { mkrid: "706-53473-19255-0", siteid: "2" },
};
// NZ has no EPN programme: NZ buyers use eBay Australia.
export const EBAY_FOR_REGION: Record<Region, string> = {
  uk: "www.ebay.co.uk",
  au: "www.ebay.com.au",
  nz: "www.ebay.com.au",
  ca: "www.ebay.ca",
  us: "www.ebay.com",
};
export function ebayLabel(region: Region): string {
  return { uk: "eBay UK", au: "eBay AU", nz: "eBay AU", ca: "eBay CA", us: "eBay US" }[region];
}

/** Tag any eBay URL (search or item) with the campaign and a customid. */
export function ebayAffiliateUrl(url: string, region: Region, placement: Placement): string {
  try {
    const u = new URL(url);
    const epn = EPN[u.hostname] ?? EPN[EBAY_FOR_REGION[region]];
    u.searchParams.set("mkevt", "1");
    u.searchParams.set("mkcid", "1");
    u.searchParams.set("mkrid", epn.mkrid);
    u.searchParams.set("siteid", epn.siteid);
    u.searchParams.set("campid", EBAY_CAMPAIGN_ID);
    u.searchParams.set("toolid", "10001");
    u.searchParams.set("customid", subId(region, placement));
    return u.toString();
  } catch {
    return url;
  }
}

/** A tagged Buy It Now search, new condition, on the region's eBay site. */
export function ebaySearchUrl(name: string, region: Region, placement: Placement): string {
  const u = new URL(`https://${EBAY_FOR_REGION[region]}/sch/i.html`);
  u.searchParams.set("_nkw", searchTerms(name) || "Warhammer");
  u.searchParams.set("LH_BIN", "1");
  u.searchParams.set("LH_ItemCondition", "1000"); // New
  u.searchParams.set("LH_PrefLoc", "1"); // located in that eBay site's country: no overseas postage (feedback, 2026-10-31)
  return ebayAffiliateUrl(u.toString(), region, placement);
}

// ─── Amazon ────────────────────────────────────────────────────────────────────
const AMAZON_HOST: Record<Region, string | null> = {
  us: "www.amazon.com",
  uk: "www.amazon.co.uk",
  ca: "www.amazon.ca",
  au: "www.amazon.com.au",
  nz: "www.amazon.com.au", // Amazon Australia ships to NZ; the label says so
};
/** Each Amazon store's tag: the owner's accounts, hard-coded (owner, 2026-11-02: no Vercel variable decides a tag). NZ uses Amazon AU. */
export function amazonTags(): Record<Region, string | null> {
  return {
    us: "riftcompare-20",
    uk: "compareempi03-21",
    ca: "compareempire-20",
    au: "wargamecomp-22",
    nz: "wargamecomp-22",
  };
}
export const AMAZON_DISCLOSURE = "As an Amazon Associate WargameCompare earns from qualifying purchases.";
/** Amazon's trademark notice (Operating Agreement Dos and Don'ts, 2026-11-02), in the footer of every page. */
export const AMAZON_TRADEMARK = "Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.";

export function amazonLabel(region: Region): string {
  if (region === "nz") return "Amazon Australia (ships to NZ)";
  return { us: "Amazon US", uk: "Amazon UK", ca: "Amazon Canada", au: "Amazon AU" }[region];
}

/** A tagged Amazon search for the product, or null where the market has no tag. Server-side (reads env). */
export function amazonSearchUrl(name: string, region: Region, placement: Placement, tags = amazonTags()): string | null {
  const tag = tags[region];
  const host = AMAZON_HOST[region];
  if (!tag || !host) return null;
  const u = new URL(`https://${host}/s`);
  u.searchParams.set("k", searchTerms(name));
  u.searchParams.set("tag", tag);
  u.searchParams.set("ascsubtag", subId(region, placement));
  return u.toString();
}

/** Amazon's own page for an item the Creators API found (lib/amazon-live.ts), tagged like a search; null without a store or tag. */
export function amazonItemUrl(asin: string, region: Region, placement: Placement, tags = amazonTags()): string | null {
  const tag = tags[region];
  const host = AMAZON_HOST[region];
  if (!tag || !host || !/^[A-Z0-9]{10}$/.test(asin)) return null;
  const u = new URL(`https://${host}/dp/${asin}`);
  u.searchParams.set("tag", tag);
  u.searchParams.set("ascsubtag", subId(region, placement));
  return u.toString();
}

// ─── Wayland Games ─────────────────────────────────────────────────────────────
/**
 * WAYLAND_SEARCH_TEMPLATE: Wayland's affiliate link with `{q}` where the search words go. Unset = no Wayland link.
 * Either a waylandgames.co.uk URL with its tracking parameter, or a network redirect (Awin) whose destination is the
 * encoded Wayland URL: there `{q}` sits inside an encoded URL, so the words are encoded twice.
 */
export function waylandSearchUrl(name: string, template: string | undefined = process.env.WAYLAND_SEARCH_TEMPLATE): string | null {
  const t = template?.trim();
  if (!t || !t.includes("{q}")) return null;
  const q = encodeURIComponent(searchTerms(name));
  if (/^https:\/\/(www\.)?waylandgames\.co\.uk\//.test(t)) return t.replace("{q}", q);
  if (/^https:\/\/www\.awin1\.com\//.test(t) && /waylandgames\.co\.uk/i.test(decodeURIComponent(t))) return t.replace("{q}", encodeURIComponent(q));
  return null;
}
/** Wayland is shown in these markets: it is a UK store that ships worldwide, priced in GBP. */
export const WAYLAND_REGIONS: readonly Region[] = ["uk"];

// ─── Stores ────────────────────────────────────────────────────────────────────
/** A store link with utm_source (so a store sees us in its own analytics), plus its partner commission parameter if any. */
export function storeUrl(url: string, ref?: { param: string; value: string } | null, opts: { checkout?: boolean } = {}): string {
  try {
    const u = new URL(url);
    if (!u.searchParams.has("utm_source")) {
      u.searchParams.set("utm_source", "wargamecompare.com");
      u.searchParams.set("utm_medium", "referral");
    }
    if (ref) u.searchParams.set(ref.param, ref.value);
    else {
      // No partner code of its own: a store that accepted us on Awin (src/lib/awin.ts) goes through its tracked deep link.
      const awin = awinUrl(u.toString(), clickref("wgc", u.hostname.replace(/^www\./, "")));
      if (awin) return awin;
      // Straight to checkout (lib/checkout-link.ts, owner 2026-11-06): an in-stock Shopify row
      // opens the store's cart with its variant in it. Never for a partner code or Awin store.
      const cart = opts.checkout ? shopifyCartUrl(u.toString()) : null;
      if (cart) {
        const c = new URL(cart);
        c.searchParams.set("utm_content", "checkout");
        return c.toString();
      }
    }
    return u.toString();
  } catch {
    return url;
  }
}

export const REL_PAID = "sponsored nofollow noopener";
export const REL_STORE = "nofollow noopener";
/** A store link's rel: "sponsored" once it earns (an Awin deep link), plain nofollow otherwise. */
export function storeRel(href: string): string {
  return isAwinLink(href) ? REL_PAID : REL_STORE;
}
export const EBAY_DISCLOSURE = "Affiliate link: as an eBay Partner Network affiliate, WargameCompare earns from qualifying purchases at no cost to you.";
