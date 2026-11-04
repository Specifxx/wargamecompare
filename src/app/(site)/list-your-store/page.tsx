import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/site";
import { REGION_LIST } from "@/lib/regions";
import { STORES } from "@/lib/stores";
import { ListYourStore } from "@/components/ListYourStore";

// The store-owner page every Compare Empire site shares (owner, 2026-11-04).
export const metadata: Metadata = {
  title: "List your store, free",
  description: "Run a store that sells Games Workshop products? Get it listed on WargameCompare's price comparison for free: buyers comparing prices go straight to your product pages.",
  alternates: { canonical: "/list-your-store" },
};

export default function Page() {
  const names = REGION_LIST.map((r) => r.inName);
  const markets = `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return (
    <div className="page prose-wg max-w-3xl py-10">
      <ListYourStore
        site="WargameCompare"
        what="Games Workshop products"
        markets={markets}
        storeCount={STORES.length}
        regions={REGION_LIST.map((r) => [r.short, r.name])}
        email={CONTACT_EMAIL}
        platforms="Shopify and WooCommerce"
        pricesRule="a price under 40% of the recommended retail price is dropped as a likely mistake"
        suggestHref="/uk/stores#suggest"
        buttonClassName="btn-primary"
      >
        <li><strong>Games Workshop&apos;s own codes in your listings.</strong> We match products only by the box code, item number or barcode, so listings that carry them are matched; ones without are left out.</li>
        <li><strong>A code for our visitors?</strong> Optional, but a store that offers one is shown with it beside its price. Mention it in the form.</li>
      </ListYourStore>
    </div>
  );
}
