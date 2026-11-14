import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Contact and store listings", alternates: { canonical: "/contact" } };

export default function Page() {
  return (
    <div className="page prose-wg py-8 sm:py-10">
      <h1 className="ph-title mb-2 text-ink">Contact and store listings</h1>
      <p>Are you a store that sells Games Workshop products and want to be compared, or listed with an exclusive code for our visitors? Spotted a wrong price or a wrong match? Email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
<p>Faster: every product page has a <strong>Report a wrong price</strong> link under its prices, and each country&rsquo;s stores page has a <a href="/uk/stores#suggest">Suggest a store</a> form. No email needed.</p>
<p>Run a store? <a href="/list-your-store">List your store</a>, free: we can add it when its catalogue can be read (Shopify stores usually can) and it sells new product in its own country&rsquo;s currency.</p>
    </div>
  );
}
