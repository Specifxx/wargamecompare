import Link from "next/link";
import { ebaySearchUrl, REL_PAID } from "@/lib/affiliate";
import { REGION_LIST, REGIONS, type Region } from "@/lib/regions";
import { Logo } from "./Logo";
import { OutboundLink } from "./OutboundLink";
import { ThemeToggle } from "./ThemeToggle";

// One row: logo, search, the sections, region and theme. No cookie, header or session is read: one CDN copy per URL.
export function Header({ region }: { region: Region | null }) {
  const r = region ?? "uk";
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="page flex h-[var(--hdr)] items-center gap-3">
        <Link href={region ? `/${region}` : "/"} aria-label="WargameCompare home" className="shrink-0">
          <Logo />
        </Link>
        <form action={`/${r}/search`} role="search" className="ml-auto flex min-w-0 flex-1 justify-end sm:max-w-md">
          <label htmlFor="q" className="sr-only">
            Search products
          </label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder="Search kits, paints, codexes…"
            className="h-10 w-full min-w-0 rounded-full border border-line bg-surface px-4 text-base text-ink placeholder:text-faint sm:text-sm"
          />
        </form>
        <nav className="hidden items-center gap-1 text-sm font-semibold lg:flex" aria-label="Sections">
          <Link href={`/${r}/deals`} className="rounded-full px-3 py-2 hover:bg-raised">
            Deals
          </Link>
          <Link href={`/${r}/stores`} className="rounded-full px-3 py-2 hover:bg-raised">
            Stores
          </Link>
          <OutboundLink href={ebaySearchUrl("Warhammer", r, "header")} rel={REL_PAID} retailer="eBay" placement="header" className="rounded-full px-3 py-2 hover:bg-raised">
            eBay
          </OutboundLink>
        </nav>
        <details className="relative shrink-0">
          <summary className="chip cursor-pointer list-none" aria-label="Change country">
            {REGIONS[r].short}
          </summary>
          <ul className="absolute right-0 mt-2 w-48 rounded-xl border border-line bg-surface p-1 shadow-lift">
            {REGION_LIST.map((x) => (
              <li key={x.region}>
                <Link href={`/${x.region}`} className="block rounded-lg px-3 py-2 text-sm hover:bg-raised">
                  {x.name} <span className="text-faint">({x.currency})</span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
        <ThemeToggle />
      </div>
    </header>
  );
}
