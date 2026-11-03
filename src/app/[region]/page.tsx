import type { Metadata } from "next";
import { EbayStrip } from "@/components/EbayStrip";
import Link from "next/link";
import { ChristmasBanner } from "@/components/ChristmasBanner";
import { EbayBox } from "@/components/EbayBox";
import { ProductGrid } from "@/components/ProductCard";
import { CategoryTiles, HeroMosaic, categoryTiles, heroPicks } from "@/components/HomeVisuals";
import { HomeHero, SectionHead } from "@/components/HomeHero";
import { FACTIONS, SYSTEMS } from "@/lib/catalog";
import { mediansFor, meta, releasesFor, summariesFor } from "@/lib/data";
import { deals } from "@/lib/deals";
import { regionOr404 } from "@/lib/page";
import { REGION_LIST } from "@/lib/regions";
import { homeAlternates, ogFor } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { storesInMarket } from "@/lib/stores";
import { Flag } from "@/components/Flag";
import { RegionChips } from "@/components/RegionChips";
import { SiteReviews } from "@/components/site-reviews/SiteReviews";

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
  const hero = heroPicks(all, dealt);
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
    <div className="page py-8">
      <HomeHero
        eyebrow={<><Flag code={r.region} /> {r.name}</>}
        title={<>Warhammer prices in {r.inName}, compared across {stores.length} independent stores</>}
        lead={<>
          {all.length.toLocaleString("en")} products tracked, {inStock.toLocaleString("en")} in stock somewhere today. Every price is the store&rsquo;s own, in{" "}
          {r.currency}, cheapest first. {r.taxNote}
          {updated && <> Prices checked {new Date(updated).toUTCString().slice(5, 16)}.</>}
        </>}
      >
        <form action={`/${r.region}/search`} className="mx-auto mt-6 flex max-w-xl gap-2">
          <label htmlFor="home-q" className="sr-only">Search</label>
          <input id="home-q" name="q" type="search" placeholder="Combat Patrol, Intercessors, Contrast paint…" className="h-12 min-w-0 flex-1 rounded-full border border-line bg-surface px-5 text-base shadow-card" />
          <button className="btn-primary h-12 px-6">Search</button>
        </form>
        <RegionChips current={r.region} className="mt-5 justify-center" />
      </HomeHero>

      {hero.length > 0 && (
        <section className="sd mt-8" aria-label="Top savings today">
          <p className="mb-3 text-center text-sm font-semibold text-muted">Top savings today</p>
          <HeroMosaic items={hero} region={r.region} className="sm:grid-cols-6" />
        </section>
      )}

      {/* Christmas only (1 November to Boxing Day; hidden by CSS otherwise). */}
      <div className="mt-10">
        <ChristmasBanner
          title="Christmas gifts for the hobby"
          text={`Combat Patrols, starter sets and paints, matched across ${stores.length} stores in ${r.inName}, cheapest in stock first.`}
          href={`/${r.region}/deals`}
          cta="Today's biggest savings"
        />
      </div>

      {/* eBay first (owner, 2026-10-28): the strip sits above the page's first product grid. */}
      <div className="sd mt-10">
        <EbayStrip region={r.region} items={[...top, ...popular]} placement="ebay-strip-home" heading="Today's top kits on eBay" />
      </div>

      {top.length > 0 && (
        <section className="sd mt-12">
          <SectionHead title="Biggest savings today" sub="In stock now, furthest under RRP, every store's own price." href={`/${r.region}/deals`} all="All deals" />
          <ProductGrid items={top} region={r.region} />
        </section>
      )}

      {fresh.length > 0 && (
        <section className="sd mt-12">
          <SectionHead title={rel.preorders.length ? "New releases and pre-orders" : "Just arrived"} sub="What the stores have just listed, cheapest first." href={`/${r.region}/new-releases`} all="All new releases" />
          <ProductGrid items={fresh} region={r.region} />
        </section>
      )}

      {tiles.length > 0 && (
        <section className="sd mt-12">
          <SectionHead title="Shop by category" sub="Every game and every kind of box, each with its own cheapest-first list." />
          <CategoryTiles tiles={tiles} />
        </section>
      )}

      <section className="sd mt-12">
        <SectionHead title="Browse by game" />
        <div className="flex flex-wrap gap-2">
          {systems.map(({ s, n }) => (
            <Link key={s.slug} href={`/${r.region}/game/${s.slug}`} className="chip">
              {s.name} <span className="text-faint">{n}</span>
            </Link>
          ))}
        </div>
      </section>

      {factions.length > 0 && (
        <section className="sd mt-10">
          <SectionHead title="Popular armies" />
          <div className="flex flex-wrap gap-2">
            {factions.map(({ f, n }) => (
              <Link key={f.slug} href={`/${r.region}/faction/${f.slug}`} className="chip">
                {f.name} <span className="text-faint">{n}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {popular.length > 0 && (
        <section className="sd mt-12">
          <SectionHead title="Stocked by the most stores" sub="The kits you can buy almost anywhere, so the comparison matters most." />
          <ProductGrid items={popular} region={r.region} />
        </section>
      )}

      <div className="sd mt-12">
        <EbayBox region={r.region} query="Warhammer" heading={`Warhammer on eBay ${r.region === "nz" ? "Australia" : r.short}`} placement="home-ebay" />
      </div>

      {/* The site's own star score and approved reviews (owner, 2026-11-03), loaded in the browser; nothing until there is a rating. */}
      <SiteReviews className="mt-12" />

      <section className="prose-wg mt-12 max-w-3xl">
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
  );
}
