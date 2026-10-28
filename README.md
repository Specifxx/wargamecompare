# WargameCompare

Miniature wargame price comparison at **wargamecompare.com**: Games Workshop products (Warhammer 40,000, Age of Sigmar,
Kill Team, Horus Heresy, Citadel paints and the rest) compared across independent stores in the **UK, Australia, New
Zealand, Canada and the US**, each country in its own currency. It earns from affiliate links: eBay Partner Network,
Amazon Associates, Wayland Games (UK) and store partner codes. A sister site of RiftCompare, MTG Compare and
DexCompare, built on what they learned about cost.

## How it works

- **No database.** `scripts/import.ts` (GitHub Actions, `.github/workflows/refresh-prices.yml`, daily at 19:20 UTC)
  reads every store in `src/data/stores.json` through Shopify's public `products.json`, two stores at a time, with
  robots.txt honoured. It groups the listings into products by Games Workshop's own codes and writes `data/*.json`,
  which is committed to `main`. The site reads those files and nothing else.
- **One build a day.** The data commit's subject carries `[deploy]`; nothing else builds production
  (`scripts/vercel-ignore-build.sh`). `claude/*` branches never deploy.
- **Pages are cached by Vercel's CDN for a day** (`next.config.js`), not ISR, and no page reads a cookie or header.
- **eBay** (`scripts/ebay.ts`, same workflow): the cheapest new Buy It Now listing that is really the product, through
  WargameCompare's own eBay keyset. Shown as a labelled ad row under the stores, never as a store.
- **Self-monitoring**: `.github/workflows/ops-monitor.yml` runs `scripts/ops-monitor.ts` every six hours; a failing check
  fails the run and GitHub emails the owner.

## Product identity (`src/lib/identify.ts`)

Games Workshop prints three codes on every box, and stores carry them in their SKUs or titles: the short box code
(`48-75`), the 11-digit item number (`99120101498`) and the barcode (`5011921…`). Listings that share a code are one
product; the codes join across stores and countries. A code one store uses for two different titles is ignored for that
store; a group with two different codes of the same kind is not joined; a listing whose title shares under half of its
words with the rest of the group is dropped. A listing with no code joins a group only by an exact title match. A wrong
merge is worse than a missing price.

## Pages

`/` picks a country. `/<region>` (uk, au, nz, ca, us) is the country's home; `/<region>/p/<slug>` a product;
`/<region>/game/<system>`, `/faction/<faction>`, `/type/<type>` hubs; `/deals`, `/stores`, `/stores/<store>`; `/search`
(noindex). Only products two or more stores list (one in stock) and hubs with six such products are indexed and in the
sitemap (`src/lib/index-tiers.ts`).

## Develop

```
npm ci
npm run dev
npm run typecheck && npm run lint && npm test
npm run import -- --only goblingaming      # needs network access to the stores
```

Read `CLAUDE.md` (rules), `DEPLOY.md` (setup and operations) and `DECISIONS.md` (why).
