# Deploying and running WargameCompare

## One-time setup (owner)

The full step-by-step prompt is `/mnt/project-files/wargame-compare/setup-prompt.md` in the project files. In short:

1. **Vercel**: import `Specifxx/wargamecompare` as a new project (framework Next.js, root `/`). Environment variables
   (Production):
   - `NEXT_PUBLIC_SITE_URL` = `https://wargamecompare.com` (the bare domain is canonical)
   - `NEXT_PUBLIC_EBAY_CAMPAIGN_ID` = `5339155911` (optional: it is the code default)
   - `AMAZON_TAG_US`, `AMAZON_TAG_UK`, `AMAZON_TAG_CA`, `AMAZON_TAG_AU` = Amazon Associates tags (US falls back to
     `riftcompare-20`, AU/NZ to `compareempire-22`; UK and CA show no Amazon link until set)
   - `WAYLAND_SEARCH_TEMPLATE` = Wayland Games' affiliate search link with `{q}` where the search words go
     (e.g. `https://www.waylandgames.co.uk/search?q={q}&<their tracking parameter>`, or an Awin deep link whose `ued` is
     the encoded Wayland search URL with `{q}` in it); unset hides Wayland
   - `EBAY_VERIFICATION_TOKEN` = 32–80 characters, the same value given to eBay for account-deletion notices
   - `GOOGLE_SITE_VERIFICATION` = Search Console's HTML-tag token (optional if verified by DNS)
   - `NEXT_PUBLIC_CONTACT_EMAIL` (optional; the site uses compareempire@gmail.com without it)
2. **Domain**: add `wargamecompare.com` (the bare domain only) in Vercel; at the registrar ADD the records Vercel asks
   for. Never redirect the apex to www, and never change or delete an existing record (the 2026-10-26 outage on the
   sister sites came from www switches).
3. **eBay** (the owner's second eBay account): a developer keyset at developer.ebay.com, with the account-deletion
   endpoint `https://wargamecompare.com/api/ebay/account-deletion` and the token above; an EPN campaign named
   WargameCompare. GitHub → Settings → Secrets and variables → Actions: secrets `EBAY_CLIENT_ID`,
   `EBAY_CLIENT_SECRET`, `EBAY_CAMPAIGN_ID`.
4. **GitHub variables**: `SITE_URL` = `https://wargamecompare.com` (the ops monitor checks it), optionally
   `EBAY_DAILY_CAP` (default 2500: the app's 5,000 a day are split with FigureCompare).
5. **Search Console**: add the domain property, submit `https://wargamecompare.com/sitemap.xml`.

## Daily operation

- `refresh-prices.yml` (19:20 UTC): import → eBay → one `[deploy]` commit → one production build.
- Code merged to `main` rides that build. A release out of turn: Actions → **Release now** (an empty `[deploy]` commit). Vercel environment variables
  apply only to the next build, so run it after changing one.
- Run the import by hand: Actions → **Refresh prices** → Run workflow (optionally only some stores or markets).

## Monitoring

`ops-monitor.yml` every six hours checks: the import's age (fails over 30 hours), the product count (fails under 300),
store reads (fails when over a quarter fail; warns when one has failed for 72 hours), the eBay pass and its call count,
the live site, and store partner codes due a re-check. "unknown" means a source is not set up yet; it never alerts.

## Adding a store

Add it to `src/data/stores.json` (`key`, `name`, `base`, `market`, `country`, and `collections`: the store's Games
Workshop collection handles, or `[]` to read the whole catalogue). Only Shopify stores that sell new Games Workshop
product in the market's own currency; the import refuses a store that prices in another currency. Check
`/robots.txt` allows `/collections/…/products.json`.

## Store partner codes

`src/lib/store-partner-deals.ts`: a store may give an exclusive discount code (shown as a chip, never re-ranking) and/or
a commission parameter. A code hides itself 30 days after it was last checked at checkout.
