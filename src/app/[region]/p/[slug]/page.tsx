import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { OutboundLink } from "@/components/OutboundLink";
import { PriceList, PriceListNote } from "@/components/PriceList";
import { ReportPrice } from "@/components/ReportForms";
import { PriceAlertForm } from "@/components/PriceAlertForm";
import { ALERT_SITE_KEY } from "@/lib/alert-feed";
import { ProductGrid } from "@/components/ProductCard";
import { Section } from "@/components/Section";
import { StickyBuyBar } from "@/components/StickyBuyBar";
import { PaidAlt } from "@/components/PaidAlt";
import { StockPill } from "@/components/StockPill";
import { StoreCode } from "@/components/StoreCode";
import {
  AMAZON_DISCLOSURE,
  amazonLabel,
  amazonSearchUrl,
  EBAY_DISCLOSURE,
  ebayAffiliateUrl,
  ebayLabel,
  ebaySearchUrl,
  REL_PAID,
  storeRel,
  storeUrl,
} from "@/lib/affiliate";
import { FACTION_BY_SLUG, SYSTEM_BY_SLUG, TYPE_BY_SLUG } from "@/lib/catalog";
import { culledType, ebayFor, meta, offersFor, product, regionsListing, rrpFor, summariesFor, summaryOf } from "@/lib/data";
import { thumb } from "@/lib/images";
import { detailIndexed, productIndexable } from "@/lib/index-tiers";
import { paidAlternativeFor, priceRows } from "@/lib/price-rows";
import { regionOr404 } from "@/lib/page";
import { formatPrice, REGIONS, type Region } from "@/lib/regions";
import { jsonLd, ogFor, regionAlternates } from "@/lib/seo";
import { STORE_BY_KEY } from "@/lib/stores";
import { activeStoreCode, dealForHost } from "@/lib/store-partner-deals";
import { SITE_URL } from "@/lib/site";
import { productShareText } from "@/lib/share-link";
import { ShareButton } from "@/components/ShareButton";
import { Flag } from "@/components/Flag";

export const dynamic = "force-dynamic";

function load(params: { region: string; slug: string }) {
  const r = regionOr404(params.region);
  const p = product(params.slug);
  if (!p) {
    // Culled by the low-traction rule (lib/focus.ts): its type page lists what is left.
    const type = culledType(params.slug);
    if (type) permanentRedirect(`/${r.region}/type/${type}`);
    notFound();
  }
  return { r, p, s: summaryOf(p.id, r.region) };
}

export function generateMetadata({ params }: { params: { region: string; slug: string } }): Metadata {
  const { r, p, s } = load(params);
  const listed = regionsListing(p.id);
  // New Zealand product pages are noindex whatever their stock (INDEXED_DETAIL_REGIONS, 2026-11-08).
  const indexable = detailIndexed(r.region) && productIndexable(s);
  const n = s?.stores ?? 0;
  const title = s?.best != null ? `${p.name}: ${formatPrice(s.best, r.region)} at ${n} ${n === 1 ? "store" : "stores"} in ${r.inName}` : `${p.name} price in ${r.inName}`;
  const description = s
    ? `Compare ${p.name} prices in ${r.inName}: ${s.inStock} of ${n} stores have it in stock${s.best != null ? `, from ${formatPrice(s.best, r.region)}` : ""}${s.rrp ? ` (RRP ${formatPrice(s.rrp, r.region)})` : ""}. Prices checked daily.`
    : `${p.name}: not listed by the stores we compare in ${r.inName} today. See other countries and eBay.`;
  return {
    title: { absolute: title.slice(0, 70) },
    description,
    // hreflang only between indexable copies; a noindex page advertises none (SEO audit, 2026-11-07).
    alternates: indexable ? regionAlternates(r.region, `/p/${p.id}`, listed.filter((x) => detailIndexed(x) && productIndexable(summaryOf(p.id, x)))) : { canonical: `${SITE_URL}/${r.region}/p/${p.id}` },
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: { ...ogFor(`/${r.region}/p/${p.id}`, title, description), ...(p.image ? { images: [{ url: p.image }] } : {}) },
  };
}

