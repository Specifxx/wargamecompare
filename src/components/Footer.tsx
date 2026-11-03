import Link from "@/components/Link";
import { AMAZON_DISCLOSURE, AMAZON_TRADEMARK, EBAY_DISCLOSURE } from "@/lib/affiliate";
import { SYSTEMS } from "@/lib/catalog";
import { REGION_LIST, REGIONS, X_DEFAULT_REGION, type Region } from "@/lib/regions";
import { CONTACT_EMAIL, GW_DISCLAIMER, SITE_NAME } from "@/lib/site";
import { NETWORK_PAGE } from "@/lib/family-network";
import { Flag } from "./Flag";
import { LogoMark } from "./Logo";
import { RateUsLink } from "./site-reviews/SiteReviews";

type FooterLink = { href: string; label: string; pick?: Region };

/** The footer's link columns (the same links as before the engine port, so every crawled link set is unchanged). Pure. */
export function footerColumns(r: Region): { title: string; links: FooterLink[] }[] {
  return [
    {
      title: "Browse",
      links: [
        ...SYSTEMS.filter((s) => s.slug !== "citadel")
          .slice(0, 8)
          .map((s) => ({ href: `/${r}/game/${s.slug}`, label: `${s.name} prices` })),
        { href: `/${r}/game/citadel`, label: "Paint and hobby tool prices" },
      ],
    },
    {
      title: "Countries",
      links: REGION_LIST.map((x) => ({ href: `/${x.region}`, label: `Warhammer prices in ${x.inName}`, pick: x.region })),
    },
    {
      title: "Deals",
      links: [
        { href: `/${r}/deals`, label: "Today’s deals" },
        { href: `/${r}/black-friday`, label: "Black Friday deals" },
        { href: `/${r}/boxing-day`, label: "Boxing Day deals" },
        { href: `/${r}/january-sales`, label: "January sales" },
        { href: `/${r}/lunar-new-year`, label: "Lunar New Year deals" },
        { href: `/${r}/stores`, label: "Stores we compare" },
      ],
    },
    {
      title: SITE_NAME,
      links: [
        { href: "/about", label: "About and how prices work" },
        { href: "/affiliate-disclosure", label: "Affiliate disclosure" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
        { href: "/creators", label: "Creators we feature" },
        { href: "/price-report", label: "Monthly price report" },
        { href: "/embed", label: "Free price widgets" },
        { href: "/forum", label: "Community forum (beta)" },
        { href: "/contact", label: "Contact and store listings" },
        { href: "/uk/stores#suggest", label: "Suggest a store" },
        { href: "/how-we-pick-stores", label: "How we pick stores" },
      ],
    },
  ];
}

/**
 * The engine's footer (from MTG Compare): a brand column (mark, one line on what the site is, the money and contact lines), then
 * the link columns, then the disclaimers. Same links as the old footer: the Games Workshop line, eBay and Amazon disclosures, and
 * the one Compare Empire network link (owner, 2026-11-03: no sister-site list).
 */
export function Footer({ region }: { region: Region | null }) {
  const r = region ?? X_DEFAULT_REGION;
  const info = REGIONS[r];
  const cols = footerColumns(r);
  const year = new Date().getUTCFullYear();
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="page grid gap-x-6 gap-y-10 py-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,3fr)]">
        <div className="max-w-sm">
          <Link href={region ? `/${region}` : "/"} className="inline-flex min-h-10 items-center gap-2 font-display text-lg font-extrabold tracking-tight">
            <LogoMark className="h-7 w-7" />
            <span>
              Wargame<span className="text-brand">Compare</span>
            </span>
            {region && (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 font-sans text-xs font-semibold text-muted">
                <Flag code={region} /> {info.short}
              </span>
            )}
          </Link>
          <p className="mt-3 text-sm leading-6 text-muted">Warhammer prices compared across independent stores, in stock and cheapest first, in five countries.</p>
          <p className="mt-4 text-xs leading-5 text-muted">
            eBay and Amazon links are affiliate links and are marked where they appear.
            <br />
            No store pays to be listed or to rank.{" "}
            <Link href="/about" className="whitespace-nowrap font-semibold text-ink underline decoration-line underline-offset-2 hover:decoration-ink">
              How prices work&nbsp;→
            </Link>
          </p>
          <p className="mt-3 text-xs text-muted">
            <Link href="/contact" className="font-semibold text-ink underline decoration-line underline-offset-2 hover:decoration-ink">
              Contact us
            </Link>
            :{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline decoration-line underline-offset-2 hover:decoration-ink">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-3 text-xs text-muted">
            <RateUsLink className="font-semibold text-ink underline decoration-line underline-offset-2 hover:decoration-ink">Rate us</RateUsLink>
            {" · "}
            <a href={NETWORK_PAGE} rel="noopener" className="underline decoration-line underline-offset-2 hover:decoration-ink">
              A Compare Empire site →
            </a>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          {cols.map((c) => (
            <nav key={c.title} aria-label={`Footer: ${c.title}`}>
              <p className="eyebrow mb-2">{c.title}</p>
              <ul className="text-sm">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} data-region-pick={l.pick} className="flex min-h-10 items-center gap-1.5 text-muted transition-colors hover:text-ink sm:min-h-8">
                      {l.pick && <Flag code={l.pick} />}
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="page space-y-2 py-6 text-xs leading-5 text-faint">
          <p>{GW_DISCLAIMER}</p>
          <p>
            {EBAY_DISCLOSURE} {AMAZON_DISCLOSURE} {AMAZON_TRADEMARK} Store links may carry a store&rsquo;s own referral code; prices are always sorted by price, never by what we earn.
          </p>
          <p>© {year} {SITE_NAME}</p>
        </div>
      </div>
    </footer>
  );
}
