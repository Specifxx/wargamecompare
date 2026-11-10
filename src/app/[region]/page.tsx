import type { Metadata } from "next";
import { EbayStrip } from "@/components/EbayStrip";
import Link from "@/components/Link";
import { ChristmasBanner } from "@/components/ChristmasBanner";
import { EbayBox } from "@/components/EbayBox";
import { Flag } from "@/components/Flag";
import { CategoryTiles, HeroCards } from "@/components/HomeVisuals";
import { Icon } from "@/components/Icon";
import { ProductGrid } from "@/components/ProductCard";
import { RegionChips } from "@/components/RegionChips";
import { SearchBox } from "@/components/SearchBox";
import { Section } from "@/components/Section";
import { SiteReviews } from "@/components/site-reviews/SiteReviews";
import { FACTIONS, SYSTEMS } from "@/lib/catalog";
import { mediansFor, meta, releasesFor, summariesFor } from "@/lib/data";
import { deals } from "@/lib/deals";
import { categoryTiles, heroPicks } from "@/lib/home";
import { regionOr404 } from "@/lib/page";
import { homeAlternates, ogFor } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { storesInMarket } from "@/lib/stores";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { region: string } }): Metadata {
  const r = regionOr404(params.region);
  const n = storesInMarket(r.market).length;
  const title = `Warhammer prices in ${r.inName}: compare ${n} stores`;
  const description = `Compare Warhammer 40,000, Age of Sigmar, Kill Team and Citadel paint prices across ${n} independent stores in ${r.inName}, with live stock and the saving on RRP.`;
  return {
    title: { absolute: title },
    description,
    alternates: homeAlternates(`${SITE_URL}/${r.region}`),
    openGraph: ogFor(`/${r.region}`, title, description),
  };
}

