// Canonicals, hreflang and JSON-LD. Every regional page is its OWN canonical with the other regions that list the same
// thing as hreflang alternates (never canonical to another region); x-default is the UK copy when it exists.
import type { Metadata } from "next";
import { REGIONS, X_DEFAULT_REGION, type Region } from "./regions";
import { GW_DISCLAIMER, SITE_NAME, SITE_URL } from "./site";

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

export function ogFor(path: string, title: string, description: string): Metadata["openGraph"] {
  return { type: "website", siteName: SITE_NAME, url: `${SITE_URL}${path}`, title, description, images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630 }] };
}
