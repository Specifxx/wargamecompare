# Working in this repo

WargameCompare (wargamecompare.com) compares Games Workshop product prices across independent stores in the UK, AU, NZ,
CA and US. A sister site of RiftCompare (`Specifxx/TCGEmpire`), MTG Compare and DexCompare. Read `README.md`, then
`DEPLOY.md`, then `DECISIONS.md`.

## Deploys are gated: do not add `[deploy]` to commit subjects

**One production build per 12 hours, and production only (owner, 2026-11-02: Vercel spend capped at $5–6 a
day).** `scripts/vercel-ignore-build.sh` skips a `[deploy]` commit within 12 hours of the last production
deployment (it rides the next release); `[urgent]` in the subject overrides that, only when the owner says
so. `vercel.json` disables every branch except production (`"**": false`), so no preview is ever built.
Never dispatch a manual release just to ship a merge. DECISIONS.md, 2026-11-02.

Production builds only a commit whose SUBJECT carries `[deploy]` (`scripts/vercel-ignore-build.sh`,
`tests/vercel-ignore-build.test.ts`). The daily data commit from `refresh-prices.yml` carries it: one build a day.
Never put `[deploy]` in a code commit's subject on your own initiative; "ship it" means land on `main`. Use
`release.yml` only when the owner says it is urgent, and say so. Previews build only with `[preview]` in the subject,
when the owner asks. `claude/*` and `ccr-*` branches never deploy (`vercel.json`).

## No database, ever, for public data

Everything the site serves is committed JSON under `data/`, written by GitHub Actions and read by `src/lib/data.ts`.
Never write anything private to `data/` (it is public with the source). Never edit `data/` by hand. `data/cache/` is the
importer's, git-ignored and kept in the Actions cache; never bundle it with the site.

## Price alerts: RiftCompare's shared service (owner, 2026-11-02)

The product page's "Email me when the price drops" form (`src/components/PriceAlertForm.tsx`) posts to
`https://riftcompare.com/api/sister-alerts`; RiftCompare keeps the address, confirms it and emails, reading this site's
static `/alert-feed.json` (`src/lib/alert-feed.ts`, `force-static`) once a day. This site never stores an address or
holds a mail key. Keep the feed's price the cheapest in-stock store price (never eBay, Amazon or Wayland).

## Cost rules (from the sister sites, where breaking them ran up the bills)

- Pages are `force-dynamic` and cached by Vercel's CDN for a day (`next.config.js` `CDN_PAGES`), never ISR, and no
  page reads a cookie, a header or the session (`tests/cache.test.ts`). A new page gets a CDN rule.
- No `generateStaticParams` prewarming. No `next/image` (store photos are plain hotlinked `<img>`).
- The search index is one CDN-cached JSON per region (`/api/index/<region>`); keystrokes never reach a function.

## Games Workshop's IP

- The brand, domain and logo never contain "Warhammer", "40K", "Citadel", "Games Workshop" or "Sigmar"
  (`tests/ip.test.ts`). Product names are used only to describe what stores sell.
- No Games Workshop artwork of our own: product photos are the stores' own listing photos, hotlinked. The share image
  is text only.
- `GW_DISCLAIMER` (`src/lib/site.ts`) stays in the footer, `/about` and `/terms`.

## Identity: a wrong merge is worse than a missing price

`src/lib/identify.ts` joins listings only by Games Workshop's codes (box code in brackets, item number, barcode), and
`src/lib/listing-filter.ts` refuses second-hand, painted, bits, merch, store bundles and other brands. Rules may only
refuse more, never loosen. Add a real store title to `tests/identify.test.ts` or `tests/listing-filter.test.ts` for
every rule you change.

## Affiliates (how the site earns)

- Every paid link goes through `src/lib/affiliate.ts` with a `wgc-<region>-<placement>` tag, and is `rel="sponsored"`.
- eBay (owner, 2026-10-28) is pinned FIRST in every product price list, tagged "Ad" (no "Shown first" wording, owner 2026-10-30), with an eBay
  button beside the best price and an eBay row above search results and the lists' first grid. Amazon is pinned second
  (owner, 2026-10-30), Wayland stays under the stores. The rows live in `src/lib/price-rows.ts` / `PriceList.tsx`,
  shared by the product page and the tile quick view (`QuickView.tsx`, `/api/quick/<region>/<id>`, CDN-cached). None is ever counted as a store, given the "Cheapest" badge, the best price or a deal;
  the store rows stay sorted by price and the real cheapest keeps its badge.
- Store partner codes (`src/lib/store-partner-deals.ts`) are a label beside a price, never a re-rank.
- The ONE ad block of a page (`InlineAds.tsx`, owner 2026-11-13; the side rails and every eBay strip and box are gone): a native horizontal card of up to six live eBay tiles above the footer, browser-only with its height reserved, never in the server HTML, never counted as a store. The phone dock (`DockAds.tsx`) stays.

## Amazon's price on the Amazon row (owner, 2026-11-05)

`scripts/amazon-asins.ts` (daily refresh; getItems takes ASINs only, 2026-11-06) finds each product's ASIN with
searchItems (the EAN, then the name) and keeps it only when Amazon's own externalIds carry our EAN; ASINs and misses
are committed in `data/amazon/` (prices never). `scripts/fetch-amazon-prices.ts` runs first in every Vercel build and
asks getItems for those ASINs, in every Amazon store with a tag (US, UK, CA, AU; NZ reads AU's), into the git-ignored
`data/amazon-live/`; the product page's Amazon row (`lib/price-rows.ts`, product surface only) shows Amazon's own
listing and price with its time for 24 hours (`lib/amazon-live.ts`, `AmazonPrice.tsx`). Never committed, never a
sort, the cheapest badge, a deal, the feed or the quick view. Credentials `AMAZON_CREATORS_<US|UK|CA|AU>_*` (GitHub
secrets + Vercel Production): each country's own (a credential works only for its own account's tags; AU is the
fallback). A store without API access yet (Amazon wants 10 qualifying sales in 30 days) is skipped and its row keeps
the search link; the ops check "Amazon ASINs" shows it. `tests/amazon-api.test.ts` pins it.

## eBay

Only `scripts/ebay.ts` (GitHub Actions) calls eBay. The keyset is on the owner's second eBay account (5,000 calls a
day), shared with FigureCompare and no other site: 2,500 each, capped by `EBAY_DAILY_CAP` (default 2,500). Never raise
it on your own initiative, and never use a card site's keyset. The website holds no eBay credential. `/api/ebay/account-deletion` must stay
deployed while the keyset exists.

## The site watches itself

`ops-monitor.yml` runs `scripts/ops-monitor.ts` every six hours (checks in `src/lib/ops.ts`, tests in
`tests/ops.test.ts`). A new scheduled job, external API or limit gets a check there.

## Checks

```
npm run typecheck
npm run lint
npm test
```

Record non-obvious decisions in `DECISIONS.md` (newest at the bottom).
