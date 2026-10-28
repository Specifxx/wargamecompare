# Decisions

Newest at the bottom. Each entry: what was decided, why, and what it rules out.

## 2026-10-28 — Launch: Games Workshop sealed product, five countries, no database

**Decided.** WargameCompare compares new Games Workshop product (every system, Citadel paints and tools, Black Library
books) at independent Shopify stores in the UK, Australia, New Zealand, Canada and the US. No EU at launch.

**Why.** The owner chose the miniatures niche after research (project memory "Next niche"): about 125 independent
discounters sell Games Workshop below RRP, the only established comparison site is US-only, and the product is high
ticket (a Combat Patrol is £100+), so a buyer saves real money and an affiliate click is worth more than a card's.
The UK is Games Workshop's home market and the most competitive; AU/NZ and CA have the highest RRPs and the most
shopping around. The EU would need per-country VAT handling and stores in many currencies.

**Rules out.** A database for public data, accounts, alerts and price history at launch: the sister sites showed
those cost money before there is any traffic (RiftCompare's Neon egress, ISR writes). Data is JSON on GitHub; the site
is CDN-cached.

## 2026-10-28 — Identity by Games Workshop's codes, never by fuzzy titles

**Decided.** Listings are grouped only by Games Workshop's own codes (bracketed box code, 11-digit item number,
5011921 barcode or ISBN), with guards against a store's ambiguous code, conflicting codes and title outliers. A
listing without a code joins only by an exact cleaned title held by one group.

**Why.** The probe of 35 stores (2026-10-28) found codes on most listings at most stores; GW reuses names across
editions ("Combat Patrol: Space Marines" exists in three versions), so a title match would merge different boxes.

**Rules out.** Fuzzy title matching to raise the match count.

## 2026-10-28 — Pages cached by Vercel's CDN for a day; one build a day

**Decided.** Every data page is `force-dynamic` with `Vercel-CDN-Cache-Control: s-maxage=86400`; the daily data commit
is the only production build; previews are off; `claude/*` never deploys.

**Why.** The sister sites' bills: ISR made every visited page a billed write after each release, and a build per push
exhausted RiftCompare's transfer allowance every three days (RiftCompare DECISIONS.md, 2026-09-11 and 2026-10-17).

## 2026-10-28 — Affiliates: eBay, Amazon, Wayland and store partner codes, all labelled, none ranked

**Decided.** Every product page pins three marketplace rows under the stores, each labelled "Ad": eBay (cheapest
matching new Buy It Now listing when known, else a tagged search; `wgc-<region>-<placement>` customid), Amazon (a
tagged search, only where a tag exists), and Wayland Games (UK only, a tagged search, only once
`WAYLAND_SEARCH_TEMPLATE` is set). Store partner codes are copied from OP Compare's program.

**Why.** Stores pay nothing; marketplaces do. Wayland is the UK's biggest discounter, runs its own store (not Shopify)
and pays 5% for 30 days. Pinning instead of ranking keeps the comparison honest, which is what earns repeat visits.

**Rules out.** Ranking a paid row with the stores, calling it "best price", or putting it in deals.

## 2026-10-28 — eBay: WargameCompare's own keyset

**Decided.** A new eBay developer keyset on the owner's second eBay account, 5,000 calls a day, capped at 4,000 by
default, split UK 35%, AU 25%, US 25%, CA 15% (NZ shows eBay AU). Products under 15 in the local currency get no call.

**Why.** The card sites' shared keysets are fully allocated (Gundam/Lorcana/YGO 4,500 of 5,000; MTG and RiftCompare
share another). A separate account keeps one site from silently spending another's quota.

## 2026-10-28 — Store reads kept in the Actions cache, not git

**Decided.** Each store's last good read (`data/cache/*.json.gz`) is git-ignored and carried between runs by
`actions/cache`; a store that fails keeps its listings for 72 hours.

**Why.** Committing tens of MB of gzip a day would bloat the repository and every clone (Vercel clones on each build).
Losing the cache only means one day where a failing store's rows drop out, which the ops monitor reports.

## 2026-10-28 — One product, several codes: join code groups by exact title (trial import)

**Decided.** After the code join, groups whose listings share an exact cleaned title (two words or more) become one
product, unless that would put two different box codes in it. In a group of three or more stores, a listing must use
at least one of the words most stores use for the kit itself (not faction or game words), else it is dropped.

**Why.** The first trial import of all 208 stores (347,700 listings) made 10,888 products, of which about 4,600 were
the same product split by code generation: stores carry different barcodes and item numbers for one paint or kit (a
Citadel paint has had three pots and four barcodes). Joining by exact title brought it to 6,141 products with the
comparisons whole (Bullgryns: 11 UK stores, 17 AU, 19 CA, 22 US). Box codes still keep editions apart ("Combat Patrol:
Space Marines" exists with several box codes). The core-word check drops a store's mis-coded listing ("Astra
Militarum: Kasrkin" filed under the Bullgryns' code).

**Also refused** from that run: Magic: The Gathering's Warhammer 40,000 and Lord of the Rings cards, which many stores
file in their "Warhammer" collections (about 110,000 listings), and other languages' editions ("(FR)", "Usagé").

**Known limit.** Codexes and battletomes keep their box code across editions (48-01 is every Space Marines codex), so
a store still listing an old edition joins the current one. Few do, and none in stock at scale; revisit if a report
comes in.
