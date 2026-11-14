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

## 2026-10-31 — Every product link opens the quick view, on every page

Owner, 2026-10-31: "Whenever I click on any item … I want a quick view open like K Young." Only `ProductCard` carried
`data-qv`, and the quick view was mounted in `[region]/layout.tsx`, so the home page (`/`), the deals rows, search
results and other product links went straight to the product page. `QuickView` is now mounted in the root layout and
opens for any plain click on a link to `/<region>/p/<id>`, reading the region and id from the href when the link has no
`data-qv`; `/api/quick` also returns `name` and `img` for those. Links inside the quick view and on the product's own
page, and modified, middle and new-tab clicks, navigate as before.

## Visitor feedback: local eBay sellers, a working phone menu, honest book prices (2026-10-31)

A wargamer's feedback (via the owner, Instagram): eBay rows often carried overseas postage ("a lot of wasted clicks"),
the phone menu "doesn't work" (tapping 40K, Paints or Black Library went nowhere), and Black Library books showed
sold-out prices from shops that never update stock, and audiobook prices.

- **eBay: local sellers, delivered price.** The Browse search is limited to items located in and delivered to the
  market's own country (`itemLocationCountry`, `deliveryCountry`), with a central postcode in `contextualLocation` so
  eBay quotes real postage; a listing with unknown postage is never kept (`pickBest`). The row and the eBay tiles show
  the delivered price (item + postage), and the "vs cheapest store" line compares that. New rows carry the seller's
  country (`l`). Rows from the older worldwide search are shown only when their postage is known and local-sized
  (`LOCAL_POSTAGE_MAX`, `src/lib/ebay-rows.ts`) and are searched again first; they age out in 96 h anyway. eBay search
  links add `LH_PrefLoc=1` (located in that country).
- **Phone menu.** It did navigate, but the `<details>` panel stayed open over the new page (client navigation keeps the
  header), so it looked dead. `MenuCloser` closes every `details[data-menu]` on a route change, a link tap inside it,
  or a tap outside it; the country picker gets the same.
- **Books.** Audiobooks, audio dramas, e-books and other digital editions are refused (`digital`). A novel group keeps
  one format: the format most stores name (paperback / hardback / limited), others dropped (SKUs had joined A$17
  paperbacks with A$40 hardbacks); an unlabelled listing must sit within 0.7x-1.4x of the labelled ones. Stores that
  report 97%+ of 50+ GW listings available do not track stock (one: 1,539 of 1,539) and are left out of book offers.
  Sold-out book rows stay (who stocks it matters to rare-book hunters) but never show their old price ("No price").

## Featured creators page (/creators), hobbyhaz first (2026-10-31)

Owner: feature hobbyhaz (Harrison, "Bolters & Booster packs", Instagram) "just like the other websites", i.e. MTG Compare's
and Gundam Compare's /creators. Same shape: a static list in `src/lib/creators.ts` (newest `since` is the spotlight), round
320px webp avatars in `public/img/creators/` (never `public/creators/`, which a route could shadow), a spotlight card with
the platform buttons, a "get featured" mailto, an FAQ, CollectionPage and FAQPage JSON-LD. Linked from the landing page
(`CreatorsTeaser`, under the search), the footer, the menu ("Deals & more") and the sitemap. The page reads no price data:
it prerenders as a static page and sits in `CDN_PAGES` anyway. No follower counts (owner). Creator links are followed and
keep the referrer (`rel="noopener"` only) so their analytics see us. His spotlight mentions the book feedback he gave
(PR #20), with his consent implied by the owner's request. To add a creator: append to `CREATORS` with a circle-cut webp.

## Christmas theme: 1 November to Boxing Day (2026-11-01)

Owner, 2026-11-01: every Compare site gets a Christmas theme after the Halloween one, each its own take. No hero band here, so the home pages get a winter-night `ChristmasBanner` ("Christmas gifts for the hobby", to deals), a candy-cane stripe under the sticky header, holly-red brand colour and a Santa hat on the logo. Halloween stays year-specific; Christmas repeats every year (`CHRISTMAS_FROM`/`CHRISTMAS_TO`).

The season window is fixed in `src/lib/season.ts`: 1 November to 26 December, every year, by the visitor's own
date, stamped on `<html data-season>` by an inline boot script before first paint. `?season=christmas` previews it out
of season and `?season=off` hides it in season. Every decoration is CSS-gated on that attribute, `aria-hidden`,
`pointer-events: none`, painted under the content (never over a price or a button), animated with `transform`
only, and stopped under `prefers-reduced-motion`. The page's content and links stay in the server HTML; the season
adds no request, no script beyond the boot line and no database or data read. The shared rules sit between
`xmas-common:start` and `xmas-common:end` in `globals.css` (identical on every sister site); this site's colours sit in
the `xmas-site` block after it. Art is eight small SVGs in `public/xmas/`. To end it early, move the `to` date; after
Boxing Day it switches itself off.

## 2026-11-01: A beta community forum, no accounts, posts in this repo

The owner asked for "user forums ... you don't need to be able to sign in ...
put your name down ... it'll save your name ... all of this is public data ...
keep it within each website's repository", on every site, to give the sites a
reason to come back that search rankings alone don't. `/forum` (docs/forum.md):

- **Storage:** `forum.json` on this repo's public orphan branch `forum`
  (never deployed: its own vercel.json, plus `deploymentEnabled.forum: false`
  here). Written only by `POST /api/forum` with the visitor-reports token;
  a write reads the file's sha and retries when two posts race.
- **Cost:** pages read the file from raw.githubusercontent.com inside their
  normal cache life, never per visit; the browser fetches the newest copy from
  GitHub directly, so a new post shows in minutes with no deploy, no function
  and no database. Rebuilding pages for posts would have meant a build per post.
- **Spam:** honeypot, a 2.5 s minimum on the form, per-visitor limits (4 per
  10 min, 20 a day, 4 threads a day) and a per-instance cap, all in memory; no
  IP, email or hash is stored, and emails/IPs/phone numbers in posts are
  blanked. Links to other sites and slurs or strong profanity are HELD (filed
  under `held/` and flagged in the daily reports triage), never published.
- **Not dead when empty:** the site's topics with a line and a few prompts;
  never an invented post.
- **SEO:** threads are in the server HTML; a thread is noindex until it has a
  reply, the forum page until any thread has one; indexed threads carry
  DiscussionForumPosting JSON-LD.
- **Moderation:** the owner asks Claude; a post is removed by an edit to
  `forum.json` (`removeFromForum` in `src/lib/forum/core.ts`).

## 2026-11-01: Creators, "How to work with us"

Creators kept asking the owner how we'd like the site promoted, so /creators
now answers it in a "How to work with us" section (`#work-with-us`). Owner's
terms: flexible, low expectations, no contract, script or quota; any one of
three is plenty: link the site (plus their creator code where the site has
codes, RiftCompare only), a shout-out in their normal content, or a
walkthrough/review of the site. They call us their **partner**, never
"sponsor": we don't pay them for a mention. On our own pages they stay
"featured creators" ("partners" here still means affiliate links). The
section asks them to say it's a partnership (FTC/ASA), lightly. The
owner's ready-to-send replies live in the project's creators playbook, not
in the repo.

## 2026-11-01 — The visitor's own region by default, the US when unknown

Owner, 2026-11-01: "the default region is the region that the visitor is located in. And if they can't determine it,
then the default should be the US … It's probably better for US to be on the indexing." The US has the most stores
(160) and products, but the landing page, the region-less pages and hreflang x-default were built for the UK.

* `X_DEFAULT_REGION` is now `us`: the landing page, About and the legal pages render for the US on the server (the
  browser still moves them to the visitor's time zone), x-default points at the US copy, and the share card's
  example is a US product.
* `REGION_BOOT_SCRIPT` (`lib/region-boot.ts`, inline in the root layout, before paint) moves a person, never a crawler,
  link preview or audit tool, from a regional page of another region to the same page in theirs. Their region is the
  one they last picked (a click on any `[data-region-pick]` country link, `wgc-region` in localStorage), else their
  time zone's, else the US. The target is the page's own hreflang alternate, so a page with no copy in their region
  stays. `<main>` is hidden for at most 1.5 s while it decides. No request, no cookie: one CDN copy per page still.

## 2026-11-01 — Region guides written around today's prices

Bill asked for one or two new guides per site. WargameCompare had hubs (game, faction, type, store) but no guides, so
`/<region>/guides/cheapest-way-to-start` and `/<region>/guides/discount-stores-vs-rrp` (lib/guides.ts) answer two
questions no hub does: which first box to buy for the least money, and how much each store typically sells under RRP.
Every number is computed from the day's data (no typed price). Boxes that a type's regex catches but nobody starts with
(roleplaying starter sets, the Combat Patrol companion book, Spearhead gaming packs, Battlezone terrain, a single unit
sold "(Combat Patrol)") are left out, and starter sets need three stores so a duplicate listing doesn't make the list.
A store's saving is the median over its in-stock products with a stated RRP, 20 products at least. Pages follow the
cost rules (force-dynamic, CDN-cached by the existing `/:region/:path*` rule) and are in the sitemap and the menu.

## 2026-11-01: eBay and Amazon rows look like the other price rows

The owner: "the ebay and amazon links should blend in and look exactly the same as the other price rows … reflect that
change on the other sites that require it." Paid marketplace rows (eBay, Amazon, and TCGplayer where it is pinned) keep
their place and their "Ad"/paid-link label, but lose their brand tints and brand-coloured buttons: they use the same row
and the same button as a store. They are still never counted as a store and never re-ranked by commission. This
reverses the 2026-10-30 "bright, catchy colour" pinned rows; eBay ad strips and panels outside the price rows keep
their own look.

## 2026-11-01 — The US comes first in the eBay plan

Owner, 2026-11-01: "the eBay API for all websites should also prioritise the US." The plan led with the UK (35%, the
biggest Warhammer market we compare), the US had 25%, and slots a site could not use (nothing due there) were not spent.
`SHARE` is now US 35%, UK 30%, AU 20%, CA 15%; the US's searches are planned and run first, so a quota stop cuts another
site, never the US; and spare slots go to the US's remaining due products first, then to every other site's by score.
Floors and intervals are unchanged; the day's cap is still `EBAY_DAILY_CAP` (2,500).

## 2026-11-02 — Black Friday page

`/<region>/black-friday` shows today's deals (`lib/deals.ts`, the same rows as `/deals`) under a Black Friday heading,
at one URL kept every year so links and rankings carry over. It has to be indexed weeks before the day (27 November
2026), so it ships now; the nav, footer and sitemap link it all year. Never a "was" price of our own, a countdown,
"ends soon" or an invented sale. Dates are pure (`src/lib/black-friday.ts`, `tests/black-friday.test.ts`). Part of the
passive-growth plan (owner, 2026-11-02: no daily Reddit posts).

## 2026-11-02 — Free price widgets

`/embed/p/<id>?region=` is a live kit price badge any hobby blog, club or store can put in an `<iframe>`: the
cheapest in-stock independent store price in the region and how many stores have it. It reads
only the public data files through `summaryOf`, is noindex, and is kept a day by the CDN like every data page.
Only `/embed/:path+` may be framed. `/embed` shows the snippet (iframe plus one plain text link, the part search
engines credit) with a real kit on offer, and a plain-HTML store badge. The daily outreach offers the widget instead
of asking for a link (owner, 2026-11-02: growth must be passive). RiftCompare and the card sites have the same.

## 2026-11-02: IndexNow after each daily release, with a committed key

Every sister site already pinged IndexNow except this one. Bing's index also feeds ChatGPT and Copilot search, so
the daily release now sends every sitemap URL (about 14,000, in requests of 10,000) to IndexNow
(`scripts/indexnow-submit.ts`, last step of `refresh-prices.yml`). The key is public by design, IndexNow reads it from
the site, so it is committed as `src/lib/indexnow.ts` plus the static file `public/<key>.txt`: no secret, no function,
no setup step for the owner. A refusal is logged, never fatal, because the release has already landed.

## 2026-11-02 — Self-updating price report

`/price-report` is one page, kept at one URL, that rebuilds itself from each day's prices: per region, how many stores
and products are in stock, the share sold under RRP and the median saving, and the most widely stocked products. It is
the citable asset the daily outreach offers hobby writers (passive-growth plan, owner 2026-11-02), with a quote line.
Pure numbers in `src/lib/price-report.ts` (tested); force-dynamic and CDN-cached a day like every page.
## 2026-11-02 — The monitor reports to Empire HQ; only red mails

The owner asked for one Monday email instead of a mail per site (the control tower, approved 2026-11-02). The ops
monitor now writes every result to `ops-status.json`, and its workflow force-pushes it as `status.json`, one orphan
commit, to this repo's public `ops-status` branch (never deployed, `vercel.json`). RiftCompare's ops monitor reads it
every three hours for Empire HQ (riftcompare.com/admin/hq) and the one Monday report, and mails the owner itself if
the file goes quiet for a day (a stopped monitor cannot mail). Only a FAILED check fails the run, which is GitHub's
email to the owner; warnings wait for HQ and Monday. The file carries status and the monitor's own sentences only,
the same as the public Actions log.

## 2026-11-02 — Seasonal sale pages

`/<region>/boxing-day`, `/<region>/january-sales` and `/<region>/lunar-new-year` (owner-approved growth plan,
2026-11-02): one URL per region, kept every year like `/<region>/black-friday`, built weeks ahead so they are
indexed before the day, with the same rows (in stock, at least 10% under RRP or the median of three or more
stores, today) from one component, `src/components/SaleSeasonPage.tsx`. Each region has its own page; the intro
states where the day is a sale day as a fact. Dates, the year a page is about (it rolls over a week after the
event) and the intro are pure in `src/lib/sale-seasons.ts` (`tests/sale-seasons.test.ts`); Lunar New Year is a
published-date table to 2040 (6 February 2027). Footer and sitemap, not the nav. CDN-cached by the existing
region rule. Never a "was" price, a countdown or an invented sale.

## 2026-11-02 — Price alerts through RiftCompare's shared service

The owner chose "Yes, one shared service" for email price alerts on the sister sites. The site still has no
database, no accounts and no mail key; the product page gains an "Email me when the price drops" form.

- **The form** (`components/PriceAlertForm.tsx`, the same file on every sister site) posts
  `{site, productId, region, email, targetCents}` straight to `https://riftcompare.com/api/sister-alerts`.
  RiftCompare keeps the address (its own Neon project, private tables), sends one confirmation email (double opt-in)
  and checks daily. This site stores nothing and holds no key.
- **The prices** come from this site's own static `/alert-feed.json` (`lib/alert-feed.ts`, `force-static`, built with
  each release from the loaders the pages read): each product's `Summary.best` per region (the cheapest in-stock store
  price, never eBay, Amazon or Wayland, never converted), with `u` = `/{r}/p/<id>` (the service fills in the region),
  plus the deals page's top three per region (RRP or store median, labelled). Another hobby site's alert email
  (FigureCompare) may end with one of them.
