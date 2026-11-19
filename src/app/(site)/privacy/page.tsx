import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" } };

export default function Page() {
  return (
    <div className="page prose-wg py-8 sm:py-10">
      <h1 className="ph-title mb-2 text-ink">Privacy</h1>
      <p>WargameCompare asks for nothing about you unless you set a price alert or sign in (below); you can compare every price without an account. We count page views and clicks on buy links with Vercel Web Analytics, which uses no cookies and does not identify you; search words are not recorded.</p>
<p>Price alerts are the one exception. If you ask to be emailed when a price drops, the form sends your email address, the product, your region and your price to our shared alert service, which keeps them only for that alert, emails you once to confirm, and deletes them when you stop the alert (every email has a link) or after six months. WargameCompare itself never stores them.</p>
<p>If you sign in (with Google, Discord or an emailed link), the same shared service keeps your email address, your alerts and, if you take Premium, your membership, so they follow you to our other sites and devices. Your sign-in is kept in your browser&rsquo;s local storage, never a cookie. Premium is billed by Stripe, which holds your card details; we never see them. WargameCompare itself stores none of this. Ask us to delete your account or alerts at the address below.</p>
<p>When you follow a link to a store, eBay or Amazon, that site&rsquo;s own privacy policy applies; affiliate networks may set their own cookies to credit the sale.</p>
<p>Your theme choice (light or dark) is kept in your own browser&rsquo;s storage and never sent to us.</p>
    </div>
  );
}
