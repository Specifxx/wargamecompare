// What a product IS, from its title: the game system, the faction and the kind of product. Pure and tested
// (tests/catalog.test.ts). These drive the browse filters and the hub pages; they never decide whether two store
// listings are the same product (that is identify.ts, which refuses rather than guesses).
//
// The names below are the products' own descriptive names (nominative use): the site's brand never contains them.

export interface GameSystem {
  slug: string;
  name: string;
  short: string;
  /** Title patterns, checked in order of the list (the first system that matches wins). */
  re: RegExp;
}

// Order matters: Kill Team and Horus Heresy titles often also say "Warhammer 40,000".
export const SYSTEMS: GameSystem[] = [
  { slug: "kill-team", name: "Kill Team", short: "Kill Team", re: /\bkill[\s-]?team\b/i },
  { slug: "horus-heresy", name: "The Horus Heresy", short: "Horus Heresy", re: /\bhorus\s+heresy\b|\b30k\b|\bage of darkness\b|\blegiones astartes\b|\bsolar auxilia\b|\bmechanicum\b/i },
  { slug: "legions-imperialis", name: "Legions Imperialis", short: "Legions Imperialis", re: /\blegions\s+imperialis\b/i },
  { slug: "adeptus-titanicus", name: "Adeptus Titanicus", short: "Titanicus", re: /\badeptus\s+titanicus\b/i },
  { slug: "aeronautica-imperialis", name: "Aeronautica Imperialis", short: "Aeronautica", re: /\baeronautica\s+imperialis\b/i },
  { slug: "necromunda", name: "Necromunda", short: "Necromunda", re: /\bnecromunda\b/i },
  { slug: "blood-bowl", name: "Blood Bowl", short: "Blood Bowl", re: /\bblood\s*bowl\b/i },
  { slug: "underworlds", name: "Warhammer Underworlds", short: "Underworlds", re: /\bunderworlds\b/i },
  { slug: "warcry", name: "Warcry", short: "Warcry", re: /\bwarcry\b/i },
  { slug: "old-world", name: "The Old World", short: "Old World", re: /\bold\s+world\b|\bkingdom of bretonnia\b|\btomb kings of khemri\b|\bwarriors of chaos\b(?!.*sigmar)/i },
  { slug: "middle-earth", name: "Middle-earth Strategy Battle Game", short: "Middle-earth", re: /\bmiddle[\s-]?earth\b|\bmesbg\b|\blord of the rings\b|\bthe hobbit\b/i },
  { slug: "black-library", name: "Black Library novels", short: "Novels", re: /\bblack library\b|\bpaperback\b|\bhardback\b|\bnovel\b|\baudio ?book\b|\((?:pb|hb)\)/i },
  { slug: "citadel", name: "Citadel paints and tools", short: "Paints & tools", re: /\btone pro\b|\btech pro\b|\bwarhammer colou?r\b|\bwarhammer tone\b|\bwarhammer pro\b|\btone:|\bcitadel\b|\b(base|layer|shade|contrast|dry|technical|air|spray)\s*(paint)?\s*[:-]|\bcontrast\s*:|\bbrush\b|\bspray\b|\bprimer\b|\bclippers?\b|\bhobby knife\b/i },
  { slug: "age-of-sigmar", name: "Age of Sigmar", short: "Age of Sigmar", re: /\bage of sigmar\b|\baos\b|\bsigmar\b|\bspearhead\b|\bbattletome\b|\bstormcast\b/i },
  { slug: "warhammer-40k", name: "Warhammer 40,000", short: "40K", re: /\b40,?000\b|\b40k\b|\bcombat patrol\b|\bcodex\b|\bspace marines?\b|\bastartes\b|\bimperium\b/i },
];

export interface Faction {
  slug: string;
  name: string;
  system: string; // GameSystem slug
  re: RegExp;
}

