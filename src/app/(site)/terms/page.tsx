import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms", alternates: { canonical: "/terms" } };

export default function Page() {
  return (
    <div className="page prose-wg py-8 sm:py-10">
      <h1 className="ph-title mb-2 text-ink">Terms</h1>
      <p>Prices, stock and product details come from the stores&rsquo; own catalogues and can change at any time; the store&rsquo;s checkout price is the one that counts. We try hard to match every listing to the right product, but check the product at the store before you buy.</p>
<p>WargameCompare is provided as is, without warranty. Trademarks belong to their owners; WargameCompare is not affiliated with Games Workshop Limited or any store it lists.</p>
    </div>
  );
}