- The privacy page says what the form sends and links to RiftCompare's. RiftCompare's `sister-alerts.yml` fails (and
  its ops monitor reports it) when a site with alerts serves no fresh feed.

## 2026-11-02 — Share buttons

The owner wants word of mouth to be a big growth driver on every site (RiftCompare's DECISIONS has the twelve-site
entry). Product pages and the quick view get a Share button: the phone's share sheet, else the link and message
copied. No pop-up, no reward. The message names the real gap in the region (`lib/share-link.ts`: cheapest and
dearest in-stock store, never converted). Each kit's share image (`[region]/p/[slug]/opengraph-image.tsx`) draws the
same gap and the RRP the stores state, text only like every share card here; it is force-dynamic and held by the CDN
for a day like the page, so only shared links cost a render. Every shared link carries
`utm_source=share&utm_medium=product`; `share` and `share_visit` join `buy_click` as the only Vercel events
(`lib/track.ts`): the button sends one, `ShareArrival` one per tab when a shared link brings someone, and
RiftCompare's weekly growth report counts both. No shared-list page: the site has no list to share yet.


## Sites that grow each other: the family feed, cluster blocks and short footers (2026-11-02)

Owner, 2026-11-02: "We need each site to help each other grow as a team effort", and the
footer family lists were "a bit convoluted … I'm wondering if it actually helps". Plan:
"Sites that grow each other" in the consolidation doc (https://claude.ai/artifact/QjrWGrfBqH4sKctwdjwptK).

- **Three clusters** (`src/lib/family-network.ts`, the same file in every repo): card games
  (Rift, OP, Dex, MTG, Gundam, Lorcana, YGO, Cyberpunk), hobby (Wargame, Figure, Gunpla on
  Gundam Compare) and tech (Compare Empire, CamCompare). KaeYoung stays out.
- **The family feed.** Each site's own daily data job writes `family-feed.json` (its best real
  deals and pre-orders today, per region) beside the data it already commits, and copies its
  cluster sisters' feeds from raw.githubusercontent.com into `family-cluster.json`. Pages read
  the committed file: no database of another site, no request-time fetch, no new function. A
  feed older than four days, from the wrong site, with a link off its own host or a saving that
  isn't the arithmetic of its two prices is dropped (`validFeed`), so a block shows less, never a guess.
- **One block per page**, on the deals, Black Friday and pre-order pages: one tile per sister with
  its best item in the visitor's region, else the US price in its own currency. Labels never name
  a country. Plain followed links inside a cluster.
- **Footers: one short line.** The sites of our own cluster by name, then one "A Compare Empire
  site" link to https://compareempire.com/network, which lists every site. Why: nothing counts
  footer clicks, footer links get few, and Google gives little weight to sitewide links between
  one owner's look-alike sites (12 sites all cross-linked in every footer is the pattern it can
  read as a link scheme). Cross-traffic should come from the price blocks, which people have a
  reason to click.
- Here: `src/lib/family.ts` (deals per region from `deals()`, the RRP or median basis kept), `scripts/family-sync.ts` in `refresh-prices.yml` before the data commit, files in `data/family/` (only `family-cluster.json` is traced into functions), the hobby block (Gunpla on Gundam Compare, FigureCompare) on `/[region]/deals` and `/[region]/black-friday`, a "Family feed" ops check (warns only), and a footer list of the two hobby sisters plus the network page. `SISTER_SITES` is gone.

## 2026-11-02 — Amazon Associates: following the Operating Agreement's Dos and Don'ts

The owner sent Amazon's own "Operating Agreement: Top Dos and Don'ts" page (2026-11-02: "make sure you
are following these instructions for all amazon affiliates"), and every site was audited against it.
The rules we keep, on every Compare Empire site:

- **Disclosure beside every Amazon link** ("Ad" / "Paid link"), and Amazon's statement "As an Amazon
  Associate I (we) earn from qualifying purchases." in the footer of every page.
- **Amazon's trademark notice** in the footer of every page: "Amazon and the Amazon logo are trademarks
  of Amazon.com, Inc. or its affiliates." No Amazon logo, screenshot, review or Amazon's own colours
  (its orange): the page "Don't use style or color of Amazon site which may cause confusion".
- **Links lead to a specific product** (an ASIN, or a search for that exact product's name), never a
  category or generic search: "All the links or buttons on your site should take customers to specific
  products on Amazon."
- **No Amazon link in a pop-up or layer**: the quick views show none; product pages carry the row.
- **Never Amazon prices in price tracking or alerts** ("Don't track prices or set price alerts"), and no
  Amazon link or trademark in any email, SMS or printed material.
- Every link tagged, rel="sponsored nofollow"; no incentive (cashback, discount) for buying through it.
- Here: the quick view has no Amazon row; `.btn-amazon` is no longer Amazon's orange; the footer carries
  the trademark line.

## 2026-11-02 — The country chooser in the hero, with drawn flags

Owner: "the region switcher must be more prevalent on all sites, on the main home page hero etc … and have
the flags as well". Every region home has a "Prices for" row of flag chips under its search, and the landing
page has the same row above its search, marking the visitor's region (`RegionChips`: plain links to each
region home with `data-region-pick`, so region-boot remembers the pick). The header's country menu shows
the flag and code, its list, the phone menu, the footer and the landing grid carry flags too.

