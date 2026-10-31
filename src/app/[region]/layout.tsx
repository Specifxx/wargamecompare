import { notFound } from "next/navigation";
import { EbayStrip } from "@/components/EbayStrip";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SideNav } from "@/components/SideNav";
import { summariesFor } from "@/lib/data";
import { navGroups } from "@/lib/nav";
import { isRegion, REGIONS } from "@/lib/regions";

export default function RegionLayout({ children, params }: { children: React.ReactNode; params: { region: string } }) {
  if (!isRegion(params.region)) notFound();
  const region = params.region;
  // The most widely stocked kits: the eBay strip above the footer on every region page.
  const popular = summariesFor(region).filter((s) => s.inStock > 0).slice(0, 40);
  return (
    <>
      <Header region={region} />
      {/* From xl, the sidebar fills the wide screen's left side; the page keeps its own width beside it. */}
      <div className="mx-auto flex w-full max-w-shell flex-1">
        <SideNav region={region} groups={navGroups(region)} />
        <main id="main" className="min-w-0 flex-1">
          {children}
          <div className="page mt-12" data-ebay-prefooter="">
            <EbayStrip region={region} items={popular} placement="ebay-strip-footer" heading={`Popular kits on eBay ${region === "nz" ? "Australia" : REGIONS[region].short}`} />
          </div>
        </main>
      </div>
      <Footer region={region} />
    </>
  );
}
