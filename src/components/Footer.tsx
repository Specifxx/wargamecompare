import Link from "next/link";
import { AMAZON_DISCLOSURE, EBAY_DISCLOSURE } from "@/lib/affiliate";
import { SYSTEMS } from "@/lib/catalog";
import { REGION_LIST, X_DEFAULT_REGION, type Region } from "@/lib/regions";
import { CONTACT_EMAIL, GW_DISCLAIMER, SITE_NAME } from "@/lib/site";
import { NETWORK_PAGE, footerSisters } from "@/lib/family-network";

export function Footer({ region }: { region: Region | null }) {
  const r = region ?? X_DEFAULT_REGION;
  const year = new Date().getUTCFullYear();
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="page grid gap-8 py-10 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="eyebrow mb-3">Browse</p>
          <ul className="space-y-1.5">
            {SYSTEMS.filter((s) => s.slug !== "citadel").slice(0, 8).map((s) => (
              <li key={s.slug}>
                <Link href={`/${r}/game/${s.slug}`} className="text-muted hover:text-ink">
                  {s.name} prices
                </Link>
              </li>
            ))}
            <li>
              <Link href={`/${r}/game/citadel`} className="text-muted hover:text-ink">
                Paint and hobby tool prices
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Countries</p>
          <ul className="space-y-1.5">
            {REGION_LIST.map((x) => (
              <li key={x.region}>
                <Link href={`/${x.region}`} data-region-pick={x.region} className="text-muted hover:text-ink">
                  Warhammer prices in {x.inName}
                </Link>
              </li>
            ))}
            <li>
              <Link href={`/${r}/deals`} className="text-muted hover:text-ink">
                Today&rsquo;s deals
              </Link>
            </li>
            <li>
              <Link href={`/${r}/black-friday`} className="text-muted hover:text-ink">
                Black Friday deals
              </Link>
            </li>
            <li>
              <Link href={`/${r}/boxing-day`} className="text-muted hover:text-ink">
                Boxing Day deals
              </Link>
            </li>
            <li>
              <Link href={`/${r}/january-sales`} className="text-muted hover:text-ink">
                January sales
              </Link>
            </li>
            <li>
              <Link href={`/${r}/lunar-new-year`} className="text-muted hover:text-ink">
                Lunar New Year deals
              </Link>
            </li>
            <li>
              <Link href={`/${r}/stores`} className="text-muted hover:text-ink">
                Stores we compare
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">{SITE_NAME}</p>
          <ul className="space-y-1.5">
            <li><Link href="/about" className="text-muted hover:text-ink">About and how prices work</Link></li>
            <li><Link href="/affiliate-disclosure" className="text-muted hover:text-ink">Affiliate disclosure</Link></li>
            <li><Link href="/privacy" className="text-muted hover:text-ink">Privacy</Link></li>
            <li><Link href="/terms" className="text-muted hover:text-ink">Terms</Link></li>
            <li><Link href="/creators" className="text-muted hover:text-ink">Creators we feature</Link></li>
            <li><Link href="/price-report" className="text-muted hover:text-ink">Monthly price report</Link></li>
            <li><Link href="/embed" className="text-muted hover:text-ink">Free price widgets</Link></li>
            <li><Link href="/forum" className="text-muted hover:text-ink">Community forum (beta)</Link></li>
            <li><Link href="/contact" className="text-muted hover:text-ink">Contact and store listings</Link></li>
            <li><Link href="/uk/stores#suggest" className="text-muted hover:text-ink">Suggest a store</Link></li>
            <li><a href={`mailto:${CONTACT_EMAIL}`} className="text-muted hover:text-ink">{CONTACT_EMAIL}</a></li>
          </ul>
        </div>
        <div>
          {/* One short list (owner, 2026-11-02: the old list of every site was "convoluted"): the hobby sisters,
              then the network page that lists every site (lib/family-network.ts, DECISIONS.md "Sites that grow each other"). */}
          <p className="eyebrow mb-3">Sister sites</p>
          <ul className="space-y-1.5">
            {footerSisters("wargame").map((s) => (
              <li key={s.id}>
                <a href={s.url} rel="noopener" title={s.label} className="text-muted hover:text-ink">
                  {s.name}
                </a>
              </li>
            ))}
            <li>
              <a href={NETWORK_PAGE} rel="noopener" className="text-muted hover:text-ink">
                A Compare Empire site →
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="page space-y-2 border-t border-line py-6 text-xs leading-5 text-faint">
        <p>{GW_DISCLAIMER}</p>
        <p>{EBAY_DISCLOSURE} {AMAZON_DISCLOSURE} Store links may carry a store&rsquo;s own referral code; prices are always sorted by price, never by what we earn.</p>
        <p>© {year} {SITE_NAME}</p>
      </div>
    </footer>
  );
}
