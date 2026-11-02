// Site-wide constants. SITE_URL is the canonical origin (no trailing slash): every canonical, hreflang, JSON-LD, robots
// and sitemap URL is built on it. The BARE domain is canonical (owner's DNS lesson, 2026-10-26: never redirect the apex
// to www); NEXT_PUBLIC_SITE_URL in Vercel overrides it.
export const SITE_NAME = "WargameCompare";
export const SITE_DOMAIN = "wargamecompare.com";
export const SITE_URL = normaliseOrigin(process.env.NEXT_PUBLIC_SITE_URL) ?? `https://${SITE_DOMAIN}`;
export const SITE_TAGLINE = "Miniature wargaming prices and stock, compared across independent stores in the UK, Australia, New Zealand, Canada and the US.";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "compareempire@gmail.com";

// Games Workshop's IP rules (DECISIONS.md, "Name, logo and Games Workshop's trademarks"): the brand never contains
// their marks, no GW artwork is ever hosted here (product photos are the stores' own, hotlinked), and every page
// carries this line. Product names are the stores' own descriptive titles.
export const GW_DISCLAIMER =
  `${SITE_NAME} is an independent price comparison site. It is not affiliated with, endorsed or sponsored by Games Workshop Limited. ` +
  "Warhammer, Warhammer 40,000, Age of Sigmar, Citadel, Games Workshop and all associated names are trademarks of Games Workshop Limited, " +
  "used here only to describe the products the stores sell. Product photos belong to the stores that list them.";

// The owner's other price-comparison sites, linked from the footer (every site links the whole family, 2026-10-27).
// Plain followed links to our own sites, not affiliates.
export const SISTER_SITES = [
  { name: "RiftCompare", url: "https://riftcompare.com", anchor: "Riftbound card prices" },
  { name: "OP Compare", url: "https://opcompare.app", anchor: "One Piece Card Game prices" },
  { name: "DexCompare", url: "https://dexcompare.app", anchor: "Pokémon TCG sealed prices" },
  { name: "MTG Compare", url: "https://mtgcompare.app", anchor: "Magic: The Gathering sealed prices" },
  { name: "Gundam Compare", url: "https://gundamcompare.com", anchor: "Gundam Card Game prices" },
  { name: "Lorcana Compare", url: "https://lorcanacompare.com", anchor: "Lorcana card prices" },
  { name: "YGO Compare", url: "https://ygocompare.com", anchor: "Yu-Gi-Oh! card prices" },
  { name: "Cyberpunk Compare", url: "https://cyberpunkcompare.com", anchor: "Cyberpunk TCG prices" },
  { name: "CamCompare", url: "https://www.camcompare.app", anchor: "Camera and lens prices" },
  { name: "Compare Empire", url: "https://compareempire.com", anchor: "Tech and appliance prices" },
  { name: "FigureCompare", url: "https://figurecompare.com", anchor: "Anime figure prices" },
] as const;

function normaliseOrigin(v: string | undefined): string | null {
  if (!v) return null;
  try {
    const u = new URL(v.trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.origin;
  } catch {
    return null;
  }
}
