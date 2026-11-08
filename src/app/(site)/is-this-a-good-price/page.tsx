import type { Metadata } from "next";
import Link from "@/components/Link";
import { LinkChecker } from "@/components/LinkChecker";
import { ogFor } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

// /is-this-a-good-price (2026-11-08): paste a store link, see how its price compares with every store we read in that store's
// region. The copy and FAQ are in the server HTML; the checker is a client island that asks /api/check/<host> (CDN-cached).
// Force-dynamic and kept a day by the CDN (next.config.js CDN_PAGES) like every page; it reads no data itself.
export const dynamic = "force-dynamic";

const title = "Is this a good price? Miniatures price checker";
const description = `Paste a store's link to a miniatures kit, paint or book and see if it's a good price against every independent store ${SITE_NAME} compares.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/is-this-a-good-price" },
  openGraph: ogFor(
    "/is-this-a-good-price",
    `${title} | ${SITE_NAME}`,
    description,
  ),
};

const STEPS = [
  "Copy the address of the store's product page (in a phone browser: Share, then Copy).",
  "Paste it into the box. The checker looks it up straight away.",
  "Read the verdict and the cheapest and median in-stock prices beside it.",
  "If the page shows a different price now, type it to check again.",
];

const FAQ = [
  {
    q: "Which links does it work with?",
    a: `Product pages at any independent store ${SITE_NAME} reads, in the UK, Australia, New Zealand, Canada or the US: it compares the price with the other stores in that store's country. For eBay, Amazon and stores we don't read, it searches our prices with the link's words.`,
  },
  {
    q: "Do you open the page I paste?",
    a: "No. The checker only reads the store's address and the product's part of the link, then looks it up in the listings we already read from that store every day.",
  },
  {
    q: "Why is the store's price different from the page?",
    a: "We read each store once a day, so a price can change in between. Type the price the page shows now and the verdict updates.",
  },
  {
    q: "What counts as a good price?",
    a: "The cheapest in-stock store price we found, or within 1% of it. Under the median (the middle in-stock store price) is fair; about the median is typical; above it, you can usually pay less elsewhere. eBay, Amazon and Wayland are not counted as stores here.",
  },
  {
    q: "Does it include shipping?",
    a: "No. Every price is the store's own item price before shipping, the way the rest of the site compares them. Check postage at checkout.",
  },
];

export default function Page() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <div className="page py-8">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Is this a good price?
        </h1>
        <p className="mt-3 text-lg leading-8 text-muted">
          Paste the link to a miniatures kit, paint or book at any independent
          store and see how its price compares with the cheapest and the typical
          in-stock price at every other store we read.
        </p>
        <LinkChecker />
        <h2 className="mt-12 font-display text-2xl font-bold tracking-tight">
          How to use it
        </h2>
        <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-muted">
          {STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <h2 className="mt-12 font-display text-2xl font-bold tracking-tight">
          Questions
        </h2>
        <dl className="mt-4 space-y-4">
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-1 text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-sm text-muted">
          Looking for a bargain instead?{" "}
          <Link
            href="/price-report"
            className="font-semibold text-brand hover:underline"
          >
            The monthly price report
          </Link>{" "}
          shows how far stores sell under RRP.
        </p>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(ld).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