- **Flags are inline SVG (`src/components/Flag.tsx`), never emoji and never image files.** Windows draws a
  flag emoji as two letters; image files would be new requests and hosting. No ids or clip paths, so a flag
  works inside the closed `<details>` menu. The same file is in every Compare Empire repo that has a region
  switcher; keep the copies identical. No Games Workshop artwork is involved: flags only.


## 2026-11-02: Nobody is moved to another region on a guess

Since 2026-11-01 `lib/region-boot.ts` moved every visitor on another region's page to their time zone's copy in the
browser. Crawlers were excluded, but Search Console then read regional copies as duplicates on Compare Empire, which has
the same script, and Google's guidance is not to redirect automatically on a guessed location. Now only a visitor who
PICKED a region (any `[data-region-pick]` link, kept in localStorage) is moved; everyone else stays on the URL they opened
and gets one line at the top, "This page shows <X> prices. Switch to <Y> prices · Stay", linking the page's own hreflang
alternate ("Stay" remembers the page's region). Crawlers never see the line. The script is byte-identical on MTG Compare,
DexCompare, WargameCompare and CamCompare.

## 2026-11-02 — At most one production build every 12 hours, and no branch but production deploys

**Why.** The owner capped Vercel spend at $5–6 a day across every site. 1 November cost $11.82 (normally
$2–4), and Build CPU was the largest line ($4.26), followed by CDN requests and ISR writes, which every
build multiplies (a deploy empties the page cache, so the next crawl re-renders and re-writes every page).
The `[deploy]` gate itself held; its premise did not: sessions landed 7–14 `[deploy]` commits a day per site
(manual "release now" runs and `[deploy]` in merge subjects), RiftCompare, OP, MTG and DexCompare alike.
Compare Empire's site built on every push to its production branch (84 commits that day) and CamCompare on
every three-hourly price commit, because neither had the gate.

**What.**
- `scripts/vercel-ignore-build.sh` skips a production `[deploy]` commit when the last production
  deployment (`VERCEL_GIT_PREVIOUS_SHA`, set by Vercel in that step) is under 12 hours old; the commit
  rides the next release. `[urgent]` in the SUBJECT overrides it, and only when the owner says a release
  cannot wait. An unset or unreadable last deployment builds (fail open). `tests/deploy-gap.test.ts` pins it,
  and the file is the same in every Compare Empire repo.
- `vercel.json` `git.deploymentEnabled` starts with `"**": false` and enables only the production branch
  (Vercel: when a branch matches several rules, any `true` wins). No preview is built for any branch or pull
  request, `[preview]` included; the older per-branch `false` entries stay for orphan commits' own copies.
- So "push to prod" means land on the production branch; the release reaches visitors within a day.

## 2026-11-03 — Footers link only card sites to card sites; every other site lists no sisters

The owner asked whether linking every Compare Empire site together helps or is a risk for search and for how the
sites look. Verdict: a sitewide footer link between sites one person owns carries little ranking value (Google
discounts it), and a mesh of unrelated sites (camera, appliance and figure sites in a card site's footer) can read
as a link network and looks odd to a reader. The owner said do it.

- `footerSisters()` in `lib/family-network.ts` (same file in every repo) now returns the other card sites for a card
  site and nothing for any other site. Gundam's Gunpla side no longer pulls WargameCompare and FigureCompare into its
  footer; the engine footer's heading is "Other card games".
- WargameCompare, FigureCompare, CamCompare and Compare Empire show no sister list in their footers, only one
  "A Compare Empire site" link to compareempire.com/network (Compare Empire: its own /network), the one page that
  lists every site. KaeYoung still links none.
- Anchors stay the brand name only, and links stay plain followed links: they are honest links between sites with
  one owner, not paid, so no `sponsored`/`nofollow`.
- Kept: the "Other card games" / hobby / tech price blocks on deals, Black Friday and pre-order pages
  (`clusterSisters`). They sit on a few pages, show real prices a reader of that page may want, and are not sitewide.

## 2026-11-03: home pages lead with product photos

Owner: "the front page can look much better. It needs images of products." The landing page and every region home now open
with a wall of six real kits (stores' own photos, the day's biggest savings in stock, one per faction, price and saving on
each), then image tiles per category (each with its most-stocked product's photo), then the savings grid. The landing page
has no region, so its one CDN copy carries every region's blocks and `HOME_REGION_SCRIPT` (lib/regions.ts) sets
`<html data-hr>` before paint so CSS shows the visitor's (their pick, else time zone, else the US); hidden blocks' images are
lazy and never fetched. No image proxy, no new function, no request-time work. Product tiles stopped prefetching
(`prefetch={false}`), one RSC render fewer per tile in view.

## 2026-11-03 — The quick view shows the product's own link

**Why.** Owner: "quickview popup should have a link change as well for all sites, instead of using the same link". The
pop-up kept the list page's URL, so a copied or bookmarked link lost the product, and Back left the page instead of
closing the pop-up.

**What.** Opening a quick view pushes the product page's own existing URL (/<region>/p/<id>) with `history.pushState`
(`src/lib/quick-view-url.ts`, the same file on every site). Back closes it and restores the list's URL, Forward reopens it,
closing it (×, Escape, the backdrop) steps back, so the history never fills with pop-ups. "See price history and details"
only hides the pop-up and navigates to the URL already shown, which Next turns into a replace: Back from the product page
goes to the list. The entry copies Next's own history state (`__NA` and the router tree), so the app router passes the
push through and the page under the pop-up never re-renders.

**SEO.** No new URL exists: the link is the canonical product page, which a reload, a share or a crawler gets in full
server HTML. Never a `?view=` or `#` variant (duplicate URLs, extra CDN copies). Pinned by `tests/quick-view-url.test.ts`.

## 2026-11-03 SEO audit: split sitemap, landing title, structured data, llms.txt

Bill's network SEO audit (homepages only) found a 14,241-URL single sitemap, a soft-404 `/llms.txt`, a landing description
that never says "Warhammer", no hreflang on the landing page, empty `alt` on product photos and no BreadcrumbList.
`/sitemap.xml` is now an index (route handler) of `/sitemaps/site.xml` and one file per region (`src/lib/sitemap.ts`,
each under 4,000 URLs today); `/llms.txt` is generated from the same data as the pages. The landing and region homes carry
reciprocal hreflang with the chooser at `/` as x-default (`homeAlternates`). Product, hub, guide and store pages emit a
BreadcrumbList matching their visible trail. Product photos' `alt` is the product name. The landing title is
"Warhammer Price Comparison: Discount Stores | WargameCompare" (60 characters, keyword first). `tests/seo.test.ts` pins it.

## Rate us and "What people say", run by RiftCompare (2026-11-03)

The owner wanted RiftCompare's rating pop-up on every site, each site's reviews public, and every written review approved in
RiftCompare's admin; star ratings count at once. This site stores nothing: the corner card (`components/site-reviews/RateCard.tsx`,
in the root layout) posts cross-origin to `https://riftcompare.com/api/site-reviews`, and the region home's "What people say"
reads the score and approved reviews from `https://riftcompare.com/api/site-reviews/wargame` in the browser (public JSON, CDN six
hours): no function, no data read. The card copies RiftCompare's corner card, not its rating drive: never on arrival, after 4
pages and 3 minutes or on return from a store tab, at most three times 14 days apart, always closable; "Rate us" in the footer
opens it. While no ad script is on the page it says "We don't run banner ads, so if this helped, please leave us a review."
No email asked for, never review markup. RiftCompare's DECISIONS.md, "Every site's reviews, approved in one queue".

## 2026-11-03 — New releases and pre-orders page, from the stores' own pre-order titles

The owner (2026-11-03): "We need a fresh pipeline of new products for all our sites, that's where our demand is."
Games Workshop opens pre-orders most Saturdays and buyers search for them, but the site had no page for them.

**What.** `/<region>/new-releases` (`src/lib/releases.ts`, `releasesFor` in `data.ts`), linked first under "Deals &
more", in the sitemap, and a "New releases and pre-orders" tile row on the region home above the savings.

- On pre-order: a store's title says pre-order AND either a release date a title states is still to come, or two or
  more stores say pre-order with no date. A stated date that has passed is a store that never edited its title
  ("Pre-Order For 10/17/2026" still up in November), so it is not shown. US and Canadian titles read month first,
  the others day first; an impossible date is read the other way; only dates from 60 days ago to a year ahead count.
  The date shown is the latest any store states, so a delayed batch is never shown early.
- Just arrived: first seen by the import in the last 45 days, never on the import's first day (2026-10-28, when
  every product was "new").
- First read (2026-11-03): Da Red Gobbo's Squigmobile (7 November) and the Necromunda Orlock wave (14 November);
  US 11 pre-orders, AU 7, CA 13, UK 1, NZ 0. Pinned by `tests/releases.test.ts`. No new data, no new job: it reads
  the daily import's files.

## 2026-11-03 — The home pages look like RiftCompare's: a centred hero, gold on blue-slate, Plus Jakarta Sans and Inter

The owner (2026-11-03): "wargamecompare also needs to look better. the home page is just a wall of text with no actual
images. Also the font and colouring can be way better and more inviting", with RiftCompare as the reference and "make sure
with all these redesigns that the seo is still 100% good". (The photo wall and tiles of the morning's entry had not yet
reached the live site: they ride the evening release.)

