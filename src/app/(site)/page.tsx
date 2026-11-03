import type { Metadata } from "next";
import Link from "next/link";
import { ChristmasBanner } from "@/components/ChristmasBanner";
import { CreatorsTeaser } from "@/components/creators/CreatorsTeaser";
import { RegionSuggest } from "@/components/RegionSuggest";
import { mediansFor, summariesFor } from "@/lib/data";
import { deals } from "@/lib/deals";
import { CategoryTiles, HeroMosaic, categoryTiles, heroPicks } from "@/components/HomeVisuals";
import { ProductGrid } from "@/components/ProductCard";
import { productIndexable } from "@/lib/index-tiers";
import { REGION_LIST, REGIONS } from "@/lib/regions";
import { ogFor } from "@/lib/seo";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { storesInMarket } from "@/lib/stores";
import { Flag } from "@/components/Flag";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME}: compare Warhammer prices across discount stores` },
  description: SITE_TAGLINE,
  alternates: { canonical: SITE_URL },
  openGraph: ogFor("/", SITE_NAME, SITE_TAGLINE),
};

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
    <div className="page py-8 sm:py-12">
      {/* Phone: headline, then the photos, then the rest. From lg the photos sit in a column of their own beside the text. */}
      <section className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-x-12 lg:gap-y-0">
        <div className="lg:col-start-1 lg:row-start-1">
          <p className="eyebrow">Stop paying full price for plastic</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">Compare Warhammer prices across the discount stores</h1>
        </div>
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          {blocks.map(({ r, hero }) =>
            hero.length ? (
              <div key={r.region} className={`hr hr-${r.region}`}>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted">
                  <Flag code={r.region} /> Top savings in {r.inName} today
                </p>
                <HeroMosaic items={hero} region={r.region} />
              </div>
            ) : null,
          )}
        </div>
        <div className="lg:col-start-1 lg:row-start-2">
          <p className="max-w-2xl text-lg text-muted lg:mt-4">
            Warhammer 40,000, Age of Sigmar, Kill Team, The Horus Heresy, The Old World and Citadel paints: every kit matched by its box code across independent
            stores, cheapest in stock first, with the saving on RRP. Free, and no account needed.
          </p>
          <RegionSuggest />
        </div>
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

      <section className="mt-12">
        <h2 className="mb-4 font-display text-2xl font-bold">Shop by category</h2>
        {blocks.map(({ r, tiles }) => (
          <div key={r.region} className={`hr hr-${r.region}`}>
            <CategoryTiles tiles={tiles} />
          </div>
        ))}
      </section>

      {/* Real prices and product links in the landing page's server HTML, every region's (crawl-audit-sites, 2026-10-30). */}
      <section className="mt-12">
        {blocks.map(({ r, savings }) =>
          savings.length ? (
            <div key={r.region} className={`hr hr-${r.region}`}>
              <div className="mb-4 flex items-end justify-between gap-4">
                <h2 className="font-display text-2xl font-bold">Biggest savings in {r.inName} today</h2>
                <Link href={`/${r.region}/deals`} prefetch={false} className="shrink-0 text-sm font-semibold text-brand">
                  All deals →
                </Link>
              </div>
              <ProductGrid items={savings} region={r.region} />
            </div>
          ) : null,
        )}
      </section>

      <CreatorsTeaser />

      <section className="mt-12">
        <h2 className="mb-4 font-display text-2xl font-bold">Prices in your country</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {REGION_LIST.map((r) => {
            const n = storesInMarket(r.market).length;
            const products = summariesFor(r.region).filter((s) => s.inStock > 0).length;
            return (
              <Link key={r.region} href={`/${r.region}`} prefetch={false} data-region-pick={r.region} className="card p-5 transition-shadow hover:shadow-lift">
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
      </section>
    </div>
  );
}
