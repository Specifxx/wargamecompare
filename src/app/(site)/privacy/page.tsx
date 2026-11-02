import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" } };

export default function Page() {
  return (
    <div className="page prose-wg max-w-3xl py-10">
      <h1 className="mb-6 font-display text-3xl font-extrabold text-ink">Privacy</h1>
      <p>WargameCompare has no accounts and asks for nothing about you unless you set a price alert (below). We count page views and clicks on buy links with Vercel Web Analytics, which uses no cookies and does not identify you; search words are not recorded.</p>
<p>Price alerts are the one exception. If you ask to be emailed when a price drops, the form sends your email address, the product, your region and your price to our sister site RiftCompare&rsquo;s alert service, which keeps them only for that alert, emails you once to confirm, and deletes them when you stop the alert (every email has a link) or after six months. WargameCompare itself never stores them. Details: <a href="https://riftcompare.com/privacy#sister-alerts">RiftCompare&rsquo;s privacy policy</a>.</p>
<p>When you follow a link to a store, eBay or Amazon, that site&rsquo;s own privacy policy applies; affiliate networks may set their own cookies to credit the sale.</p>
<p>Your theme choice (light or dark) is kept in your own browser&rsquo;s storage and never sent to us.</p>
    </div>
  );
}
