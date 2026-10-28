import { FACTIONS, SYSTEMS } from "./catalog";

// Which store listings are the SAME product. Pure and tested (tests/identify.test.ts).
//
// A wrong merge is worse than a missed one (the rule every Compare site runs on): two different kits on one page send a
// buyer to the wrong box. So identity comes from the product codes the stores themselves carry, never from a fuzzy title:
//
//   • the short product code printed on every box, "48-75", "20-331", "301-85" (most stores' SKU, or in the title as
//     "(46-51)" / "[48-75]", or bare at the title's start or end), compared as numbers so "20-052" and "20-52" agree;
//   • the 11-digit item number, "99120101498" / "60010205001" (some stores' SKU, a few put it in the title), and the
//     13-digit "99189961221" + "06" form some stores use for paints;
//   • the barcode, EAN-13 starting 5011921 (Games Workshop's prefix), or an ISBN for books.
//
// Listings sharing a code are one product (union-find). A code is only trusted when the store uses it for ONE title
// (a second-hand shop that reuses "06-09" for two different kits loses that code), and a listing whose title shares
// almost no words with the product's other titles is dropped from it (a typo'd code). A listing with no code joins a
// product only when its cleaned title equals one of that product's cleaned titles AND no other product has that title.

// Words that name a faction, a game or a kind of product: shared by many kits, so they never prove two titles are the
// same kit (step 4b of groupListings).
const GENERIC = new Set(
  [...FACTIONS.map((f) => f.name), ...SYSTEMS.map((x) => x.name), "Warhammer 40,000 Age of Sigmar Militarum Auxilla Astartes Chaos Imperium Xenos Grand Alliance Order Death Destruction Legiones Mechanicum Squad Team Unit Units Upgrades Upgrade Pack"]
    .flatMap((n) => n.toLowerCase().split(/[^a-z0-9']+/))
    .filter((t) => t.length > 2),
);

export type CodeKind = "short" | "item" | "ean";
export interface Code {
  kind: CodeKind;
  value: string;
}

const SHORT = /^(\d{2,3})-(\d{1,3})$/;
const SHORT_IN_TITLE = /[([]\s*(\d{2,3})-(\d{1,3})\s*[)\]]/;
// Paints and many stores put the code bare at the start or end of the title, or after "#": "21-04 Base: Khorne Red",
// "Citadel Base: Leadbelcher 21-28", "Citadel Base #21-53 Wraithbone". Only there: inside a title "25-32" may be a size.
const SHORT_BARE = /^(\d{2,3})-(\d{2,3})\s|\s(\d{2,3})-(\d{2,3})$|#\s?(\d{2,3})-(\d{2,3})\b/;
const ITEM = /^(?:99|60)\d{9}$/;
const ITEM_IN_TITLE = /[([]\s*((?:99|60)\d{9})\s*[)\]]/;
const EAN_GW = /^5011921\d{6}$/;
const ISBN = /^97[89]\d{10}$/;

function shortCode(a: string, b: string): Code {
  return { kind: "short", value: `${parseInt(a, 10)}-${parseInt(b, 10)}` };
}

/** Every product code a listing carries, from its SKU(s) and its title. */
export function codesOf(title: string, skus: (string | null | undefined)[]): Code[] {
  const out: Code[] = [];
  const add = (c: Code) => {
    if (!out.some((x) => x.kind === c.kind && x.value === c.value)) out.push(c);
  };
  for (const raw of skus) {
    const s = String(raw ?? "").trim();
    if (!s) continue;
    let m: RegExpMatchArray | null;
    if ((m = s.match(SHORT))) add(shortCode(m[1], m[2]));
    else if (ITEM.test(s)) add({ kind: "item", value: s });
    else if (/^(?:99|60)\d{11}$/.test(s)) add({ kind: "item", value: s.slice(0, 11) });
    else if (EAN_GW.test(s) || ISBN.test(s)) add({ kind: "ean", value: s });
    else {
      // "5011921234080 (301-40)": a barcode and the box code together.
      const ean = s.match(/\b(5011921\d{6}|97[89]\d{10})\b/);
      if (ean) add({ kind: "ean", value: ean[1] });
      const sc = s.match(/[(\s](\d{2,3})-(\d{1,3})\)?$/);
      if (sc) add(shortCode(sc[1], sc[2]));
    }
  }
  let m: RegExpMatchArray | null;
  if ((m = title.match(SHORT_IN_TITLE))) add(shortCode(m[1], m[2]));
  else if ((m = title.trim().match(SHORT_BARE))) add(shortCode(m[1] ?? m[3] ?? m[5], m[2] ?? m[4] ?? m[6]));
  if ((m = title.match(ITEM_IN_TITLE))) add({ kind: "item", value: m[1] });
  return out;
}

const NOISE = new Set([
  "warhammer", "games", "workshop", "gw", "citadel", "colour", "color", "40k", "40000", "40", "000", "age", "of", "sigmar", "aos",
  "the", "and", "a", "an", "with", "new", "eng", "english", "edition", "ed", "box", "set", "kit", "miniatures", "miniature",
  "paint", "paints", "pot", "ml", "12ml", "18ml", "24ml", "pre", "order", "preorder", "release", "max", "one", "per", "person", "customer",
  "oop", "hardback", "paperback", "hb", "pb", "black", "library", "x",
]);

/** A title's meaningful words, lower-case, store noise out. */
export function titleTokens(title: string): string[] {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\((?:pre-?order|preorder)[^)]*\)|\bpre-?order(?: for)? [\d/]+|\bships? [\d/]+|\[max[^\]]*\]/g, " ")
    .replace(/[[(][^)\]]*\d{2,3}-\d{1,3}[^)\]]*[)\]]|[[(]\s*\d{9,13}\s*[)\]]/g, " ") // codes in brackets
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t && !NOISE.has(t));
}

