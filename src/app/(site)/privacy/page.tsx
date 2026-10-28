import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" } };

export default function Page() {
  return (
    <div className="page prose-wg max-w-3xl py-10">
      <h1 className="mb-6 font-display text-3xl font-extrabold text-ink">Privacy</h1>
      <p>WargameCompare has no accounts and asks for nothing about you. We count page views and clicks on buy links with Vercel Web Analytics, which uses no cookies and does not identify you; search words are not recorded.</p>
<p>When you follow a link to a store, eBay or Amazon, that site&rsquo;s own privacy policy applies; affiliate networks may set their own cookies to credit the sale.</p>
<p>Your theme choice (light or dark) is kept in your own browser&rsquo;s storage and never sent to us.</p>
    </div>
  );
}
