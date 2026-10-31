import Link from "next/link";
import { ebaySearchUrl, REL_PAID } from "@/lib/affiliate";
import { navGroups } from "@/lib/nav";
import { REGION_LIST, REGIONS, type Region } from "@/lib/regions";
import { Logo } from "./Logo";
import { MenuCloser } from "./MenuCloser";
import { MobileMenu } from "./MobileMenu";
import { OutboundLink } from "./OutboundLink";
import { ThemeToggle } from "./ThemeToggle";

/** The header for one region. Pure (no hooks of its own, no server reads; MenuCloser is a client island): SoftHeader draws it in the browser too. */
export function HeaderBar({ region: r, home }: { region: Region; home: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="page flex h-[var(--hdr)] items-center gap-3">
        <MobileMenu region={r} groups={navGroups(r)} />
        <Link href={home} aria-label="WargameCompare home" className="shrink-0">
          <Logo />
        </Link>
        <form action={`/${r}/search`} role="search" className="ml-auto hidden min-w-0 flex-1 justify-end sm:flex sm:max-w-md">
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
        <details className="relative ml-auto shrink-0 sm:ml-0" data-menu="country">
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
        <MenuCloser />
      </div>
    </header>
  );
}
