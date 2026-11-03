import type { Metadata } from "next";
import Link from "next/link";
import { ChristmasBanner } from "@/components/ChristmasBanner";
import { CreatorsTeaser } from "@/components/creators/CreatorsTeaser";
import { RegionSuggest } from "@/components/RegionSuggest";
import { mediansFor, summariesFor } from "@/lib/data";
import { deals } from "@/lib/deals";
import { CategoryTiles, HeroMosaic, categoryTiles, heroPicks } from "@/components/HomeVisuals";
import { HomeHero, SectionHead } from "@/components/HomeHero";
import { ProductGrid } from "@/components/ProductCard";
import { productIndexable } from "@/lib/index-tiers";
import { REGION_LIST, REGIONS } from "@/lib/regions";
import { faqLd, homeAlternates, jsonLd, ogFor } from "@/lib/seo";
import { GUIDES, fill } from "@/lib/guides";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { storesInMarket } from "@/lib/stores";
import { Flag } from "@/components/Flag";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // 60 characters, keyword first, brand last (SEO audit, 2026-11-03).
  title: { absolute: `Warhammer Price Comparison: Discount Stores | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  alternates: homeAlternates(SITE_URL),
  openGraph: ogFor("/", SITE_NAME, SITE_DESCRIPTION),
};

const FAQ: [string, string][] = [
  [
    "Where is the cheapest place to buy Warhammer?",
    "It changes from kit to kit. Independent discount stores usually sell Games Workshop products 10 to 25% under RRP, and a different store is cheapest for different boxes, so we compare every store's own price for each product every day and sort them cheapest first.",
  ],
  [
    "Are these Games Workshop prices with shipping?",
    "No. They are each store's listed item price in your own currency. Shipping and free-shipping thresholds differ by store, so check the store's checkout before you buy, especially on a big order.",
  ],
  [
    "Which countries do you compare?",
    "The United Kingdom, Australia, New Zealand, Canada and the United States. Each country only compares stores that charge in its own currency, and prices are never converted.",
  ],
  [
    "Is WargameCompare part of Games Workshop?",
    "No. WargameCompare is an independent price comparison site, not affiliated with or endorsed by Games Workshop. Product photos belong to the stores that list them.",
  ],
];

export default function Landing() {
  // Every region's pictures are in this one CDN copy; CSS shows the visitor's (HOME_REGION_SCRIPT). Hidden blocks' images are
  // lazy, so a visitor downloads only their own region's photos.
  const blocks = REGION_LIST.map((r) => {
    const all = summariesFor(r.region);
    const top = deals(all, mediansFor(r.region)).map((d) => d.s);
    const hero = heroPicks(all, top);
    const shown = new Set(hero.map((s) => s.product.id));
    const savings = top.filter((s) => !shown.has(s.product.id) && productIndexable(s)).slice(0, 12);
    return { r, hero, savings, tiles: categoryTiles(all, r.region) };
  });
  return (
    <div className="page py-8">
      <HomeHero
        eyebrow="Stop paying full price for plastic"
        title="Compare Warhammer prices across the discount stores"
        lead={<>
          Warhammer 40,000, Age of Sigmar, Kill Team, The Horus Heresy, The Old World and Citadel paints: every kit matched by its box code across independent
          stores, cheapest in stock first, with the saving on RRP. Free, and no account needed.
        </>}
      >
        <RegionSuggest />
      </HomeHero>

      {/* Every region's pictures are in this one CDN copy; CSS shows the visitor's (HOME_REGION_SCRIPT). Hidden blocks' images are
          lazy, so a visitor downloads only their own region's photos. */}
      <section className="sd mt-8" aria-label="Top savings today">
        {blocks.map(({ r, hero }) =>
          hero.length ? (
            <div key={r.region} className={`hr hr-${r.region}`}>
              <p className="mb-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-muted">
                <Flag code={r.region} /> Top savings in {r.inName} today
              </p>
              <HeroMosaic items={hero} region={r.region} className="sm:grid-cols-6" />
            </div>
          ) : null,
        )}
      </section>

      {/* Christmas only (1 November to Boxing Day; hidden by CSS otherwise). */}
      <div className="mt-10">
        <ChristmasBanner
          title="Christmas gifts for the hobby"
          text="Combat Patrols, starter sets and paints, matched by box code across the discount stores, cheapest in stock first."
          href="/us/deals"
          cta="See the biggest savings"
        />
      </div>

      {/* Real prices and product links in the landing page's server HTML, every region's (crawl-audit-sites, 2026-10-30). */}
      <section className="sd mt-12">
        {blocks.map(({ r, savings }) =>
          savings.length ? (
            <div key={r.region} className={`hr hr-${r.region}`}>
              <SectionHead title={`Biggest savings in ${r.inName} today`} sub="In stock now, furthest under RRP, every store's own price." href={`/${r.region}/deals`} all="All deals" />
              <ProductGrid items={savings} region={r.region} />
            </div>
          ) : null,
        )}
      </section>

      <section className="sd mt-12">
        <SectionHead title="Shop by category" sub="Every game and every kind of box, each with its own cheapest-first list." />
        {blocks.map(({ r, tiles }) => (
          <div key={r.region} className={`hr hr-${r.region}`}>
            <CategoryTiles tiles={tiles} />
          </div>
        ))}
      </section>

      <CreatorsTeaser />

      <section className="sd mt-12">
        <SectionHead title="Prices in your country" sub="Each country compares only the stores that charge in its own currency." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {REGION_LIST.map((r) => {
            const n = storesInMarket(r.market).length;
            const products = summariesFor(r.region).filter((s) => s.inStock > 0).length;
            return (
              <Link key={r.region} href={`/${r.region}`} prefetch={false} data-region-pick={r.region} className="card p-5 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-lift">
                <p className="flex items-center gap-2 font-display text-xl font-bold">
                  <Flag code={r.region} /> {r.name}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {n} stores · {products.toLocaleString("en")} in stock · {REGIONS[r.region].currency}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="prose-wg mt-12 max-w-3xl">
        <h2>Why compare?</h2>
        <p>
          Independent stockists sell the same boxes for 10 to 25% under RRP, and which one is cheapest changes from kit to kit. We read their catalogues every day so
          you don&rsquo;t have to open twenty tabs. Prices stay in your own currency and are never converted.
        </p>
        <h2>How it works</h2>
        <p>
          Every listing is matched to a Games Workshop product by its box code, item number or barcode, never by a guess at the title, so a Combat Patrol is only
          ever compared with the same Combat Patrol. Second-hand, painted, bits and store-made bundles are left out. The stores are sorted by price, in stock first;
          eBay and Amazon sit above them as labelled ads and are never counted as the cheapest store.
        </p>
        <h2>Guides</h2>
        {REGION_LIST.map((r) => (
          <ul key={r.region} className={`hr hr-${r.region}`}>
            {GUIDES.map((g) => (
              <li key={g.slug}>
                <Link href={`/${r.region}/guides/${g.slug}`} prefetch={false}>{fill(g.h1, r.inName)}</Link>
              </li>
            ))}
            <li>
              <Link href={`/${r.region}/deals`} prefetch={false}>Warhammer deals in {r.inName} today</Link>
            </li>
            <li>
              <Link href={`/${r.region}/stores`} prefetch={false}>Every store we compare in {r.inName}</Link>
            </li>
          </ul>
        ))}
        <h2>Questions</h2>
        {FAQ.map(([q, a]) => (
          <div key={q}>
            <h3>{q}</h3>
            <p>{a}</p>
          </div>
        ))}
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqLd(FAQ)) }} />
    </div>
  );
}
