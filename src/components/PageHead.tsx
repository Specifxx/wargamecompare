import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

/**
 * The one page header every inner page shares (2026-11-14, the home page's language carried inward): the trail, the h1, one line
 * that says what the page is, and an optional row of key facts or a toolbar. `ld` passes through to Breadcrumbs: a page that already
 * writes its own BreadcrumbList (or never had one) draws the trail without a second copy, so no page's JSON-LD changes.
 */
export function PageHead({
  crumbs,
  ld = false,
  title,
  lead,
  children,
}: {
  crumbs?: Crumb[];
  ld?: boolean;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="ph">
      {crumbs && crumbs.length > 1 ? <Breadcrumbs items={crumbs} ld={ld} /> : null}
      <h1 className="ph-title">{title}</h1>
      {lead ? <div className="ph-lead">{lead}</div> : null}
      {children}
    </div>
  );
}
