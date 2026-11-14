import Link from "@/components/Link";
import { breadcrumbLd, jsonLd } from "@/lib/seo";

export interface Crumb {
  /** The page's path ("/uk/game/kill-team"); the last crumb is the page itself and gets no link. */
  path: string;
  label: string;
}

/** The crumb a phone's back link goes to: the last one before the current page. */
export function parentCrumb(items: Crumb[]): Crumb | null {
  return items.length >= 2 ? items[items.length - 2] : null;
}

/**
 * Where the page sits (the engine's breadcrumbs, from MTG Compare). Below sm, one "← {parent}" link (40px tall: a thumb's target,
 * and one line instead of a wrapping trail above the H1); from sm, the whole trail. The BreadcrumbList JSON-LD (seo.ts breadcrumbLd)
 * is emitted once, whichever shows, with the same names and paths the pages carried before.
 */
export function Breadcrumbs({ items, ld = true }: { items: Crumb[]; /** false: the page already emits its own BreadcrumbList (or none), so draw the trail only. */ ld?: boolean }) {
  const parent = parentCrumb(items);
  const last = items.length - 1;
  return (
    <nav aria-label="Breadcrumb" className="mb-2 text-sm text-muted sm:mb-5">
      {parent && (
        <Link href={parent.path} className="-ml-1 inline-flex min-h-10 max-w-full items-center gap-1.5 rounded-lg px-1 font-medium hover:text-ink sm:hidden">
          <span aria-hidden="true">←</span>
          <span className="truncate">{parent.label}</span>
        </Link>
      )}
      <ol className={`${parent ? "hidden sm:flex" : "flex"} flex-wrap items-center gap-1.5`}>
        {items.map((it, i) => (
          <li key={it.path} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden="true" className="text-faint">
                /
              </span>
            )}
            {i < last ? (
              <Link href={it.path} className="hover:text-ink hover:underline hover:underline-offset-2">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate text-ink">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd(items.map((c) => ({ name: c.label, path: c.path })))) }} />}
    </nav>
  );
}
