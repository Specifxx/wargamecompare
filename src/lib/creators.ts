// Featured creators (/creators; owner, 2026-10-31), WargameCompare's copy of MTG Compare's and Gundam Compare's /creators.
// The list is hand-curated here: no database, no form, no account. Use the creator's own spelling and handles, and only
// links they show publicly. No follower counts (owner, 2026-10-31). Never called "partners": that word means the affiliate
// links. Avatars live in public/img/creators/ (not public/creators/), already cut to a circle. The newest `since` is the
// spotlight and the homepage strip's name.

export type CreatorPlatform = "Instagram" | "YouTube" | "Threads" | "TikTok" | "Facebook" | "X" | "Twitch" | "Website";

export interface CreatorLink {
  platform: CreatorPlatform;
  url: string;
  /** As displayed, e.g. "@handle". */
  handle?: string;
  /** The link's own words when it is not a profile (a link page, a single video). */
  label?: string;
}

export interface Creator {
  /** Stable id, lowercase with hyphens: the card's anchor (/creators#slug). */
  slug: string;
  name: string;
  /** Their tagline or handle line, as they write it. */
  tagline?: string;
  /** What they make, one line. */
  blurb: string;
  /** A few sentences for their spotlight. */
  about: string;
  /** Their channels, most important first. The first is the main button. */
  links: CreatorLink[];
  /** Short content tags. At most four show. */
  tags: string[];
  /** A square photo in public/img/creators/, already cut to a circle. Initials without one. */
  avatar?: string;
  /** ISO date the listing went live. */
  since: string;
}

export const CREATORS: Creator[] = [
  {
    slug: "hobbyhaz",
    name: "Harrison",
    tagline: "Bolters & Booster packs",
    blurb: "Daily hobby videos on Warhammer, games, trading card games and books, with a soft spot for Black Library novels.",
    about:
      "Harrison makes a hobby video every day as hobbyhaz: new Warhammer releases, the games on the table, card game packs and a shelf of Black Library novels he hunts down, rare editions included. His feedback shaped how WargameCompare prices books: one format per novel, no audiobooks or ebooks, and an honest “No price” when a book is sold out.",
    links: [
      { platform: "Instagram", url: "https://www.instagram.com/hobbyhaz/", handle: "@hobbyhaz" },
      { platform: "Website", url: "https://beacons.ai/hobbyhaz", label: "All links" },
    ],
    tags: ["Warhammer", "Black Library", "Trading card games", "Daily videos"],
    avatar: "/img/creators/hobbyhaz.webp",
    since: "2026-10-31",
  },
];

/** Newest first. Pure. */
export function featuredCreators(list: Creator[] = CREATORS): Creator[] {
  return [...list].sort((a, b) => b.since.localeCompare(a.since) || a.name.localeCompare(b.name));
}

/** "Kevin Lepage" → "KL". Pure. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