export default function ProductPage({ params }: { params: { region: string; slug: string } }) {
  const { r, p, s } = load(params);
  const region = r.region;
  const offers = offersFor(p.id, region);
  const rrp = rrpFor(p.id, region);
  const best = offers.find((o) => o.in) ?? null;
  const ebay = ebayFor(p.id, region);
  const amazon = amazonSearchUrl(p.name, region, "product-amazon");
  const system = p.system ? SYSTEM_BY_SLUG.get(p.system) : null;
  const faction = p.faction ? FACTION_BY_SLUG.get(p.faction) : null;
  const type = TYPE_BY_SLUG.get(p.type);
  const others = (Object.keys(REGIONS) as Region[]).filter((x) => x !== region).map((x) => ({ x, s: summaryOf(p.id, x) })).filter((o) => o.s);
  const related = summariesFor(region)
    .filter((x) => x.product.id !== p.id && x.inStock > 0 && (faction ? x.product.faction === faction.slug : x.product.system === p.system))
    .slice(0, 8);
  const updated = meta().updatedAt;
  const storeName = (k: string) => STORE_BY_KEY.get(k)?.name ?? k;
  const photoStore = offers.find((o) => o.u && p.image)?.s;
  const ebayCurrencyRegion: Region = region === "nz" ? "au" : region;
  const rows = priceRows(p, region, "product");
  const bestHref = best ? storeUrl(best.u, dealForHost(new URL(best.u).hostname)?.ref, { checkout: best.in }) : null;
  const inStock = offers.filter((o) => o.in).length;
  const ld =
    productIndexable(s) && offers.some((o) => o.in)
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          ...(p.image ? { image: p.image } : {}),
          ...(p.ean ? { gtin13: p.ean } : {}),
          ...(p.code ? { mpn: p.code } : {}),
          brand: { "@type": "Brand", name: "Games Workshop" },
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: r.currency,
            lowPrice: (Math.min(...offers.filter((o) => o.in).map((o) => o.p)) / 100).toFixed(2),
            highPrice: (Math.max(...offers.filter((o) => o.in).map((o) => o.p)) / 100).toFixed(2),
            offerCount: offers.filter((o) => o.in).length,
            availability: "https://schema.org/InStock",
            // Prices refresh on the daily import: good until tomorrow (schema.org priceValidUntil).
            priceValidUntil: new Date(Date.now() + 86400e3).toISOString().slice(0, 10),
            url: `${SITE_URL}/${region}/p/${p.id}`,
          },
        }
      : null;

  return (
    <div className={`page py-6 sm:py-8 ${best ? "pb-24 lg:pb-8" : ""}`}>
      {/* The same crumbs as before the port (the region, the game, the army, the product), drawn by the engine's component. */}
      <Breadcrumbs
        items={[
          { path: `/${region}`, label: r.short },
          ...(system ? [{ path: `/${region}/game/${system.slug}`, label: system.short }] : []),
          ...(faction ? [{ path: `/${region}/faction/${faction.slug}`, label: faction.name }] : []),
          { path: `/${region}/p/${p.id}`, label: p.name },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
        <div>
          <div className="plate relative mx-auto aspect-square max-w-md">
            {p.image ? (
              <img src={thumb(p.image, 800) ?? undefined} alt={p.name} width={800} height={800} className="absolute inset-0 h-full w-full object-contain p-4 mix-blend-multiply" fetchPriority="high" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-sold">No photo</div>
            )}
          </div>
          {p.image && photoStore && <p className="mt-2 text-center text-xs text-faint">Photo: {storeName(photoStore)}</p>}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 text-xs">
            {system && (
              <Link href={`/${region}/game/${system.slug}`} className="chip py-1 text-xs">
                {system.name}
              </Link>
            )}
            {faction && (
              <Link href={`/${region}/faction/${faction.slug}`} className="chip py-1 text-xs">
                {faction.name}
              </Link>
            )}
            {type && (
              <Link href={`/${region}/type/${type.slug}`} className="chip py-1 text-xs">
                {type.name}
              </Link>
            )}
            {p.code && <span className="chip py-1 text-xs">Box code {p.code}</span>}
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight sm:text-4xl">{p.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StockPill state={best ? "open" : "soldout"}>{best ? `In stock at ${inStock} of ${offers.length} ${offers.length === 1 ? "store" : "stores"}` : offers.length ? `Sold out at all ${offers.length} ${offers.length === 1 ? "store" : "stores"}` : "Not in stock"}</StockPill>
            <ShareButton title={p.name} path={`/${region}/p/${p.id}`} text={productShareText(p.name, offers, storeName, (c) => formatPrice(c, region))} />
          </div>

          {/* The best-price card (the engine's BestPriceCard, server-rendered): the cheapest store you can buy from now and its button, eBay beside it as a labelled ad. */}
          <section className="card mt-5 p-5 sm:p-6" aria-label="Best price">
            {best && bestHref ? (
              <>
                <p className="eyebrow">
                  <Flag code={region} /> Best price in {r.inName}
                </p>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="tabular font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{formatPrice(best.p, region)}</span>
                  <span className="text-muted">at {storeName(best.s)}</span>
                </div>
                {rrp && rrp > best.p && (
                  <p className="mt-1.5 text-sm">
                    <span className="font-bold text-open">{Math.round(((rrp - best.p) / rrp) * 100)}% under RRP</span>{" "}
                    <span className="text-muted">({formatPrice(rrp, region)}, as the stores state it)</span>
                  </p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <OutboundLink href={bestHref} rel={storeRel(bestHref)} retailer={storeName(best.s)} placement="product-best" className="btn-primary min-h-12 px-6 text-base">
                    Buy at {storeName(best.s)} <span aria-hidden="true">↗</span>
                  </OutboundLink>
                  <OutboundLink href={ebay ? ebayAffiliateUrl(ebay.u, region, "product-best-ebay") : ebaySearchUrl(p.name, region, "product-best-ebay")} rel={REL_PAID} retailer={ebayLabel(region)} placement="product-best-ebay" className="btn-ad min-h-12 px-5 text-base">
                    {ebay ? `Or ${formatPrice(ebay.p + (ebay.sh ?? 0), ebayCurrencyRegion)}${ebay.sh == null ? " + postage" : " delivered"} on eBay` : "Compare on eBay"}
                  </OutboundLink>
                  <span className="ad-pill">Ad</span>
                  <StoreCode code={activeStoreCode(best.u)} />
                </div>
                {(() => {
                  // Amazon or a store on Awin within 20% when the cheapest store pays nothing; eBay has its own button above.
                  const alt = paidAlternativeFor(p, region, "product-best-alt", false);
                  return alt ? <PaidAlt className="mt-3 text-sm" price={formatPrice(alt.c.p, region)} name={alt.c.name} note={alt.c.note} pctMore={alt.pctMore} href={alt.c.href} at={alt.c.at} placement="product-best-alt" /> : null;
                })()}
                <p className="mt-3 text-xs text-faint">Item price only; shipping is added at the store&rsquo;s checkout. {r.taxNote}</p>
                <a href="#prices" className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-brand hover:underline">
                  Compare all {offers.length} {offers.length === 1 ? "price" : "prices"} ↓
                </a>
              </>
            ) : (
              <>
                <p className="eyebrow">Sold out in {r.inName}</p>
                <p className="mt-2 text-muted">
                  {offers.length ? `None of the ${offers.length} stores that list it has it in stock today.` : "None of the stores we compare lists it today."} New copies on eBay or Amazon:
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <OutboundLink href={ebaySearchUrl(p.name, region, "product-soldout")} rel={REL_PAID} retailer={ebayLabel(region)} placement="product-soldout" className="btn-ad min-h-11">
                    Search {ebayLabel(region)}
                  </OutboundLink>
                  {amazon && (
                    <OutboundLink href={amazonSearchUrl(p.name, region, "product-soldout")!} rel={REL_PAID} retailer={amazonLabel(region)} placement="product-soldout" className="btn-amazon min-h-11">
                      Check {amazonLabel(region)}
                    </OutboundLink>
                  )}
                </div>
                <p className="mt-2 text-xs text-faint">Ads. {EBAY_DISCLOSURE}</p>
              </>
            )}
          </section>
        </div>
      </div>

      <Section id="prices" title={offers.length ? `${p.name} prices at ${offers.length} ${offers.length === 1 ? "store" : "stores"} in ${r.inName}` : `Where to look for ${p.name} in ${r.inName}`}>
        <PriceList {...priceRows(p, region, "product")} />
        <PriceListNote>
          {updated && <p>Store prices checked {new Date(updated).toUTCString().slice(5, 22)} UTC.</p>}
        </PriceListNote>
        <div className="mt-4 flex flex-wrap items-start gap-3">
          <ReportPrice product={`${p.name}${p.code ? ` (${p.code})` : ""}`} region={r.short} buttonClassName="btn-ghost" stores={rows.stores.map((x) => ({ name: x.name, price: x.price ?? "sold out" }))} />
          {/* RiftCompare's shared alert service emails when it drops (lib/alert-feed.ts, DECISIONS.md 2026-11-02). */}
          <PriceAlertForm site={ALERT_SITE_KEY} productId={p.id} region={r.market} priceCents={s?.best ?? null} buttonClassName="btn-ghost" />
        </div>
        <p className="mt-3 text-xs text-faint">
          eBay and Amazon are pinned first as labelled ads; the stores under them are sorted by price, in stock first, never by what we earn. {EBAY_DISCLOSURE} {amazon ? AMAZON_DISCLOSURE : ""}
        </p>
      </Section>

      {others.length > 0 && (
        <Section title="In other countries">
          <div className="flex flex-wrap gap-2">
            {others.map(({ x, s: os }) => (
              <Link key={x} href={`/${x}/p/${p.id}`} className="chip min-h-10">
                <Flag code={x} /> {REGIONS[x].short}: {os!.best != null ? `from ${formatPrice(os!.best, x)}` : "sold out"} <span className="text-faint">· {os!.stores} {os!.stores === 1 ? "store" : "stores"}</span>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs text-faint">Each country in its own currency; we never convert prices.</p>
        </Section>
      )}

      {related.length > 0 && (
        <Section title={`More ${faction?.name ?? system?.name ?? ""} in stock`} href={faction ? `/${region}/faction/${faction.slug}` : system ? `/${region}/game/${system.slug}` : undefined} linkLabel="See all">
          <ProductGrid items={related} region={region} />
        </Section>
      )}

      {best && bestHref && (() => {
        // The phone bar has no eBay button, so eBay counts here (lib/price-rows.ts paidAlternativeFor).
        const alt = paidAlternativeFor(p, region, "product-sticky-alt", true);
        return <StickyBuyBar price={formatPrice(best.p, region)} store={storeName(best.s)} href={bestHref} alt={alt ? { ...alt, price: formatPrice(alt.c.p, region) } : null} />;
      })()}

      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />}
    </div>
  );
}
