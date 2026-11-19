import Link from "@/components/Link";
import { AMAZON_DISCLOSURE, AMAZON_TRADEMARK, EBAY_DISCLOSURE } from "@/lib/affiliate";
import { SYSTEMS } from "@/lib/catalog";
import { REGION_LIST, REGIONS, X_DEFAULT_REGION, type Region } from "@/lib/regions";
import { CONTACT_EMAIL, GW_DISCLAIMER, SITE_NAME } from "@/lib/site";
import { Flag } from "./Flag";
import { LogoMark } from "./Logo";
import { RateUsLink } from "./site-reviews/SiteReviews";
import { FeedbackAsk } from "@/components/FeedbackAsk";

type FooterLink = { href: string; label: string; pick?: Region };

/** The footer's link columns, cut to what a visitor needs (2026-11-19, core-update quality pass: ~35 links became ~19). Pure. */
export function footerColumns(r: Region): { title: string; links: FooterLink[] }[] {
  return [
    {
      title: "Browse",
      links: [
        ...SYSTEMS.filter((s) => s.slug !== "citadel")
          .slice(0, 4)
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
        { href: `/${r}/stores`, label: "Stores we compare" },
        { href: "/account", label: "Sign in or create a free account" },
        { href: "/premium", label: "Premium: 14 days free" },
      ],
    },
    {
      title: SITE_NAME,
      links: [
        { href: "/about", label: "Who runs it, and how prices work" },
        { href: "/affiliate-disclosure", label: "Affiliate disclosure" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
        { href: "/contact", label: "Contact and store listings" },
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
      {/* "Was this page useful?" (owner, 2026-11-18: more feedback). One inline line, never a pop-up. */}
      <div className="page pt-8"><FeedbackAsk email={CONTACT_EMAIL} /></div>
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
            {/* 2026-11-08: one internal link to /our-sites, which lists every Compare Empire site once, instead of a
                link from every page to another of our domains (DECISIONS.md). */}
            <Link href="/our-sites" prefetch={false} className="underline decoration-line underline-offset-2 hover:decoration-ink">
              Our other price comparison sites →
            </Link>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          {cols.map((c) => (
            <nav key={c.title} aria-label={`Footer: ${c.title}`}>
              <p className="eyebrow mb-2">{c.title}</p>
              <ul className="text-sm">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} data-region-pick={l.pick} className="flex min-h-10 items-center gap-2 py-1.5 leading-snug text-muted transition-colors hover:text-ink sm:min-h-8 sm:py-1">
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
