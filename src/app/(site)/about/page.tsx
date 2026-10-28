import type { Metadata } from "next";

export const metadata: Metadata = { title: "About WargameCompare and how prices work", alternates: { canonical: "/about" } };

export default function Page() {
  return (
    <div className="page prose-wg max-w-3xl py-10">
      <h1 className="mb-6 font-display text-3xl font-extrabold text-ink">About WargameCompare and how prices work</h1>
      <p>WargameCompare compares the prices of new Games Workshop products (Warhammer 40,000, Age of Sigmar, Kill Team, The Horus Heresy, The Old World, Middle-earth, Necromunda, Blood Bowl and Citadel paints and tools) across independent stores in the United Kingdom, Australia, New Zealand, Canada and the United States.</p>
<h2>Where the prices come from</h2>
<p>Once a day we read each store&rsquo;s public product catalogue. Every listing is matched to one product by the code printed on the box (for example 48-75), the item number or the barcode the store gives. A listing we cannot match with certainty is left out: a wrong match is worse than a missing one. Second-hand, painted, on-sprue, damaged and store-made bundle listings are left out too.</p>
<h2>How we sort</h2>
<p>Within each country, prices are the store&rsquo;s own, in that country&rsquo;s currency, and are never converted. They are sorted in stock first, then cheapest. The &ldquo;saving&rdquo; is against the RRP when two or more stores state the same one, otherwise against the median price of three or more stores today. Shipping and, in Canada and the US, sales tax are added at the store&rsquo;s checkout and are not included.</p>
<h2>How we earn</h2>
<p>Links to eBay and Amazon, and to stores in a partner programme, are affiliate links: we may earn a commission at no cost to you. That never changes the order: rows are sorted by price. See the <a href="/affiliate-disclosure">affiliate disclosure</a>.</p>
<h2>Games Workshop</h2>
<p>WargameCompare is independent and not affiliated with, endorsed or sponsored by Games Workshop Limited. Product names are used only to describe what the stores sell, and product photos are the stores&rsquo; own.</p>
    </div>
  );
}
