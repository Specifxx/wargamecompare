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

## 2026-10-28 — Navigation from the first page, and eBay strips across the site

**Decided (owner).** As on MTG Compare and DexCompare: no "Compare prices in <country>" step on the landing page. Every
page, the landing page included, has the full header, a phone menu listing every game, product type, popular army and
deal page plus the countries, and from xl a sticky left sidebar with the same list (`lib/nav.ts`). Pages with no region
are built for the UK and moved to the visitor's region in the browser from the time zone (`SoftRegion.tsx`): one CDN
copy, no redirect, nothing sent.

eBay is the main commission until Wayland approves us, so eBay strips (`EbayStrip.tsx`) sit on the region home, every
game, army and type page, every product page, the deals page and above every region page's footer, with an eBay link
in the sidebar and phone menu. A tile is the cheapest matching new listing when the eBay pass has one (its photo and
price), else a tagged search for that product: never a store's photo and never a price we did not see. Each placement
has its own customid (`ebay-strip-*`, `menu-ebay`, `landing-ebay`) so the EPN report shows which earn. Labelled Ad,
outside the store comparison, never a pop-up.

## 2026-10-28 — eBay shown first, never hidden

**Decided (owner).** Until Wayland and the other programmes approve us, eBay is the commission that pays, so it goes
first, as on the card sites: every product price list starts with the eBay row (the cheapest matching new listing, or
a tagged search when the eBay pass has none), tagged "Ad" and "Shown first", with "+N% vs cheapest store" when it is
dearer. The best price card gets an eBay button beside "Buy at", the search page an eBay row above the results, and
the home, army, game, type and deals pages carry their eBay strip above their first grid instead of under it.

**What did not change.** The store rows under eBay stay sorted by price, in stock first, and the cheapest keeps its
"Cheapest" badge; eBay is never counted as a store, never the "Best price", never in deals or the share image, and
nothing is behind a toggle or a pop-up. Amazon and Wayland stay under the stores until they earn. Each surface has
its own customid (`product-ebay`, `product-best-ebay`, `browse-ebay`) so the EPN report shows which earn.

## 2026-10-28 — 392 stores, the US first

**Decided (owner).** Before the launch posts, read every Warhammer stockist we can. A wide search (search engines for
stores' Games Workshop collection pages, the r/Warhammer40k retailer list, the sister sites' registries) gave 395 new
candidate shops; probed with the first 711, 184 more carry 40+ Games Workshop products in a readable Shopify feed
in one of our five currencies: 113 US, 30 CA, 27 UK, 11 AU, 3 NZ. The registry is now 392 stores (US 165, CA 90, UK 78,
AU 50, NZ 9). The first registry kept only the 50 biggest US stores; that cap is gone. The import's timeout is 300
minutes, still two stores at a time (Shopify throttles by IP).

Still unreadable, so still missing: Element Games, Firestorm, Wayland, Miniature Market, Noble Knight and the other
custom-built big discounters. The same identity rules apply to every new store: a wrong merge is worse than a gap.

## 2026-10-29 — The eBay keyset is shared with FigureCompare, 2,500 calls each

**Decided (owner).** The production keyset on the owner's second eBay account (5,000 Browse calls a day) serves
WargameCompare and FigureCompare, 2,500 a day each: `EBAY_DAILY_CAP` now defaults to 2,500 (was 4,000) here and in
the ops monitor. The run still never spends past the app's own remaining count minus 300, so a sister's spend is
respected. One app has one Marketplace Account Deletion endpoint; both sites keep theirs deployed and answer the same
way, and whichever is registered on eBay must stay deployed while the keyset exists.

## 2026-10-29 — One EPN campaign for WargameCompare and FigureCompare

