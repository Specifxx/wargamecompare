"use client";

import Link from "@/components/Link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ebayLabel, ebaySearchUrl, REL_PAID } from "@/lib/affiliate";
import { retargetGroups, type NavGroup } from "@/lib/nav";
import { REGION_LIST, REGIONS, type Region } from "@/lib/regions";
import { Icon } from "./Icon";
import { LogoMark } from "./Logo";
import { isActivePath } from "./NavLink";
import { OutboundLink } from "./OutboundLink";
import { pickRegion, useSoftRegion } from "./SoftRegion";
import { regionSwitchFollow, regionSwitchHref } from "./RegionSwitcher";
import { Flag } from "./Flag";

/**
 * The menu button and its sheet (the engine's phone menu, from MTG Compare): a native modal <dialog> (showModal: the page behind is
 * inert, focus stays inside, Escape closes it, and focus returns to the button), drawn as a full-width sheet from the top of the
 * screen. It closes on any link (the pathname effect catches back/forward too, so a client-side navigation never leaves it open over
 * the new page: visitor feedback, 2026-10-31). The sheet's contents are rendered on the first open, not in the server's HTML: every
 * link in it is in the sidebar, the header or the footer already, and leaving it out keeps the markup off every page. Never opens by
 * itself (pop-up policy).
 *
 * `groups`: lib/nav.ts navGroups, built on the server for `built` (the page's country, or the default on a page with none, where the
 * sheet follows the visitor's country instead: SoftRegion.tsx useSoftRegion, asked only once the menu opens).
 */
export function MobileMenu({ region, groups, built, className = "" }: { region: Region | null; groups: NavGroup[]; built: Region; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const close = () => ref.current?.close();

  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => {
          // The contents first (synchronously), so showModal() finds the close button to focus.
          if (!ready) flushSync(() => setReady(true));
          ref.current?.showModal();
          setOpen(true);
        }}
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink/30 ${className}`}
      >
        <Icon name="menu" size={20} />
      </button>
      <dialog
        ref={ref}
        id="site-menu"
        data-menu="mobile"
        aria-label="Menu"
        onClose={() => setOpen(false)}
        // A click on the backdrop lands on the <dialog> itself (everything visible is inside the inner box).
        onClick={(e) => e.target === ref.current && close()}
        className="menu-sheet fixed inset-x-0 bottom-auto top-0 m-0 h-auto max-h-[100dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-b-2xl border-0 bg-surface p-0 text-ink shadow-lift"
      >
        {ready &&
          (region ? (
            <MenuSheet region={region} groups={groups} pathname={pathname} onClose={close} />
          ) : (
            <SoftMenuSheet groups={groups} built={built} pathname={pathname} onClose={close} />
          ))}
      </dialog>
    </>
  );
}

/** The sheet on a page with no region of its own: the visitor's country's links, and a country tile switches the page in place. */
function SoftMenuSheet({ groups, built, pathname, onClose }: { groups: NavGroup[]; built: Region; pathname: string; onClose: () => void }) {
  const region = useSoftRegion();
  return <MenuSheet region={region} groups={region === built ? groups : retargetGroups(groups, region)} pathname={pathname} onClose={onClose} soft />;
}

/**
 * The sheet: everything the site has, grouped as the desktop sidebar is (lib/nav.ts: games, kinds of product, armies, deals and
 * more), then the five countries (the same page in each; on a `soft` page, a pick that switches the page in place), then the eBay
 * search (a labelled ad), About and Contact.
 */
export function MenuSheet({ region, groups, pathname, onClose: close, soft = false }: { region: Region; groups: NavGroup[]; pathname: string; onClose: () => void; soft?: boolean }) {
  const current = REGIONS[region];
  // On a soft page the country tiles are judged as on a page with no region: each goes to its home.
  const from = soft ? null : region;
  return (
    <div className="page pb-5">
      <div className="flex h-[var(--hdr)] items-center gap-3 border-b border-line">
        <LogoMark className="h-8 w-8" />
        <span className="min-w-0 flex-1 truncate font-display text-lg font-bold tracking-tight">
          <Flag code={current.region} /> WargameCompare {current.name}
        </span>
        <button type="button" onClick={close} aria-label="Close menu" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink/30">
          <Icon name="close" size={20} />
        </button>
      </div>

      <nav aria-label="Sections" className="mt-1">
        {groups.map((g) => (
          <section key={g.title} className="border-b border-line py-3">
            <h2 className="eyebrow mb-1.5 px-2">{g.title}</h2>
            <ul className="grid grid-cols-2 gap-x-2 sm:grid-cols-3">
              {g.links.map((l) => {
                const active = isActivePath(pathname, l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center rounded-xl px-2 py-1.5 text-[15px] font-medium leading-5 transition-colors hover:bg-raised ${active ? "bg-raised text-brand-strong" : ""}`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>

      <div className="mt-4">
        <h2 className="eyebrow mb-2.5 px-2">Country</h2>
        <ul className="grid grid-cols-5 gap-2">
          {REGION_LIST.map((r) => {
            const on = r.region === region;
            return (
              <li key={r.region}>
                <Link
                  href={regionSwitchHref(pathname, r.region, from)}
                  data-region-pick={r.region}
                  rel={!on && !regionSwitchFollow(pathname, from) ? "nofollow" : undefined}
                  onClick={(e) => {
                    if (soft && !(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) {
                      e.preventDefault();
                      pickRegion(r.region);
                    }
                    close();
                  }}
                  aria-current={on ? "true" : undefined}
                  aria-label={`${r.name} (${r.currency})`}
                  className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl border py-1.5 transition-colors ${on ? "border-ink bg-raised" : "border-line hover:border-ink/30"}`}
                >
                  <Flag code={r.region} className="text-2xl" />
                  <span className="text-xs font-semibold text-muted">{r.short}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <OutboundLink href={ebaySearchUrl("Warhammer", region, "menu-ebay")} rel={REL_PAID} retailer={ebayLabel(region)} placement="menu-ebay" className="btn-ad mt-4 w-full">
        <span className="ad-pill">Ad</span> Search {ebayLabel(region)}
      </OutboundLink>

      <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 px-2 text-sm">
        <Link href="/about" onClick={close} className="inline-flex min-h-10 items-center text-muted hover:text-ink">
          About &amp; how it works
        </Link>
        <Link href="/contact" onClick={close} className="inline-flex min-h-10 items-center text-muted hover:text-ink">
          Contact
        </Link>
      </p>
    </div>
  );
}
