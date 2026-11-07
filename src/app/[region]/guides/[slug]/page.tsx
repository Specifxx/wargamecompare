import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EbayBox } from "@/components/EbayBox";
import { ProductCard } from "@/components/ProductCard";
import { offersFor, summariesFor, type Summary } from "@/lib/data";
import { cheapestOfType, fill, GUIDE_BY_SLUG, GUIDES, mostStockedOfType, storeSavings, type GuideInfo } from "@/lib/guides";
import { regionOr404 } from "@/lib/page";
import { formatPrice, REGION_LIST, type RegionInfo } from "@/lib/regions";
import { breadcrumbLd, jsonLd, ogFor, regionAlternates } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { STORE_BY_KEY } from "@/lib/stores";

export const dynamic = "force-dynamic";

function load(params: { region: string; slug: string }): { r: RegionInfo; g: GuideInfo } {
  const r = regionOr404(params.region);
  const g = GUIDE_BY_SLUG.get(params.slug);
  if (!g) notFound();
  return { r, g };
}

export function generateMetadata({ params }: { params: { region: string; slug: string } }): Metadata {
  const { r, g } = load(params);
  const title = fill(g.title, r.inName);
  const description = fill(g.description, r.inName);
  return { title: { absolute: title }, description, alternates: regionAlternates(r.region, `/guides/${g.slug}`, REGION_LIST.map((x) => x.region)), openGraph: ogFor(`/${r.region}/guides/${g.slug}`, title, description, g.image) };
}

const Grid = ({ items, r }: { items: Summary[]; r: RegionInfo }) =>
  items.length ? (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((s) => <ProductCard key={s.product.id} s={s} region={r.region} />)}
    </div>
  ) : (
    <p className="mt-3 text-muted">None in stock at two or more stores today.</p>
  );

const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="mt-10 font-display text-2xl font-extrabold">{children}</h2>;
const P = ({ children }: { children: React.ReactNode }) => <p className="mt-3 max-w-3xl leading-relaxed text-muted">{children}</p>;

function Start({ r, all }: { r: RegionInfo; all: Summary[] }) {
  const starters40k = cheapestOfType(all, "starter-sets", 4, "warhammer-40k", 3);
  const startersAos = cheapestOfType(all, "starter-sets", 4, "age-of-sigmar", 3);
  const patrols = cheapestOfType(all, "combat-patrols", 8, "warhammer-40k");
  const spearheads = cheapestOfType(all, "combat-patrols", 8, "age-of-sigmar");
  const paints = cheapestOfType(all, "paint-sets", 4);
  const cheapest = [...patrols, ...spearheads].sort((a, b) => a.best! - b.best!)[0];
  const p = (s: Summary | undefined) => (s?.best != null ? formatPrice(s.best, r.region) : null);
  return (
    <>
      <P>
        Warhammer is cheaper to start than its reputation, if you buy the right first box. You need three things: models, the rules to play them, and paint.
        Here is the cheapest way to get all three in {r.inName}, priced at the independent stores we compare this morning
        {cheapest ? <> (the cheapest Combat Patrol or Spearhead in stock today is {p(cheapest)})</> : null}. Prices are in {r.currency}. {r.taxNote}
      </P>
      <H2>1. A starter set if you have someone to play with</H2>
      <P>
        A starter set holds two small armies, the core rules and a battle map, so two people can play from one box. It is the best value per model in the range, and
        many stores sell it under RRP. The cheapest in stock today:
      </P>
      <h3 className="mt-6 font-display text-lg font-bold">Warhammer 40,000</h3>
      <Grid items={starters40k} r={r} />
      <h3 className="mt-6 font-display text-lg font-bold">Age of Sigmar</h3>
      <Grid items={startersAos} r={r} />
      <H2>2. A Combat Patrol or Spearhead if you know your army</H2>
      <P>
        Combat Patrol (40K) and Spearhead (Age of Sigmar) boxes are one faction&rsquo;s ready-to-play force, with its own small-game rules. Pick the army you like the
        look of: you will paint every model. The cheapest Combat Patrols in stock today:
      </P>
      <Grid items={patrols} r={r} />
      <P>And the cheapest Spearheads:</P>
      <Grid items={spearheads} r={r} />
      <P>
        Every Combat Patrol and Spearhead we compare is on <Link className="text-brand underline" href={`/${r.region}/type/combat-patrols`}>one page</Link>, cheapest first.
      </P>
      <H2>3. A paint set</H2>
      <P>A paint set with a brush covers your first army. Add a primer spray when you can; it makes paint go on far more evenly.</P>
      <Grid items={paints} r={r} />
      <H2>How to spend less</H2>
      <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-muted">
        <li>Buy from an independent store: most sell under RRP. See <Link className="text-brand underline" href={`/${r.region}/guides/discount-stores-vs-rrp`}>how much each store saves</Link>.</li>
        <li>Skip the codex or battletome at first: the box rules are enough to learn on.</li>
        <li>Check <Link className="text-brand underline" href={`/${r.region}/deals`}>today&rsquo;s deals</Link> before buying: a starter set or patrol is often among them.</li>
        <li>Add the store&rsquo;s shipping before comparing: our prices are item prices.</li>
      </ul>
    </>
  );
}