**Decided (owner).** Both sites use EPN campaign 5339155911, now the code default here (`src/lib/affiliate.ts`, also
used by the eBay import's affiliate header) and in FigureCompare. The customid (`wgc-…` / `figure-…`) tells the sites
apart in EPN's report, so no second campaign is needed.

## 2026-10-30 — One eBay campaign for every Compare site, hard-coded

**Decided (owner).** Every Compare site now sends eBay clicks to ONE EPN campaign, 5339155912 (RiftCompare's,
already set up), hard-coded in the code: no variable overrides it any more, so a forgotten secret or Vercel
value can't split the sites again. The sites are told apart by the `customid` prefix alone, which comes first
in every tag; this site's is `wgc-<region>`. Supersedes "One EPN campaign for WargameCompare and FigureCompare" (2026-10-29). Stored listings are re-tagged at render.
Replaced: 5339155911 (WargameCompare, FigureCompare, Compare Empire, K Young), 5339231473 (Lorcana),
5339231474 (Gundam), 5339234013 (YGO). Old secrets/variables (`EBAY_AFFILIATE_CAMPAIGN`,
`NEXT_PUBLIC_EBAY_CAMPAIGN_ID`, `EBAY_CAMPAIGN_ID`) are no longer read and can be deleted.

## 2026-10-30: quick view on every product tile (from K Young), Amazon pinned second

Owner: "I really like the kaeyoung quick view pop ups, can we do that for … all the other sites". A plain click on a
product tile now opens K Young's quick view at once with what the tile shows (photo, name), and the region's price
rows load from `/api/quick/<region>/<id>`, a function response Vercel's CDN keeps for a day like every page (the data
only changes with a release); it is fetched ahead when a mouse rests on a tile. The rows are the product page's own
(`lib/price-rows.ts`, drawn by `PriceList.tsx`), so the two cannot drift. Amazon moves up to the second row, under
eBay, as on every sister site (owner, 2026-10-30: eBay first, Amazon second); Wayland stays under the stores. The tile
is still a real link, so crawlers, new tabs and modified clicks reach the product page, whose server HTML keeps every
price.

## 2026-10-31: wrong-price reports and store suggestions go to a private GitHub repo

**Owner:** "for all of these websites … we must have the ability to report any prices that are wrong, for users to
suggest a store … it's just stored within the GitHub … a daily job that checks for that."

* Every Compare Empire site now has the same two forms: **Report a wrong price** (a quiet link under the price table
  that opens in place, never a pop-up) and **Suggest a store**. Both POST to `/api/report`
  (`src/lib/reports-github.ts`, `src/components/ReportForms.tsx`: the same two files in every site repo).
* They are filed in ONE **private** repository, `Specifxx/compare-reports`: one new JSON file per report at
  `inbox/<site>/<day>/…json`, created through GitHub's contents API with `REPORTS_GITHUB_TOKEN` (a fine-grained token
  with Contents read/write on that repo only, Vercel only). Private because the site repos are public and a note is a
  stranger's free text; the K Young reviews branch is public because reviews are meant to be read.
* Nothing about the visitor is stored: no email field, no IP, no hash of one (the per-visitor limit, 6 an hour, lives
  in the function's memory), and email addresses, IP addresses and phone-like numbers in a note are blanked before
  the write. A honeypot field swallows bots.
* Each write creates a new file (no read, no sha), so reports never race, and the commit subject never carries
  `[deploy]`/`[preview]`. The route is POST only: no page view or crawler runs it, so it costs nothing at rest.
* A daily job in that repo (`triage.yml`) keeps one issue per site listing what is still open, flags repeat
  reports of the same product and store, and warns before the token expires. A handled report is moved to
  `done/<site>/`. Until the token is set the route answers 503 and the form says to email the site's address.

## Visitor reports live on each site's own `reports` branch, not a private repo — 2026-10-31

**Owner:** "we don't need a private repo for this … just build it into each site … inside the public GitHub, it's
fine. As long as it's not reflected on the front end." This replaces the private `Specifxx/compare-reports` repo
of the entry before it; everything else in that entry (the forms, no email/IP, redaction, new file per report,
POST only, 503 until the token is set) still holds.

* Each site writes its reports to **its own repo**, on an orphan branch named `reports` (`SITE_REPOS` in
  `src/lib/reports-github.ts`): `inbox/<site>/<day>/…json`, moved to `done/<site>/…` once handled. The branch is
  never merged into `main` and never deploys: `git.deploymentEnabled.reports = false` in `main`'s `vercel.json`
  (pinned by `tests/reports-github.test.ts`) and the branch's own `vercel.json` turns deploys off as well.
* Nothing on any site reads the branch, so no report ever shows on a page. The branch is public with the source,
  which is why nothing about the visitor is stored and notes are redacted before the write.
* One token, `REPORTS_GITHUB_TOKEN` (fine-grained, Contents read/write on the twelve site repos only), set in each
  Vercel project for Production.
* The daily triage moved to RiftCompare (`Specifxx/TCGEmpire`): `.github/workflows/reports-triage.yml` reads all
  twelve `reports` branches through the API and keeps one issue per site there, plus a once-a-day "Reports digest"
  comment. Those issues are public, so they link to each report's file and never quote a note. It fails (and
  GitHub emails the owner) when a site has no `reports` branch, or the token stops working or expires within 14
  days (checked only when the token is also a TCGEmpire Actions secret). The ops monitor's job list watches it.
