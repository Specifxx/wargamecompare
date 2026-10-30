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

export const PLACEMENTS = [
  "product-best", // product page: the best-price card's button
  "product-table", // product page: the store price table
  "product-ebay", // product page: the eBay row pinned first in the price list
  "product-best-ebay", // product page: the eBay button beside the best price
  "product-amazon", // product page: the Amazon row
  "product-wayland", // product page: the Wayland Games row
  "product-sticky", // product page, phones: the buy bar
  "product-soldout", // product page, sold out everywhere: the eBay / Amazon box
  "browse-empty", // browse with no results: eBay search
  "browse-ebay", // browse with a query: the eBay row above the results
  "deals", // deals page rows
  "header", // the eBay item in the header
  "store-page", // a store page's visit link
  "home-ebay", // region home: the eBay block
  "category-ebay", // game / faction / type pages: the eBay line
  "ebay-strip-home", // region home: the eBay strip
  "ebay-strip-hub", // game / faction / type pages: the eBay strip
  "ebay-strip-product", // product page: this kit and related kits on eBay
  "ebay-strip-deals", // deals page: the eBay strip
  "ebay-strip-footer", // every region page: the strip above the footer
  "landing-ebay", // the landing page and pages with no region: the eBay block
  "menu-ebay", // the sidebar and the phone menu: the eBay link
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
/** Each Amazon store's tag. US and AU fall back to the owner's existing Compare Empire tags until WargameCompare's own are set. */
export function amazonTags(env: Record<string, string | undefined> = process.env): Record<Region, string | null> {
  const ok = (v: string | undefined) => (v && /^[A-Za-z0-9-]{1,64}$/.test(v.trim()) ? v.trim() : null);
  const au = ok(env.AMAZON_TAG_AU) ?? "compareempire-22";
  return {
    us: ok(env.AMAZON_TAG_US) ?? "riftcompare-20",
    uk: ok(env.AMAZON_TAG_UK),
    ca: ok(env.AMAZON_TAG_CA),
    au,
    nz: au,
  };
}
export const AMAZON_DISCLOSURE = "As an Amazon Associate WargameCompare earns from qualifying purchases.";

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
export function storeUrl(url: string, ref?: { param: string; value: string } | null): string {
  try {
    const u = new URL(url);
    if (!u.searchParams.has("utm_source")) {
      u.searchParams.set("utm_source", "wargamecompare.com");
      u.searchParams.set("utm_medium", "referral");
    }
    if (ref) u.searchParams.set(ref.param, ref.value);
    return u.toString();
  } catch {
    return url;
  }
}

export const REL_PAID = "sponsored nofollow noopener";
export const REL_STORE = "nofollow noopener";
export const EBAY_DISCLOSURE = "Affiliate link: as an eBay Partner Network affiliate, WargameCompare earns from qualifying purchases at no cost to you.";
