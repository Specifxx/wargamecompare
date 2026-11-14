import type { Metadata } from "next";
import { STORES } from "@/lib/stores";
import { HowWePickStores } from "@/components/HowWePickStores";

export const metadata: Metadata = {
  title: "How we pick stores",
  description: "How WargameCompare checks every store before listing it, keeps checking it, and how to report one.",
  alternates: { canonical: "/how-we-pick-stores" },
};

export default function Page() {
  return (
    <div className="page prose-wg py-8 sm:py-10">
      <HowWePickStores
        site="WargameCompare"
        what="miniatures and hobby supplies"
        stores={STORES.map((s) => s.name)}
        priceRule="A price under 40% of the recommended retail price, or under 45% of what the other stores charge for the same product, is dropped automatically."
        marketplaces="eBay and Amazon rows are marketplaces, not stores: they are labelled as ads and never counted as a store or as the cheapest. We don't vet the individual sellers there, so check a seller's feedback before you buy."
        buttonClassName="btn-primary"
        suggestHref="/uk/stores#suggest"
      />
    </div>
  );
}