// Faction names as stores write them. Sub-factions (chapters) first so "Blood Angels" is not plain "Space Marines".
export const FACTIONS: Faction[] = [
  // Warhammer 40,000 — Imperium
  { slug: "blood-angels", name: "Blood Angels", system: "warhammer-40k", re: /\bblood angels?\b/i },
  { slug: "dark-angels", name: "Dark Angels", system: "warhammer-40k", re: /\bdark angels?\b/i },
  { slug: "space-wolves", name: "Space Wolves", system: "warhammer-40k", re: /\bspace wolf|\bspace wolves\b/i },
  { slug: "black-templars", name: "Black Templars", system: "warhammer-40k", re: /\bblack templars?\b/i },
  { slug: "deathwatch", name: "Deathwatch", system: "warhammer-40k", re: /\bdeathwatch\b/i },
  { slug: "grey-knights", name: "Grey Knights", system: "warhammer-40k", re: /\bgr[ae]y knights?\b/i },
  { slug: "adeptus-custodes", name: "Adeptus Custodes", system: "warhammer-40k", re: /\bcustodes\b|\bcustodian\b/i },
  { slug: "adepta-sororitas", name: "Adepta Sororitas", system: "warhammer-40k", re: /\bsororitas\b|\bsisters of battle\b/i },
  { slug: "adeptus-mechanicus", name: "Adeptus Mechanicus", system: "warhammer-40k", re: /\badeptus mechanicus\b|\badmech\b|\bskitarii\b/i },
  { slug: "astra-militarum", name: "Astra Militarum", system: "warhammer-40k", re: /\bastra militarum\b|\bimperial guard\b|\bcadian\b|\bdeath korps\b|\bkasrkin\b|\bcatachan\b/i },
  { slug: "imperial-knights", name: "Imperial Knights", system: "warhammer-40k", re: /\bimperial knights?\b/i },
  { slug: "imperial-agents", name: "Imperial Agents", system: "warhammer-40k", re: /\bimperial agents\b|\binquisit/i },
  { slug: "space-marines", name: "Space Marines", system: "warhammer-40k", re: /\bspace marines?\b|\badeptus astartes\b|\bultramarines?\b|\bprimaris\b|\bintercessors?\b|\bterminators?\b(?!.*chaos)/i },
  // Warhammer 40,000 — Chaos
  { slug: "death-guard", name: "Death Guard", system: "warhammer-40k", re: /\bdeath guard\b/i },
  { slug: "thousand-sons", name: "Thousand Sons", system: "warhammer-40k", re: /\bthousand sons\b/i },
  { slug: "world-eaters", name: "World Eaters", system: "warhammer-40k", re: /\bworld eaters\b/i },
  { slug: "emperors-children", name: "Emperor's Children", system: "warhammer-40k", re: /\bemperor'?s children\b/i },
  { slug: "chaos-knights", name: "Chaos Knights", system: "warhammer-40k", re: /\bchaos knights?\b/i },
  { slug: "chaos-daemons", name: "Chaos Daemons", system: "warhammer-40k", re: /\bchaos daemons?\b/i },
  { slug: "chaos-space-marines", name: "Chaos Space Marines", system: "warhammer-40k", re: /\bchaos space marines?\b|\bheretic astartes\b/i },
  // Warhammer 40,000 — Xenos
  { slug: "drukhari", name: "Drukhari", system: "warhammer-40k", re: /\bdrukhari\b|\bdark eldar\b/i },
  { slug: "aeldari", name: "Aeldari", system: "warhammer-40k", re: /\baeldari\b|\bcraftworlds?\b|\bharlequins?\b|\bycarnes?\b|\beldar\b/i },
  { slug: "necrons", name: "Necrons", system: "warhammer-40k", re: /\bnecrons?\b/i },
  { slug: "orks", name: "Orks", system: "warhammer-40k", re: /\borks?\b/i },
  { slug: "tau-empire", name: "T'au Empire", system: "warhammer-40k", re: /\bt'?au\b/i },
  { slug: "tyranids", name: "Tyranids", system: "warhammer-40k", re: /\btyranids?\b/i },
  { slug: "genestealer-cults", name: "Genestealer Cults", system: "warhammer-40k", re: /\bgenestealer cults?\b/i },
  { slug: "leagues-of-votann", name: "Leagues of Votann", system: "warhammer-40k", re: /\bvotann\b/i },
  // Age of Sigmar
  { slug: "stormcast-eternals", name: "Stormcast Eternals", system: "age-of-sigmar", re: /\bstormcast\b/i },
  { slug: "cities-of-sigmar", name: "Cities of Sigmar", system: "age-of-sigmar", re: /\bcities of sigmar\b/i },
  { slug: "sylvaneth", name: "Sylvaneth", system: "age-of-sigmar", re: /\bsylvaneth\b/i },
  { slug: "lumineth-realm-lords", name: "Lumineth Realm-lords", system: "age-of-sigmar", re: /\blumineth\b/i },
  { slug: "idoneth-deepkin", name: "Idoneth Deepkin", system: "age-of-sigmar", re: /\bidoneth\b/i },
  { slug: "daughters-of-khaine", name: "Daughters of Khaine", system: "age-of-sigmar", re: /\bdaughters of khaine\b/i },
  { slug: "fyreslayers", name: "Fyreslayers", system: "age-of-sigmar", re: /\bfyreslayers?\b/i },
  { slug: "kharadron-overlords", name: "Kharadron Overlords", system: "age-of-sigmar", re: /\bkharadron\b/i },
  { slug: "seraphon", name: "Seraphon", system: "age-of-sigmar", re: /\bseraphon\b/i },
  { slug: "slaves-to-darkness", name: "Slaves to Darkness", system: "age-of-sigmar", re: /\bslaves to darkness\b/i },
  { slug: "blades-of-khorne", name: "Blades of Khorne", system: "age-of-sigmar", re: /\bblades of khorne\b|\bkhorne bloodbound\b/i },
  { slug: "disciples-of-tzeentch", name: "Disciples of Tzeentch", system: "age-of-sigmar", re: /\bdisciples of tzeentch\b/i },
  { slug: "maggotkin-of-nurgle", name: "Maggotkin of Nurgle", system: "age-of-sigmar", re: /\bmaggotkin\b/i },
  { slug: "hedonites-of-slaanesh", name: "Hedonites of Slaanesh", system: "age-of-sigmar", re: /\bhedonites\b/i },
  { slug: "skaven", name: "Skaven", system: "age-of-sigmar", re: /\bskaven\b/i },
  { slug: "flesh-eater-courts", name: "Flesh-eater Courts", system: "age-of-sigmar", re: /\bflesh[\s-]?eater courts?\b/i },
  { slug: "nighthaunt", name: "Nighthaunt", system: "age-of-sigmar", re: /\bnighthaunt\b/i },
  { slug: "ossiarch-bonereapers", name: "Ossiarch Bonereapers", system: "age-of-sigmar", re: /\bossiarch\b/i },
  { slug: "soulblight-gravelords", name: "Soulblight Gravelords", system: "age-of-sigmar", re: /\bsoulblight\b/i },
  { slug: "orruk-warclans", name: "Orruk Warclans", system: "age-of-sigmar", re: /\borruks?\b|\bkruleboyz\b|\bironjawz\b/i },
  { slug: "gloomspite-gitz", name: "Gloomspite Gitz", system: "age-of-sigmar", re: /\bgloomspite\b/i },
  { slug: "ogor-mawtribes", name: "Ogor Mawtribes", system: "age-of-sigmar", re: /\bogor\b/i },
  { slug: "sons-of-behemat", name: "Sons of Behemat", system: "age-of-sigmar", re: /\bsons of behemat\b/i },
];

export interface ProductType {
  slug: string;
  name: string;
  re: RegExp | null; // null = the fallback
}
export const TYPES: ProductType[] = [
  { slug: "starter-sets", name: "Starter sets", re: /\bstarter set\b|\bintroductory set\b|\bultimate starter\b|\blaunch box\b|\bstarter box\b/i },
  { slug: "combat-patrols", name: "Combat Patrols & Spearheads", re: /\bcombat patrol\b|\bspearhead\b|\bvanguard\b(?=.*:)/i },
  { slug: "army-sets", name: "Army sets & battleforces", re: /\barmy set\b|\bbattleforce\b|\barmy box\b|\bboarding patrol\b|\bbundle\b|\bbattle ?box\b/i },
  { slug: "books", name: "Codexes, battletomes & books", re: /\bpaperback\b|\bhardback\b|\bnovel\b|\barcane journal\b|\bjournal tactica\b|\bcodex\b|\bbattletome\b|\bcore book\b|\brulebook\b|\bbook\b|\bcampaign\b|\bsupplement\b|\bdatasheet cards\b|\bcards\b(?=.*\b(codex|faction|datasheet)\b)|\bfaction pack\b/i },
  { slug: "paint-sets", name: "Paint sets", re: /\bpaint set\b|\bpaints? \+ tools\b|\bpaint & tools\b|\bpaint pack\b|\bmega paint\b/i },
  { slug: "paints", name: "Paints", re: /\btone pro\b|\btech pro\b|\btone:|\bwarhammer tone\b|\b(base|layer|shade|contrast|dry|technical|air|spray)\b(\s*paint)?\s*[:-]|\(\d{1,3}\s?ml\)|\b\d{1,3}\s?ml\b|\bspray\b|\bprimer\b/i },
  { slug: "tools", name: "Brushes, tools & hobby", re: /\bbrush(es)?\b|\bclippers?\b|\bknife\b|\bfiles?\b|\bglue\b|\bpalette\b|\bhandle\b|\btools?\b|\bbasing\b|\btexture\b/i },
  { slug: "terrain", name: "Terrain & boards", re: /\bterrain\b|\bkillzone\b|\bbattlefield\b|\bruins?\b|\bscenery\b|\bboard\b|\bmat\b/i },
  { slug: "accessories", name: "Dice, cards & accessories", re: /\bdice\b|\btokens?\b|\bmeasuring\b|\bcarry case\b|\bcase\b|\bdeck\b|\bcards?\b/i },
  { slug: "miniatures", name: "Miniatures", re: null },
];

export function systemOf(title: string): GameSystem | null {
  return SYSTEMS.find((s) => s.re.test(title)) ?? null;
}

/** The faction a title names: for a system that has factions, only that system's (a Blood Bowl "Orc" team is not 40K Orks). */
export function factionOf(title: string, system: string | null): Faction | null {
  // Paint names borrow army names ("Kasrkin Green", "Seraphon Blue"): paints, tools and novels have no faction.
  if (system === "citadel" || system === "black-library") return null;
  if (system && system !== "warhammer-40k" && system !== "age-of-sigmar" && system !== "kill-team") return null;
  const pool = system === "age-of-sigmar" ? FACTIONS.filter((f) => f.system === "age-of-sigmar") : system ? FACTIONS.filter((f) => f.system === "warhammer-40k") : FACTIONS;
  return pool.find((f) => f.re.test(title)) ?? null;
}

export function typeOf(title: string, system: string | null): ProductType {
  if (system === "black-library") return TYPES.find((x) => x.slug === "books")!;
  if (system === "citadel") {
    const t = TYPES.find((x) => ["paint-sets", "paints", "tools"].includes(x.slug) && x.re!.test(title));
    return t ?? TYPES.find((x) => x.slug === "tools")!;
  }
  return TYPES.find((x) => x.re && x.re.test(title)) ?? TYPES[TYPES.length - 1];
}

export const SYSTEM_BY_SLUG = new Map(SYSTEMS.map((s) => [s.slug, s]));
export const FACTION_BY_SLUG = new Map(FACTIONS.map((f) => [f.slug, f]));
export const TYPE_BY_SLUG = new Map(TYPES.map((t) => [t.slug, t]));
