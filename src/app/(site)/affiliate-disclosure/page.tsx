import type { Metadata } from "next";

export const metadata: Metadata = { title: "Affiliate disclosure", alternates: { canonical: "/affiliate-disclosure" } };

export default function Page() {
  return (
    <div className="page prose-wg max-w-3xl py-10">
      <h1 className="mb-6 font-display text-3xl font-extrabold text-ink">Affiliate disclosure</h1>
      <p>WargameCompare is free and earns money from some of the links on it. When you buy through one of them we may earn a commission, at no extra cost to you.</p>
<ul><li><strong>eBay</strong>: as an eBay Partner Network affiliate, WargameCompare earns from qualifying purchases. eBay rows and boxes are labelled &ldquo;Ad&rdquo;.</li>
<li><strong>Amazon</strong>: as an Amazon Associate WargameCompare earns from qualifying purchases. Amazon rows are labelled &ldquo;Ad&rdquo;; we do not check Amazon&rsquo;s price or stock.</li>
<li><strong>Wayland Games</strong> (UK): an affiliate link to search its site, labelled &ldquo;Ad&rdquo;; its prices are not part of our comparison.</li>
<li><strong>Partner stores</strong>: a store may give us a referral code or an exclusive discount code for our visitors. The code is shown beside its price; it never moves the store up the list.</li></ul>
<p>Every comparison is sorted by price and stock, never by commission.</p>
    </div>
  );
}
