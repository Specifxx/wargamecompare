import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EbayBox } from "@/components/EbayBox";
import { ProductCard } from "@/components/ProductCard";
import { offersFor, summariesFor, type Summary } from "@/lib/data";
import { cheapestOfType, fill, GUIDE_BY_SLUG, GUIDES, storeSavings, type GuideInfo } from "@/lib/guides";
import { regionOr404 } from "@/lib/page";
import { formatPrice, REGION_LIST, type RegionInfo } from "@/lib/regions";
import { jsonLd, ogFor, regionAlternates } from "@/lib/seo";
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
  return { title: { absolute: title }, description, alternates: regionAlternates(r.region, `/guides/${g.slug}`, REGION_LIST.map((x) => x.region)), openGraph: ogFor(`/${r.region}/guides/${g.slug}`, title, description) };
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

export default function GuidePage({ params }: { params: { region: string; slug: string } }) {
  const { r, g } = load(params);
  const all = summariesFor(r.region);
  const h1 = fill(g.h1, r.inName);
  const url = `${SITE_URL}/${r.region}/guides/${g.slug}`;
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: h1, description: fill(g.description, r.inName), url, mainEntityOfPage: url, publisher: { "@type": "Organization", name: "WargameCompare", url: SITE_URL } };
  return (
    <article className="page py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <p className="text-xs font-bold uppercase tracking-wide text-faint"><Link href={`/${r.region}/guides`} className="hover:text-brand">Guides</Link> · {r.name}</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">{h1}</h1>
      {g.slug === "cheapest-way-to-start" ? <Start r={r} all={all} /> : <Discounts r={r} all={all} />}
      <div className="mt-10">
        <EbayBox region={r.region} query={g.slug === "cheapest-way-to-start" ? "Warhammer Combat Patrol" : "Warhammer"} heading="On eBay" placement="guide-ebay" />
      </div>
      <p className="mt-8 text-sm text-faint">
        Other guides: {GUIDES.filter((x) => x.slug !== g.slug).map((x) => <Link key={x.slug} className="text-brand underline" href={`/${r.region}/guides/${x.slug}`}>{fill(x.h1, r.inName)}</Link>)}
      </p>
    </article>
  );
}
