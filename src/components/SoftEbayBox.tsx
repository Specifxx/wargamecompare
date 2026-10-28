"use client";

import { EbayBox } from "./EbayBox";
import { useSoftRegion } from "./SoftRegion";

/** The eBay block on a page with no region of its own, for the visitor's region. */
export function SoftEbayBox() {
  const region = useSoftRegion();
  return <EbayBox region={region} query="Warhammer" heading="Warhammer on eBay" placement="landing-ebay" />;
}
