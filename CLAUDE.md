# Working in this repo

WargameCompare (wargamecompare.com) compares Games Workshop product prices across independent stores in the UK, AU, NZ,
CA and US. A sister site of RiftCompare (`Specifxx/TCGEmpire`), MTG Compare and DexCompare. Read `README.md`, then
`DEPLOY.md`, then `DECISIONS.md`.

## Deploys are gated: do not add `[deploy]` to commit subjects

Production builds only a commit whose SUBJECT carries `[deploy]` (`scripts/vercel-ignore-build.sh`,
`tests/vercel-ignore-build.test.ts`). The daily data commit from `refresh-prices.yml` carries it: one build a day.
Never put `[deploy]` in a code commit's subject on your own initiative; "ship it" means land on `main`. Use
`release.yml` only when the owner says it is urgent, and say so. Previews build only with `[preview]` in the subject,
when the owner asks. `claude/*` and `ccr-*` branches never deploy (`vercel.json`).

## No database, ever, for public data

Everything the site serves is committed JSON under `data/`, written by GitHub Actions and read by `src/lib/data.ts`.
Never write anything private to `data/` (it is public with the source). Never edit `data/` by hand. `data/cache/` is the
importer's, git-ignored and kept in the Actions cache; never bundle it with the site.

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
- eBay, Amazon and Wayland rows are labelled "Ad", pinned under the store rows, never counted as a store, never the
  best price, never in deals. Store rows are sorted by price; commission never decides order.
- Store partner codes (`src/lib/store-partner-deals.ts`) are a label beside a price, never a re-rank.

## eBay

Only `scripts/ebay.ts` (GitHub Actions) calls eBay. The keyset is WargameCompare's own (the owner's second eBay
account, 5,000 calls a day), capped by `EBAY_DAILY_CAP` (default 4,000). Never raise it on your own initiative, and
never use a sister site's keyset. The website holds no eBay credential. `/api/ebay/account-deletion` must stay
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