**What.** Both home pages open with RiftCompare's hero (`components/HomeHero.tsx`): centred, the title with a soft gold
glow over the living sparks canvas (`HeroSparks.tsx`, the card engine's), the search and the country row under it, then the
six-kit photo wall full width, and every section after it under one title row (`SectionHead`). Cards and tiles lift on
hover, the category tiles carry their label over the photo, and sections ease in on scroll (CSS view timelines, transform
only, nothing hidden). The palette moved from near-black and brass to a deep blue-slate night with gold and a crimson spark,
the light theme to warm paper and bronze; every text pair stays WCAG AA. The fonts are the family's since today: Plus Jakarta
Sans for headings and Inter for text, bundled as the latin subsets of the variable fonts (75 KB together, OFL,
`src/app/fonts`), no font request at runtime, `display: swap` with next/font's metric-matched fallback.

**SEO unchanged, checked.** The two builds (`main` and this one) were compared page by page with scripts off: title, meta
description, Open Graph, canonical, hreflang, every JSON-LD block, the h1, the set of internal links and the headings are
identical on `/`, `/au`, `/uk` and `/us`; the only differences are the order of two h2s (the eBay box now follows "Stocked by
the most stores") and the one-line section subtitles. Images keep their alt text and dimensions; only the first row of the
photo wall loads eagerly. eBay's strip stays above the first product grid (owner, 2026-10-28; `tests/nav.test.ts`).

## 2026-11-03 — The whole site runs the Dex/MTG engine's look, as a before-and-after test

The owner (2026-11-03): "I want to do a test. Can we completely redesign wargamecompare and make it follow the same engine as
dexcompare and mtgcompare? To do A/B testing". That overrides the morning's "no engine switches" note for this site only.

**What "the same engine" means here.** WargameCompare already shared the engine's token system and navigation model, so the
port is the presentation layer of DexCompare's sealed app and MTG Compare on WargameCompare's own data layer (`lib/data.ts`,
`lib/price-rows.ts`, the committed JSON): the neutral stylesheet and its light and dark themes (`globals.css`, from MTG, with the
site's claret as the one brand colour), Bricolage Grotesque for display and Inter for text (latin subsets, OFL, `src/app/fonts`;
Plus Jakarta Sans is gone), the one-row sticky header with the Browse dropdown, the typeahead `SearchBox` over `/api/index`,
the `<details>` country switcher and the `<dialog>` phone menu, the xl sidebar with active marking, the product card (type pill
over the photo, stock pill, "From", "Compare N prices"), the grid-row price table with the "Cheapest" badge and a "Show more"
fold after eight stores, the quick view, the `Section`/`Empty`/`Breadcrumbs` pieces, the phone sticky buy bar, and the footer
with a brand column. The hero band keeps the morning's photo wall (owner, 2026-11-03: "it needs images of products") as its
aside, and the category tiles stay. `HomeHero`, `HeroSparks`, `HomeVisuals`'s picks (now `lib/home.ts`), `HeaderBar`,
`SoftHeader`, `SoftSideNav` and `MenuCloser` are replaced.

**SEO unchanged, checked.** Both builds (`main` and this one) were compared page by page with scripts off on the landing page,
two region homes, two product pages, a game, an army and a type hub, deals, new releases, stores, search, about, creators, a
guide and Black Friday: title, meta description, robots, canonical, hreflang, Open Graph, every JSON-LD block, the h1 and the
h2 outline are identical. Internal links only grew: the country switcher now links every region's copy of the same page, the
Browse item links `/<region>/search`, and the product page's related rail shows eight kits instead of six. Every URL is the
same. The cost rules hold: every page is still `force-dynamic` under the CDN rules, nothing reads a cookie or header, no new
JavaScript on the server, the client bundle is 87 KB shared (`tests/cache.test.ts`).

**The test is before-and-after, not a split.** A cookie or edge traffic split would break the one-CDN-copy-per-URL rule
(two variants means two cache misses per page, double the function work), and serving crawlers a different page than visitors
risks a cloaking judgement. So: the seven days before the release are the baseline, the seven to fourteen days after are the
treatment, measured on Vercel Web Analytics (`buy_click` by retailer and placement, page views, visitors, the pages-per-visit)
and Search Console (clicks and CTR per page, which the identical metadata keeps comparable). The redesign rides the next
daily `[deploy]` data commit after the merge (about 4 November, 19:20 UTC); judge it around 18 November. If clicks per visitor
fall, `git revert` of the one merge commit restores the old look in the same release cadence.

## 2026-11-04: 19 stores from the big-store gap research, and a WooCommerce reader

Owner: "ensure all big stores are captured with no gaps … I don't have domain knowledge outside of Australia". A
research pass per region (r/Warhammer40k's retailer wiki, the Warhamateur and Warhammer Guild discount lists, Spikey
Bits, store locators) named 79 Games Workshop retailers not on the list. A runner probe read each one the way the
import does; 18 Shopify stores priced Games Workshop product in their market's currency and were added with their
Games Workshop collections (a trial import read all of them): Australia Hobbytech Toys, War and Peace Games,
WarGamers Hub, West Coast Games; Canada Battle Ready Games, Double Star, Imperial Hobbies, JR Toy Company, Kingdom
of the Titans, Maple Airbrush Supplies (Citadel paints), Fenris Workshop, Tabletop Renaissance; New Zealand Game
Corner, Hobby City (Citadel paints), Kapiti Hobbies; UK A Fistful of Dice, Castle Comics, Wargames Emporium.

**Mind Games (m-g.com.au), the national Australian chain, runs WooCommerce**, so the import now has a second reader,
`src/lib/import/woocommerce.ts`: the WordPress Store API, checked against robots.txt, category slugs or (with
`collections: []`) a keyword search per Games Workshop range, products returned in the Shopify shape so the same
listing filter, identity and pricing rules apply. `platform: "woocommerce"` in `stores.json` selects it. Waroffice
(UK) is also WooCommerce but showed seven Warhammer products: not added.

**The biggest names cannot be read, and stay off the list until an adapter exists:** Element Games, Dark Sphere,
Firestorm Games, Hobby Workshop, The Outpost, 4TK, Magic Madhouse (BigCommerce), Chaos Cards, Wayland (all custom
or behind Cloudflare, no feed); Mighty Ape AU/NZ (Kogan platform, 403); The Gamesmen, War for Less, Aetherworks,
Area 52, Milsims (custom); Sentry Box, MiniWarGaming, Meeplemart (custom); US Miniature Market (Magento), Game
Kastle (Shopify, but its feed holds no Games Workshop collection and robots.txt blocks the catalogue), Noble Knight,
GameNerdz, Discount Games Inc, CoolStuffInc, The Warstore, Atomic Empire (custom). Shopify stores whose robots.txt
disallows the feed are honoured and left out: Black Hole Gaming, Leodis, Sprues & Brews, Board Game Extras, Emerald
Hobbies, Elemental Games, Tin Soldier, Ocean Wargames, Boardlandia, Mission Fun & Games. Games Paradise and Hobbyco
(AU) run Shopify but their Games Workshop stock is not in any collection the probe could find. Bad Moon Cafe (UK)
lists events and pre-orders only.

## 2026-11-04 — The engine's eBay side rails, on both sides

The owner (2026-11-04, moving Gundam Compare onto the Dex / MTG Compare engine): "we should have the ads, the new ad change
that we had for that MTG Dex compare engine … make sure that we are using as much juice out of the eBay API as possible."
Checked against the engine's ad layout, WargameCompare already had everything but the side rails: eBay pinned first and
Amazon second in every price list and quick view (Amazon never in the quick view), the eBay strip above every first grid and
above the footer, the eBay row beside the best price. The one gap was the two fixed rails outside the 1480px shell on a wide
screen.

Ported (`src/components/SideAds.tsx`, geometry in `src/lib/rails.ts`, tiles in `src/lib/side-rails.ts`, mounted by the region
layout): left rail the most widely stocked kits, right rail today's deals, both eBay (Games Workshop has no TCGplayer, which
is the engine's right rail), each tile a live Buy It Now listing the import already matched (photo and delivered price; a rail
of bare searches is noise), never a product in both rails. Browser-only from 1864px wide, as many tiles as the window's height
fits, nothing in the server HTML (no SEO or layout change), every link `rel="sponsored"` under its own tag (`side-ebay`,
`side-ebay-deals`), labelled Ad, outside the store comparison and never counted as a store. No extra eBay call: the rails
read `data/ebay.json` like the strips. One lesson pinned in `tests/side-rails.test.ts`: a value imported from a `"use client"`
module into server code is a client reference, not the value (it emptied the rails once), so the geometry lives in a plain
module.

## 2026-11-04 — List your store: stores come to us

The owner stopped cold email outreach ("not really doing anything") and set the aim: be popular enough that stores
ask us, and encourage the ones that do. Every Compare Empire site now has `/list-your-store` (shared
`ListYourStore.tsx` + the `ListStore` form in `ReportForms.tsx`), linked from the footer, `/contact` and the stores
page: what a store gets (free, no contract, never pays to rank), what we need (a readable shop, own currency,
established), and what happens next (checked within a few days, reply through the store's own contact details).
The request is filed as a `suggest-store` report with `issue: "owner"`; RiftCompare's daily reports triage puts
those first and asks for a reply within two days. No email is asked for (the reports branch is public); no pop-up,
no cold email. RiftCompare and OP Compare keep their `/stores/suggest` page (now the owner pitch) and redirect
`/list-your-store` to it.

## 2026-11-05 — Amazon's own price on the Amazon row, from the Creators API at build

The owner (2026-11-05): "We need all the sites especially compare empire showing the API prices as price rows." The
owner's Associates accounts (AU approved 2026-11-03, US 2026-11-05) give ONE Creators API credential that serves every
Amazon store, but each store opens only once its own account has qualifying sales, so the site must switch on by itself
per store and keep working without it.

Every product with an EAN (4,238 of them) is looked up by barcode: `scripts/fetch-amazon-prices.ts` runs first in the
build script, before `next build`, in each store we tag (US, UK, CA, AU; NZ shows Amazon AU's price in A$ like its eBay
row), ten products a call, the most widely stocked kits first, 30 calls a store (`AMAZON_BUILD_CALLS`). It writes
`data/amazon-live/<store>.json`, git-ignored and traced into the functions, never committed: Amazon's licence lets a
price be kept for 24 hours and shown with the time it was fetched, so each build fetches its own and a price older than
24 hours is not read (`lib/amazon-live.ts`), and the browser hides it again past 24 hours (`AmazonPrice.tsx`) since the
CDN serves the page for a day. A price under 60% or over 160% of the store median is dropped (a different product behind
the barcode, or a marketplace seller's fantasy). Without credentials, or with a store Amazon refuses (401/403/429), the
script logs and moves on; the build never fails on it and the row keeps the tagged search link and "Amazon's own price".

The price lives on the Amazon row alone (`priceRows`, product surface): a `/dp/<ASIN>` link with the region's tag and
sub id, "View" instead of "Search", the required "accurate as of" disclaimer under the list. It is never a sort, the
cheapest badge, a deal, the alert feed, metadata or the quick view (no Amazon link in a pop-up). The credentials are
Vercel Production variables only (`AMAZON_CREATORS_AU_*`, a store's own `AMAZON_CREATORS_<STORE>_*` overriding), never
in the repo; `tests/amazon-api.test.ts` keeps the client build-side and the live file out of git.

## 2026-11-06 — Awin: a store that accepts us pays from the next build, with no step by hand

**Decision (owner: "check if we are making the most of Awin, and if it's not there, just do it"):** the family's Awin
account (Compare Empire, publisher 3144410) is read each morning by Compare Empire's `scripts/awin-sync.ts`, which
publishes the programmes that accepted us, with their tracked domains, in its public `data/awin/programmes.json`. This
site copies it first in every build (`scripts/fetch-awin.ts` → `src/lib/awin-programmes.json`; the committed copy is an
empty list). `storeUrl` turns a link to a joined advertiser's own domain (Element Games, Firestorm, Wayland…, whichever
accept) into its Awin deep link to the same page, unless a store partner code applies; `storeRel` makes it "sponsored"
and the price list marks it "Paid link". Order, the Cheapest badge and prices never change.

## 2026-11-06 — Side rails on every regular screen, scrolling through ten popular products

**Decision (owner: "I do not see those ads on the left and right side of the screen … it should appear on regular 16:9
screens … 16:10 even … scrollable … up to 10 products … popular products"):** the side rails now show from 1280px wide,
not 1864px. Below 1864px the shell gives up 160px a side for them (`globals.css`: `.max-w-shell` and `xl:max-w-shell` are
`min(1480px, 100vw - 320px)` from 1280px), so a 1280, 1366, 1440, 1536, 1600 or 1680px window gets a 136px rail on each
side, 12px from the window and from the page; from 1864px the shell is its full 1480px and the rails sit just outside it as
before. Each rail runs from under the header to the window's foot and its list scrolls through up to ten tiles, popular
first, instead of as many as the height fitted (at most six). A window too short for one whole tile shows none.

**Still true:** browser-only (mounted after a matchMedia check, nothing in the server HTML, so no SEO change), fixed (CLS
0; the shell rule is CSS, identical in the server HTML, so nothing moves when the rails mount), labelled Ad, rel
sponsored under their own placements, never a store, never Amazon.

**Cost:** the content column is narrower between 1280 and 1864px (960px at 1280). Pages already lay out at those
widths (a 1024px laptop gets the same), so nothing breaks; revisit if clicks per visit fall on laptops.

## 2026-11-06 — Store thumbs up and down, one tally shared by every site

**Decision (owner: "a little mini area where you can rate a shop … thumbs up a store or thumbs down a store … across all
the sites you can now see that these stores are trusted"):** every store row carries two tiny thumbs beside the store's
name (`src/components/StoreVote.tsx`, the same file on every Compare Empire site), with counts once a store has votes and
a green "Trusted" mark from 3 thumbs up and 80% of the votes. RiftCompare keeps the votes and serves one public tally
(`riftcompare.com/api/store-votes`, CDN six hours), keyed by the store's host without "www.", so a shop listed on several
sites shares its thumbs; this site stores nothing and fetches the tally in the browser only (no function, no build
step). One vote per browser per store, a few per network, marketplaces (eBay, Amazon, TCGplayer…) get none. Votes never
order prices, hide a store or decide the cheapest. RiftCompare's DECISIONS.md, 2026-11-06, has the rules; change the
component there first and copy it.

**Addendum (owner, 2026-11-06: "the home page must have this as well"):** the home page gets the same rails, in the
visitor's suggested or picked region (`SoftSideAds`, the way its header and sidebar follow the visitor).

## 2026-11-06 — Buy links open the store's checkout

**Decision (owner: "for all the sites that we can, send them directly to the checkout page, with the item in the
basket"):** an in-stock Shopify store row opens that store's checkout with the item in the cart, through Shopify's cart
permalink (`/cart/<variant id>:1`), as RiftCompare (#340) and OP Compare (#99) do. `scripts/import.ts` now names the
variant on every Shopify listing URL (before, only on multi-variant products), and `storeUrl(…, { checkout })` returns
the cart link, with `utm_source` and `utm_content=checkout`, for in-stock rows on the product page, its best-price
button and the quick view (`price-rows.ts`). A store with a partner code or on Awin keeps its product page (their
tracking runs there); eBay, Amazon and Wayland are unchanged. `buy_click` carries `link_type`.
`lib/checkout-link.ts`, `tests/checkout-link.test.ts`.

## 2026-11-06 — The phone dock: the side rails' ads on screens too narrow for them

Owner: "how can we have those [eBay and TCGplayer side rail ads] on mobile phone … like I have a Z Fold 7 … but also iPhones.
How do we get those ads to show on phones in the best way that doesn't interrupt user experience, but will also potentially
get a couple of clicks."

**Pattern:** below the rails' width, one bar along the foot of the screen (`AdDock.tsx`, fed by the rails' own tiles in
`SideAds.tsx`), the phone buy bar's size and rules: 64px plus the safe area, slides on transform only (CLS 0), never on the
first screen (only after 60% of a screen is scrolled), hidden while any other ad unit, the footer, a dialog, the menu or the
keyboard is in view, never on a page with the buy bar (product pages keep their own units), ✕ for the visit. On a phone it
shows one tile at a time with a View button, eBay and TCGplayer taking turns: the next tile peeks at the edge and swipes, and
each time the dock comes back it shows the next one (nothing animates on its own). From 640px (tablets) both sides at once.
Nothing is in the server HTML and nothing is requested until the visitor scrolls a third of a screen: no SEO change.
Placements `listings-dock` / `tcgplayer-strip-dock` (or the site's equivalents) so its clicks can be read on their own.

**Why this pattern (viewport simulation, Playwright, a local build):** Galaxy Z Fold cover screen (411×960, ~21:9), iPhone SE,
iPhone 16 (393×852), iPhone 16 Pro Max (440×956), iPad (820×1180); home, browse, a guide and a product page, stopping every
half screen. Without the dock an ad unit was in view at 8–20% of stops; with it 75–90% on the home page and guides, ~70% on
browse, 0% on product pages (by design). Never two units in a phone screen because of the dock, layout shift unchanged, the
bar is 7% of the Fold cover screen and 10% of an iPhone SE (Better Ads' "large sticky ad" line is 30%). Rejected: an extra
in-flow strip (the pages already have one unit per screen at most and in-flow ads are what the visitor already scrolls past),
a corner chip that opens a sheet (an overlay, and a tap before any product shows), a ticker under the header (covers the top
of the page, where searchers land). Split halves (eBay | TCGplayer) were tried on phones first: at 375px each title was cut to
a word, so phones show one at a time.

**Measure:** the dock's placements against the strips' in the ~11-10 / ~11-17 checks. If pages per visit drop on phones,
raise DOCK_ARM or drop the dock from that site first.

## 2026-11-06 — A cart list on every site

**Decision (owner: "I really like the cart feature … all of our websites"; built on RiftCompare first, TCGEmpire
#346):** every store price row gets an "Add to cart" button, and the header a cart with its count on every width.
`/cart` (static, noindexed, out of the sitemap) groups the lines by store with ONE "Check out at <store>" button per
store: Shopify's cart permalink `/cart/<variant>:<qty>,…`, which fills that store's cart and opens its checkout. The
list lives in the visitor's browser only (`localStorage` `ce_cart_v1`): no account, no database, no function. The page
re-checks each line's price and stock from the store's own `/products/<handle>.js` in the browser (Shopify serves it
with CORS open) and leaves a sold-out line out. A line is cartable only when the row's own buy link already is a cart
permalink (the single-click checkout links), so Awin and partner stores, and rows whose variant we don't know, stay
"manual" lines on their own tracked links; eBay, Amazon, TCGplayer and Cardmarket are never lines. Shared files, the
same in every site (port fixes by hand): `src/lib/cart-list.ts`, `src/components/cart/*` (`cart-config.ts` is the
one per-site file; styles imported once from the root layout), `tests/cart-list.test.ts`.

## 2026-11-06: Amazon prices find ASINs by EAN first (ported from ScentCompare #20)

The 2026-11-05 build fetch asked getItems with `itemIdType: "EAN"`. The Creators API documents ASIN as the only
itemIdType, so it could never have priced anything, even once Amazon opened access. Now `scripts/amazon-asins.ts`
runs in the daily refresh: per Amazon store, products with the most in-stock stores first, one searchItems by the
EAN and, failing that, one by the product's name, kept only when the result's own `externalIds` list our EAN (a
wrong merge is worse than a missing price; products without an EAN are never searched). Up to 300 calls a store a
day (`AMAZON_SEARCH_BUDGET`), misses retried after 30 days, `data/amazon/asins-<store>.json` committed (ASINs may be
stored, prices may not; not bundled with functions). The build prices those ASINs, ten a call, still within 60–160%
of the store median. Credentials are per country (the AU credential answers US and UK calls with 400
InvalidAssociate, found on Compare Empire), and InvalidAssociate / AssociateNotEligible now stop a store at once.


## 2026-11-06 — Every visitor lands on their own region, the US when we can't tell

The owner, for every site: "all of our websites … should default to the US version, unless it detects the user's
country." `lib/region-boot.ts` (byte-identical in MTG Compare, DexCompare, WargameCompare and CamCompare) now moves
every person, never a crawler, on a regional page of another region to the same page in theirs: the region they picked
(localStorage), else their time zone's, else the US. This reverses the 2026-11-02 rule that moved only visitors who had
picked and offered everyone else a "Switch to <X> prices" line; Compare Empire made the same reversal earlier the same
day. Crawlers still see every regional page as it is, and URLs, titles, canonicals and hreflang are unchanged, so
indexing is untouched. A pick always beats the time zone. `tests/region-boot.test.ts` pins it.

## 2026-11-06 — eBay and Amazon rows are full price rows, on top, outlined

**Decision (owner: "eBay prices and Amazon prices should function exactly like a normal store price row. So you can also
add to cart … if it's in stock … it just sits on the very top. And it has a different colored outline"):** the eBay row
is always the first row, with a green outline, and Amazon the second, with an amber one. Both carry everything a store
row has: the stock line, the store thumbs (one tally per eBay / Amazon domain, `ebay.com.au`, `amazon.com`…) and the
cart button. They are "manual" cart lines on their own tagged links (`src/lib/cart-list.ts`), never a Shopify checkout;
an Amazon line's price is dropped from the visitor's list after 24 hours (Amazon's licence), and the cart then says to
see today's price on Amazon. With no Amazon price the row reads "Also check on Amazon", a tagged link. Unchanged: neither
is counted as a store, "Best price", a deal, an alert price or the reference price; TCGplayer and Cardmarket stay
references (no thumbs, no cart line); no Amazon link in a pop-up.
WargameCompare: the eBay row's pill now reads "In stock" (was "Listed"); its cart line carries the delivered price the row shows. Wayland stays a search row under the stores.

## 2026-11-06: one box code, two editions; odd box codes beside one item number

A shopper review found the AU "Spearhead Starter Set" page showing Mperor's 3rd-edition Extremis set at A$199 as "44% under
RRP (A$355)", the 4th-edition set's RRP: Games Workshop reuses box code 80-01 for every edition's starter set, and the box
code joined them. `groupListings` step 2b now drops the box code from a group holding two item numbers whose titles name
the kit differently (a word most of one side uses and none of the other's), and 4c joins a group known only by its box
code to ONE product it shares a title with, never two. The other way round, a store's odd box code beside one item
number and barcode ("73-441" for Combat Patrol: Dark Angels) no longer splits the kit into two pages with the same
barcode. A bare box code at a title's start or end is no longer a title word. Rulebooks that name a box ("Combat Patrol
Companion") are books, battleforces and Apocalypse detachments that name a spearhead are army sets. The product page's
eBay button shows the delivered price when postage is known, as the eBay row does. Real titles in `tests/identify.test.ts`
and `tests/catalog.test.ts`. Pages pick it up at the next import.

## 2026-11-06: The quick view carries the tagged Amazon link (owner)

Since 2026-11-02 the quick view showed no Amazon link (or, on KaeYoung and ScentCompare, an "Amazon" row that opened our
own product page), read as Amazon's ban on links in pop-ups. The owner noticed the quick view sends nobody to Amazon and
chose (2026-11-06) to put the product page's own tagged Amazon link there. Amazon's Participation Requirements, item
(o): "You will not post or serve any Special Links … within any pop-up or pop-under windows, transitional page ads, or
layer ads, except for pop-up windows in conjunction with your Site promoting Products closely associated with the
materials on your Site." A quick view the visitor opens for one product, showing that same product, fits the exception;
the owner accepted the remaining risk. The quick view shows the link only (the item's own page where the ASIN is known,
else the tagged search), never Amazon's price: that stays on the product page under the 24-hour licence. Uninvited
overlays (a phone ad dock, a corner card, an exit pop-up) still never carry Amazon, and an Amazon page is never framed
(item (n)).

## 2026-11-07 — Black Friday strip and Cyber Monday page (owner: "capture all of the Black Friday SEO")

Black Friday is 27 November 2026 and Cyber Monday 30 November. Three additions, every Compare site:

- **`/<region>/cyber-monday`**, its own URL for its own searches ("<game> cyber monday deals"), kept every year like
  `/black-friday`, listing the same real store deals. In the sitemap and footer; the two pages link each other.
- **The holiday strip**: one line under the header on every page, in the server HTML, linking `/black-friday`
  from 1 November to the Saturday after it, then `/<region>/cyber-monday` to the day after Cyber Monday, then nothing
  (`saleStrip` in `lib/black-friday.ts`, tested). The same link leads the nav while it shows. A link, never a
  pop-up (pop-up policy: no uninvited interruption on a visit's first page), never a countdown or "ends soon".
- **More on both pages, nothing taken away**: the URL, title and h1 of `/<region>/black-friday` are unchanged;
  below the existing rows come four visible questions (the dates, whether stores have sales, shipping, how often it updates). No FAQ rich-result markup:
  Google shows those only for government and health sites since 2023, so the text is what ranks.

## 2026-11-07: Three stores to index a product page; hreflang only between indexable copies

The owner's Search Console and Bing audit (2026-11-07): the family's region sites put the same product at five region
URLs, and a copy one or two stores list reads as thin, so Google samples instead of indexing. `productIndexable`
(`src/lib/index-tiers.ts`) now needs three stores listing a product in a market, one in stock (`MIN_INDEX_STORES`; was
two). Below that the page is noindex, follow, out of the sitemap and out of other pages' hreflang; a noindex page now
advertises no hreflang itself. Indexable product pages 14,477 → 12,971 on today's data (NZ 1,358 → 739). Hubs count
indexable products, so a hub's tier follows. Every page stays live; URLs unchanged. Recheck Search Console ~25 Nov.
## 2026-11-07 — The low-traction cull: a product needs two in-stock stores in one region

Owner, 2026-11-07: apply Compare Empire's focus cull to every site. On 2026-11-07, 1,464 of 6,701 products were in stock at no
store and 1,578 at one store only; Search Console (56 days) put 22 product pages over a click or 10 impressions. `lib/focus.ts`
(read by `lib/data.ts`, so every page, list, search index and the sitemap follow it) keeps a product with search demand
(`data/focus/demand.json`, refreshed daily from the `demand` branch by `scripts/focus-demand.ts`), on pre-order, newly arrived
and in stock somewhere, or in stock at two or more stores in one region. ≈6,700 → 4,000 products. Nothing is deleted from the
data files; a culled product's URL 301s to its type page and comes back by itself when it qualifies.

## 2026-11-07 — The ops monitor checks the live site again

`scripts/ops-monitor.ts` checked the live site only when the repository variable `SITE_URL` was set, and it never was,
so "Live site" said "unknown" on every run: the monitor would not have noticed the site going down. Found in the
all-keys check. It now falls back to the site's canonical origin (`SITE_URL` in `src/lib/site.ts`).

## Black Friday guide (2026-11-07)

Owner: get the Black Friday pages indexed and ranking. The sale pages were already in the sitemap and the daily IndexNow
run (every sitemap URL). Added the region guide `warhammer-black-friday-2026`: the dates, each store's typical saving under RRP
today (`storeSavings`, top ten), the cheapest Combat Patrols, Spearheads and starter sets in stock at two or more stores,
and five checks. The sale pages link it. Its point is that independents already sell under RRP, so a code is a deal only
when it beats the cheapest store's ordinary price. It makes no claim about what stores will do on the day.

## 2026-11-08 — One Our sites page instead of footer cross-links

From the owner's Search Console audit of DexCompare: its only links from other sites were ~9,000 site-wide footer
links from our own sites, all to its home page, with the brand or a keyword as the anchor. They pass no authority,
and a network of same-owner sites linking each other from every page is the pattern Google's link-spam policy warns
about. CamCompare indexes well with more of them, so they are not what holds a site back, but they buy nothing.
DexCompare's footer went first (CompareEmpire #153); every other site now does the same: the footer links one
internal page, `/our-sites`, and that page links each other family site once, by its plain name, from
`FAMILY_SITES` (`lib/family-network.ts`, unchanged; `footerSisters` stays for the shared test). Every other footer
link, page URL and title is unchanged. Cross-traffic still comes from the price blocks on the deals and pre-order pages.

## 2026-11-08 — New Zealand product and guide pages noindex

Ported from DexCompare (CompareEmpire #153), after the owner's Search Console audit there: a new site with no outside
links offering a near-identical copy of every product and guide in every region gets cautious treatment.
`INDEXED_DETAIL_REGIONS` (`lib/index-tiers.ts`) is uk, au, ca, us. New Zealand keeps every page for visitors, but its
product and guide pages are `noindex`, out of its sitemap part and out of every hreflang set (739 NZ product pages and
every NZ guide copy, on the day); its home, game, faction, type, store and sale hubs stay. The 3-store product rule
(`MIN_INDEX_STORES`) is unchanged. Add New Zealand back once the core is indexed (recheck ~2026-11-25).

## 2026-11-08 — Christmas is one quiet line, not a costume

Owner: "some of the christmas themes on our websites are a bit too much - the theme must match the domain". The
2026-11-01 Christmas look (falling snow, a strand of lights, trees, presents, candy canes, stockings, a Santa hat on the
logo, candy-cane stripes and seasonal palette swaps) is gone, with its art in `public/xmas/`. The season keeps at most ONE
touch, drawn in the site's own colours: the home pages' gifts line (`ChristmasBanner`, now a plain `.xmas-pill` instead of a winter-night card), and the brand keeps its own red instead of turning holly red. It still starts and ends by itself (`lib/season.ts`, 1 November to
Boxing Day), and the tests pin that nothing else comes back. Black Friday and Cyber Monday (strip, pages, nav) are
unchanged. The same rule went to every sister site: the site's own identity first.

## 2026-11-08 — Full-width shell and a featured-product hero

Owner, 2026-11-08: KaeYoung and ScentCompare's hero ("feature some products on the hero … uses the full screen") on the Dex / MTG
engine family (DexCompare #154, MTG Compare #104, YGO Compare #125, Gundam Compare #118), ported by hand:

- From 1280px the shell runs from the eBay rail's edge to the right rail's (`.max-w-shell` margins of 136px, not a max-width:
  `100vw` counts a desktop scrollbar), the sidebar flush against the left rail; `.page` 1440px.
- The hero's six-photo wall is now two big product cards (`HeroCards` in `components/HomeVisuals.tsx`: photo, saving on RRP,
  faction or type, cheapest in-stock price, in-stock store count), the first two of `heroPicks` (`n = 2`, so the deals grid below
  keeps the rest). Region home and landing alike (the landing's per-region blocks unchanged). Nothing in the cards is a heading;
  URLs, titles and metadata unchanged. Seasonal decor unchanged.

## 2026-11-08 — The alert form asks, unticked, for a weekly price drops email

Owner, on the 2026-11-08 competitor scan: "implement all of this" (gap #5, a weekly email of the biggest price drops).
The shared `PriceAlertForm.tsx` (byte-identical on every sister site) gains one UNTICKED box, "Also email me this site's
biggest price drops once a week", sent as `weekly` beside the alert. RiftCompare's alert service does the rest
(TCGEmpire DECISIONS.md, "A weekly biggest-drops email for the sister sites"): it rides the same double opt-in, builds
one edition a week from this site's own `/alert-feed.json`, links only to this site's pages (no eBay or Amazon), and
every email has a one-click stop. This site still stores no address and holds no mail key, and nothing new pops up.

## 2026-11-08 — Store badges, free price data and My collection (competitor scan)

The owner approved the competitor scan's ideas (Collectr and PriceCharting keep people coming back with "what is my
collection worth"; Scryfall grew on free data credited with a link; price sites earn links from the stores they list).
- **Store badge.** `/list-your-store` ends with "Already listed? Add our badge": the site's plain-HTML "prices compared on"
  badge (an ordinary link: no iframe, script, image or tracking) and its code to copy. `ListYourStore.tsx` takes it as the
  optional `badge` prop and stays the same file in every site. Stores see it when they come to us; nobody is emailed about it
  (cold outreach stays stopped).
- **Per-store badge.** A store's own page ends with "Add this badge to <store>'s site" (`components/StoreBadgeBox.tsx`): the
  same badge, pointing at that store's page here (`storeBadge(…, path)`), so a store that adds it links to its own listing.

## 2026-11-08 — "Is this a good price?": paste a store link

Owner, 2026-11-08 (the competitor scan's gap #7, "implement all of this"), ported from MTG Compare (mtgcompare #106): a visitor
pastes a store's product link at `/is-this-a-good-price` (`components/LinkChecker.tsx`, `lib/link-check.ts`)
and sees whether it is a good price.

- The browser asks `/api/check/<host>` for that store's listings: our own stored rows, only for a store in `src/data/stores.json`
  (anything else is a 404), force-dynamic and kept by the CDN for a day, never ISR. It never fetches the pasted
  page. Each listed product comes with its cheapest and median in-stock store price in that region (eBay, Amazon and Wayland never count).
- A link is keyed by host and path (`linkPath`: a Shopify product is `/products/<handle>` from any collection or market prefix); two
  products under one path need the `?variant=` to tell them apart, or there is no answer (a wrong product is worse than none).
- Verdict (`priceVerdict`): within 1% of the cheapest in stock is the best price; under the median fair; within 3% of it typical;
  above it "you can pay less", with the saving. A listing that was out of stock says so instead. eBay, Amazon, marketplaces, stores
  we don't read and unmatched pages fall back to a search from the link's words, and the visitor gets a search of their region with those words.
- Pasting a link into the header search opens the checker (`#link=` in the fragment, so the CDN keeps one copy of the page).

## 2026-11-09 — Navigation audit (Bill): Games, Armies and Products in the header; no dead-end menu links; hubs link onward

Bill: a collector deep in one space must reach it fast. A Games Workshop buyer looks by game system, then army, then kind of kit.

- The header's one "Browse" dropdown became three: **Games**, **Armies**, **Products** (real links in the server HTML, opening on hover
  and focus), then Deals and New releases; Stores and Forum from xl (the sidebar and footer carry them below). Never more than seven
  items below xl, the Black Friday / Cyber Monday page included. Each dropdown's label goes to its first hub.
- Menus (header, sidebar, phone sheet) link only a game, army or kind of kit that holds a product in that market (`lib/nav-live.ts`,
  computed from the summaries already loaded). A region-less page (home, About) uses every market together. `navGroups(region)` with no
  filter is still the whole list.
- Hub pages say where to go next (`HubPage` `more`): a game lists its kinds of kit and the other games, an army its game and the
  other armies of that game, a kind of kit its games and the other kinds. The BreadcrumbList, titles, canonicals and h1 are unchanged.
- Not done: an "all armies" index page (the sidebar holds the ten popular ones), and the footer's one link to /our-sites (the
  owner's 2026-11-08 call) is untouched.

## 2026-11-09: one mega-menu component for the header dropdowns (owner)

- Bill: navigation like the best modern sites, one shared pattern across the Dex / MTG engine family. `components/NavMenu.tsx` (the same
  file in DexCompare, MTG, Gundam, Wargame, YGO and Bandai; keep them identical) wraps every header dropdown: the panel is always in the
  server's HTML as plain links (closed it is only `invisible`, so crawlers read it and keyboards skip it), it opens on hover with intent
  (90 ms in, 200 ms grace out), a chevron button toggles it for touch and click, focus into the item opens it, ArrowDown/Up/Home/End move
  through the links, Escape closes and returns focus, focus leaving or a press outside closes it, one menu open at a time, a navigation
  closes it (`aria-expanded`, `aria-controls`, `aria-haspopup`). The label stays a real link.
- Header is now Games, Armies, Products, Deals, Guides, Stores (sale page first in season): Deals (today's deals, new releases and
  pre-orders, Black Friday / Cyber Monday) and Guides (how to start, store savings, price outlook, forum, creators, about, add a store)
  are new dropdowns, split from the "Deals & more" group; the "New releases" and "Forum" items moved into them. The region switcher
  already switches in place.
- No URL, title, canonical, h1 or JSON-LD changed; no read or page added; the phone menu and the sidebar are unchanged.
- Not done: removing the side panel (the menus do not yet cover its deep groups, and it carries the current-section state for the
  deep levels; revisit once the menus have been in use), a phone bottom sheet (the `<dialog>` menu stays), and the side rails and
  footer links, which are the owner's own decisions. Deals is a hover menu: nothing is added to the deploy cadence.

## 2026-11-10: Christmas: the banner opens the gift guide, which lists battleforces (site review WGC-1)

The three Black Friday pages won 26 of the site's 64 Google clicks (positions 4.6 to 9.3). They already refresh every
day: each is drawn from the day's prices, the daily data commit is the release, and the CDN holds a page one day. Nothing
to change there through 1 December.

A separate "Christmas battleforce" page was not built: `/<region>/type/army-sets` already lists every battleforce and army
set at the cheapest store price, and this year's Christmas boxes cannot be told from earlier ones in our data until stores
list them (`firstSeen` restarted on 5 November). Instead the Christmas banner on the home pages opens the gift guide (it
pointed at the deals list), and the gift guide's "big present" section shows eight battleforces and army sets in stock at
two or more stores (four before), cheapest first, with a link to the full army sets page. When Games Workshop's Christmas
battleforces appear in stores they show there the same day. No URL, title or metadata changed.

## 2026-11-10: A lean sitemap, 450 products per region (SEO indexing plan, SEO-5)

- The sitemap listed 12,625 URLs, 12,015 of them product pages across four regions. Google held 7,540 pages and had 7,197
  queued ("discovered, currently not indexed"), for 44 clicks a week from 855 pages with impressions.
- `SITEMAP_PRODUCTS = 450` (`lib/index-tiers.ts`, as KaeYoung and Figure name theirs; the card said 500, but with about 130
  hub URLs a region the whole sitemap came to 2,610, so 450 keeps it under 2,500: now 2,410). `sitemapProducts` lists, per
  region, every product with search demand first (`data/focus/demand.json`: a click or 10+ impressions), then the rest by
  stores with it in stock, then id. Every hub (game, faction, type, store, guides) stays.
- A product left out is still live and indexable under the three-store rule (`productIndexable`); it is just not announced.
  IndexNow sends the sitemap's URLs, so its batch shrank with it. No URL, title, canonical or noindex rule changed.
- Pinned in `tests/seo.test.ts` (the cap, the demand-first order, the total under 2,500). Widen the cap one step when the
  recheck (~25 Nov) shows the queued pages being indexed.

## 2026-11-10: Product page weight cut, every store row kept (site review X1, ported from DexCompare)

Measured on a local production build with today's data: /uk/p/tau-empire-commander (46 stores) went from 590 KB (305 KB payload) to 363 KB (214 KB payload); / 737 KB to 552 KB of HTML. The title, meta tags, canonical,
hreflang, JSON-LD, headings and every link are byte-identical (compared). The same change as DexCompare's entry of the same day:

- Price-table rows past `FULL_ROWS` (20, `PriceList.tsx`) in the server's price order are lean (`PriceList.tsx` LeanRow, here; the lean row keeps the "Paid link" label and a store's code):
  store, stock pill, price, button (no thumbs, cart or listing title). Every row stays in the server HTML, folded as before.
- Row cells, `StockPill` and `ProductCard` use short `@apply` classes in `globals.css` (`.or-*`, `.sp-*`, `.pc-*`); `StoreVote`
  reads `components/store-vote.css` (imported by the root layout so node tests can load the component).
- `Flag` is an `<img>` of `public/flags/<code>.svg`, written by `scripts/write-flags.tsx`, not ~2 KB of inline SVG per flag.

## 2026-11-10: The nearest paid price under the cheapest store (best-price card and phone buy bar)

The zero-earnings diagnosis (10 Nov) found 214 buy clicks in 30 days, 57 of them to a link that can earn. RiftCompare's
paid-alternative rule (owner 2026-10-27) is ported (`paidAlternativeFor` in `lib/price-rows.ts`, the one file that reads
Amazon prices): when the cheapest in-stock store is not a paid link, a line names the cheapest paid row of the same list
within 20% of its item price, "or £29.71 delivered on eBay" with the Ad pill. eBay counts in the phone buy bar (product
`product-sticky-alt`), which had no eBay button; on the best-price card (`product-best-alt`) eBay already has its own
button, so only Amazon's own listing (hidden in the browser after 24 hours) and stores on Awin count there. A row in
another currency (NZ reads eBay and Amazon Australia) is never compared. It is the row's real price, never "Cheapest",
never a reorder. On the day's data the phone bar shows it on 4,615 of 17,106 product pages; the card on none until an
Amazon price or an Awin store qualifies.

## 2026-11-12: The home page features the dearer kits (owner)

A bigger ticket pays a bigger commission, so each region's home page (hero picks, "Biggest savings today", new releases and
pre-orders, "Stocked by the most stores" and the top-kits eBay strip, which reads the same lists) now keeps to products whose
cheapest in-stock price is at or above the market's MEDIAN (`homeFloor` / `dearer` in `lib/home.ts`; own currency, never
converted; on 2026-11-12 data about US$40, CA$48, A$59, £23, NZ$80). A shelf with too few qualifying products falls back to
the old list. Cheaper kits stay listed, searchable and on /deals, /new-releases and every hub; URLs, titles, metadata, the
alert feed and the price order inside a product's table are unchanged, and nothing ranks by commission.

## 2026-11-12: A tasteful Christmas layer, more festive than the 8 November pill (owner)

On 2026-11-08 the owner had the first Christmas look stripped ("a bit too much: the theme must match the domain"); on
2026-11-12 he asked for it to be more festive again. The answer is accents, not a costume: the same shape on every Compare site,
in this site's own colours. Inside the existing window (`lib/season.ts`, 1 November to 26 December by the visitor's date,
`?season=christmas|off`), `ChristmasBanner` is now a one-line gift-guide card on the home page (inline SVG gift in
`currentColor`, "Christmas gift guide", a short subline from 640px, a pine "Gifts" badge, a cranberry 3px left border; a link
to the existing `/<region>/guides/warhammer-gift-guide`, not a heading). `globals.css` adds a 3px two-tone cranberry-then-pine
hairline at the very top of the page (a hard-stop gradient on `html::before`, absolutely positioned, so no layout shift) with
light and dark colour tokens (`--xmas-red`, `--xmas-green`), and the gifts pill and the Black Friday strip take the same tokens
for their border only. No new element, request, script, image or font. Still gone, and pinned in `tests/season.test.ts`: snow,
lights, Santa hats, candy stripes, palette swaps, sparkles, keyframes and canvas. ONE off switch: `CHRISTMAS_FESTIVE_LAYER` in
`lib/season.ts` gates the banner markup (false renders the old pill) and the `data-festive` attribute every rule keys on; set it
false after New Year, or let the window end on 26 December. No URL, title, meta, h1 or h2 changes; no `revalidate` touched.


## 2026-11-12: the festive layer is released urgently (owner)

The owner said to deploy the festive layer urgently once every site had it, so this merge carries `[deploy] [urgent]` in its subject: one production build now, instead of waiting for the next release. No other change.


## 2026-11-12: a calmer price table (owner)

The owner opened DexCompare and its quick view and said there was too much going on: too many colours, a colour per row. DexCompare's
rule now applies here too: the accent is for the one thing to press, green is for money (the best price), everything else is neutral.
This replaces the coloured outlines of 2026-11-06 and 2026-11-07.

The pinned eBay and Amazon rows lose their green and amber outlines (`PIN_OUTLINE`, `.or-ebay` and `.or-amz` are gone); the cheapest store row trades its sky-blue outline for a soft ground and a green edge (`.or-hl`). `.btn-ad` is filled with the ink colour instead of eBay blue, and the Amazon row uses it too, so the paid rows stay as easy to press without adding colours.

Order, labels, links, tags, URLs, titles, metadata and headings are unchanged; what we earn still never decides order. Measure outbound
clicks per placement on 19 November against the week before: if the pinned eBay row's clicks fall, strengthen its button before
bringing any outline back.

## 2026-11-13: urgent release

Owner asked for every site to be released now: the unpriced-Amazon fix, Fetch as an ordinary store row and the blue TCGplayer button had been merged without a deploy marker. One build, via this commit's subject.

## 2026-11-13: the side rails are off; the ads are the strips inside the page

Owner: visitors looked down, the side banners "don't look as good" and spoil the site's look, so the eBay and TCGplayer (or Amazon) rails come off every site and the page column gets the side space back. The ads that stay are the horizontal strips inside the page and, on small screens, the phone dock (after a scroll, never on a product page). The rail code stays behind one constant (`SIDE_RAILS = false` in the rail component, or `SITE.sideRails` on MotorCompare): nothing is rendered or fetched while it is false, and the CSS that narrowed the column for them is gone. Measured before the change (Vercel Web Analytics, unique visitors, Oct 30 to Nov 5 against Nov 6 to Nov 12, the rails having shipped Nov 6): DexCompare 4,200 to 4,972 with bounce 57% to 43%; RiftCompare 3,399 to 3,179 (its fall was Oct 29, a week before the rails); OP Compare 1,123 to 1,016. The measure to watch next is clicks per placement for the strips, not visitors. Never re-add rails, a floating banner or a gutter ad without the owner.

## 2026-11-13: one native horizontal ad block inside the page, in place of the side rails, the strips and the boxes

Owner: with the side rails off, replace them with ONE bigger, subtler horizontal ad that sits in the page content and looks like the
site: its own card, border and surface tokens, a small muted "Ad" pill, no loud colours, nothing floating, no side space.
`components/InlineAds.tsx` (picked by `lib/inline-ads.ts`, filled by `lib/inline-tiles.ts`) is that block: a full-column-width card of
up to six larger tiles (172px, a 154px photo, two title lines, the delivered price and "eBay · delivered" or "eBay · deal"), popular
kits and today's deals taking turns, scrolling sideways on a narrow column (`.scroller`). eBay only: Games Workshop has no TCGplayer
and Amazon and Wayland have no stored prices. Links are rel sponsored under `inline-ebay`, `inline-ebay-deals` and `inline-ebay-all`
(EPN customid `wgc-<region>-inline-ebay…`), so the report counts it apart from the retired `side-ebay*`, `ebay-strip-*`, `home-ebay`,
`category-ebay`, `landing-ebay`, `guide-ebay` and `new-releases` placements.

Browser-only like the rails were: the server sends an empty box of the block's exact height (`INLINE_H`) and the tiles draw after
hydration, only when three exist: no SEO change, CLS 0. ONE per page, mounted by the two layouts (`[region]/layout.tsx`, and
`(site)/layout.tsx` in the visitor's region for the home and About pages) below the page's content and above the footer, so it is
never beside a buy button, above a price or in the quick view; the home page's block is therefore at the foot of the page rather than
between sections (a per-page slot would have meant a second block on the others). Every `EbayStrip` and `EbayBox` (home, hubs,
deals, product, new releases, guides, the footer strip) and the rail code are deleted; the pinned eBay rows of the price tables and
search are not strips and stay. The phone dock stays (`DockAds.tsx`) and yields to the block. `tests/inline-ads.test.ts` and
`tests/nav.test.ts` pin it. Measure clicks per `inline-*` placement against the old strips on 20 November.

## 2026-11-14: The price rows' cart button says "Add to cart"

The owner, opening the price rows: "there needs to be an add to cart button ... right now, it just sends it to the site". The
cart button was already on every store row, but as a bare grey cart icon on a computer (lost on the tinted best-price row) and
as small coloured text on a phone, so it read as decoration. `CartAddButton` now carries its words by default ("Add to cart",
"In cart" once added; "Add" beside the icon below 640px where a row has no room), with a firmer neutral border, and the phone's
text button (`inline`) is drawn as a bordered button (`cart.css`). Neutral, never a new colour: the buy button stays the one
filled action and the calm three-colour rule holds. Nothing else moved: which rows can be added (open store rows, eBay and
Amazon with a live price; never a marketplace or a search row), the line's buy link and its affiliate tag, the row order, the
buy button and every placement are unchanged. A caller can still ask for the bare icon (`label={false}`).

### 2026-11-14 — On a phone, a price row's two buttons get their own line

With "Add to cart" beside the store's button, a phone row's second column took the store's name down to one letter ("T  BEST
PRICE" on the cheapest row). Below 640px a full row is now name and stock, price, host, then the cart button and the store's
button side by side at full width (`globals.css`, after `.or-act`). The name keeps the whole row and the cart button says "Add to
cart" in full. Lean rows, the order of rows and every paid row's wording are unchanged.

## 2026-11-14: every inner page brought up to the home page's design (owner: "make all the other pages more aesthetic as well")

The home page's language is now the spec for the rest of the site: one page header (`components/PageHead.tsx`: the trail, the h1
in the home page's voice, one line of lead, then any key facts or toolbar), the home page's section title (`.sec-title`, now also
used by `Section`), its cards and chips, and one article style (`.art-*` in `globals.css`, applied to plain HTML by `.prose-wg`:
a ~68-character measure, one heading scale, styled lists, `.data-table` for numbers, which scrolls in its own box on a phone).

- Product pages: on a phone the photo is a 216px plate instead of a full-width square, and the game, army, kind of kit and box code
  are one quiet dotted line under the h1 (they were chips above it), so the name, photo, stock and best price fit the first screen.
  The price alert and "Report a wrong price" are two matching buttons (`.tool-btn`; `triggerClassName` / `summaryClassName` props,
  off by default, so the forms are unchanged elsewhere).
- Game, army and kind-of-kit pages: the armies, kinds of kit and other games are one sideways row each on a phone, wrapped from
  1024px (`.chip-row`), so the first products sit about one screen down instead of three. Every chip is still a link in the server HTML.
- Deals, new releases, Black Friday, Cyber Monday and the other sale pages: product names wrap to two lines instead of being cut off,
  prices are the display face and tabular, the secondary line reads in `muted` instead of `faint`.
- Guides index and guides: the shared header with a visible trail (drawn without a second BreadcrumbList: `Breadcrumbs ld={false}`),
  article typography, tables in `.data-table`, and "Other guides" as cards instead of a run-on line of links.
- Stores and a store: the shared header, roomier rows with the count in tabular figures; a store that is the cheapest for nothing
  today now says so with two ways on, instead of an empty heading.
- Search: the box is full width with an icon, the filters a two-column grid on a phone with 44px targets; a search with no results
  says so and offers sold-out matches, clearing the filters and six of the region's own lists; the results area keeps its height
  while the index loads (layout shift 0.376 to 0 on a phone).
- About, legal, contact, price report and the 404: the same h1 and prose; the footer's two-line links get breathing room.
- Home (polish only): the Deals and New releases chips are neutral like the others (they were brand pink and green), per the
  three-colour rule.

Checked against main with scripts off on 18 URLs: identical title, meta description, canonical, hreflang, robots, Open Graph,
JSON-LD and h1; no h2 lost; the same set of internal links; no indexed words lost; and every outbound link (eBay, Amazon, stores,
the sticky bar, the ad block) in the same order with the same words and href. No paid link, ad block, placement name, URL, metadata
or `revalidate` changed, so the 19 November clicks-per-placement recheck is unaffected.
