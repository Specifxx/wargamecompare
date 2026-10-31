// From every store's raw listings to the public data files: products, per-market offers and stated RRPs. Pure and
// tested (tests/build.test.ts); scripts/import.ts does the reading and writing.
import { factionOf, systemOf, typeOf } from "@/lib/catalog";
import { codesOf, groupListings, titleKey, type Code } from "@/lib/identify";
import { refuse } from "@/lib/listing-filter";
import type { Market } from "@/lib/regions";
import type { Offer, OffersFile, Product, RrpFile } from "@/lib/types";

export interface StoreListing {
  store: string;
  market: Market;
  title: string;
  url: string;
  cents: number;
  wasCents: number | null;
  inStock: boolean;
  image: string | null;
  skus: string[];
  vendor: string;
  productType: string;
  tags: string[];
  /** Read from one of the store's GW collections (not the whole catalogue). */
  gwCollection?: boolean;
}

/** A display name from a store title: store noise out, ALL CAPS calmed, never invented. */
export function cleanName(title: string): string {
  let t = title
    .replace(/\s*[([]\s*(?:pre-?order|preorder|max|limit|ships?|release|oop)[^)\]]*[)\]]/gi, "")
    .replace(/\s*[([]\s*\d{2,3}-\d{1,3}\s*[)\]]|\s*[([]\s*\d{9,13}\s*[)\]]/g, "")
    .replace(/\s*-?\s*\bpre-?order\b.*$/i, "")
    .replace(/^\s*(?:games workshop|gw)\s*[-:|]?\s*/i, "")
    .replace(/^\s*oop\s*-\s*/i, "")
    .replace(/\s*\[[^\]]*\]\s*$/, "")
    .replace(/\s+[.]+$|\.$/, "")
    .replace(/\s*\(?\b\d{1,2}\s?ml\)?\s*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (t && t === t.toUpperCase() && /[A-Z]{3}/.test(t)) {
    t = t.toLowerCase().replace(/(^|[\s:(/-])([a-z])/g, (_, a, b) => a + b.toUpperCase()).replace(/\b(Of|The|And|With|On|In|For)\b/g, (w, _x, i) => (i ? w.toLowerCase() : w));
  }
  return t;
}

export function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
    .replace(/-$/, "");
}

function pickName(titles: string[]): string {
  const counts = new Map<string, { n: number; name: string }>();
  for (const t of titles) {
    const name = cleanName(t);
    if (!name) continue;
    const k = name.toLowerCase();
    const c = counts.get(k) ?? { n: 0, name };
    c.n++;
    counts.set(k, c);
  }
  // Most stores' wording wins; between equals, the cleanest: "Faction: Unit" form, no shouting, no store prefix or pot size.
  const tidy = (name: string) =>
    (name.includes(":") ? 3 : 0) -
    (name.split(/\s+/).filter((w) => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w)).length > 1 ? 5 : 0) -
    (/^(?:warhammer|games workshop)\b/i.test(name) ? 3 : 0) -
    (/\b\d{2}\s?ml\b/i.test(name) ? 2 : 0) -
    name.length / 40;
  const list = [...counts.values()];
  list.sort((a, b) => b.n - a.n || tidy(b.name) - tidy(a.name));
  return list[0]?.name ?? titles[0];
}