function Discounts({ r, all }: { r: RegionInfo; all: Summary[] }) {
  const rows = storeSavings(all, (id) => offersFor(id, r.region));
  const withRrp = all.filter((s) => s.rrp && s.best != null && s.stores >= 2);
  const offs = withRrp.map((s) => (s.rrp! - s.best!) / s.rrp!).sort((a, b) => a - b);
  const typical = offs.length ? offs[Math.floor(offs.length / 2)] : null;
  const biggest = withRrp.filter((s) => s.off != null).sort((a, b) => b.off! - a.off!).slice(0, 8);
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  return (
    <>
      <P>
        Games Workshop sets an RRP; independent stores are free to sell under it, and most do. But how much under varies a lot by store. We checked every in-stock
        price at the stores we compare in {r.inName} against the RRP that two or more stores state for the same product.
        {typical != null ? <> Across {withRrp.length.toLocaleString(r.locale)} products sold by two or more stores, the cheapest store is typically <strong>{pct(typical)} under RRP</strong> today.</> : null}
      </P>
      <H2>Every store against RRP</H2>
      <P>A store&rsquo;s typical saving is the median across every in-stock product it lists that has a stated RRP. Stores with fewer than 20 such products are left out.</P>
      {rows.length ? (
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-faint">
                <th className="px-3 py-2">Store</th>
                <th className="px-3 py-2 text-right">Typical saving</th>
                <th className="px-3 py-2 text-right">Under RRP</th>
                <th className="px-3 py-2 text-right">Products compared</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((x) => (
                <tr key={x.store} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 font-semibold"><Link href={`/${r.region}/stores/${x.store}`} className="hover:text-brand">{STORE_BY_KEY.get(x.store)?.name ?? x.store}</Link></td>
                  <td className="tabular px-3 py-2 text-right font-bold">{x.typical > 0 ? `${pct(x.typical)} off` : x.typical < 0 ? `${pct(-x.typical)} over` : "at RRP"}</td>
                  <td className="tabular px-3 py-2 text-right">{pct(x.under)}</td>
                  <td className="tabular px-3 py-2 text-right">{x.compared}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <P>Not enough stated RRPs in {r.inName} today to compare stores.</P>
      )}
      <H2>The biggest savings on RRP today</H2>
      <Grid items={biggest} r={r} />
      <P>
        All of today&rsquo;s savings of 10% or more are on <Link className="text-brand underline" href={`/${r.region}/deals`}>the deals page</Link>, and every store is
        on <Link className="text-brand underline" href={`/${r.region}/stores`}>stores we compare</Link>.
      </P>
      <H2>Read the saving with shipping</H2>
      <P>
        A bigger discount can still cost more once shipping is added, and stores set their free-shipping thresholds differently. Prices here are item prices; check the
        store&rsquo;s shipping at checkout, and on a big order look for a free-shipping threshold. {r.taxNote}
      </P>
    </>
  );
}

/** The cheapest in-stock store against the RRP two or more stores state, across a region's products. */
function discountGap(all: Summary[]) {
  const offs = all.filter((s) => s.rrp && s.best != null && s.stores >= 2).map((s) => (s.rrp! - s.best!) / s.rrp!).sort((a, b) => a - b);
  if (offs.length < 50) return null;
  return { n: offs.length, typical: offs[Math.floor(offs.length / 2)], top: offs[Math.floor(offs.length * 0.9)], under: offs.filter((x) => x > 0.005).length / offs.length, deep: offs.filter((x) => x >= 0.2).length / offs.length };
}

function Trajectory({ r, all }: { r: RegionInfo; all: Summary[] }) {
  const gap = discountGap(all);
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  const stores = storeSavings(all, (id) => offersFor(id, r.region));
  const others = REGION_LIST.filter((x) => x.region !== r.region).map((x) => ({ r: x, gap: discountGap(summariesFor(x.region)) })).filter((x) => x.gap);
  const biggest = all.filter((s) => s.off != null && s.stores >= 2).sort((a, b) => b.off! - a.off!).slice(0, 4);
  return (
    <>
      <P>
        Games Workshop has raised its prices every year since 2022, and the independent stores that sell under its RRP have, so far, kept discounting at about the
        same rate. That gap is the whole reason this site exists, so this guide looks at both sides of it for {r.inName}: what GW has done, what the stores we
        compare are doing this morning, how that compares with the other countries we cover, and where we think it goes from here. Prices are in {r.currency}. {r.taxNote}
      </P>
      <H2>Four years of rises, and a change of season</H2>
      <P>
        GW announces one price rise a year. From 2022 to 2024 it landed in spring: around 5% on core plastic kits and more on books, resin and scenery in March 2022;
        about 6% on kits, brushes and sprays in March 2023; an average of 3% to 5% from May and June 2024, with 8% to 14% in Sweden and Norway. In 2025 the pattern
        changed: the rise was announced on 30 August and took effect on 6 October, at about 4% on the products it touched, and GW&rsquo;s half-year report to November
        2025 later put the year&rsquo;s rises on miniatures and books at about 3.5% and named roughly US$8 million of new US tariff costs as the largest drag on its
        margin. Nothing has been announced for 2026 as we write this. Our read is that the rise has moved to autumn for good, because an October rise sits between the
        summer launches and the Christmas quarter, and that the next one lands in the same window in 2026 or early 2027, at a similar size unless tariffs move again.
      </P>
      <H2>What the stores are doing in {r.inName} today</H2>
      {gap ? (
        <P>
          Across {gap.n.toLocaleString(r.locale)} products that two or more of the stores we compare list in stock with a stated RRP, the cheapest store is
          typically <strong>{pct(gap.typical)} under RRP</strong>. {pct(gap.under)} of those products can be had under RRP somewhere, {pct(gap.deep)} at 20% off or
          more, and the best tenth of savings run to {pct(gap.top)} or better. {stores.length ? <>The deepest typical discounter in {r.inName} today is{" "}
          <Link href={`/${r.region}/stores/${stores[0].store}`} className="text-brand underline">{STORE_BY_KEY.get(stores[0].store)?.name ?? stores[0].store}</Link> at {pct(stores[0].typical)} off across {stores[0].compared} products; every store is ranked in{" "}
          <Link href={`/${r.region}/guides/discount-stores-vs-rrp`} className="text-brand underline">store savings vs RRP</Link>.</> : null}
        </P>
      ) : (
        <P>Too few stores in {r.inName} state an RRP today for a fair measure of the discount; the <Link href={`/${r.region}/deals`} className="text-brand underline">deals page</Link> lists what is under the median of the stores we compare.</P>
      )}
      <P>
        The pattern inside those numbers has held since we started comparing: a core of long-established discounters sells almost everything at a fixed percentage
        under RRP, new releases sit at the smallest discount in their first weeks, and the deepest cuts are on last year&rsquo;s boxes, army sets and paint. Stores
        do not race each other down. The typical discount is a store policy, not a sale, which is why it survives each GW rise intact: when the RRP goes up 4%, so
        does the discounted price.
      </P>
      <H2>How {r.inName} compares</H2>
      {others.length ? (
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-faint">
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2 text-right">Typical saving under RRP</th>
                <th className="px-3 py-2 text-right">Products 20%+ off</th>
                <th className="px-3 py-2 text-right">Products compared</th>
              </tr>
            </thead>
            <tbody>
              {[{ r, gap }, ...others].filter((x) => x.gap).map((x) => (
                <tr key={x.r.region} className={`border-b border-line last:border-0 ${x.r.region === r.region ? "font-semibold" : ""}`}>
                  <td className="px-3 py-2"><Link href={`/${x.r.region}/guides/warhammer-prices-where-they-are-heading`} className="hover:text-brand">{x.r.name}</Link></td>
                  <td className="tabular px-3 py-2 text-right">{pct(x.gap!.typical)}</td>
                  <td className="tabular px-3 py-2 text-right">{pct(x.gap!.deep)}</td>
                  <td className="tabular px-3 py-2 text-right">{x.gap!.n.toLocaleString(r.locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <P>
        Each country is measured in its own currency against its own RRP, so this is a comparison of discount depth, not of price. The UK and Australia have run the
        deepest typical discounts since we began, because both have a long-established independent trade that competes on a fixed percentage off; North America has
        more stores but a smaller typical cut, and New Zealand has too few stores stating an RRP for the measure to mean much.
      </P>
      <H2>The biggest savings on RRP today</H2>
      <Grid items={biggest} r={r} />
      <H2>Where we think it goes</H2>
      <P>
        Three things to expect. First, another rise of about 4%, most likely announced in late summer and landing in autumn, with weeks of notice; the stores&rsquo;
        prices move the same day, so the only way to buy at the old price is before it. Second, the discount gap holds: nothing in four years of rises has narrowed
        it, and tariff costs fall on GW&rsquo;s own US prices, not on what an independent store chooses to take off them. Third, the sales calendar matters more than
        the rise. Black Friday, Boxing Day and the January sales are when the stores that normally sit at 10% off go to 20% or more, and those are a bigger swing than
        any annual rise. The <Link href={`/${r.region}/black-friday`} className="text-brand underline">Black Friday page</Link> and{" "}
        <Link href={`/${r.region}/deals`} className="text-brand underline">deals page</Link> show what is actually under RRP each morning, never a sale we invented.
      </P>
    </>
  );
}

function Gifts({ r, all }: { r: RegionInfo; all: Summary[] }) {
  const paints = cheapestOfType(all, "paint-sets", 4);
  const tools = mostStockedOfType(all, "tools", 4);
  const kits = mostStockedOfType(all, "miniatures", 8, 4);
  const patrols = [...cheapestOfType(all, "combat-patrols", 8, "warhammer-40k"), ...cheapestOfType(all, "combat-patrols", 8, "age-of-sigmar")].sort((a, b) => a.best! - b.best!).slice(0, 8);
  const starters = [...cheapestOfType(all, "starter-sets", 4, "warhammer-40k", 2), ...cheapestOfType(all, "starter-sets", 4, "age-of-sigmar", 2)].sort((a, b) => a.best! - b.best!).slice(0, 4);
  const armies = cheapestOfType(all, "army-sets", 4);
  const books = mostStockedOfType(all, "books", 4);
  const p = (s: Summary | undefined) => (s?.best != null ? formatPrice(s.best, r.region) : null);
  const deals = all.filter((s) => s.off != null && s.off >= 0.15 && s.stores >= 2).sort((a, b) => b.off! - a.off!).slice(0, 8);
  return (
    <>
      <P>
        The problem with buying for a Warhammer player is that they already have a plan: an army, a faction, a half-painted project on the desk. The safe gifts are
        the ones every army uses (paint, tools, a book), the popular kits of their own army, or a whole new box that starts something. Everything below is in stock
        at the independent stores we compare in {r.inName} this morning, at the cheapest store&rsquo;s price, which is almost always under Games Workshop&rsquo;s RRP
        {patrols[0] ? <> (the cheapest Combat Patrol or Spearhead today is {p(patrols[0])})</> : null}. Prices are in {r.currency}. {r.taxNote}
      </P>
      <H2>Stocking fillers: paint sets, tools and books</H2>
      <P>
        A paint set is the one gift no player returns: every army needs more of it. The sets below bundle a brush with the colours; a single pot or a primer spray
        is cheaper still, and every paint we compare is on <Link className="text-brand underline" href={`/${r.region}/type/paints`}>the paints page</Link>.
      </P>
      <Grid items={paints} r={r} />
      <P>Tools and hobby supplies the most stores stock, which is the best sign that players actually buy them:</P>
      <Grid items={tools} r={r} />
      <P>The books stocked by the most stores today, for a reader who already has every model they can fit on the shelf:</P>
      <Grid items={books} r={r} />
      <H2>A kit for their own army</H2>
      <P>
        If you know which army they play, one box of it is the gift that gets used first. These are the kits the most stores in {r.inName} have in stock today,
        a fair proxy for what players are buying this season; filter by system on <Link className="text-brand underline" href={`/${r.region}/type/miniatures`}>the kits page</Link>
        to find their faction.
      </P>
      <Grid items={kits} r={r} />
      <H2>A whole army in one box: Combat Patrols and Spearheads</H2>
      <P>
        Combat Patrol (Warhammer 40,000) and Spearhead (Age of Sigmar) boxes hold one faction&rsquo;s ready-to-play force with its own small-game rules, and they
        are the best value per model short of a starter set. For someone starting out, pick the faction they like the look of; for an existing player, their own
        faction&rsquo;s box is usually still worth having. The cheapest in stock today:
      </P>
      <Grid items={patrols} r={r} />
      <H2>The big present: a starter set or an army set</H2>
      <P>
        A starter set holds two small armies, the rules and a battle map, so two people can play from one box: the right gift for someone who has never played,
        or for a parent and child. Army sets are a single faction&rsquo;s launch box, usually with models not yet sold separately, and they sell out, so a listed
        one in stock is worth taking.
      </P>
      <Grid items={starters} r={r} />
      <Grid items={armies} r={r} />
      <H2>Today&rsquo;s biggest savings, if you are flexible</H2>
      <P>
        If the budget matters more than the box, these are the products furthest under RRP at a store in {r.inName} this morning. The full list is on{" "}
        <Link className="text-brand underline" href={`/${r.region}/deals`}>the deals page</Link>, and <Link className="text-brand underline" href={`/${r.region}/black-friday`}>Black Friday</Link> is
        when the stores that normally sit at 10% off go deeper.
      </P>
      <Grid items={deals} r={r} />
      <H2>Before you order a gift</H2>
      <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-muted">
        <li>Check the store&rsquo;s last order date for delivery before the 25th; it is usually on the shipping page, and it moves earlier every week of December.</li>
        <li>Add shipping before comparing: our prices are item prices, and free-shipping thresholds differ by store. See <Link className="text-brand underline" href={`/${r.region}/guides/discount-stores-vs-rrp`}>how much each store saves</Link>.</li>
        <li>Buy the box, not the codex: the rules in a Combat Patrol, Spearhead or starter set are enough to learn on, and the army book they want changes with each edition.</li>
        <li>When in doubt, a store gift card from the shop they already use keeps the discount: most independents sell under RRP, so the card buys more than it would at GW.</li>
      </ul>
    </>
  );
}

/** Black Friday 2026 (2026-11-07): each store's typical saving under RRP today, the cheapest starter boxes, and the checks. */
function BlackFriday({ r, all }: { r: RegionInfo; all: Summary[] }) {
  const rows = storeSavings(all, (id) => offersFor(id, r.region)).slice(0, 10);
  const withRrp = all.filter((s) => s.rrp && s.best != null && s.stores >= 2);
  const offs = withRrp.map((s) => (s.rrp! - s.best!) / s.rrp!).sort((a, b) => a - b);
  const typical = offs.length ? offs[Math.floor(offs.length / 2)] : null;
  const patrols = [...cheapestOfType(all, "combat-patrols", 6, "warhammer-40k"), ...cheapestOfType(all, "combat-patrols", 6, "age-of-sigmar")].sort((a, b) => a.best! - b.best!).slice(0, 8);
  const starters = [...cheapestOfType(all, "starter-sets", 4, "warhammer-40k", 2), ...cheapestOfType(all, "starter-sets", 4, "age-of-sigmar", 2)].sort((a, b) => a.best! - b.best!).slice(0, 4);
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  return (
    <>
      <P>
        Black Friday is Friday 27 November 2026 and Cyber Monday is Monday 30 November. Independent Warhammer stores already sell under Games Workshop&rsquo;s RRP
        every day of the year
        {typical != null ? <>: across {withRrp.length.toLocaleString(r.locale)} products sold by two or more stores in {r.inName}, the cheapest store is typically <strong>{pct(typical)} under RRP</strong> today</> : null}.
        So a &ldquo;Black Friday 20% off&rdquo; is only a deal if it beats what the cheapest store charges on an ordinary day. This guide is today&rsquo;s prices to
        read a Black Friday price against. Prices are in {r.currency}. {r.taxNote}
      </P>
      <P>
        The deals themselves are on <Link className="text-brand underline" href={`/${r.region}/black-friday`}>Warhammer Black Friday deals</Link>, rebuilt every day
        through the week, and <Link className="text-brand underline" href={`/${r.region}/cyber-monday`}>Cyber Monday deals</Link> does the same for the Monday.
      </P>
      <H2>Where each store already sits against RRP</H2>
      <P>
        A store&rsquo;s typical saving is the median across every in-stock product it lists with a stated RRP (stores with fewer than 20 such products are left out). A code
        on top of a store that is already well under RRP goes further than the same code at a store that sells at RRP.
      </P>
      {rows.length ? (
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-faint">
                <th className="px-3 py-2">Store</th>
                <th className="px-3 py-2 text-right">Typical saving today</th>
                <th className="px-3 py-2 text-right">Products compared</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((x) => (
                <tr key={x.store} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 font-semibold"><Link href={`/${r.region}/stores/${x.store}`} className="hover:text-brand">{STORE_BY_KEY.get(x.store)?.name ?? x.store}</Link></td>
                  <td className="tabular px-3 py-2 text-right font-bold">{x.typical > 0 ? `${pct(x.typical)} off` : x.typical < 0 ? `${pct(-x.typical)} over` : "at RRP"}</td>
                  <td className="tabular px-3 py-2 text-right">{x.compared}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <P>Not enough stated RRPs in {r.inName} today to compare stores.</P>
      )}
      <H2>The prices to beat: Combat Patrols and Spearheads</H2>
      <P>The cheapest whole-army boxes in stock at two or more stores in {r.inName} today:</P>
      <Grid items={patrols} r={r} />
      <H2>Starter sets</H2>
      <Grid items={starters} r={r} />
      <H2>Five checks before you pay</H2>
      <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-muted">
        <li>Compare with the cheapest store today, not with the RRP or a struck-through price: the RRP is a price most independents never charge.</li>
        <li>Add the shipping. A bigger discount can cost more once shipping is added, and free-shipping thresholds differ by store.</li>
        <li>Check it is in stock. A low price on a pre-order or a backorder ships later, or not at all.</li>
        <li>Read the code&rsquo;s terms: stores often leave new releases and pre-orders out of site-wide codes.</li>
        <li>For gifts, check the store&rsquo;s last order date for delivery before the 25th. Our <Link className="text-brand underline" href={`/${r.region}/guides/warhammer-gift-guide`}>gift guide</Link> has ideas at every budget.</li>
      </ul>
    </>
  );
}

export default function GuidePage({ params }: { params: { region: string; slug: string } }) {
  const { r, g } = load(params);
  const all = summariesFor(r.region);
  const h1 = fill(g.h1, r.inName);
  const url = `${SITE_URL}/${r.region}/guides/${g.slug}`;
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: h1, description: fill(g.description, r.inName), url, mainEntityOfPage: url, publisher: { "@type": "Organization", name: "WargameCompare", url: SITE_URL } };
  return (
    <article className="page py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd([{ name: r.name, path: `/${r.region}` }, { name: "Guides", path: `/${r.region}/guides` }, { name: h1, path: `/${r.region}/guides/${g.slug}` }])) }} />
      <p className="text-xs font-bold uppercase tracking-wide text-faint"><Link href={`/${r.region}/guides`} className="hover:text-brand">Guides</Link> · {r.name}</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">{h1}</h1>
      {g.slug === "warhammer-black-friday-2026" ? <BlackFriday r={r} all={all} /> : g.slug === "cheapest-way-to-start" ? <Start r={r} all={all} /> : g.slug === "discount-stores-vs-rrp" ? <Discounts r={r} all={all} /> : g.slug === "warhammer-gift-guide" ? <Gifts r={r} all={all} /> : <Trajectory r={r} all={all} />}
      <div className="mt-10">
        <EbayBox region={r.region} query={g.slug === "cheapest-way-to-start" ? "Warhammer Combat Patrol" : "Warhammer"} heading="On eBay" placement="guide-ebay" />
      </div>
      <p className="mt-8 text-sm text-faint">
        Other guides: {GUIDES.filter((x) => x.slug !== g.slug).map((x) => <Link key={x.slug} className="text-brand underline" href={`/${r.region}/guides/${x.slug}`}>{fill(x.h1, r.inName)}</Link>)}
      </p>
    </article>
  );
}