export default function RegionHome({ params }: { params: { region: string } }) {
  const r = regionOr404(params.region);
  const all = summariesFor(r.region);
  const stores = storesInMarket(r.market);
  const inStock = all.filter((s) => s.inStock > 0).length;
  const dealt = deals(all, mediansFor(r.region)).map((d) => d.s);
  const hero = heroPicks(all, dealt, 2);
  const inHero = new Set(hero.map((s) => s.product.id));
  const top = dealt.filter((s) => !inHero.has(s.product.id)).slice(0, 12);
  const tiles = categoryTiles(all, r.region);
  const popular = all.filter((s) => s.inStock > 0).slice(0, 12);
  const count = (pred: (s: (typeof all)[number]) => boolean) => all.filter(pred).length;
  const systems = SYSTEMS.map((s) => ({ s, n: count((x) => x.product.system === s.slug) })).filter((x) => x.n > 0);
  const factions = FACTIONS.map((f) => ({ f, n: count((x) => x.product.faction === f.slug) }))
    .filter((x) => x.n >= 5)
    .sort((a, b) => b.n - a.n)
    .slice(0, 24);
  const updated = meta().updatedAt;
  // New releases and pre-orders (lib/releases.ts): the soonest pre-orders, else the newest arrivals, as product tiles.
  const rel = releasesFor(r.region);
  const ids = new Set([...rel.preorders, ...rel.arrivals].slice(0, 6).map((x) => x.product.id));
  const fresh = all.filter((s) => ids.has(s.product.id));
  const freshOrder = [...rel.preorders, ...rel.arrivals].map((x) => x.product.id);
  fresh.sort((a, b) => freshOrder.indexOf(a.product.id) - freshOrder.indexOf(b.product.id));

  return (
    <div>
      {/* The engine's hero band (Dex and MTG Compare): the words and the search on the left, two featured products on the right (owner, 2026-11-08). The
          H1, the lead and every link are the same as before the port; only the composition changed. */}
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div className="page relative grid gap-8 py-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(340px,480px)] lg:gap-10 lg:items-center">
          <div className="min-w-0">
            <div className="eyebrow">
              <Flag code={r.region} /> {r.name} · prices in {r.currency}
            </div>
            <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              Warhammer prices in <span className="text-brand">{r.inName}</span>, compared across {stores.length} independent stores
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              {all.length.toLocaleString("en")} products tracked, {inStock.toLocaleString("en")} in stock somewhere today. Every price is the store&rsquo;s own, in {r.currency}, cheapest first. {r.taxNote}
              {updated && <> Prices checked {new Date(updated).toUTCString().slice(5, 16)}.</>}
            </p>
            <div className="mt-6 max-w-2xl">
              <SearchBox region={r.region} size="lg" />
            </div>
            <RegionChips region={r.region} className="mt-4" />
            <nav aria-label="Jump to" className="mt-4 flex flex-wrap gap-2">
              <Link href={`/${r.region}/deals`} prefetch={false} className="chip min-h-10 border-brand/30 bg-brand-soft font-semibold text-brand-strong hover:border-brand/60">
                <Icon name="tag" size={16} /> Deals
              </Link>
              <Link href={`/${r.region}/new-releases`} prefetch={false} className="chip min-h-10 border-open/30 bg-open-soft font-semibold text-open hover:border-open/60">
                <Icon name="calendar" size={16} /> New releases
              </Link>
              <Link href={`/${r.region}/type/combat-patrols`} prefetch={false} className="chip min-h-10">
                Combat Patrols
              </Link>
              <Link href={`/${r.region}/type/starter-sets`} prefetch={false} className="chip min-h-10">
                Starter sets
              </Link>
              <Link href={`/${r.region}/type/paints`} prefetch={false} className="chip min-h-10">
                Paints
              </Link>
              <Link href={`/${r.region}/stores`} prefetch={false} className="chip min-h-10">
                Stores
              </Link>
            </nav>
            <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              <span className="h-2 w-2 shrink-0 rounded-full bg-open motion-safe:animate-pulse" aria-hidden="true" />
              <span>
                <b className="tabular font-semibold text-ink">{stores.length.toLocaleString("en")}</b> stores
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <b className="tabular font-semibold text-ink">{inStock.toLocaleString("en")}</b> in stock
              </span>
              <span aria-hidden="true">·</span>
              <span>checked daily</span>
            </p>
          </div>
          {hero.length > 0 && (
            <aside aria-labelledby="top-savings">
              <p id="top-savings" className="eyebrow mb-3">
                Top savings today
              </p>
              <HeroCards items={hero} region={r.region} />
            </aside>
          )}
        </div>
      </section>

      <div className="page">
        {/* Christmas only (1 November to Boxing Day; hidden by CSS otherwise). */}
        <div className="mt-8">
          <ChristmasBanner
            title="Christmas gifts for the hobby"
            href={`/${r.region}/guides/warhammer-gift-guide`}
            cta="Gifts at every budget, priced today"
          />
        </div>

        {/* eBay first (owner, 2026-10-28): the strip sits above the page's first product grid. */}
        <div className="mt-8">
          <EbayStrip region={r.region} items={[...top, ...popular]} placement="ebay-strip-home" heading="Today's top kits on eBay" />
        </div>

        {top.length > 0 && (
          <Section title="Biggest savings today" kicker="In stock now, furthest under RRP, every store's own price" href={`/${r.region}/deals`} linkLabel="All deals">
            <ProductGrid items={top} region={r.region} eager={4} />
          </Section>
        )}

        {fresh.length > 0 && (
          <Section title={rel.preorders.length ? "New releases and pre-orders" : "Just arrived"} kicker="What the stores have just listed, cheapest first" href={`/${r.region}/new-releases`} linkLabel="All new releases">
            <ProductGrid items={fresh} region={r.region} />
          </Section>
        )}

        {tiles.length > 0 && (
          <Section title="Shop by category" kicker="Every game and every kind of box, each with its own cheapest-first list">
            <CategoryTiles tiles={tiles} />
          </Section>
        )}

        <Section title="Browse by game">
          <div className="flex flex-wrap gap-2">
            {systems.map(({ s, n }) => (
              <Link key={s.slug} href={`/${r.region}/game/${s.slug}`} className="chip">
                {s.name} <span className="text-faint">{n}</span>
              </Link>
            ))}
          </div>
        </Section>

        {factions.length > 0 && (
          <Section title="Popular armies">
            <div className="flex flex-wrap gap-2">
              {factions.map(({ f, n }) => (
                <Link key={f.slug} href={`/${r.region}/faction/${f.slug}`} className="chip">
                  {f.name} <span className="text-faint">{n}</span>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {popular.length > 0 && (
          <Section title="Stocked by the most stores" kicker="The kits you can buy almost anywhere, so the comparison matters most">
            <ProductGrid items={popular} region={r.region} />
          </Section>
        )}

        <div className="mt-14">
          <EbayBox region={r.region} query="Warhammer" heading={`Warhammer on eBay ${r.region === "nz" ? "Australia" : r.short}`} placement="home-ebay" />
        </div>

        {/* The site's own star score and approved reviews (owner, 2026-11-03), loaded in the browser; nothing until there is a rating. */}
        <SiteReviews className="mt-14" />

        <section className="prose-wg mt-14 max-w-3xl">
          <h2>How WargameCompare works</h2>
          <p>
            We read each store&rsquo;s public catalogue once a day and match every listing to one product by the code printed on the box (for example 48-75), so a
            price is only ever compared with the same kit. Second-hand, painted and on-sprue listings are left out. The best price is the cheapest store that has it in
            stock; the saving is measured against the RRP the stores themselves state. Shipping is not included: check the store&rsquo;s checkout.
          </p>
          <p>
            Missing a store? <Link href="/contact">Tell us</Link> and we will add it if its catalogue can be read.
          </p>
        </section>
      </div>
    </div>
  );
}
