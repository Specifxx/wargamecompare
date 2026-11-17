import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Rift Compare's list of bulk crawlers that send nobody (owner, 2026-11-02:
// Vercel spend capped; each page they fetch is a billed request). Google, Bing,
// the AI answer engines, AhrefsBot and SemrushBot stay allowed.
const BLOCKED_BOTS = [
  "Bytespider", "meta-externalagent", "Meta-ExternalAgent",
  "MJ12bot", "DotBot", "PetalBot", "DataForSeoBot", "BLEXBot", "Barkrowler", "serpstatbot", "SeekportBot", "ImagesiftBot", "Timpibot",
];

// Next's RSC prefetch variants (?_rsc=) are the same page again as a payload, never an index entry (Gemini SEO report, 2026-11-17).
// /_next/ assets stay crawlable: no rule here blocks them.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/*/search", "/*?_rsc="] },
      { userAgent: BLOCKED_BOTS, disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