/** The cleaned title used for code-less matching: sorted unique tokens. */
export function titleKey(title: string): string {
  return [...new Set(titleTokens(title))].sort().join(" ");
}

/** Overlap coefficient of two token lists: shared / size of the smaller. */
export function overlap(a: string[], b: string[]): number {
  const A = new Set(a);
  const B = new Set(b);
  if (!A.size || !B.size) return 0;
  let n = 0;
  for (const t of A) if (B.has(t)) n++;
  return n / Math.min(A.size, B.size);
}

export interface Listing {
  store: string;
  title: string;
  codes: Code[];
}

/**
 * Group listings into products. Returns, per listing index, its group number (or -1: no product).
 * Groups with codes only; code-less listings are attached afterwards by exact cleaned title.
 */
export function groupListings(listings: Listing[]): number[] {
  // 1. Per store, a code used for two different cleaned titles is ambiguous there: drop it for that store.
  const perStore = new Map<string, Map<string, Set<string>>>();
  listings.forEach((l) => {
    for (const c of l.codes) {
      const k = `${c.kind}:${c.value}`;
      const m = perStore.get(l.store) ?? new Map();
      perStore.set(l.store, m);
      const s = m.get(k) ?? new Set();
      s.add(titleKey(l.title));
      m.set(k, s);
    }
  });
  const usable = listings.map((l) =>
    l.codes.filter((c) => (perStore.get(l.store)?.get(`${c.kind}:${c.value}`)?.size ?? 0) <= 1).map((c) => `${c.kind}:${c.value}`),
  );

  // 2. Union-find over codes.
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    let p = parent.get(x) ?? x;
    if (p !== x) {
      p = find(p);
      parent.set(x, p);
    }
    return p;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };
  usable.forEach((codes) => codes.forEach((c, i) => i && union(codes[0], c)));

  // 3. A group holding two different SHORT codes (or two item numbers, or two barcodes) was bridged by a listing that
  // is wrong somewhere: refuse the bridges. Each listing then keeps only its first code's own group.
  const kindsInRoot = new Map<string, Map<CodeKind, Set<string>>>();
  usable.forEach((codes) =>
    codes.forEach((c) => {
      const r = find(c);
      const m = kindsInRoot.get(r) ?? new Map<CodeKind, Set<string>>();
      kindsInRoot.set(r, m);
      const kind = c.split(":")[0] as CodeKind;
      const s = m.get(kind) ?? new Set();
      s.add(c);
      m.set(kind, s);
    }),
  );
  const conflicted = new Set([...kindsInRoot].filter(([, m]) => [...m.values()].some((s) => s.size > 1)).map(([r]) => r));
  const groupKey = (codes: string[]): string | null => {
    if (!codes.length) return null;
    const r = find(codes[0]);
    if (!conflicted.has(r)) return r;
    // Conflicted: fall back to the listing's own short code, else its own first code, never the bridged group.
    return codes.find((c) => c.startsWith("short:")) ?? codes[0];
  };

  const ids = new Map<string, number>();
  const out = usable.map((codes) => {
    const k = groupKey(codes);
    if (k == null) return -1;
    if (!ids.has(k)) ids.set(k, ids.size);
    return ids.get(k)!;
  });

  // 4. Drop a listing whose title shares too few words with its group's other titles (a typo'd code).
  const members = new Map<number, number[]>();
  out.forEach((g, i) => g >= 0 && members.set(g, [...(members.get(g) ?? []), i]));
  for (const [, idx] of members) {
    if (idx.length < 2) continue;
    for (const i of idx) {
      const mine = titleTokens(listings[i].title);
      const others = idx.filter((j) => j !== i && listings[j].store !== listings[i].store);
      if (!others.length) continue;
      const agree = others.filter((j) => overlap(mine, titleTokens(listings[j].title)) >= 0.5).length;
      if (agree === 0) out[i] = -1;
    }
    // 4b. In a group of four or more stores, the words most of them use for the kit itself (not the faction or the game:
    // "bullgryns", "brayherds", "dice") must appear in each listing. "Astra Militarum: Kasrkin" filed under the
    // Bullgryns' code agrees with them on "astra militarum" alone, and is dropped here.
    const live = idx.filter((i) => out[i] >= 0);
    if (new Set(live.map((i) => listings[i].store)).size < 4) continue;
    const toks = live.map((i) => new Set(titleTokens(listings[i].title).filter((t) => !GENERIC.has(t))));
    const freq = new Map<string, number>();
    for (const ts of toks) for (const t of ts) freq.set(t, (freq.get(t) ?? 0) + 1);
    const core = [...freq].filter(([, n]) => n >= live.length * 0.5).map(([t]) => t);
    if (!core.length) continue;
    live.forEach((i, k) => {
      if (!core.some((t) => toks[k].has(t))) out[i] = -1;
    });
  }

  // 5. Code-less listings: attach by exact cleaned title, only when exactly one group has that title.
  const byKey = new Map<string, Set<number>>();
  out.forEach((g, i) => {
    if (g < 0) return;
    const k = titleKey(listings[i].title);
    if (k.split(" ").length < 2) return; // one word is never enough
    const s = byKey.get(k) ?? new Set();
    s.add(g);
    byKey.set(k, s);
  });
  listings.forEach((l, i) => {
    if (out[i] >= 0 || usable[i].length) return;
    const s = byKey.get(titleKey(l.title));
    if (s && s.size === 1) out[i] = [...s][0];
  });
  return out;
}
