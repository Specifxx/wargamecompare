// Is a store listing a NEW, factory-sealed Games Workshop product we can compare? Pure and tested.
// Refuses: second-hand, painted, on-sprue or bits sales, damaged or incomplete boxes, 3D prints and proxies, other
// brands' accessories that merely say "Warhammer", and store-made bundles without a product code.
import { SYSTEMS } from "./catalog";

const GW_WORDS = /games\s*workshop|\bcitadel\b|warhammer|black\s*library|forge\s*world|\bgw\b/i;
const NOT_NEW = /\bused\b|pre-?owned|second[\s-]?hand|\bpainted\b|on sprues?\b|\bsprues? only\b|\bbits?\b|\bmissing\b|\bdamaged\b|\bincomplete\b|\bopen(?:ed)? box\b|\bproxy\b|\b3d[\s-]?print|\bresin print|\bstl\b|\bkitbash|\bcustom\b|\bnib\b|\bloose\b|\bbuilt\b|\bassembled\b|\bprimed\b|\bstripped\b|\bvintage\b|\b(?:5|6|7|8)th ed(?:ition)?\b/i;
const OTHER_BRANDS = /q[\s-]?workshop|ultra[\s-]?pro|joy\s*toys|let'?s\s*play\s*games|\blpg\b|kraken|aetherworks|cubicle\s*7|chaosium|wizards|asmodee|hasbro|gamegenic|army\s*painter|vallejo|mantic|warlord|green\s*stuff\s*world|baneblade\s*studio|gale\s*force|tt\s*combat|loot\s*studios|modiphius|monster\s*fight\s*club|funko|mcfarlane|steamforged|para\s*bellum|atomic\s*mass|corvus\s*belli|battlefront|gf9|magic:?\s*the\s*gathering|\bmtg\b|universes\s*beyond/i;
// Trading cards: Magic's Warhammer 40,000 and Lord of the Rings sets sit in many stores' "Warhammer" collections.
const CARD = /\bnear mint\b|\b(?:lightly|moderately|heavily) played\b|\bnon[\s-]?foil\b|\bsurge foil\b|\bborderless\b|\[[^\]]*\bcommander\]|\[(?:40k|ltr|ltc)\b/i;
const MERCH = /\bhoodie\b|\bt-?shirt\b|\bmug\b|\bposter\b|\bdesk\s*mat\b|\bplaymat\b|\bfigurine\b|\bstatue\b|\b1\/\d+ scale\b|\bkeyring\b|\bplush\b|\bgift card\b|\bvoucher\b|\bmagazine\b|\bissue \d+\b/i;
const STORE_BUNDLE = /\bbundle\b|\bcombo\b|\bdeal\b|\boffer\b|\bmega pack\b|\bcollection of\b|\bx\s?\d+\s*(?:boxes|kits)\b|\b\d+\s*x\s*boxes\b/i;

export interface RawListing {
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  hasCode: boolean;
  /** Read from one of the store's Games Workshop collections (stores.json `collections`, all GW-named). */
  gwCollection?: boolean;
}

export function isGamesWorkshop(l: RawListing): boolean {
  if (OTHER_BRANDS.test(l.vendor) || OTHER_BRANDS.test(l.title) || CARD.test(l.title)) return false;
  if (GW_WORDS.test(l.vendor) || GW_WORDS.test(l.productType)) return true;
  if (l.tags.some((t) => /^games\s*workshop$|^warhammer|^citadel$/i.test(t))) return true;
  // A title that names the range ("Warhammer Tone Pro Paint - Gnarlwood 5") from a store that puts its own name in the
  // vendor field. Safe without a code: a code-less listing only ever joins a product by an exact cleaned title.
  if (GW_WORDS.test(l.title)) return true;
  // The store filed it under Games Workshop itself ("Necromunda", "Kill Team"): stores whose vendor field is their own
  // name and whose titles are just the kit's name ("Goliath Gang").
  if (l.gwCollection) return true;
  return l.hasCode && SYSTEMS.some((s) => s.re.test(`${l.title} ${l.productType}`));
}

/** Why a listing is refused, or null when it is a comparable new product. */
export function refuse(l: RawListing): string | null {
  const text = `${l.title} ${l.vendor} ${l.productType}`;
  if (NOT_NEW.test(text)) return "not-new";
  if (MERCH.test(l.title)) return "merch";
  if (!isGamesWorkshop(l)) return "not-gw";
  if (!l.hasCode && STORE_BUNDLE.test(l.title)) return "store-bundle";
  return null;
}
