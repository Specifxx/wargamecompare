import Link from "next/link";
import { AMAZON_DISCLOSURE, EBAY_DISCLOSURE } from "@/lib/affiliate";
import { SYSTEMS } from "@/lib/catalog";
import { REGION_LIST, type Region } from "@/lib/regions";
import { CONTACT_EMAIL, GW_DISCLAIMER, SISTER_SITES, SITE_NAME } from "@/lib/site";

export function Footer({ region }: { region: Region | null }) {
  const r = region ?? "uk";
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
                <Link href={`/${x.region}`} className="text-muted hover:text-ink">
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
            <li><Link href="/contact" className="text-muted hover:text-ink">Contact and store listings</Link></li>
            <li><Link href="/uk/stores#suggest" className="text-muted hover:text-ink">Suggest a store</Link></li>
            <li><a href={`mailto:${CONTACT_EMAIL}`} className="text-muted hover:text-ink">{CONTACT_EMAIL}</a></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">More price comparison</p>
          <ul className="space-y-1.5">
            {SISTER_SITES.map((s) => (
              <li key={s.url}>
                <a href={s.url} className="text-muted hover:text-ink">
                  {s.anchor} <span className="text-faint">· {s.name}</span>
                </a>
              </li>
            ))}
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
