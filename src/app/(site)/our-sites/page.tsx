import type { Metadata } from "next";
import { FAMILY_SITES, NETWORK_PAGE } from "@/lib/family-network";

// The one page that links the owner's other sites (2026-11-08, DECISIONS.md "One Our sites page instead of footer
// cross-links"): every footer links here once, and this page links each site once, by its plain name, instead of a
// site-wide link from every page to another of our domains. CDN-cached like every page (next.config.js CDN_PAGES).
export const metadata: Metadata = {
  title: "Our other sites",
  description: "WargameCompare is one of the Compare Empire price comparison sites. The others compare card games, hobby and tech prices the same way.",
  alternates: { canonical: "/our-sites" },
};

export default function Page() {
  const sites = FAMILY_SITES.filter((s) => s.id !== "wargame");
  return (
    <div className="page prose-wg max-w-3xl py-10">
      <h1 className="mb-6 font-display text-3xl font-extrabold text-ink">Our other sites</h1>
      <p>WargameCompare is one of the Compare Empire sites: independent price comparison, the same rules on every site, no paid ranking.</p>
      <ul>
        {sites.map((s) => (
          <li key={s.id}>
            <a href={s.url} rel="noopener">{s.name}</a>: {s.label}
          </li>
        ))}
      </ul>
      <p>
        <a href={NETWORK_PAGE} rel="noopener">Every Compare Empire site →</a>
      </p>
    </div>
  );
}
