// Canonicals, hreflang and JSON-LD. Every regional page is its OWN canonical with the other regions that list the same
// thing as hreflang alternates (never canonical to another region); x-default is the US copy when it exists.
import type { Metadata } from "next";
import { REGIONS, X_DEFAULT_REGION, type Region } from "./regions";
import { GW_DISCLAIMER, SITE_NAME, SITE_URL } from "./site";

/** BreadcrumbList for a page's visible breadcrumb trail; the last item is the page itself (SEO audit, 2026-11-03). */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
  };
}

/** FAQPage for questions printed on the page (never for hidden text). */
export function faqLd(qa: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}

/** hreflang for the landing page and the region homes: each region's home, and the chooser at / as x-default. */
export function homeAlternates(canonical: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const r of Object.values(REGIONS)) languages[r.hreflang] = `${SITE_URL}/${r.region}`;
  languages["x-default"] = SITE_URL;
  return { canonical, languages };
}

export function jsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, description: GW_DISCLAIMER.split(".")[0] },
      { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/icon.svg` },
    ],
  };
}

/** Metadata alternates for a page that exists under several regions at `/<region><rest>`. */
export function regionAlternates(region: Region, rest: string, regions: Region[]): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const r of regions) languages[REGIONS[r].hreflang] = `${SITE_URL}/${r}${rest}`;
  const xd = regions.includes(X_DEFAULT_REGION) ? X_DEFAULT_REGION : regions[0];
  if (xd) languages["x-default"] = `${SITE_URL}/${xd}${rest}`;
  return { canonical: `${SITE_URL}/${region}${rest}`, languages: regions.length > 1 ? languages : undefined };
}

/** `image` is a page's own share card (a hub's `opengraph-image` route); without one, the site's card. */
export function ogFor(path: string, title: string, description: string, image = "/opengraph-image"): Metadata["openGraph"] {
  return { type: "website", siteName: SITE_NAME, url: `${SITE_URL}${path}`, title, description, images: [{ url: `${SITE_URL}${image}`, width: 1200, height: 630 }] };
}