function median(xs: number[]): number {
  const s = xs.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

/** The RRP as the stores state it: the most common compare-at price, when at least two stores agree on it. */
export function statedRrp(offers: { s: string; w?: number }[]): number | null {
  const by = new Map<number, Set<string>>();
  for (const o of offers) if (o.w) by.set(o.w, (by.get(o.w) ?? new Set()).add(o.s));
  let best: [number, number] | null = null;
  for (const [w, stores] of by) if (stores.size >= 2 && (!best || stores.size > best[1])) best = [w, stores.size];
  return best?.[0] ?? null;
}

/** Drop offers whose price is implausible next to the others (a typo, a case of six, a single sprue): in place. */
export function plausible(offers: Offer[], rrp: number | null): Offer[] {
  let out = offers;
  if (rrp) out = out.filter((o) => o.p >= rrp * 0.4 && o.p <= rrp * 1.6);
  if (out.length >= 3) {
    const m = median(out.map((o) => o.p));
    out = out.filter((o) => o.p >= m * 0.45 && o.p <= m * 2.2);
  }
  return out;
}

/** The path of a store URL: the data files hold "/products/…", and the site adds the store's base (a smaller file). */
function relativeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.pathname}${u.search}`;
  } catch {
    return url;
  }
}

// ---- Black Library books (visitor feedback, 2026-10-31: book prices must be prices you can actually pay) ----

/** A book listing's format, from its title: limited/special edition, hardback, paperback, or null when it doesn't say. */
export function bookFormat(title: string): "ltd" | "hb" | "pb" | null {
  if (/\blimited edition\b|\bspecial edition\b|\bcollector'?s edition\b|\bsigned\b|\bnumbered\b|\bslipcase\b/i.test(title)) return "ltd";
  if (/\bhard\s?(?:back|cover)\b|[([]\s*hb\s*[)\]]|\bhb\b/i.test(title)) return "hb";
  if (/\bpaper\s?back\b|\bsoft\s?cover\b|[([]\s*pb\s*[)\]]|\bpb\b/i.test(title)) return "pb";
  return null;
}

/**
 * One book, one format. Stores' SKUs sometimes join a novel's paperback, hardback and limited edition into one group
 * (a A$17 paperback "beside" a A$40 hardback). The format most STORES name wins (a tie goes to the format the product's
 * slug already names, else the paperback); listings naming another format are dropped. Listings that name none stay,
 * price-checked later by bookOffers. Pure.
 */
export function oneBookFormat<T extends { store: string; title: string }>(ls: T[], slugHint = ""): T[] {
  const stores = new Map<string, Set<string>>();
  for (const l of ls) {
    const f = bookFormat(l.title);
    if (f) stores.set(f, (stores.get(f) ?? new Set()).add(l.store));
  }
  if (stores.size <= 1) return ls;
  const hint = bookFormat(slugHint.replace(/-/g, " ").replace(/\bhardcover\b/, "hardback"));
  const ranked = [...stores].sort((a, b) => b[1].size - a[1].size || Number(b[0] === hint) - Number(a[0] === hint) || Number(b[0] === "pb") - Number(a[0] === "pb"));
  const keep = ranked[0][0];
  return ls.filter((l) => {
    const f = bookFormat(l.title);
    return f === null || f === keep;
  });
}

/**
 * A store that reports nearly every Games Workshop listing as available does not track stock (seen: 1,539 of 1,539).
 * Its "in stock" says nothing about a book that went out of print years ago, so its book offers are left out.
 */
export function untrackedStockStores(ls: { store: string; inStock: boolean }[], minListings = 50, share = 0.97): Set<string> {
  const by = new Map<string, { n: number; in: number }>();
  for (const l of ls) {
    const c = by.get(l.store) ?? { n: 0, in: 0 };
    c.n++;
    if (l.inStock) c.in++;
    by.set(l.store, c);
  }
  return new Set([...by].filter(([, c]) => c.n >= minListings && c.in / c.n >= share).map(([s]) => s));
}

/**
 * A book's offers in one market: never from a store that does not track stock, and a listing that names no format must
 * sit within 0.7x–1.4x of the median of the ones that do (an unlabelled hardback beside paperbacks). Sold-out rows stay
 * (a rare-book hunter wants to know who stocks it) but the site never shows their old price (lib/price-rows.ts). Pure.
 */
export function bookOffers(list: Offer[], untracked: Set<string>): Offer[] {
  const live = list.filter((o) => !untracked.has(o.s));
  const known = live.filter((o) => bookFormat(o.t)).map((o) => o.p);
  if (!known.length) return live;
  const m = median(known);
  return live.filter((o) => bookFormat(o.t) || (o.p >= m * 0.7 && o.p <= m * 1.4));
}

/** A Black Library novel (or audio/anthology) group: most of its listings say so in the title, vendor or product type. */
export function isNovelGroup(ls: { title: string; vendor: string; productType: string }[]): boolean {
  const novel = ls.filter((l) => /\bblack\s*library\b|\bnovel\b/i.test(`${l.title} ${l.vendor} ${l.productType}`) || systemOf(l.title)?.slug === "black-library");
  return novel.length * 2 > ls.length;
}

export interface BuildResult {
  products: Product[];
  offers: OffersFile;
  rrp: RrpFile;
  refused: Record<string, number>;
  unmatched: number;
}

export function build(listings: StoreListing[], previous: Product[], today: string): BuildResult {
  const refused: Record<string, number> = {};
  const kept: (StoreListing & { codes: Code[] })[] = [];
  for (const l of listings) {
    const codes = codesOf(l.title, l.skus);
    const why = refuse({ title: l.title, vendor: l.vendor, productType: l.productType, tags: l.tags, hasCode: codes.length > 0, gwCollection: l.gwCollection });
    if (why) {
      refused[why] = (refused[why] ?? 0) + 1;
      continue;
    }
    kept.push({ ...l, codes });
  }
  const untracked = untrackedStockStores(kept);
  const groups = groupListings(kept.map((l) => ({ store: l.store, title: l.title, codes: l.codes })));

  const members = new Map<number, number[]>();
  groups.forEach((g, i) => g >= 0 && members.set(g, [...(members.get(g) ?? []), i]));

  const prevByCode = new Map<string, Product>();
  for (const p of previous) for (const c of p.codes) prevByCode.set(c, p);
  const usedSlugs = new Set<string>();
  const products: Product[] = [];
  const offers: OffersFile = {};
  const rrp: RrpFile = {};

  // Biggest groups first, so a contested slug goes to the product most people will look for.
  const ordered = [...members.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [, idx] of ordered) {
    const all = idx.map((i) => kept[i]);
    const isBook = isNovelGroup(all);
    const prevHint = all.flatMap((l) => l.codes.map((c) => prevByCode.get(`${c.kind}:${c.value}`)?.id ?? "")).find(Boolean) ?? "";
    const ls = isBook ? oneBookFormat(all, prevHint) : all;
    if (!ls.length) continue;
    const codes = [...new Set(ls.flatMap((l) => l.codes.map((c) => `${c.kind}:${c.value}`)))].sort();
    const name = pickName(ls.map((l) => l.title));
    const prev = codes.map((c) => prevByCode.get(c)).find(Boolean);
    let id = prev && !usedSlugs.has(prev.id) ? prev.id : slugify(name) || slugify(codes[0] ?? "product");
    if (usedSlugs.has(id)) {
      const short = codes.find((c) => c.startsWith("short:"))?.slice(6);
      id = short ? `${id}-${short}` : `${id}-${products.length}`;
    }
    if (usedSlugs.has(id)) continue;
    usedSlugs.add(id);

    const context = ls.map((l) => `${l.title} ${l.productType}`);
    const votes = new Map<string, number>();
    for (const t of context) {
      const s = systemOf(t)?.slug;
      if (s) votes.set(s, (votes.get(s) ?? 0) + 1);
    }
    const system = [...votes].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const faction = factionOf(`${name} ${ls.map((l) => l.title).join(" ")}`, system)?.slug ?? null;
    const image = ls.find((l) => l.image && /^https:\/\//.test(l.image))?.image ?? null;
    const short = codes.find((c) => c.startsWith("short:"))?.slice(6) ?? null;
    const ean = codes.find((c) => c.startsWith("ean:5011921"))?.slice(4) ?? null;

    let any = false;
    const byMarket = new Map<Market, Offer[]>();
    for (const l of ls) {
      const list = byMarket.get(l.market) ?? [];
      // One offer per store: in stock first, then cheapest.
      const o: Offer = { s: l.store, p: l.cents, in: l.inStock, u: relativeUrl(l.url), t: l.title.slice(0, 100), ...(l.wasCents && l.wasCents > l.cents ? { w: l.wasCents } : {}) };
      const at = list.findIndex((x) => x.s === l.store);
      if (at < 0) list.push(o);
      else if ((o.in && !list[at].in) || (o.in === list[at].in && o.p < list[at].p)) list[at] = o;
      byMarket.set(l.market, list);
    }
    for (const [market, list] of byMarket) {
      const stated = statedRrp(list);
      const ok = plausible(isBook || system === "black-library" ? bookOffers(list, untracked) : list, stated).sort((a, b) => Number(b.in) - Number(a.in) || a.p - b.p);
      if (!ok.length) continue;
      any = true;
      (offers[market] ??= {})[id] = ok;
      if (stated) (rrp[market] ??= {})[id] = stated;
    }
    if (!any) continue;
    products.push({
      id,
      name,
      system,
      faction,
      type: typeOf(name, system).slug,
      ean,
      codes,
      code: short,
      image,
      firstSeen: prev?.firstSeen ?? today,
    });
  }
  products.sort((a, b) => a.id.localeCompare(b.id));
  const unmatched = groups.filter((g) => g < 0).length;
  return { products, offers, rrp, refused, unmatched };
}

export { titleKey };
